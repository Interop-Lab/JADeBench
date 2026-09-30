/**
 * A small JSON-RPC 2.0 client with aria2-specific conveniences.
 */

function promiseEvent(target, successType, errorType = "error") {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      target.removeEventListener(successType, onSuccess);
      target.removeEventListener(errorType, onError);
    };
    const onSuccess = (event) => {
      cleanup();
      resolve(event);
    };
    const onError = (event) => {
      cleanup();
      reject(event.error || event);
    };
    target.addEventListener(successType, onSuccess, { once: true });
    target.addEventListener(errorType, onError, { once: true });
  });
}

class JSONRPCError extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.code = code;
    this.data = data;
    this.name = "JSONRPCError";
  }
}

if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this.message = options.message || "";
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

  async websocket(message) {
    if (!this.socket || this.socket.readyState > 1) await this.open();
    if (message !== undefined) this.socket.send(JSON.stringify(message));
    return this.socket;
  }

  async http(message) {
    const options = {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    };
    if (message !== undefined) options.body = JSON.stringify(message);
    const response = await fetch(this.url("http"), options);
    return message === undefined ? response : response.json();
  }

  _buildMessage(method, params) {
    return { method, "json-rpc": "2.0", id: this.id(), params };
  }

  batch(calls) {
    return this._send(calls.map(([method, params]) => this._buildMessage(method, params)));
  }

  call(method, params) {
    return this._send(this._buildMessage(method, params));
  }

  _send(message) {
    const messages = Array.isArray(message) ? message : [message];
    const pending = messages.map(({ id }) => new Promise((resolve, reject) => {
      this.deferreds[id] = { resolve, reject };
    }));

    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(JSON.stringify(message));
    } else {
      this.http(message)
        .then((response) => this._onmessage(response))
        .catch((error) => {
          for (const item of messages) {
            this.deferreds[item.id]?.reject(error);
            delete this.deferreds[item.id];
          }
        });
    }
    return Array.isArray(message) ? Promise.all(pending) : pending[0];
  }

  _onresponse(response) {
    const deferred = this.deferreds[response.id];
    if (deferred) {
      if (response.error) deferred.reject(new JSONRPCError(response.error));
      else deferred.resolve(response.result);
      delete this.deferreds[response.id];
    }
  }

  _onrequest(request) {
    this.dispatchEvent(new JSONRPCEvent("request", { data: request }));
  }

  _onnotification(notification) {
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", notification));
  }

  _onmessage(message) {
    const data = typeof message === "string"
      ? JSON.parse(message)
      : typeof message?.data === "string"
        ? JSON.parse(message.data)
        : message;
    if (Array.isArray(data)) data.forEach((item) => this._onobject(item));
    else this._onobject(data);
  }

  _onobject(object) {
    if (!object || typeof object !== "object") return;
    if (object.method !== undefined) {
      if (object.id !== undefined) this._onrequest(object);
      else this._onnotification(object);
    } else if (object.id !== undefined) {
      this._onresponse(object);
    }
  }

  async open() {
    if (this.socket && this.socket.readyState <= 1) return this.socket;
    const socket = new WebSocket(this.url("ws"));
    this.socket = socket;
    socket.addEventListener("message", (event) => this._onmessage(event));
    socket.addEventListener("close", (event) => this.dispatchEvent(new JSONRPCEvent("close", { data: event })));
    socket.addEventListener("error", (event) => this.dispatchEvent(new ErrorEvent("error", { error: event })));
    await promiseEvent(socket, "open");
    return socket;
  }

  close() {
    if (this.socket) this.socket.close();
    this.socket = undefined;
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
    return this.secret ? [`token:${this.secret}`, ...params] : params;
  }

  _onnotification(notification) {
    const eventName = unprefix(notification.method);
    if (eventName !== notification.method) {
      this.dispatchEvent(new JSONRPCNotificationEvent(eventName, {
        params: notification.params,
      }));
    }
    super._onnotification(notification);
  }

  call(method, ...params) {
    return super.call(prefix(method), this.addSecret(params));
  }

  multicall(calls) {
    const requests = calls.map(([method, ...params]) => ({
      methodName: prefix(method),
      params: this.addSecret(params),
    }));
    return super.call("system.multicall", [requests]);
  }

  batch(calls) {
    const messages = calls.map(([method, ...params]) =>
      this._buildMessage(prefix(method), this.addSecret(params)));
    return this._send(messages);
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
  Aria2,
  Aria2_default: Aria2,
});

export default Aria2;
