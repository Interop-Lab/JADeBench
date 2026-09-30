function promiseEvent(target, type, signal) {
  const controller = new AbortController();
  const options = { once: true, signal: controller.signal };
  const promise = new Promise((resolve, reject) => {
    target.addEventListener(type, resolve, options);
    target.addEventListener('error', reject, options);
    if (signal) {
      signal.addEventListener('abort', () => reject(signal.reason), {
        once: true,
        signal: controller.signal,
      });
    }
  });
  return promise.finally(() => controller.abort());
}

class JSONRPCError extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.message = message;
    this.code = code;
    this.data = data;
    this.name = this.constructor.name;
  }
}
globalThis.JSONRPCError = JSONRPCError;

if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this.error = options.error;
    }
  };
}

class JSONRPCEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.data = options.data;
  }
}
globalThis.JSONRPCEvent = JSONRPCEvent;

class JSONRPCNotificationEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.method = options.method;
    this.params = options.params;
  }
}
globalThis.JSONRPCNotificationEvent = JSONRPCNotificationEvent;

class JSONRPCClient extends EventTarget {
  constructor(options) {
    super();
    this.deferreds = Object.create(null);
    this.lastId = 0;
    Object.assign(this, this.constructor.defaultOptions, options);
  }

  id() {
    return ++this.lastId;
  }

  url(protocol) {
    return `${protocol}${this.secure ? 's' : ''}://${this.host}:${this.port}${this.path}`;
  }

  websocket(message) {
    return this.socket.send(JSON.stringify(message));
  }

  async http(message) {
    try {
      const response = await fetch(this.url('http'), {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });
      this._onmessage(await response.json());
    } catch (error) {
      this.dispatchEvent(new ErrorEvent('error', { error }));
    }
  }

  _buildMessage(method, params) {
    if (typeof method !== 'string') throw new TypeError(`${method} is not a string`);
    return Object.assign(
      { method, 'json-rpc': '2.0', id: this.id() },
      params === undefined ? undefined : { params },
    );
  }

  batch(requests) {
    const messages = requests.map(request => this._buildMessage(...request));
    this._send(messages);
    return messages.map(({ id }) => {
      const deferred = Promise.withResolvers();
      this.deferreds[id] = deferred;
      return deferred.promise;
    });
  }

  call(method, params) {
    const message = this._buildMessage(method, params);
    this._send(message);
    const deferred = Promise.withResolvers();
    this.deferreds[message.id] = deferred;
    return deferred.promise;
  }

  _send(message) {
    this.dispatchEvent(new JSONRPCEvent('output', { data: message }));
    return this.socket?.readyState === 1 ? this.websocket(message) : this.http(message);
  }

  _onresponse({ id, error, result }) {
    const deferred = this.deferreds[id];
    if (!deferred) return;
    delete this.deferreds[id];
    if (error) deferred.reject(new JSONRPCError(error));
    else deferred.resolve(result);
  }

  _onrequest({ method, params }) {
    return this.onrequest?.(method, params);
  }

  _onnotification({ method, params }) {
    this.dispatchEvent(new JSONRPCNotificationEvent('notification', { method, params }));
  }

  _onmessage(data) {
    this.dispatchEvent(new JSONRPCEvent('input', { data }));
    const messages = Array.isArray(data) ? data : [data];
    messages.forEach(message => this._onobject(message));
  }

  _onobject(message) {
    if (message.method === undefined) this._onresponse(message);
    else if (message.id === undefined) this._onnotification(message);
    else this._onrequest(message);
  }

  open() {
    const socket = new WebSocket(this.url('ws'));
    this.socket = socket;
    socket.onclose = event => this.dispatchEvent(new Event('close', event));
    socket.onmessage = event => {
      try {
        this._onmessage(JSON.parse(event.data));
      } catch (error) {
        this.dispatchEvent(new ErrorEvent('error', { error }));
      }
    };
    socket.onopen = event => this.dispatchEvent(new Event('open', event));
    socket.onerror = error => this.dispatchEvent(new ErrorEvent('error', { error }));
    return promiseEvent(socket, 'open');
  }

  close() {
    this.socket.close();
    return promiseEvent(this.socket, 'close');
  }

  static defaultOptions = {
    secure: false,
    host: 'localhost',
    port: 80,
    secret: '',
    path: '/jsonrpc',
  };
}
globalThis.JSONRPCClient = JSONRPCClient;
globalThis.JSONRPCClient_default = JSONRPCClient;

export { JSONRPCEvent, JSONRPCNotificationEvent, JSONRPCClient as default };
