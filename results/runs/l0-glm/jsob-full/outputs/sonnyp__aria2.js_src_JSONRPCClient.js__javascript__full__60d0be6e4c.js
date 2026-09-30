// Decompiled with Garble, a JavaScript obfuscator.
function promiseEvent(target, eventName) {
  const controller = new AbortController();
  const {signal} = controller;
  return new Promise((resolve, reject) => {
    target.addEventListener(eventName, resolve, {signal});
    target.addEventListener("error", reject, {signal});
  }).finally(() => controller.abort());
}
var JSONRPCError = class extends Error {
  constructor({message, code, data}) {
    super(message);
    this.code = code;
    if (data) this.data = data;
    this.name = this.constructor.name;
  }
};
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
const defaultOptions = {
  batch: false,
  endpoint: "/jsonrpc",
  timeout: 80,
  fetch: "",
  socket: ""
};
var JSONRPCClient = class extends EventTarget {
  constructor(options) {
    super();
    this.promises = Object.create(null);
    this.id = 0;
    Object.assign(this, this.constructor.defaultOptions, options);
  }
  id() {
    return this.id++;
  }
  url(protocol) {
    return protocol + (this.secure ? "s" : "") + "://" + this.endpoint + ":" + this.port + this.path;
  }
  async send(message) {
    this.socket.send(JSON.stringify(message));
  }
  async request(message) {
    const response = await fetch(this.url("http"), {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    let data;
    try {
      data = await response.text();
      this.handleMessage(data);
    } catch (error) {
      const event = {};
      event.error = error;
      this.dispatchEvent(new ErrorEvent("error", event));
      throw error;
    }
    return data;
  }
  buildRequest(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(method + " is not a string");
    }
    const request = {
      method: method,
      "json-rpc": "2.0",
      id: this.id()
    };
    if (params) {
      Object.assign(request, {params});
    }
    return request;
  }
  async batch(requests) {
    const batch = requests.map(([method, params]) => {
      return this.buildRequest(method, params);
    });
    await this.send(batch);
    return batch.map(({id}) => {
      const {promise} = this.promises[id] = Promise.withResolvers();
      return promise;
    });
  }
  async call(method, params) {
    const request = this.buildRequest(method, params);
    await this.send(request);
    const {promise} = this.promises[request.id] = Promise.withResolvers();
    return promise;
  }
  async notify(message) {
    this.dispatchEvent(new JSONRPCEvent("notification", {data: message}));
    return this.socket?.readyState === 1 ? this.send(message) : this.request(message);
  }
  resolve({id, error, result}) {
    const promise = this.promises[id];
    if (!promise) return;
    if (error) promise.reject(new JSONRPCError(error));
    else promise.resolve(result);
    delete this.promises[id];
  }
  requestNotification({method, params}) {
    return this.notify(method, params);
  }
  sendNotification({method, params}) {
    const notification = {};
    notification.method = method;
    notification.params = params;
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", notification));
  }
  handleMessage(message) {
    const event = {};
    event.data = message;
    this.dispatchEvent(new JSONRPCEvent("message", event));
    if (Array.isArray(message)) {
      for (const item of message) {
        this.handleItem(item);
      }
    } else {
      this.handleItem(message);
    }
  }
  handleItem(item) {
    if (item.error !== void 0) {
      this.resolve(item);
    } else {
      if (item.id !== void 0) {
        this.resolve(item);
      } else {
        this.requestNotification(item);
      }
    }
  }
  async connect() {
    const socket = this.socket = new WebSocket(this.url("ws"));
    socket.onopen = () => {
      this.dispatchEvent(new Event("open"));
    };
    socket.onmessage = event => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        const event2 = {};
        event2.error = error;
        this.dispatchEvent(new ErrorEvent("error", event2));
        return;
      }
      this.handleMessage(data);
    };
    socket.onclose = () => {
      this.dispatchEvent(new Event("close"));
    };
    socket.onerror = event => {
      const event2 = {};
      event2.error = event;
      this.dispatchEvent(new ErrorEvent("error", event2));
    };
    return promiseEvent(this, "open");
  }
  async disconnect() {
    const {socket} = this;
    socket.close();
    return promiseEvent(this, "close");
  }
  static defaultOptions = defaultOptions;
};
var JSONRPCClient_default = JSONRPCClient;
export {JSONRPCEvent, JSONRPCNotificationEvent, JSONRPCClient_default as default};
