function promiseEvent(target, eventName) {
  const controller = new AbortController();
  const { signal } = controller;
  return new Promise((resolve, reject) => {
    target.addEventListener(eventName, resolve, { signal });
    target.addEventListener('error', reject, { signal });
  }).finally(() => controller.abort());
}

var JSONRPCError = class extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.code = code;
    if (data) this.data = data;
    this.name = this.constructor.name;
  }
};

!globalThis.ErrorEvent && (globalThis.ErrorEvent = class ErrorEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.error = options?.error;
  }
});

var JSONRPCEvent = class extends Event {
  constructor(type, options) {
    super(type, options);
    this.result = options?.result;
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
  secure: false,
  host: 'localhost',
  port: 6800,
  secret: '',
  path: '/jsonrpc'
};

var JSONRPCClient = class extends EventTarget {
  constructor(options) {
    super();
    this.promises = Object.create(null);
    this.nextId = 0;
    Object.assign(this, this.constructor.defaultOptions, options);
  }

  id() {
    return this.nextId++;
  }

  url(path) {
    return `${this.secure ? 's' : ''}://${this.host}:${this.port}${this.path}${path || ''}`;
  }

  async socketSend(message) {
    this.socket.send(JSON.stringify(message));
  }

  async fetch(message) {
    const response = await fetch(this.url(), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    let data;
    try {
      data = await response.json();
      this.onmessage(data);
    } catch (error) {
      const errorInfo = { error };
      this.dispatchEvent(new ErrorEvent('fetch', errorInfo));
      throw error;
    }
    return data;
  }

  buildRequest(method, params) {
    if (typeof method !== 'string') {
      throw new TypeError(`${method} is not a string`);
    }
    const request = {
      method,
      'json-rpc': '2.0',
      id: this.id()
    };
    if (params) Object.assign(request, { params });
    return request;
  }

  async batch(calls) {
    const batch = calls.map(([method, params]) => {
      return this.buildRequest(method, params);
    });
    await this.socketSend(batch);
    return batch.map(({ id }) => {
      const { promise } = this.promises[id] = Promise.withResolvers();
      return promise;
    });
  }

  async call(method, ...params) {
    const message = this.buildRequest(method, params);
    await this.socketSend(message);
    const { promise } = this.promises[message.id] = Promise.withResolvers();
    return promise;
  }

  async notify(method, params) {
    const message = { method, params };
    return this.socketSend(new JSONRPCEvent('notify', message));
  }

  onmessage({ id, error, result }) {
    const promise = this.promises[id];
    if (!promise) return;
    if (error) promise.reject(new JSONRPCError(error));
    else promise.resolve(result);
    delete this.promises[id];
  }

  request({ method, params }) {
    return this.call(method, params);
  }

  onnotification({ method, params }) {
    const type = 'notification';
    const message = { method, params };
    this.dispatchEvent(new JSONRPCNotificationEvent(type, message));
  }

  onmessage(message) {
    if (message.id === undefined) {
      this.onnotification(message);
    } else if (message.error === undefined) {
      this.onresult(message);
    } else {
      this.onerror(message);
    }
  }

  async open() {
    const socket = this.socket = new WebSocket(this.url('ws'));
    socket.onopen = () => {
      this.dispatchEvent(new Event('open'));
    };
    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        const errorInfo = { error };
        this.dispatchEvent(new ErrorEvent('parse', errorInfo));
        return;
      }
      this.onmessage(data);
    };
    socket.onclose = () => {
      this.dispatchEvent(new Event('close'));
    };
    socket.onerror = (error) => {
      const errorInfo = { error };
      this.dispatchEvent(new ErrorEvent('error', errorInfo));
    };
    return promiseEvent(this, 'open');
  }

  async close() {
    const { socket } = this;
    socket.close();
    return promiseEvent(this, 'close');
  }

  static defaultOptions = defaultOptions;
};

var JSONRPCClient_default = JSONRPCClient;

function prefix(str) {
  if (!str.startsWith('aria2.') && !str.startsWith('system.')) {
    str = 'aria2.' + str;
  }
  return str;
}

function unprefix(str) {
  const prefix = 'aria2.';
  const index = str.indexOf(prefix);
  return index === 0 ? str.slice(prefix.length) : str;
}

const aria2DefaultOptions = {
  secure: false,
  host: 'localhost',
  port: 6800,
  secret: '',
  path: '/jsonrpc'
};

var Aria2 = class extends JSONRPCClient_default {
  secretToken(params) {
    let result = this.secret ? [`token:${this.secret}`] : [];
    if (Array.isArray(params)) {
      result = result.concat(params);
    }
    return result;
  }

  onnotification(message) {
    const { method, params } = message;
    const unprefixed = unprefix(method);
    if (unprefixed !== method) {
      const notification = { params };
      this.dispatchEvent(new JSONRPCNotificationEvent(unprefixed, notification));
    }
    return super.onnotification(message);
  }

  async call(method, ...params) {
    return super.call(prefix(method), this.secretToken(params));
  }

  async multicall(calls) {
    const mapped = calls.map(([method, ...params]) => ({
      methodName: prefix(method),
      params: this.secretToken(params)
    }));
    return super.batch('system.multicall', mapped);
  }

  async batch(calls) {
    return super.batch(calls.map(([method, ...params]) => [prefix(method), this.secretToken(params)]));
  }

  async listMethods() {
    const methods = await this.call('system.listMethods');
    return methods.map(method => unprefix(method));
  }

  async listNotifications() {
    const notifications = await this.call('system.listNotifications');
    return notifications.map(notification => unprefix(notification));
  }

  static version;
  static defaultOptions = {
    ...JSONRPCClient_default.defaultOptions,
    ...aria2DefaultOptions
  };
};

var Aria2_default = Aria2;

export { Aria2_default as default };
