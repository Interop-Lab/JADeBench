function promiseEvent(target, type) {
  return new Promise((resolve, reject) => {
    target.addEventListener(type, resolve, { once: true });
    target.addEventListener("error", (event) => reject(event.error), { once: true });
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
    this.deferreds = {};
    this.lastId = 0;
    Object.assign(this, this.constructor.defaultOptions, options);
  }

  id() {
    return this.lastId++;
  }

  url(protocol) {
    return `${protocol}://${this.host}:${this.port}${this.path}`;
  }

  async websocket(message) {
    this.socket.send(JSON.stringify(message));
  }

  async http(message) {
    try {
      const response = await fetch(this.url(this.secure ? "https" : "http"), {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      this._onobject(await response.json());
    } catch (error) {
      const messages = Array.isArray(message) ? message : [message];
      for (const { id } of messages) {
        const deferred = this.deferreds[id];
        if (deferred) {
          deferred.reject(error);
          delete this.deferreds[id];
        }
      }
    }
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
    const responses = messages.map(({ id }) => new Promise((resolve, reject) => {
      this.deferreds[id] = { resolve, reject };
    }));
    void this._send(messages);
    return responses;
  }

  async call(method, params) {
    const message = this._buildMessage(method, params);
    const response = new Promise((resolve, reject) => {
      this.deferreds[message.id] = { resolve, reject };
    });
    void this._send(message);
    return response;
  }

  _send(message) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return this.websocket(message);
    }
    return this.http(message);
  }

  _onresponse(response) {
    const deferred = this.deferreds[response.id];
    if (!deferred) return;

    delete this.deferreds[response.id];
    if (response.error) {
      deferred.reject(new JSONRPCError(response.error));
    } else {
      deferred.resolve(response.result);
    }
  }

  _onrequest(request) {
    this.dispatchEvent(new JSONRPCEvent("request", { data: request }));
  }

  _onnotification(notification) {
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", notification));
  }

  _onmessage(event) {
    const message = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    this._onobject(message);
  }

  _onobject(message) {
    if (Array.isArray(message)) {
      message.forEach((item) => this._onobject(item));
    } else if (message && message.method !== undefined) {
      if (message.id === undefined) this._onnotification(message);
      else this._onrequest(message);
    } else if (message && message.id !== undefined) {
      this._onresponse(message);
    }
  }

  open() {
    this.socket = new WebSocket(this.url(this.secure ? "wss" : "ws"));
    this.socket.onopen = (event) => this.dispatchEvent(new Event(event.type));
    this.socket.onclose = (event) => this.dispatchEvent(new Event(event.type));
    this.socket.onerror = (event) => this.dispatchEvent(new ErrorEvent(event.type, event));
    this.socket.onmessage = (event) => this._onmessage(event);
    return promiseEvent(this, "open");
  }

  close() {
    if (!this.socket) return Promise.resolve();
    const closed = promiseEvent(this, "close");
    this.socket.close();
    return closed;
  }
}

function prefix(methods) {
  if (Array.isArray(methods)) return methods.map(prefix);
  return /^(aria2|system)\./.test(methods) ? methods : `aria2.${methods}`;
}

function unprefix(methods) {
  if (Array.isArray(methods)) return methods.map(unprefix);
  return methods.replace(/^aria2\./, "");
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
    return this.secret ? [`token:${this.secret}`, ...params] : params.slice();
  }

  _onnotification(notification) {
    super._onnotification(notification);
    this.dispatchEvent(new JSONRPCNotificationEvent(unprefix(notification.method), {
      params: notification.params,
    }));
  }

  async call(method, ...params) {
    return super.call(prefix(method), this.addSecret(params));
  }

  async multicall(calls) {
    const methods = calls.map(([methodName, ...params]) => ({
      methodName: prefix(methodName),
      params: this.addSecret(params),
    }));
    return super.call("system.multicall", [methods]);
  }

  async batch(calls) {
    const prefixedCalls = calls.map(([method, ...params]) => [
      prefix(method),
      this.addSecret(params),
    ]);
    return Promise.all(super.batch(prefixedCalls));
  }

  async listNotifications() {
    return unprefix(await this.call("system.listNotifications"));
  }

  async listMethods() {
    return unprefix(await this.call("system.listMethods"));
  }
}

export { Aria2 as default };
