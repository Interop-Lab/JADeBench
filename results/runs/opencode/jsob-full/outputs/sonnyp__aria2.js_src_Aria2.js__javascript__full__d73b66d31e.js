/* Recovered, unobfuscated implementation. */

function promiseEvent(target, type) {
  const controller = new AbortController();
  const { signal } = controller;
  return new Promise((resolve, reject) => {
    target.addEventListener(type, resolve, { signal });
    target.addEventListener("error", reject, { signal });
  }).finally(() => controller.abort());
}

class JSONRPCError extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.code = code;
    if (data) this.data = data;
    this.name = this.constructor.name;
  }
}

if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, options) {
      super(type, options);
      this.error = options?.error;
    }
  };
}

class JSONRPCEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.result = options?.result;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.params = options?.params;
  }
}

class JSONRPCClient extends EventTarget {
  constructor(options = {}) {
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

  websocket() {
    if (!this.socket) {
      const socket = this.socket = new WebSocket(this.url("ws"));
      socket.addEventListener("message", event => this._onmessage(event));
      socket.addEventListener("open", event => this.dispatchEvent(new Event("open", event)));
      socket.addEventListener("close", event => this.dispatchEvent(new Event("close", event)));
      socket.addEventListener("error", event => this.dispatchEvent(new ErrorEvent("error", { error: event })));
    }
    return this.socket;
  }

  async http(message) {
    const response = await fetch(this.url("http"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(message)
    });
    return response.json();
  }

  _buildMessage(method, params) {
    if (typeof method !== "string") throw new TypeError(`${method} is not a string`);
    const message = { method, "json-rpc": "2.0", id: this.id() };
    if (params !== undefined) message.params = params;
    return message;
  }

  async batch(calls) {
    const messages = calls.map(([method, ...params]) => this._buildMessage(method, params));
    return this._send(messages);
  }

  async call(method, ...params) {
    return this._send(this._buildMessage(method, params.length ? params : undefined));
  }

  async _send(message) {
    const messages = Array.isArray(message) ? message : [message];
    const promises = messages.map(item => new Promise((resolve, reject) => {
      this.deferreds[item.id] = { resolve, reject };
    }));

    if (this.websocket !== false) {
      const socket = this.websocket();
      if (socket.readyState !== WebSocket.OPEN) await promiseEvent(socket, "open");
      socket.send(JSON.stringify(message));
    } else {
      const response = await this.http(message);
      this._onobject(response);
    }
    const results = await Promise.all(promises);
    return Array.isArray(message) ? results : results[0];
  }

  _onresponse(response) {
    const deferred = this.deferreds[response.id];
    if (!deferred) return;
    delete this.deferreds[response.id];
    if (response.error) deferred.reject(new JSONRPCError(response.error));
    else deferred.resolve(response.result);
  }

  _onrequest(request) {
    this.dispatchEvent(new JSONRPCEvent("request", { result: request }));
  }

  _onnotification(notification) {
    this.dispatchEvent(new JSONRPCNotificationEvent(notification.method, {
      params: notification.params
    }));
  }

  _onmessage(event) {
    this._onobject(JSON.parse(event.data));
  }

  _onobject(object) {
    if (Array.isArray(object)) return object.forEach(item => this._onobject(item));
    if (Object.prototype.hasOwnProperty.call(object, "id") && ("result" in object || "error" in object)) {
      this._onresponse(object);
    } else if (object.method && Object.prototype.hasOwnProperty.call(object, "id")) {
      this._onrequest(object);
    } else if (object.method) {
      this._onnotification(object);
    }
  }

  async open() {
    const socket = this.websocket();
    if (socket.readyState !== WebSocket.OPEN) await promiseEvent(socket, "open");
    return socket;
  }

  async close() {
    if (!this.socket) return;
    const socket = this.socket;
    if (socket.readyState === WebSocket.OPEN) {
      const closed = promiseEvent(socket, "close");
      socket.close();
      await closed;
    } else {
      socket.close();
    }
    delete this.socket;
  }

  static defaultOptions = {
    secure: false,
    host: "localhost",
    port: 80,
    secret: "",
    path: "/jsonrpc"
  };
}

function prefix(method) {
  return method.startsWith("system.") || method.startsWith("aria2.")
    ? method
    : `aria2.${method}`;
}

function unprefix(method) {
  return method.startsWith("aria2.") ? method.slice(6) : method;
}

class Aria2 extends JSONRPCClient {
  addSecret(params) {
    const result = this.secret ? [`token:${this.secret}`] : [];
    return Array.from(result.concat(params || []));
  }

  _onnotification(notification) {
    if (notification.method) notification = { ...notification, method: unprefix(notification.method) };
    return super._onnotification(notification);
  }

  async call(method, ...params) {
    return super.call(prefix(method), ...this.addSecret(params));
  }

  async multicall(calls) {
    const params = calls.map(([methodName, ...params]) => ({
      methodName: prefix(methodName),
      params: this.addSecret(params)
    }));
    return super.call("system.multicall", params);
  }

  async batch(calls) {
    return super.batch(calls.map(([method, ...params]) => [prefix(method), ...this.addSecret(params)]));
  }

  async listNotifications() {
    const result = await this.call("system.listNotifications");
    return result.map(unprefix);
  }

  async listMethods() {
    const result = await this.call("system.listMethods");
    return result.map(unprefix);
  }

  static prefix;
  static unprefix;
  static defaultOptions = {
    ...JSONRPCClient.defaultOptions,
    secure: false,
    host: "localhost",
    port: 6800,
    secret: "",
    path: "/jsonrpc"
  };
}

export default Aria2;
