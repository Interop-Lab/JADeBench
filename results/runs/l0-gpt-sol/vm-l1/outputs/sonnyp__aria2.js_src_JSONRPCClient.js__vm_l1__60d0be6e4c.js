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
  constructor({ message, code, data } = {}) {
    super(message);
    this.name = "JSONRPCError";
    this.code = code;
    this.data = data;
  }
}

if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, init = {}) {
      super(type, init);
      Object.defineProperties(this, {
        message: {
          value: init.message || "",
          enumerable: true
        },
        filename: {
          value: init.filename || "",
          enumerable: true
        },
        lineno: {
          value: init.lineno || 0,
          enumerable: true
        },
        colno: {
          value: init.colno || 0,
          enumerable: true
        },
        error: {
          value: init.error,
          enumerable: true
        }
      });
    }
  };
}

class JSONRPCEvent extends Event {
  constructor(type, init = {}) {
    super(type, init);
    for (const key of Object.keys(init)) {
      if (!(key in this)) {
        Object.defineProperty(this, key, {
          value: init[key],
          enumerable: true,
          configurable: true
        });
      }
    }
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, init = {}) {
    super(type, init);
    for (const key of Object.keys(init)) {
      if (!(key in this)) {
        Object.defineProperty(this, key, {
          value: init[key],
          enumerable: true,
          configurable: true
        });
      }
    }
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
    this._requests = new Map();
    this._socket = null;
    this._batch = null;
  }

  id() {
    return ++this._id;
  }

  url(protocol = "http") {
    if (protocol && typeof protocol === "object") {
      const options = {
        ...this.options,
        ...protocol
      };
      protocol = options.protocol || "http";
      return this._url(protocol, options);
    }

    return this._url(protocol, this.options);
  }

  _url(protocol, options) {
    const secureProtocol =
      options.secure && !protocol.endsWith("s") ? `${protocol}s` : protocol;
    const port =
      options.port === undefined || options.port === null || options.port === ""
        ? ""
        : `:${options.port}`;
    const path = options.path || "/jsonrpc";

    return `${secureProtocol}://${options.host}${port}${path}`;
  }

  websocket(options = {}) {
    const configuration =
      typeof options === "string"
        ? { url: options }
        : { ...this.options, ...options };

    if (typeof WebSocket !== "function") {
      throw new TypeError("WebSocket is not available");
    }

    const socket = new WebSocket(
      configuration.url || this._url("ws", configuration)
    );

    this._socket = socket;
    socket.addEventListener("message", event => this._onmessage(event));
    socket.addEventListener("error", event => {
      this.dispatchEvent(
        new ErrorEvent("error", {
          error: event.error || event,
          message: event.message || "WebSocket error"
        })
      );
    });
    socket.addEventListener("open", event => this.dispatchEvent(event));
    socket.addEventListener("close", event => {
      if (this._socket === socket) {
        this._socket = null;
      }

      const error = new Error("Connection closed");
      for (const request of this._requests.values()) {
        request.reject(error);
      }
      this._requests.clear();
      this.dispatchEvent(event);
    });

    return socket;
  }

  async http(message) {
    const headers = {
      "content-type": "application/json"
    };

    if (this.options.secret) {
      headers.authorization = this.options.secret;
    }

    const response = await fetch(this.url("http"), {
      method: "POST",
      headers,
      body: JSON.stringify(message)
    });

    const object = await response.json();
    this._onobject(object);
    return object;
  }

  _buildMessage(method, params) {
    const message = {
      jsonrpc: "2.0",
      id: this.id(),
      method
    };

    if (params !== undefined) {
      message.params = params;
    }

    return message;
  }

