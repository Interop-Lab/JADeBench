function promiseEvent(target, type) {
  return new Promise((resolve, reject) => {
    target.addEventListener(type, resolve, { once: true });
    target.addEventListener('error', reject, { once: true });
  });
}

function createDeferred() {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
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
    constructor(type, options = {}) {
      super(type, options);
      this.error = options.error;
      this.message = options.message ?? options.error?.message ?? '';
    }
  };
}

class JSONRPCEvent extends Event {
  constructor(type, options) {
    super(type);
    if (options && 'data' in options) this.data = options.data;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, options) {
    super(type);
    if (options && 'method' in options) this.method = options.method;
    if (options && 'params' in options) this.params = options.params;
  }
}

class JSONRPCClient extends EventTarget {
  static defaultOptions = {
    secure: false,
    host: 'localhost',
    port: 80,
    secret: '',
    path: '/jsonrpc'
  };

  constructor(options = {}) {
    super();
    this.deferreds = Object.create(null);
    this.lastId = 0;
    Object.assign(this, JSONRPCClient.defaultOptions, options);
  }

  id() {
    return this.lastId++;
  }

  url(protocol) {
    return `${protocol}${this.secure ? 's' : ''}://${this.host}:${this.port}${this.path}`;
  }

  async websocket(message) {
    this.socket.send(JSON.stringify(message));
  }

  async http(message) {
    const response = await fetch(this.url('http'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const object = await response.json();
    this._onobject(object);
    return object;
  }

  _buildMessage(method, params) {
    if (typeof method !== 'string') throw new TypeError(`${method} is not a string`);
    const message = {
      method,
      'json-rpc': '2.0',
      id: this.id()
    };
    if (params != null) message.params = params;
    return message;
  }

  async batch(calls) {
    const messages = calls.map(([method, params]) => this._buildMessage(method, params));
    const promises = messages.map(message => {
      const deferred = createDeferred();
      this.deferreds[message.id] = deferred;
      return deferred.promise;
    });
    await this._send(messages);
    return promises;
  }

  async call(method, params) {
    const message = this._buildMessage(method, params);
    const deferred = createDeferred();
    this.deferreds[message.id] = deferred;
    await this._send(message);
    return deferred.promise;
  }

  async _send(message) {
    if (this.socket && this.socket.readyState === 1) return this.websocket(message);
    return this.http(message);
  }

  _onresponse({ id, result, error }) {
    const deferred = this.deferreds[id];
    if (!deferred) return;
    delete this.deferreds[id];
    if (error) deferred.reject(new JSONRPCError(error));
    else deferred.resolve(result);
  }

  _onrequest({ method, params }) {
    return this.onrequest(method, params);
  }

  _onnotification(object) {
    this.dispatchEvent(new JSONRPCNotificationEvent('notification', object));
  }

  _onmessage(message) {
    this._onobject(message);
  }

  _onobject(object) {
    if (Array.isArray(object)) {
      object.forEach(value => this._onobject(value));
    } else if (object.method && object.id === undefined) {
      this._onnotification(object);
    } else if (object.method) {
      this._onrequest(object);
    } else {
      this._onresponse(object);
    }
  }

  async open() {
    const socket = new WebSocket(this.url('ws'));
    this.socket = socket;
    socket.onopen = () => this.dispatchEvent(new Event('open'));
    socket.onerror = error => this.dispatchEvent(new ErrorEvent('error', { error }));
    socket.onclose = () => this.dispatchEvent(new Event('close'));
    socket.onmessage = ({ data }) => {
      try {
        this._onmessage(JSON.parse(data));
      } catch (error) {
        this.dispatchEvent(new ErrorEvent('error', { error }));
      }
    };
    return promiseEvent(this, 'open');
  }

  async close() {
    const closed = promiseEvent(this, 'close');
    this.socket.close();
    return closed;
  }
}

globalThis.JSONRPCEvent = JSONRPCEvent;
globalThis.JSONRPCNotificationEvent = JSONRPCNotificationEvent;
globalThis.JSONRPCClient = JSONRPCClient;
globalThis.JSONRPCClient_default = JSONRPCClient;

export { JSONRPCEvent, JSONRPCNotificationEvent, JSONRPCClient as default };
