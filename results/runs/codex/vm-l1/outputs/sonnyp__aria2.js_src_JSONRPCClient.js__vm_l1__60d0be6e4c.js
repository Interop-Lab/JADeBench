function promiseEvent(target, type) {
  const controller = new AbortController();
  return new Promise((resolve, reject) => {
    target.addEventListener(type, resolve, { signal: controller.signal });
    target.addEventListener('error', reject, { signal: controller.signal });
  }).finally(() => controller.abort());
}

class JSONRPCError extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.code = code;
    this.data = data;
    this.name = 'JSONRPCError';
  }
}

if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, options) {
      super(type, options);
      this.error = options.error;
    }
  };
}

class JSONRPCEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.data = options.data;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.method = options.method;
    this.params = options.params;
  }
}

class JSONRPCClient extends EventTarget {
  static defaultOptions = {
    secure: false,
    host: 'localhost',
    port: 80,
    secret: '',
    path: '/jsonrpc',
  };

  constructor(options) {
    super();
    this.deferreds = Object.create(null);
    this.lastId = 0;
    Object.assign(this, this.constructor.defaultOptions, options);
  }

  id() {
    return this.lastId++;
  }

  url(protocol) {
    return protocol + (this.secure ? 's' : '') + '://' + this.host + ':' + this.port + this.path;
  }

  async websocket(message) {
    this.socket.send(JSON.stringify(message));
  }

  async http(message) {
    try {
      const response = await fetch(this.url('http'), {
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      this._onmessage(data);
      return data;
    } catch (error) {
      this.dispatchEvent(new ErrorEvent('error', { error }));
    }
  }

  _buildMessage(method, params) {
    if (typeof method !== 'string') {
      throw new TypeError(method + ' is not a string');
    }
    const message = {
      method,
      'json-rpc': '2.0',
      id: this.id(),
    };
    return Object.assign(message, params ? { params } : undefined);
  }

  batch(calls) {
    const messages = calls.map((args) => this._buildMessage(...args));
    const promises = messages.map(({ id }) => {
      const deferred = Promise.withResolvers();
      this.deferreds[id] = deferred;
      return deferred.promise;
    });
    this._send(messages);
    return promises;
  }

  call(method, params) {
    const message = this._buildMessage(method, params);
    const deferred = Promise.withResolvers();
    this.deferreds[message.id] = deferred;
    this._send(message);
    return deferred.promise;
  }

  async _send(data) {
    this.dispatchEvent(new JSONRPCEvent('output', { data }));
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      await this.websocket(data);
    } else {
      await this.http(data);
    }
  }

  _onresponse({ id, error, result }) {
    const deferred = this.deferreds[id];
    if (!deferred) return;
    delete this.deferreds[id];
    if (error) {
      deferred.reject(new JSONRPCError(error));
    } else {
      deferred.resolve(result);
    }
  }

  _onrequest({ method, params }) {
    return this.onrequest(method, params);
  }

  _onnotification({ method, params }) {
    this.dispatchEvent(new JSONRPCNotificationEvent('notification', { method, params }));
  }

  _onmessage(data) {
    this.dispatchEvent(new JSONRPCEvent('input', { data }));
    if (Array.isArray(data)) {
      data.forEach((item) => this._onobject(item));
    } else {
      this._onobject(data);
    }
  }

  _onobject(data) {
    if (!data.method) {
      this._onresponse(data);
    } else if (data.id === undefined) {
      this._onnotification(data);
    } else {
      this._onrequest(data);
    }
  }

  async open() {
    this.socket = new WebSocket(this.url('ws'));
    this.socket.onclose = () => this.dispatchEvent(new Event('close'));
    this.socket.onmessage = ({ data }) => {
      try {
        this._onmessage(JSON.parse(data));
      } catch (error) {
        this.dispatchEvent(new ErrorEvent('error', { error }));
      }
    };
    this.socket.onopen = () => this.dispatchEvent(new Event('open'));
    this.socket.onerror = ({ error }) => this.dispatchEvent(new ErrorEvent('error', { error }));
    return promiseEvent(this, 'open');
  }

  async close() {
    this.socket.close();
    return promiseEvent(this, 'close');
  }
}

globalThis.promiseEvent = promiseEvent;
globalThis.JSONRPCError = JSONRPCError;
globalThis.JSONRPCEvent = JSONRPCEvent;
globalThis.JSONRPCNotificationEvent = JSONRPCNotificationEvent;
globalThis.JSONRPCClient = JSONRPCClient;
globalThis.JSONRPCClient_default = JSONRPCClient;

export { JSONRPCEvent, JSONRPCNotificationEvent, JSONRPCClient as default };