  batch(callback) {
    if (Array.isArray(callback)) {
      return Promise.all(
        callback.map(item =>
          Array.isArray(item)
            ? this.call(item[0], item[1])
            : this.call(item.method, item.params)
        )
      );
    }

    if (typeof callback !== "function") {
      throw new TypeError("Batch callback must be a function or an array");
    }

    const previousBatch = this._batch;
    const batch = [];
    this._batch = batch;

    let result;
    try {
      result = callback(this);
    } catch (error) {
      this._batch = previousBatch;
      throw error;
    }

    this._batch = previousBatch;

    return Promise.resolve(result).then(() => {
      if (batch.length === 0) {
        return [];
      }

      const messages = batch.map(entry => entry.message);
      const pending = batch.map(entry => entry.promise);
      this._send(messages);
      return Promise.all(pending);
    });
  }

  call(method, params) {
    const message = this._buildMessage(method, params);

    let resolveRequest;
    let rejectRequest;
    const promise = new Promise((resolve, reject) => {
      resolveRequest = resolve;
      rejectRequest = reject;
    });

    this._requests.set(message.id, {
      resolve: resolveRequest,
      reject: rejectRequest
    });

    if (this._batch) {
      this._batch.push({ message, promise });
    } else {
      try {
        const result = this._send(message);
        if (result && typeof result.then === "function") {
          result.catch(error => {
            const request = this._requests.get(message.id);
            if (request) {
              this._requests.delete(message.id);
              request.reject(error);
            }
          });
        }
      } catch (error) {
        this._requests.delete(message.id);
        rejectRequest(error);
      }
    }

    return promise;
  }

  _send(message) {
    if (
      this._socket &&
      (this._socket.readyState === undefined ||
        this._socket.readyState === WebSocket.OPEN)
    ) {
      this._socket.send(JSON.stringify(message));
      return;
    }

    return this.http(message);
  }

  _onresponse(response) {
    const request = this._requests.get(response.id);
    if (request) {
      this._requests.delete(response.id);

      if (response.error) {
        request.reject(new JSONRPCError(response.error));
      } else {
        request.resolve(response.result);
      }
    }

    this.dispatchEvent(
      new JSONRPCEvent("response", {
        response
      })
    );
  }

  _onrequest(request) {
    this.dispatchEvent(
      new JSONRPCEvent("request", {
        request
      })
    );
  }

  _onnotification(notification) {
    this.dispatchEvent(
      new JSONRPCNotificationEvent("notification", {
        notification,
        method: notification.method,
        params: notification.params
      })
    );
  }

  _onmessage(event) {
    try {
      const value =
        event && Object.prototype.hasOwnProperty.call(event, "data")
          ? event.data
          : event;
      const object = typeof value === "string" ? JSON.parse(value) : value;
      this._onobject(object);
    } catch (error) {
      this.dispatchEvent(
        new ErrorEvent("error", {
          error,
          message: error.message
        })
      );
    }
  }

  _onobject(object) {
    if (Array.isArray(object)) {
      for (const item of object) {
        this._onobject(item);
      }
      return;
    }

    if (!object || typeof object !== "object") {
      return;
    }

    if ("method" in object) {
      if ("id" in object) {
        this._onrequest(object);
      } else {
        this._onnotification(object);
      }
    } else if ("id" in object) {
      this._onresponse(object);
    }
  }

  open() {
    if (this._socket) {
      if (
        this._socket.readyState === undefined ||
        this._socket.readyState === WebSocket.OPEN
      ) {
        return Promise.resolve(this._socket);
      }

      return promiseEvent(this._socket, "open").then(() => this._socket);
    }

    const socket = this.websocket();
    return promiseEvent(socket, "open").then(() => socket);
  }

  close() {
    if (!this._socket) {
      return;
    }

    const socket = this._socket;
    this._socket = null;
    socket.close();
  }
}

globalThis.promiseEvent = promiseEvent;
globalThis.JSONRPCError = JSONRPCError;
globalThis.JSONRPCEvent = JSONRPCEvent;
globalThis.JSONRPCNotificationEvent = JSONRPCNotificationEvent;
globalThis.JSONRPCClient = JSONRPCClient;
globalThis.JSONRPCClient_default = JSONRPCClient;

export {
  JSONRPCEvent,
  JSONRPCNotificationEvent,
  JSONRPCClient as default
};
