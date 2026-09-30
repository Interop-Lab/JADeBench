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
    this.data = options?.data;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.params = options?.params;
    this.method = options?.method;
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

  async websocket(message) {
    this.socket.send(JSON.stringify(message));
  }

  async http(message) {
    const response = await fetch(this.url("http"), {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    let result;
    try {
      result = await response.json();
      this._onmessage(result);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
      throw error;
    }
    return result;
  }

  _buildMessage(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(`${method} is not a string`);
    }

    const message = { method, "json-rpc": "2.0", id: this.id() };
    if (params) Object.assign(message, { params });
    return message;
  }

  async batch(calls) {
    const messages = calls.map(([method, params]) => this._buildMessage(method, params));
    await this._send(messages);
    return messages.map(({ id }) => {
      const { promise } = (this.deferreds[id] = Promise.withResolvers());
      return promise;
    });
  }

  async call(method, params) {
    const message = this._buildMessage(method, params);
    await this._send(message);
    const { promise } = (this.deferreds[message.id] = Promise.withResolvers());
    return promise;
  }

  async _send(message) {
    this.dispatchEvent(new JSONRPCEvent("output", { data: message }));
    return this.socket?.readyState === 1
      ? this.websocket(message)
      : this.http(message);
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
    this.dispatchEvent(new JSONRPCNotificationEvent(method, { method, params }));
  }

  _onmessage(data) {
    this.dispatchEvent(new JSONRPCEvent("input", { data }));
    if (Array.isArray(data)) {
      for (const object of data) this._onobject(object);
    } else {
      this._onobject(data);
    }
  }

  _onobject(object) {
    if (object.method === undefined) this._onresponse(object);
    else if (object.id === undefined) this._onnotification(object);
    else this._onrequest(object);
  }

  async open() {
    const socket = (this.socket = new WebSocket(this.url("ws")));
    socket.onclose = () => this.dispatchEvent(new Event("close"));
    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        this.dispatchEvent(new ErrorEvent("error", { error }));
        return;
      }
      this._onmessage(data);
    };
    socket.onopen = () => this.dispatchEvent(new Event("open"));
    socket.onerror = (error) =>
      this.dispatchEvent(new ErrorEvent("error", { error }));
    return promiseEvent(this, "open");
  }

  async close() {
    this.socket.close();
    return promiseEvent(this, "close");
  }
}

const JSONRPCClient_default = JSONRPCClient;

function prefix(method) {
  if (!method.startsWith("system.") && !method.startsWith("aria2.")) {
    return `aria2.${method}`;
  }
  return method;
}

function unprefix(method) {
  return method.split("aria2.")[1] || method;
}

const aria2Options = {
  secure: false,
  host: "localhost",
  port: 6800,
  secret: "",
  path: "/jsonrpc",
};

class Aria2 extends JSONRPCClient_default {
  static prefix;
  static unprefix;
  static defaultOptions = {
    ...JSONRPCClient_default.defaultOptions,
    ...aria2Options,
  };

  addSecret(params) {
    let result = this.secret ? [`token:${this.secret}`] : [];
    if (Array.isArray(params)) result = result.concat(params);
    return result;
  }

  _onnotification(notification) {
    const { method, params } = notification;
    const eventName = unprefix(method);
    if (eventName !== method) {
      this.dispatchEvent(new JSONRPCNotificationEvent(eventName, { params }));
    }
    return super._onnotification(notification);
  }

  async call(method, ...params) {
    return super.call(prefix(method), this.addSecret(params));
  }

  async multicall(calls) {
    const params = [
      calls.map(([method, ...args]) => ({
        methodName: prefix(method),
        params: this.addSecret(args),
      })),
    ];
    return super.call("system.multicall", params);
  }

  async batch(calls) {
    return super.batch(
      calls.map(([method, ...params]) => [prefix(method), this.addSecret(params)]),
    );
  }

  async listNotifications() {
    const notifications = await this.call("system.listNotifications");
    return notifications.map((method) => unprefix(method));
  }

  async listMethods() {
    const methods = await this.call("system.listMethods");
    return methods.map((method) => unprefix(method));
  }
}

const Aria2_default = Aria2;
export { Aria2_default as default };
