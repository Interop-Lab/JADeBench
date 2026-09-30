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
    this.data = data;
    this.name = this.constructor.name;
  }
}

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
    Object.assign(this, this.constructor.defaultOptions, options);
  }

  id() {
    return this.lastId++;
  }

  url(protocol) {
    return `${protocol}${this.secure ? "s" : ""}://${this.host}:${this.port}${this.path}`;
  }

  websocket(message) {
    return this.socket.send(JSON.stringify(message));
  }

  async http(message) {
    try {
      const response = await fetch(this.url("http"), {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      this._onmessage(data);
      return data;
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
    }
  }

  _buildMessage(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(`${method} is not a string`);
    }

    return Object.assign(
      {
        method,
        "json-rpc": "2.0",
        id: this.id(),
      },
      params === undefined ? {} : { params },
    );
  }

  async batch(calls) {
    return this._send(calls.map((args) => this._buildMessage(...args)));
  }

  async call(method, params) {
    const message = this._buildMessage(method, params);
    const deferred = Promise.withResolvers();
    this.deferreds[message.id] = deferred;
    this._send(message);
    return deferred.promise;
  }

  _send(message) {
    const event = new JSONRPCEvent("output", { data: message });
    this.dispatchEvent(event);

    if (this.socket && this.socket.readyState === 1) {
      return this.websocket(event.data);
    }
    return this.http(event.data);
  }

  _onresponse({ id, error, result }) {
    const deferred = this.deferreds[id];
    if (!deferred) return;

    delete this.deferreds[id];
    if (error) {
      deferred.reject(new JSONRPCError(error));
    } else {
      deferred.resolve(result);
    }
  }

  _onrequest({ method, params }) {
    return this.onrequest(method, params);
  }

  _onnotification({ method, params }) {
    this.dispatchEvent(
      new JSONRPCNotificationEvent("notification", { method, params }),
    );
  }

  _onmessage(data) {
    const event = new JSONRPCEvent("input", { data });
    this.dispatchEvent(event);

    if (Array.isArray(event.data)) {
      event.data.forEach((value) => this._onobject(value));
    } else {
      this._onobject(event.data);
    }
  }

  _onobject(object) {
    if (object.method === undefined) {
      this._onresponse(object);
    } else if (object.id === undefined) {
      this._onnotification(object);
    } else {
      this._onrequest(object);
    }
  }

  async open() {
    this.socket = new WebSocket(this.url("ws"));
    this.socket.onclose = (event) => this.dispatchEvent(event);
    this.socket.onmessage = (event) => this._onmessage(JSON.parse(event.data));
    this.socket.onopen = (event) => this.dispatchEvent(event);
    this.socket.onerror = (error) => {
      this.dispatchEvent(new ErrorEvent("error", { error }));
    };
    return promiseEvent(this.socket, "open");
  }

  async close() {
    this.socket.close();
    return promiseEvent(this.socket, "close");
  }
}

function prefix(method) {
  if (method.startsWith("system.") || method.startsWith("aria2.")) {
    return method;
  }
  return `aria2.${method}`;
}

function unprefix(method) {
  return method.split("aria2.").pop();
}

class Aria2 extends JSONRPCClient {
  static prefix;
  static unprefix;
  static defaultOptions = {
    ...JSONRPCClient.defaultOptions,
    secure: false,
    host: "localhost",
    port: 6800,
    secret: "",
    path: "/jsonrpc",
  };

  addSecret(params) {
    const secret = this.secret ? [`token:${this.secret}`] : [];
    return Array.isArray(params) ? secret.concat(params) : secret;
  }

  _onnotification(notification) {
    const { method, params } = notification;
    this.dispatchEvent(
      new JSONRPCNotificationEvent(unprefix(method), { method, params }),
    );
    return super._onnotification(notification);
  }

  call(method) {
    const args = Array.prototype.slice.call(arguments, 1);
    return super.call(prefix(method), this.addSecret(args));
  }

  multicall(calls) {
    return this.call(
      "system.multicall",
      calls.map(([method, params]) => ({
        methodName: prefix(method),
        params: this.addSecret(params),
      })),
    );
  }

  batch(calls) {
    return super.batch(
      calls.map(([method, ...params]) => [prefix(method), this.addSecret(params)]),
    );
  }

  async listNotifications() {
    return (await this.call("system.listNotifications")).map(unprefix);
  }

  async listMethods() {
    return (await this.call("system.listMethods")).map(unprefix);
  }
}

Object.assign(globalThis, {
  promiseEvent,
  prefix,
  unprefix,
  JSONRPCError,
  JSONRPCEvent,
  JSONRPCNotificationEvent,
  JSONRPCClient,
  JSONRPCClient_default: JSONRPCClient,
  Aria2,
  Aria2_default: Aria2,
});

export { Aria2 as default };
