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

    if (data) {
      this.data = data;
    }

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
    this.message = options?.message;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.method = options?.method;
    this.params = options?.params;
  }
}

class JSONRPCClient extends EventTarget {
  static defaults = {
    secure: false,
    host: "localhost",
    port: 80,
    path: "",
    protocol: "http"
  };

  constructor(options) {
    super();
    this.promises = Object.create(null);
    this.index = 0;
    Object.assign(this, this.constructor.defaults, options);
  }

  id() {
    return this.index++;
  }

  url(protocol) {
    return (
      protocol +
      (this.secure ? "s" : "") +
      "://" +
      this.host +
      ":" +
      this.port +
      this.path
    );
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

    let result;

    try {
      result = await response.json();
      this.handleMessage(result);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
      throw error;
    }

    return result;
  }

  createRequest(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(method + " must be a string");
    }

    const request = {
      method,
      "json-rpc": "2.0",
      id: this.id()
    };

    if (params) {
      Object.assign(request, { params });
    }

    return request;
  }

  async batch(entries) {
    const requests = entries.map(([method, params]) =>
      this.createRequest(method, params)
    );

    await this.send(requests);

    return requests.map(({ id }) => {
      const { promise, resolve, reject } = Promise.withResolvers();
      this.promises[id] = { promise, resolve, reject };
      return promise;
    });
  }

  async request(method, params) {
    const request = this.createRequest(method, params);
    await this.send(request);

    const { promise, resolve, reject } = Promise.withResolvers();
    this.promises[request.id] = { promise, resolve, reject };
    return promise;
  }

  async send(message) {
    this.dispatchEvent(new JSONRPCEvent("send", { message }));

    return this.socket?.readyState === 1
      ? this.websocket(message)
      : this.http(message);
  }

  handleResponse({ id, error, result }) {
    const pending = this.promises[id];

    if (!pending) {
      return;
    }

    if (error) {
      pending.reject(new JSONRPCError(error));
    } else {
      pending.resolve(result);
    }

    delete this.promises[id];
  }

  handleRequest({ method, params }) {
    return this.request(method, params);
  }

  handleNotification({ method, params }) {
    this.dispatchEvent(
      new JSONRPCNotificationEvent("notification", { method, params })
    );
  }

  handleMessage(message) {
    this.dispatchEvent(new JSONRPCEvent("message", { message }));

    if (Array.isArray(message)) {
      for (const item of message) {
        this.digest(item);
      }
    } else {
      this.digest(message);
    }
  }

  digest(message) {
    if (message.method === undefined) {
      this.handleResponse(message);
    } else if (message.id !== undefined) {
      this.handleRequest(message);
    } else {
      this.handleNotification(message);
    }
  }

  async connect() {
    const socket = (this.socket = new WebSocket(this.url("ws")));

    socket.onopen = () => {
      this.dispatchEvent(new Event("open"));
    };

    socket.onmessage = event => {
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

    socket.onerror = error => {
      this.dispatchEvent(new ErrorEvent("error", { error }));
    };

    return promiseEvent(this, "open");
  }

  async disconnect() {
    const { socket } = this;
    socket.close();
    return promiseEvent(this, "close");
  }
}

const JSONRPCClient_default = JSONRPCClient;

export {
  JSONRPCEvent,
  JSONRPCNotificationEvent,
  JSONRPCClient_default as default
};
