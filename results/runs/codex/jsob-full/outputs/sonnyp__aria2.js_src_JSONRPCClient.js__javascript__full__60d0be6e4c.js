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

    let data;
    try {
      data = await response.json();
      this._onmessage(data);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
      throw error;
    }
    return data;
  }

  _buildMessage(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(`${method} is not a string`);
    }

    const message = {
      method,
      "json-rpc": "2.0",
      id: this.id(),
    };
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
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", { method, params }));
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
    if (object.method === undefined) {
      this._onresponse(object);
    } else if (object.id === undefined) {
      this._onnotification(object);
    } else {
      this._onrequest(object);
    }
  }

  async open() {
    const socket = (this.socket = new WebSocket(this.url("ws")));
    socket.onclose = () => this.dispatchEvent(new Event("close"));
    socket.onmessage = ({ data }) => {
      let message;
      try {
        message = JSON.parse(data);
      } catch (error) {
        this.dispatchEvent(new ErrorEvent("error", { error }));
        return;
      }
      this._onmessage(message);
    };
    socket.onopen = () => this.dispatchEvent(new Event("open"));
    socket.onerror = error => {
      this.dispatchEvent(new ErrorEvent("error", { error }));
    };
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
