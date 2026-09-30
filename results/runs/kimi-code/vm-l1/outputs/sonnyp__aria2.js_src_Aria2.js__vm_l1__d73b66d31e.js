function promiseEvent(target, type) {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  return new Promise((resolve, reject) => {
    target.addEventListener(type, (event) => {
      controller.abort();
      resolve(event);
    }, options);
    target.addEventListener("error", (event) => {
      controller.abort();
      reject(event);
    }, options);
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

if (typeof globalThis.ErrorEvent === "undefined") {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this.message = options.message || "";
      this.error = options.error;
    }
  };
}

class JSONRPCEvent extends Event {
  constructor(type, data) {
    super(type);
    this.data = data;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(method, params) {
    super(method);
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
    this.deferreds = {};
    this.lastId = 0;
    Object.assign(this, JSONRPCClient.defaultOptions, options);
  }

  id() {
    const id = this.lastId;
    this.lastId += 1;
    return id;
  }

  url(protocol) {
    return `${protocol}${this.secure ? "s" : ""}://${this.host}:${this.port}${this.path}`;
  }

  async websocket(message) {
    this.socket.send(JSON.stringify(message));
  }

  async http(message) {
    const response = await fetch(this.url("http"), {
      method: "POST",
      body: message === undefined ? undefined : JSON.stringify(message),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }

  _buildMessage(method, params) {
    const message = {
      method,
      "json-rpc": "2.0",
      id: this.id(),
    };
    if (params !== undefined) message.params = params;
    return message;
  }

  batch(calls) {
    const messages = calls.map(([method, params]) => this._buildMessage(method, params));
    return this._send(messages);
  }

  call(method, params) {
    const message = this._buildMessage(method, params);
    const promise = new Promise((resolve, reject) => {
      this.deferreds[message.id] = { resolve, reject };
    });
    this.deferreds[message.id].promise = promise;
    Promise.resolve()
      .then(() => this._send(message))
      .catch((error) => {
        const deferred = this.deferreds[message.id];
        if (deferred) {
          delete this.deferreds[message.id];
          deferred.reject(error);
        }
      });
    return promise;
  }

  async _send(message) {
    const object = this.socket
      ? await this.websocket(message)
      : await this.http(message);
    if (object !== undefined) this._onobject(object);
    return object;
  }

  _onresponse(response) {
    const deferred = this.deferreds[response.id];
    if (!deferred) return;
    delete this.deferreds[response.id];
    if (response.error) deferred.reject(new JSONRPCError(response.error));
    else deferred.resolve(response.result);
  }

  _onrequest(request) {
    return this.onrequest(request.method, request.params);
  }

  _onnotification(notification) {
    this.dispatchEvent(new JSONRPCNotificationEvent(
      "notification",
      notification.params,
    ));
  }

  _onmessage(event) {
    this.dispatchEvent(new JSONRPCEvent("input", event));
    this._onobject(event);
  }

  _onobject(object) {
    if (object.method) {
      if (object.id === undefined) this._onnotification(object);
      else this._onrequest(object);
    } else {
      this._onresponse(object);
    }
  }

  async open() {
    this.socket = new WebSocket(this.url("ws"));
    this.socket.onclose = (event) => this.dispatchEvent(new JSONRPCEvent("close", event));
    this.socket.onmessage = (event) => this._onmessage(event);
    this.socket.onopen = (event) => this.dispatchEvent(new JSONRPCEvent("open", event));
    this.socket.onerror = (event) => this.dispatchEvent(new JSONRPCEvent("error", event));
    return promiseEvent(this, "open");
  }

  async close() {
    this.socket.close();
    return promiseEvent(this, "close");
  }
}

function prefix(method) {
  return method.startsWith("aria2.") || method.startsWith("system.")
    ? method
    : `aria2.${method}`;
}

function unprefix(method) {
  return method.slice(6);
}

class Aria2 extends JSONRPCClient {
  static prefix = prefix;
  static unprefix = unprefix;
  static defaultOptions = {
    ...JSONRPCClient.defaultOptions,
    port: 6800,
  };

  constructor(options = {}) {
    super({ ...Aria2.defaultOptions, ...options });
  }

  addSecret(params) {
    const values = Array.isArray(params) ? [...params] : [];
    if (this.secret) values.unshift(`token:${this.secret}`);
    return values;
  }

  _onnotification(notification) {
    this.dispatchEvent(new JSONRPCNotificationEvent(
      unprefix(notification.method),
      notification.params,
    ));
    super._onnotification(notification);
  }

  call(method, params) {
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
    const messages = calls.map(([method, ...params]) => [
      prefix(method),
      this.addSecret(params),
    ]);
    return super.batch(messages);
  }

  listNotifications() {
    return this.call("system.listNotifications");
  }

  listMethods() {
    return this.call("system.listMethods");
  }
}

export default Aria2;
