/* A small JSON-RPC 2.0 client supporting HTTP and WebSocket transports. */

function promiseEvent(target, type) {
  return new Promise((resolve, reject) => {
    target.addEventListener(type, resolve, { once: true });
    target.addEventListener("error", reject, { once: true });
  });
}

class JSONRPCError extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.code = code;
    if (data !== undefined) this.data = data;
    this.name = "JSONRPCError";
  }
}

// Node has EventTarget and Event but did not always provide ErrorEvent.
if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, options = {}) {
      super(type, options);
      Object.assign(this, options);
    }
  };
}

class JSONRPCEvent extends Event {
  constructor(type, { data } = {}) {
    super(type);
    this.data = data;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, { method, params } = {}) {
    super(type);
    this.method = method;
    this.params = params;
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
    return `${protocol}${this.secure ? "s" : ""}://${this.host}:${this.port}${this.path}`;
  }

  websocket(message) {
    this.socket.send(typeof message === "string" ? message : JSON.stringify(message));
  }

  async http(message) {
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    if (message !== undefined) options.body = JSON.stringify(message);
    const response = await fetch(this.url("http"), options);
    return response.json();
  }

  _buildMessage(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(`${method} is not a string`);
    }
    const message = { method, "json-rpc": "2.0", id: this.id() };
    if (params !== undefined) message.params = params;
    return message;
  }

  batch(calls) {
    const messages = calls.map((call) => this._buildMessage(...call));
    const promises = messages.map(({ id }) => new Promise((resolve, reject) => {
      this.deferreds[id] = { resolve, reject };
    }));
    this._send(messages);
    return Promise.all(promises);
  }

  call(method, params) {
    const message = this._buildMessage(method, params);
    const result = new Promise((resolve, reject) => {
      this.deferreds[message.id] = { resolve, reject };
    });
    this._send(message);
    return result;
  }

  _send(message) {
    if (this.socket) return this.websocket(message);
    return this.http(message).then((response) => this._onmessage(response));
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

  _onnotification({ method, params }) {
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", { method, params }));
  }

  _onmessage(message) {
    const value = typeof message === "string" ? JSON.parse(message) : message;
    if (Array.isArray(value)) value.forEach((item) => this._onobject(item));
    else this._onobject(value);
  }

  _onobject(object) {
    if (object.method !== undefined) {
      if (object.id !== undefined) return this._onrequest(object);
      return this._onnotification(object);
    }
    if (object.id !== undefined) return this._onresponse(object);
  }

  open() {
    this.socket = new WebSocket(this.url("ws"));
    this.socket.onclose = (event) => this.dispatchEvent(new JSONRPCEvent("close", { data: event }));
    this.socket.onmessage = (event) => this._onmessage(event.data);
    this.socket.onopen = (event) => this.dispatchEvent(new JSONRPCEvent("open", { data: event }));
    this.socket.onerror = (event) => this.dispatchEvent(new ErrorEvent("error", { error: event }));
    return promiseEvent(this, "open");
  }

  close() {
    const closed = promiseEvent(this, "close");
    this.socket.close();
    return closed;
  }
}

// These globals are side effects of the input module and are retained.
globalThis.promiseEvent = promiseEvent;
globalThis.JSONRPCError = JSONRPCError;
globalThis.JSONRPCEvent = JSONRPCEvent;
globalThis.JSONRPCNotificationEvent = JSONRPCNotificationEvent;
globalThis.JSONRPCClient = JSONRPCClient;
globalThis.JSONRPCClient_default = JSONRPCClient;

export { JSONRPCEvent, JSONRPCNotificationEvent, JSONRPCClient as default };
