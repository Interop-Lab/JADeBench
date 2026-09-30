function waitForEvent(target, eventName) {
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

const DEFAULT_CLIENT_OPTIONS = {
  secure: false,
  host: "localhost",
  port: 80,
  path: "",
  secret: "",
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

    try {
      const result = await response.json();
      this._onmessage(result);
      return result;
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
      throw error;
    }
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

  async batch(requests) {
    const messages = requests.map(([method, params]) => this._buildMessage(method, params));
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
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", { method, params }));
  }

  _onmessage(message) {
    this.dispatchEvent(new JSONRPCEvent("input", { data: message }));
    if (Array.isArray(message)) {
      for (const item of message) this._onobject(item);
    } else {
      this._onobject(message);
    }
  }

  _onobject(message) {
    if (message.method === undefined) {
      this._onresponse(message);
    } else if (message.id === undefined) {
      this._onnotification(message);
    } else {
      this._onrequest(message);
    }
  }

  async open() {
    const socket = (this.socket = new WebSocket(this.url("ws")));
    socket.onopen = () => this.dispatchEvent(new Event("open"));
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
    socket.onclose = () => this.dispatchEvent(new Event("close"));
    socket.onerror = (error) => this.dispatchEvent(new ErrorEvent("error", { error }));
    await waitForEvent(this, "open");
  }

  async close() {
    const { socket } = this;
    socket.close();
    return waitForEvent(this, "close");
  }

  static defaultOptions = DEFAULT_CLIENT_OPTIONS;
}

function prefix(methodName) {
  if (!methodName.startsWith("aria2.") && !methodName.startsWith("system.")) {
    return `aria2.${methodName}`;
  }
  return methodName;
}

function unprefix(methodName) {
  return methodName.split("aria2.")[1] || methodName;
}

const DEFAULT_ARIA2_OPTIONS = {
  secure: false,
  host: "localhost",
  port: 6800,
  path: "/jsonrpc",
  secret: "",
};

class Aria2 extends JSONRPCClient {
  addSecret(params) {
    let prepared = this.secret ? [`token:${this.secret}`] : [];
    if (Array.isArray(params)) prepared = prepared.concat(params);
    return prepared;
  }

  _onnotification(message) {
    const { method, params } = message;
    const eventName = unprefix(method);
    if (eventName !== method) {
      this.dispatchEvent(new JSONRPCNotificationEvent(eventName, { params }));
    }
    return super._onnotification(message);
  }

  async call(method, ...params) {
    return super.call(prefix(method), this.addSecret(params));
  }

  async multicall(calls) {
    const params = [
      calls.map(([methodName, ...params]) => ({
        methodName: prefix(methodName),
        params: this.addSecret(params),
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
    return notifications.map(unprefix);
  }

  async listMethods() {
    const methods = await this.call("system.listMethods");
    return methods.map(unprefix);
  }

  static prefix;
  static unprefix;
  static defaultOptions = {
    ...JSONRPCClient.defaultOptions,
    ...DEFAULT_ARIA2_OPTIONS,
  };
}

export default Aria2;
