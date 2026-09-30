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
    this.requests = Object.create(null);
    this.sequence = 0;
    Object.assign(this, this.constructor.defaultOptions, options);
  }

  id() {
    return this.sequence++;
  }

  url(protocol) {
    return `${protocol}${this.secure ? "s" : ""}://${this.host}:${this.port}${this.secret}${this.path}`;
  }

  async sendWebSocket(message) {
    this.socket.send(JSON.stringify(message));
  }

  async post(message) {
    const response = await fetch(this.url("http"), {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    let decoded;
    try {
      decoded = await response.json();
      this.handleMessage(decoded);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
      throw error;
    }
    return decoded;
  }

  createRequest(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(`${method} is not a string`);
    }

    const request = {
      method,
      "json-rpc": "2.0",
      id: this.id(),
    };
    if (params) Object.assign(request, { params });
    return request;
  }

  async batch(entries) {
    const requests = entries.map(([method, params]) =>
      this.createRequest(method, params),
    );
    await this.send(requests);
    return requests.map(({ id }) => {
      const deferred = Promise.withResolvers();
      this.requests[id] = deferred;
      return deferred.promise;
    });
  }

  async call(method, params) {
    const request = this.createRequest(method, params);
    await this.send(request);
    const deferred = Promise.withResolvers();
    this.requests[request.id] = deferred;
    return deferred.promise;
  }

  async send(message) {
    this.dispatchEvent(new JSONRPCEvent("request", { detail: message }));
    if (this.socket?.readyState === 1) {
      return this.sendWebSocket(message);
    }
    return this.post(message);
  }

  handleResponse({ id, error, result }) {
    const deferred = this.requests[id];
    if (!deferred) return;

    if (error) deferred.reject(new JSONRPCError(error));
    else deferred.resolve(result);
    delete this.requests[id];
  }

  handleRequest({ method, params }) {
    return this.handleNotification(method, params);
  }

  handleNotification(method, params) {
    this.dispatchEvent(
      new JSONRPCNotificationEvent("notification", { method, params }),
    );
  }

  handleMessage(message) {
    this.dispatchEvent(new JSONRPCEvent("message", { detail: message }));
    if (Array.isArray(message)) {
      for (const item of message) this.handleMessage(item);
      return;
    }
    this.handleSingleMessage(message);
  }

  handleSingleMessage(message) {
    if (
      message.result !== undefined ||
      message.error !== undefined ||
      message.id !== undefined
    ) {
      this.handleResponse(message);
    } else {
      this.handleRequest(message);
    }
  }

  async connect() {
    const socket = (this.socket = new WebSocket(this.url("ws")));
    socket.onopen = () => {
      this.dispatchEvent(new Event("open"));
    };
    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (error) {
        this.dispatchEvent(new ErrorEvent("error", { error }));
        return;
      }
      this.handleMessage(message);
    };
    socket.onclose = () => {
      this.dispatchEvent(new Event("close"));
    };
    socket.onerror = (error) => {
      this.dispatchEvent(new ErrorEvent("error", { error }));
    };
    return promiseEvent(this, "open");
  }

  async disconnect() {
    const { socket } = this;
    socket.close();
    return promiseEvent(this, "close");
  }

  static defaultOptions = defaultOptions;
}

export {
  JSONRPCEvent,
  JSONRPCNotificationEvent,
  JSONRPCClient as default,
};
