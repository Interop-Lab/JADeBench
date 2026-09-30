function promiseEvent(target, type) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      target.removeEventListener(type, onEvent);
      target.removeEventListener("error", onError);
    };
    const onEvent = (event) => {
      cleanup();
      resolve(event);
    };
    const onError = (event) => {
      cleanup();
      reject(event.error || event);
    };

    target.addEventListener(type, onEvent, { once: true });
    if (type !== "error") target.addEventListener("error", onError, { once: true });
  });
}

class JSONRPCError extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.name = "JSONRPCError";
    this.code = code;
    this.data = data;
  }
}

if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this.message = options.message || "";
      this.filename = options.filename || "";
      this.lineno = options.lineno || 0;
      this.colno = options.colno || 0;
      this.error = options.error;
    }
  };
}

class JSONRPCEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.request = options.request;
    this.response = options.response;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.method = options.method;
    this.params = options.params;
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
    this.options = { ...JSONRPCClient.defaultOptions, ...options };
    this.sequence = 0;
    this.pending = new Map();
    this.socket = null;
  }

  id() {
    this.sequence += 1;
    return this.sequence;
  }

  url(transport) {
    const { secure, host, port, path } = this.options;
    const protocol = transport === "websocket"
      ? secure ? "wss" : "ws"
      : secure ? "https" : "http";
    const defaultPort = secure ? 443 : 80;
    const authority = port && port !== defaultPort ? `${host}:${port}` : host;
    return `${protocol}://${authority}${path}`;
  }

  websocket(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("WebSocket is not open"));
    }
    this.socket.send(JSON.stringify(message));
    return undefined;
  }

  async http(message) {
    const response = await fetch(this.url("http"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(message),
    });
    const object = await response.json();
    this._onobject(object);
    return object;
  }

  _buildMessage(method, params = []) {
    return { jsonrpc: "2.0", id: this.id(), method, params };
  }

  batch(calls) {
    const messages = calls.map((call) => {
      if (Array.isArray(call)) return this._buildMessage(call[0], call[1] || []);
      return this._buildMessage(call.method, call.params || []);
    });
    return Promise.all(messages.map((message) => this._send(message)));
  }

  call(method, params = []) {
    return this._send(this._buildMessage(method, params));
  }

  _send(message) {
    const messages = Array.isArray(message) ? message : [message];
    const promises = messages.map((request) => new Promise((resolve, reject) => {
      if (request.id !== undefined) this.pending.set(request.id, { request, resolve, reject });
      else resolve(undefined);
    }));

    const transport = this.socket && this.socket.readyState === WebSocket.OPEN
      ? this.websocket(message)
      : this.http(message);
    Promise.resolve(transport).catch((error) => {
      for (const request of messages) {
        const pending = this.pending.get(request.id);
        if (pending) {
          this.pending.delete(request.id);
          pending.reject(error);
        }
      }
      this.dispatchEvent(new ErrorEvent("error", { error, message: error.message }));
    });

    return Array.isArray(message) ? Promise.all(promises) : promises[0];
  }

  _onresponse(response) {
    const pending = this.pending.get(response.id);
    if (!pending) return;
    this.pending.delete(response.id);
    this.dispatchEvent(new JSONRPCEvent("response", { request: pending.request, response }));
    if (response.error) pending.reject(new JSONRPCError(response.error));
    else pending.resolve(response.result);
  }

  _onrequest(request) {
    this.dispatchEvent(new JSONRPCEvent("request", { request }));
  }

  _onnotification(notification) {
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", notification));
  }

  _onmessage(event) {
    try {
      const value = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      this._onobject(value);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error, message: error.message }));
    }
  }

  _onobject(value) {
    if (Array.isArray(value)) value.forEach((item) => this._onobject(item));
    else if (value && value.id !== undefined && ("result" in value || "error" in value)) this._onresponse(value);
    else if (value && value.id !== undefined && value.method) this._onrequest(value);
    else if (value && value.method) this._onnotification(value);
  }

  open() {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) return promiseEvent(this.socket, "open");
    this.socket = new WebSocket(this.url("websocket"));
    this.socket.addEventListener("message", (event) => this._onmessage(event));
    this.socket.addEventListener("open", (event) => this.dispatchEvent(new Event("open", event)));
    this.socket.addEventListener("close", (event) => this.dispatchEvent(new Event("close", event)));
    this.socket.addEventListener("error", (event) => {
      this.dispatchEvent(new ErrorEvent("error", { error: event.error, message: event.message }));
    });
    return promiseEvent(this.socket, "open");
  }

  close() {
    if (!this.socket) return;
    this.socket.close();
    this.socket = null;
  }
}

function prefix(method) {
  return method.includes(".") ? method : `aria2.${method}`;
}

function unprefix(method) {
  return method.startsWith("aria2.") ? method.slice(6) : method;
}

class Aria2 extends JSONRPCClient {
  static prefix = prefix;
  static unprefix = unprefix;
  static defaultOptions = {
    ...JSONRPCClient.defaultOptions,
    secure: false,
    host: "localhost",
    port: 6800,
    secret: "",
    path: "/jsonrpc",
  };

  constructor(options = {}) {
    super({ ...Aria2.defaultOptions, ...options });
  }

  addSecret(params = []) {
    const values = [...params];
    if (this.options.secret) values.unshift(`token:${this.options.secret}`);
    return values;
  }

  _onnotification(notification) {
    const method = unprefix(notification.method);
    this.dispatchEvent(new JSONRPCNotificationEvent(method, { method, params: notification.params }));
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", { method, params: notification.params }));
  }

  call(method, params = []) {
    return super.call(prefix(method), this.addSecret(params));
  }

  multicall(calls) {
    const methods = calls.map((call) => ({
      methodName: prefix(call.methodName || call.method || call[0]),
      params: this.addSecret(call.params || call[1] || []),
    }));
    return super.call("system.multicall", [methods]);
  }

  batch(calls) {
    return super.batch(calls.map((call) => Array.isArray(call)
      ? [prefix(call[0]), this.addSecret(call[1] || [])]
      : { method: prefix(call.method), params: this.addSecret(call.params || []) }));
  }

  listNotifications() {
    return this.call("system.listNotifications");
  }

  listMethods() {
    return this.call("system.listMethods");
  }
}

Object.assign(globalThis, {
  promiseEvent,
  JSONRPCError,
  JSONRPCEvent,
  JSONRPCNotificationEvent,
  JSONRPCClient,
  JSONRPCClient_default: JSONRPCClient,
  prefix,
  unprefix,
  Aria2,
  Aria2_default: Aria2,
});

export { Aria2 as default };
