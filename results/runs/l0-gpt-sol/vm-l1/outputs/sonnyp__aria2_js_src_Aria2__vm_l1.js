function promiseEvent(target, type) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      target.removeEventListener(type, onEvent);
      target.removeEventListener("error", onError);
    };

    const onEvent = event => {
      cleanup();
      resolve(event);
    };

    const onError = event => {
      cleanup();
      reject(event.error || event);
    };

    target.addEventListener(type, onEvent, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

class JSONRPCError extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.name = "JSONRPCError";
    this.code = code;
    this.data = data;
  }
}

class JSONRPCEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    Object.assign(this, options);
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    Object.assign(this, options);
  }
}

class JSONRPCClient extends EventTarget {
  static defaultOptions = {
    secure: false,
    host: "localhost",
    port: 80,
    secret: "",
    path: "/jsonrpc"
  };

  constructor(options = {}) {
    super();

    this.options = {
      ...JSONRPCClient.defaultOptions,
      ...options
    };

    this._id = 0;
    this._pending = new Map();
    this.websocket = null;
  }

  get url() {
    const protocol = this.options.secure ? "wss" : "ws";
    return `${protocol}://${this.options.host}:${this.options.port}${this.options.path}`;
  }

  id() {
    return String(++this._id);
  }

  addSecret(params) {
    return params == null ? [] : Array.isArray(params) ? params : [params];
  }

  _buildMessage(method, params) {
    return {
      jsonrpc: "2.0",
      id: this.id(),
      method,
      params: this.addSecret(params)
    };
  }

  _send(message) {
    if (!this.websocket) {
      throw new Error("WebSocket is not open");
    }

    const send = () => {
      this.websocket.send(JSON.stringify(message));
      return message;
    };

    if (this.websocket.readyState === WebSocket.OPEN) {
      return Promise.resolve(send());
    }

    if (this.websocket.readyState === WebSocket.CONNECTING) {
      return promiseEvent(this.websocket, "open").then(send);
    }

    return Promise.reject(new Error("WebSocket is not open"));
  }

  call(method, params = []) {
    const message = this._buildMessage(method, params);

    const result = new Promise((resolve, reject) => {
      this._pending.set(message.id, { resolve, reject });
    });

    return this._send(message).then(
      () => result,
      error => {
        this._pending.delete(message.id);
        throw error;
      }
    );
  }

  batch(calls) {
    const messages = calls.map(call => {
      const [method, ...params] = call;
      return this._buildMessage(method, params);
    });

    const results = messages.map(
      message =>
        new Promise((resolve, reject) => {
          this._pending.set(message.id, { resolve, reject });
        })
    );

    return this._send(messages).then(
      () => Promise.all(results),
      error => {
        for (const message of messages) {
          this._pending.delete(message.id);
        }
        throw error;
      }
    );
  }

  _onresponse(response) {
    const pending = this._pending.get(String(response.id));
    if (!pending) {
      return;
    }

    this._pending.delete(String(response.id));

    if (response.error) {
      pending.reject(new JSONRPCError(response.error));
    } else {
      pending.resolve(response.result);
    }
  }

  _onrequest(request) {
    this.dispatchEvent(
      new JSONRPCEvent("request", {
        request,
        method: request.method,
        params: request.params,
        id: request.id
      })
    );
  }

  _onnotification(notification) {
    this.dispatchEvent(
      new JSONRPCNotificationEvent(notification.method, {
        notification,
        method: notification.method,
        params: notification.params
      })
    );
  }

  _onobject(message) {
    if (Object.prototype.hasOwnProperty.call(message, "id")) {
      if (
        Object.prototype.hasOwnProperty.call(message, "result") ||
        Object.prototype.hasOwnProperty.call(message, "error")
      ) {
        this._onresponse(message);
      } else {
        this._onrequest(message);
      }
    } else if (message.method) {
      this._onnotification(message);
    }
  }

  _onmessage(event) {
    let message;

    try {
      message = JSON.parse(event.data);
    } catch (error) {
      this.dispatchEvent(
        new JSONRPCEvent("error", {
          error,
          message: event.data
        })
      );
      return;
    }

    if (Array.isArray(message)) {
      for (const item of message) {
        this._onobject(item);
      }
    } else {
      this._onobject(message);
    }
  }

  open() {
    if (
      this.websocket &&
      (this.websocket.readyState === WebSocket.OPEN ||
        this.websocket.readyState === WebSocket.CONNECTING)
    ) {
      return this.websocket.readyState === WebSocket.OPEN
        ? Promise.resolve(this.websocket)
        : promiseEvent(this.websocket, "open").then(() => this.websocket);
    }

    const websocket = new WebSocket(this.url);
    this.websocket = websocket;

    websocket.addEventListener("message", event => this._onmessage(event));
    websocket.addEventListener("close", event => {
      const error = new Error("WebSocket closed");

      for (const { reject } of this._pending.values()) {
        reject(error);
      }
      this._pending.clear();

      this.dispatchEvent(
        new JSONRPCEvent("close", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
      );
    });

    return promiseEvent(websocket, "open").then(event => {
      this.dispatchEvent(new JSONRPCEvent("open", { event }));
      return websocket;
    });
  }

  close() {
    if (!this.websocket) {
      return;
    }

    this.websocket.close();
  }
}

function prefix(method) {
  if (method.startsWith("aria2.") || method.startsWith("system.")) {
    return method;
  }

  return `aria2.${method}`;
}

function unprefix(method) {
  return method.startsWith("aria2.") ? method.slice(6) : method;
}

class Aria2 extends JSONRPCClient {
  static prefix = prefix;
  static unprefix = unprefix;

  static defaultOptions = {
    ...JSONRPCClient.defaultOptions,
    secure: false,
    host: "localhost",
    port: 6800,
    secret: "",
    path: "/jsonrpc"
  };

  constructor(options = {}) {
    super({
      ...Aria2.defaultOptions,
      ...options
    });
  }

  addSecret(params) {
    const values = params == null ? [] : Array.isArray(params) ? [...params] : [params];

    if (this.options.secret) {
      values.unshift(`token:${this.options.secret}`);
    }

    return values;
  }

  _buildMessage(method, params) {
    return super._buildMessage(prefix(method), params);
  }

  _onnotification(notification) {
    const method = unprefix(notification.method);

    this.dispatchEvent(
      new JSONRPCNotificationEvent(method, {
        notification,
        method,
        params: notification.params
      })
    );
  }

  call(method, params = []) {
    return super.call(prefix(method), params);
  }

  multicall(calls) {
    const methods = calls.map(call => {
      const [method, ...params] = call;
      return {
        methodName: prefix(method),
        params: this.addSecret(params)
      };
    });

    return super.call("system.multicall", [methods]);
  }

  batch(calls) {
    return super.batch(
      calls.map(call => {
        const [method, ...params] = call;
        return [prefix(method), ...params];
      })
    );
  }

  listMethods() {
    return super.call("system.listMethods").then(methods =>
      methods.map(unprefix)
    );
  }

  listNotifications() {
    return super.call("system.listNotifications").then(methods =>
      methods.map(unprefix)
    );
  }
}

export { Aria2 as default };
