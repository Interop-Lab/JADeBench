// ../work/sonnyp__aria2.js/src/promiseEvent.js
function promiseEvent(target, event) {
  const controller = new AbortController();
  const { signal } = controller;
  return new Promise((resolve, reject) => {
    target.addEventListener(event, resolve, {
      signal
    });
    target.addEventListener("error", reject, {
      signal
    });
  }).finally(() => controller.abort());
}

// ../work/sonnyp__aria2.js/src/JSONRPCError.js
var JSONRPCError = class extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.code = code;
    if (data) this.data = data;
    this.name = this.constructor.name;
  }
};

// ../work/sonnyp__aria2.js/src/JSONRPCClient.js
if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, options) {
      super(type, options);
      this.error = options?.error;
    }
  };
}
var JSONRPCEvent = class extends Event {
  constructor(type, options) {
    super(type, options);
    this.data = options?.data;
  }
};
var JSONRPCNotificationEvent = class extends Event {
  constructor(type, options) {
    super(type, options);
    this.method = options?.method;
    this.params = options?.params;
  }
};
var JSONRPCClient = class extends EventTarget {
  constructor(options) {
    super();
    this.deferreds = /* @__PURE__ */ Object.create(null);
    this.lastId = 0;
    Object.assign(this, this.constructor.defaultOptions, options);
  }
  id() {
    return this.lastId++;
  }
  url(protocol) {
    return protocol + (this.secure ? "s" : "") + "://" + this.host + ":" + this.port + this.path;
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
        "Content-Type": "application/json"
      }
    });
    let msg;
    try {
      msg = await response.json();
      this._onmessage(msg);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
      throw error;
    }
    return msg;
  }
  _buildMessage(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(method + " is not a string");
    }
    const message = {
      method,
      "json-rpc": "2.0",
      id: this.id()
    };
    if (params) Object.assign(message, { params });
    return message;
  }
  async batch(calls) {
    const message = calls.map(([method, params]) => {
      return this._buildMessage(method, params);
    });
    await this._send(message);
    return message.map(({ id }) => {
      const { promise } = this.deferreds[id] = Promise.withResolvers();
      return promise;
    });
  }
  async call(method, parameters) {
    const message = this._buildMessage(method, parameters);
    await this._send(message);
    const { promise } = this.deferreds[message.id] = Promise.withResolvers();
    return promise;
  }
  async _send(message) {
    this.dispatchEvent(new JSONRPCEvent("output", { data: message }));
    return this.socket?.readyState === 1 ? this.websocket(message) : this.http(message);
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
    this.dispatchEvent(
      new JSONRPCNotificationEvent("notification", { method, params })
    );
  }
  _onmessage(message) {
    this.dispatchEvent(new JSONRPCEvent("input", { data: message }));
    if (Array.isArray(message)) {
      for (const object of message) {
        this._onobject(object);
      }
    } else {
      this._onobject(message);
    }
  }
  _onobject(message) {
    if (message.method === void 0) this._onresponse(message);
    else if (message.id === void 0) this._onnotification(message);
    else this._onrequest(message);
  }
  async open() {
    const socket = this.socket = new WebSocket(this.url("ws"));
    socket.onclose = () => {
      this.dispatchEvent(new Event("close"));
    };
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
    socket.onopen = () => {
      this.dispatchEvent(new Event("open"));
    };
    socket.onerror = (evt) => {
      this.dispatchEvent(new ErrorEvent("error", { error: evt }));
    };
    return promiseEvent(this, "open");
  }
  async close() {
    const { socket } = this;
    socket.close();
    return promiseEvent(this, "close");
  }
  static defaultOptions = {
    secure: false,
    host: "localhost",
    port: 80,
    secret: "",
    path: "/jsonrpc"
  };
};
var JSONRPCClient_default = JSONRPCClient;

// ../work/sonnyp__aria2.js/src/Aria2.js
function prefix(str) {
  if (!str.startsWith("system.") && !str.startsWith("aria2.")) {
    str = "aria2." + str;
  }
  return str;
}
function unprefix(str) {
  const suffix = str.split("aria2.")[1];
  return suffix || str;
}
var Aria2 = class extends JSONRPCClient_default {
  addSecret(parameters) {
    let params = this.secret ? ["token:" + this.secret] : [];
    if (Array.isArray(parameters)) {
      params = params.concat(parameters);
    }
    return params;
  }
  _onnotification(notification) {
    const { method, params } = notification;
    const event = unprefix(method);
    if (event !== method) {
      this.dispatchEvent(new JSONRPCNotificationEvent(event, { params }));
    }
    return super._onnotification(notification);
  }
  async call(method, ...params) {
    return super.call(prefix(method), this.addSecret(params));
  }
  async multicall(calls) {
    const multi = [
      calls.map(([method, ...params]) => {
        return { methodName: prefix(method), params: this.addSecret(params) };
      })
    ];
    return super.call("system.multicall", multi);
  }
  async batch(calls) {
    return super.batch(
      calls.map(([method, ...params]) => [
        prefix(method),
        this.addSecret(params)
      ])
    );
  }
  async listNotifications() {
    const events = await this.call("system.listNotifications");
    return events.map((event) => unprefix(event));
  }
  async listMethods() {
    const methods = await this.call("system.listMethods");
    return methods.map((method) => unprefix(method));
  }
  static prefix;
  static unprefix;
  static defaultOptions = {
    ...JSONRPCClient_default.defaultOptions,
    ...{
      secure: false,
      host: "localhost",
      port: 6800,
      secret: "",
      path: "/jsonrpc"
    }
  };
};
var Aria2_default = Aria2;
export {
  Aria2_default as default
};
