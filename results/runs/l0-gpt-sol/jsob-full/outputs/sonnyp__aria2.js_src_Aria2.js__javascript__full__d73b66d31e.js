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

const jsonRPCDefaultOptions = {
  secure: false,
  host: "localhost",
  port: 80,
  token: "",
  path: "/jsonrpc"
};

class JSONRPCClient extends EventTarget {
  constructor(options) {
    super();
    this.requests = Object.create(null);
    this.index = 0;
    Object.assign(this, this.constructor.defaultOptions, options);
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

  async post(message) {
    this.socket.send(JSON.stringify(message));
  }

  async fetch(message) {
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
      this.message(result);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent("error", { error }));
      throw error;
    }

    return result;
  }

  createRequest(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(method + " is not a string");
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

  async batch(requests) {
    const messages = requests.map(([method, params]) =>
      this.createRequest(method, params)
    );

    await this.send(messages);

    return messages.map(({ id }) => {
      const { promise } = (this.requests[id] = Promise.withResolvers());
      return promise;
    });
  }

  async request(method, params) {
    const message = this.createRequest(method, params);
    await this.send(message);

    const { promise } = (this.requests[message.id] =
      Promise.withResolvers());

    return promise;
  }

  async send(message) {
    this.dispatchEvent(new JSONRPCEvent("send", { message }));

    return this.socket?.readyState === 1
      ? this.post(message)
      : this.fetch(message);
  }

  handleResponse({ id, error, result }) {
    const request = this.requests[id];
    if (!request) return;

    if (error) {
      request.reject(new JSONRPCError(error));
    } else {
      request.resolve(result);
    }

    delete this.requests[id];
  }

  handleRequest({ method, params }) {
    return this.request(method, params);
  }

  handleNotification({ method, params }) {
    this.dispatchEvent(
      new JSONRPCNotificationEvent("notification", { method, params })
    );
  }

  message(message) {
    this.dispatchEvent(new JSONRPCEvent("message", { message }));

    if (Array.isArray(message)) {
      for (const item of message) {
        this.handle(item);
      }
    } else {
      this.handle(message);
    }
  }

  handle(message) {
    if (message.method === undefined) {
      this.handleResponse(message);
    } else if (message.id === undefined) {
      this.handleNotification(message);
    } else {
      this.handleRequest(message);
    }
  }

  async open() {
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

      this.message(message);
    };

    socket.onclose = () => {
      this.dispatchEvent(new Event("close"));
    };

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

  static defaultOptions = jsonRPCDefaultOptions;
}

function prefix(method) {
  if (!method.startsWith("aria2.") && !method.startsWith("system.")) {
    method = "aria2." + method;
  }

  return method;
}

function unprefix(method) {
  const unprefixed = method.split("aria2.")[1];
  return unprefixed || method;
}

const aria2DefaultOptions = {
  secure: false,
  host: "localhost",
  port: 6800,
  token: "",
  path: "/jsonrpc"
};

class Aria2 extends JSONRPCClient {
  params(params) {
    let result = this.token ? ["token:" + this.token] : [];

    if (Array.isArray(params)) {
      result = result.concat(params);
    }

    return result;
  }

  handleNotification(message) {
    const { method, params } = message;
    const eventType = unprefix(method);

    if (eventType !== method) {
      this.dispatchEvent(
        new JSONRPCNotificationEvent(eventType, { params })
      );
    }

    return super.handleNotification(message);
  }

  async call(method, ...params) {
    return super.request(prefix(method), this.params(params));
  }

  async multicall(methods) {
    const params = [
      methods.map(([method, ...params]) => ({
        methodName: prefix(method),
        params: this.params(params)
      }))
    ];

    return super.request("system.multicall", params);
  }

  async batch(requests) {
    return super.batch(
      requests.map(([method, ...params]) => [
        prefix(method),
        this.params(params)
      ])
    );
  }

  async listMethods() {
    const methods = await this.call("system.listMethods");
    return methods.map(method => unprefix(method));
  }

  async listNotifications() {
    const notifications = await this.call("system.listNotifications");
    return notifications.map(notification => unprefix(notification));
  }

  static methods;
  static notifications;

  static defaultOptions = {
    ...JSONRPCClient.defaultOptions,
    ...aria2DefaultOptions
  };
}

export { Aria2 as default };
