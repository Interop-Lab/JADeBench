function promiseEvent(target, eventName) {
  const controller = new AbortController();
  const { signal } = controller;

  return new Promise((resolve, reject) => {
    target.addEventListener(eventName, resolve, { signal });
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
    this.detail = options?.detail;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.method = options?.method;
    this.params = options?.params;
  }
}

const jsonRpcDefaults = {
  secure: false,
  host: "localhost",
  port: 80,
  secret: "",
  path: "/jsonrpc",
};

class JSONRPCClient extends EventTarget {
  constructor(options) {
    super();
    this.promises = Object.create(null);
    this.nextId = 0;
    Object.assign(this, this.constructor.defaultOptions, options);
  }

  id() {
    return this.nextId++;
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

    let body;
    try {
      body = await response.json();
      this._onmessage(body);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
      throw error;
    }
    return body;
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
    const messages = calls.map(([method, params]) =>
      this._buildMessage(method, params),
    );
    await this._send(messages);

    return messages.map(({ id }) => {
      const { promise, resolve, reject } = Promise.withResolvers();
      this.promises[id] = { promise, resolve, reject };
      return promise;
    });
  }

  async call(method, params) {
    const message = this._buildMessage(method, params);
    await this._send(message);
    const { promise, resolve, reject } = Promise.withResolvers();
    this.promises[message.id] = { promise, resolve, reject };
    return promise;
  }

  async _send(message) {
    this.dispatchEvent(new JSONRPCEvent("send", { detail: message }));
    return this.socket?.readyState === 1
      ? this.websocket(message)
      : this.http(message);
  }

  _onresponse({ id, error, result }) {
    const pending = this.promises[id];
    if (!pending) return;

    if (error) pending.reject(new JSONRPCError(error));
    else pending.resolve(result);
    delete this.promises[id];
  }

  _onrequest({ method, params }) {
    return this.call(method, params);
  }

  _onnotification({ method, params }) {
    this.dispatchEvent(
      new JSONRPCNotificationEvent("notification", { method, params }),
    );
  }

  _onmessage(message) {
    this.dispatchEvent(new JSONRPCEvent("message", { detail: message }));
    if (Array.isArray(message)) {
      for (const item of message) this._onobject(item);
    } else {
      this._onobject(message);
    }
  }

  _onobject(message) {
    if (message.method === undefined) this._onresponse(message);
    else if (message.id === undefined) this._onnotification(message);
    else this._onrequest(message);
  }

  async open() {
    const socket = (this.socket = new WebSocket(this.url("ws")));

    socket.onopen = () => this.dispatchEvent(new Event("open"));
    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (error) {
        this.dispatchEvent(new ErrorEvent("error", { error }));
        return;
      }
      this._onmessage(message);
    };
    socket.onclose = () => this.dispatchEvent(new Event("close"));
    socket.onerror = (error) =>
      this.dispatchEvent(new ErrorEvent("error", { error }));

    return promiseEvent(this, "open");
  }

  async close() {
    const { socket } = this;
    socket.close();
    return promiseEvent(this, "close");
  }

  static defaultOptions = jsonRpcDefaults;
}

function prefix(method) {
  if (!method.startsWith("aria2.") && !method.startsWith("system.")) {
    method = `aria2.${method}`;
  }
  return method;
}

function unprefix(method) {
  return method.split("aria2.")[1] || method;
}

const aria2Defaults = {
  secure: false,
  host: "localhost",
  port: 6800,
  secret: "",
  path: "/jsonrpc",
};

class Aria2 extends JSONRPCClient {
  addSecret(params) {
    let result = this.secret ? [`token:${this.secret}`] : [];
    if (Array.isArray(params)) result = result.concat(params);
    return result;
  }

  _onnotification(notification) {
    const { method, params } = notification;
    const eventName = unprefix(method);
    if (eventName !== method) {
      this.dispatchEvent(
        new JSONRPCNotificationEvent(eventName, { method: eventName, params }),
      );
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
      calls.map(([method, ...params]) => [
        prefix(method),
        this.addSecret(params),
      ]),
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

  static prefix;
  static unprefix;
  static defaultOptions = { ...JSONRPCClient.defaultOptions, ...aria2Defaults };
}

export { Aria2 as default };
