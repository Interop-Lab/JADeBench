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

const defaultOptions = {
  secure: false,
  host: "localhost",
  port: 80,
  secret: "",
  path: "/jsonrpc",
};

class JSONRPCClient extends EventTarget {
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
    let object;
    try {
      object = await response.json();
      this._onmessage(object);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
      throw error;
    }
    return object;
  }

  _buildMessage(method, params) {
    if (this.secret) params.unshift(`token:${this.secret}`);
    const message = { method, "json-rpc": "2.0", id: this.id() };
    if (params) Object.assign(message, { params });
    return message;
  }

  async batch(calls) {
    const messages = calls.map(([method, params]) => this._buildMessage(method, params));
    await this._send(messages);
    return messages.map(({ id }) => {
      const { promise } = this.deferreds[id] = Promise.withResolvers();
      return promise;
    });
  }

  async call(method, params) {
    const message = this._buildMessage(method, params);
    await this._send(message);
    const { promise } = this.deferreds[message.id] = Promise.withResolvers();
    return promise;
  }

  async _send(message) {
    this.dispatchEvent(new JSONRPCEvent("output", { detail: message }));
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
    return this._onnotification({ method, params });
  }

  _onnotification({ method, params }) {
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", { method, params }));
  }

  _onmessage(message) {
    this.dispatchEvent(new JSONRPCEvent("input", { detail: message }));
    if (Array.isArray(message)) {
      for (const object of message) this._onobject(object);
    } else {
      this._onobject(message);
    }
  }

  _onobject(object) {
    if (object.method !== undefined) this._onrequest(object);
    else if (object.id !== undefined) this._onresponse(object);
    else this._onnotification(object);
  }

  async open() {
    const socket = this.socket = new WebSocket(this.url("ws"));
    socket.onopen = () => this.dispatchEvent(new Event("open"));
    socket.onmessage = event => {
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
    socket.onerror = error => this.dispatchEvent(new ErrorEvent("error", { error }));
    return promiseEvent(this, "open");
  }

  async close() {
    const { socket } = this;
    socket.close();
    return promiseEvent(this, "close");
  }

  static defaultOptions = defaultOptions;
}

export { JSONRPCEvent, JSONRPCNotificationEvent, JSONRPCClient as default };
