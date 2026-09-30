function promiseEvent(target, eventName) {
  const controller = new AbortController();
  return new Promise((resolve, reject) => {
    target.addEventListener(eventName, resolve, { signal: controller.signal });
    target.addEventListener("error", reject, { signal: controller.signal });
  }).finally(() => controller.abort());
}

class JSONRPCError extends Error {
  constructor({ message, code, data }) {
    super(message);
    if (code !== undefined) this.code = code;
    if (data !== undefined) this.data = data;
    this.name = this.constructor.name;
  }
}

if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, options) {
      super(type, options);
      if (options?.error !== undefined) this.error = options.error;
    }
  };
}

class JSONRPCEvent extends Event {
  constructor(type, options) {
    super(type, options);
    if (options?.data !== undefined) this.data = options.data;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, options) {
    super(type, options);
    if (options?.method !== undefined) this.method = options.method;
    if (options?.params !== undefined) this.params = options.params;
  }
}

class JSONRPCClient extends EventTarget {
  static defaultOptions = {
    secure: false,
    host: "localhost",
    port: 80,
    secret: "",
    path: "/jsonrpc",
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
    return `${protocol}${this.secure ? "s" : ""}://${this.host}:${this.port}${this.path}`;
  }

  websocket(data) {
    this.socket.send(JSON.stringify(data));
  }

  async http(data) {
    try {
      const response = await fetch(this.url("http"), {
        method: "POST",
        body: JSON.stringify(data),
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      });
      this._onmessage(await response.json());
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
    }
  }

  _buildMessage(method, params) {
    if (typeof method !== "string") throw new TypeError(`${method} is not a string`);
    const message = { method, "json-rpc": "2.0", id: this.id() };
    if (params !== undefined) Object.assign(message, { params });
    return message;
  }

  batch(calls) {
    const messages = calls.map(([method, params]) => this._buildMessage(method, params));
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

  _send(data) {
    this.dispatchEvent(new JSONRPCEvent("output", { data }));
    if (this.socket?.readyState === 1) this.websocket(data);
    else this.http(data);
  }

  _onresponse({ id, error, result }) {
    const deferred = this.deferreds[id];
    if (!deferred) return;
    if (error) deferred.reject(new JSONRPCError(error));
    else deferred.resolve(result);
    delete this.deferreds[id];
  }

  _onrequest({ method, params }) {
    return this.onrequest(method, params);
  }

  _onnotification({ method, params }) {
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", { method, params }));
  }

  _onmessage(data) {
    this.dispatchEvent(new JSONRPCEvent("input", { data }));
    if (Array.isArray(data)) data.forEach((object) => this._onobject(object));
    else this._onobject(data);
  }

  _onobject(object) {
    if (object.method === undefined) this._onresponse(object);
    else if (object.id === undefined) this._onnotification(object);
    else this._onrequest(object);
  }

  async open() {
    this.socket = new WebSocket(this.url("ws"));
    this.socket.onclose = () => this.dispatchEvent(new Event("close"));
    this.socket.onmessage = ({ data }) => {
      try {
        this._onmessage(JSON.parse(data));
      } catch (error) {
        this.dispatchEvent(new ErrorEvent("error", { error }));
      }
    };
    this.socket.onopen = () => this.dispatchEvent(new Event("open"));
    this.socket.onerror = (error) => this.dispatchEvent(new ErrorEvent("error", { error }));
    return promiseEvent(this, "open");
  }

  async close() {
    const socket = this.socket;
    socket.close();
    return promiseEvent(this, "close");
  }
}

globalThis.promiseEvent = promiseEvent;
globalThis.JSONRPCError = JSONRPCError;
globalThis.JSONRPCEvent = JSONRPCEvent;
globalThis.JSONRPCNotificationEvent = JSONRPCNotificationEvent;
globalThis.JSONRPCClient = JSONRPCClient;
globalThis.JSONRPCClient_default = JSONRPCClient;

export { JSONRPCEvent, JSONRPCNotificationEvent, JSONRPCClient as default };
