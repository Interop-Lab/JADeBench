import { EventEmitter } from 'events';

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
    this.result = options?.result;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, options) {
    super(type, options);
    this.method = options?.method;
    this.params = options?.params;
  }
}

const DEFAULTS = {
  secure: false,
  path: '/jsonrpc',
  port: 6800,
  host: '',
  secret: '',
};

function promiseEvent(target, name) {
  const controller = new AbortController();
  const { signal } = controller;
  return new Promise((resolve, reject) => {
    target.addEventListener(name, resolve, { signal });
    target.addEventListener('error', reject, { signal });
  }).finally(() => controller.abort());
}

class JSONRPCClient extends EventTarget {
  static DEFAULTS = DEFAULTS;

  constructor(options) {
    super();
    this.promises = Object.create(null);
    this.id = 0;
    Object.assign(this, this.constructor.DEFAULTS, options);
  }

  id() {
    return this.id++;
  }

  url(protocol) {
    return `${protocol}${this.secure ? 's' : ''}://${this.host}:${this.port}${this.path}`;
  }

  async write(message) {
    this.socket.send(JSON.stringify(message));
  }

  async send(message) {
    const response = await fetch(this.url('http'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    let data;
    try {
      data = await response.json();
      this._message(data);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent('error', { error }));
      throw error;
    }
    return data;
  }

  _build(method, params) {
    if (typeof method !== 'string') throw new TypeError(`${method} is not a string`);
    const message = { method, 'json-rpc': '2.0', id: this.id() };
    if (params) Object.assign(message, { params });
    return message;
  }

  async batch(calls) {
    const messages = calls.map(([method, ...params]) => this._build(method, params));
    await this.send(messages);
    return messages.map(({ id }) => {
      const { promise } = this.promises[id] = Promise.withResolvers();
      return promise;
    });
  }

  async call(method, params) {
    const message = this._build(method, params);
    await this.send(message);
    const { promise } = this.promises[message.id] = Promise.withResolvers();
    return promise;
  }

  async notify(message) {
    const event = { result: message };
    this.dispatchEvent(new JSONRPCEvent('notification', event));
    return this.socket?.readyState === 1 ? this._send(message) : this.send(message);
  }

  _resolve({ id, error, result }) {
    const promise = this.promises[id];
    if (!promise) return;
    if (error) promise.reject(new JSONRPCError(error));
    else promise.resolve(result);
    delete this.promises[id];
  }

  _notification({ method, params }) {
    const event = { method, params };
    this.dispatchEvent(new JSONRPCNotificationEvent('notification', event));
  }

  _message(message) {
    const event = { result: message };
    this.dispatchEvent(new JSONRPCEvent('message', event));
    if (Array.isArray(message)) {
      for (const item of message) {
        this._dispatch(item);
      }
    } else this._dispatch(message);
  }

  _dispatch(message) {
    if (message.error === undefined) this._notification(message);
    else {
      if (message.id === undefined) this._notification(message);
      else this._resolve(message);
    }
  }

  async open() {
    const socket = this.socket = new WebSocket(this.url('ws'));
    socket.onopen = () => {
      this.dispatchEvent(new Event('open'));
    };
    socket.onmessage = event => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        this.dispatchEvent(new ErrorEvent('error', { error }));
        return;
      }
      this._message(data);
    };
    socket.onclose = () => {
      this.dispatchEvent(new Event('close'));
    };
    socket.onerror = error => {
      this.dispatchEvent(new ErrorEvent('error', { error }));
    };
    return promiseEvent(this, 'open');
  }

  async close() {
    const { socket } = this;
    socket.close();
    return promiseEvent(this, 'close');
  }
}

const JSONRPCClient_default = JSONRPCClient;

function prefix(secret) {
  if (!secret.startsWith('token:') && !secret.startsWith('http')) {
    secret = `token:${secret}`;
  }
  return secret;
}

function unprefix(prefixed) {
  const token = prefixed.split(':').slice(1).join(':');
  return token || prefixed;
}

const ARIA2_DEFAULTS = {
  secure: false,
  path: '/jsonrpc',
  port: 6800,
  host: '',
  secret: '',
};

class Aria2 extends JSONRPCClient_default {
  static DEFAULTS;
  static events;
  static DEFAULTS = { ...JSONRPCClient_default.DEFAULTS, ...ARIA2_DEFAULTS };

  _secret(params) {
    let secret = this.secret ? [`token:${this.secret}`] : [];
    if (Array.isArray(params)) {
      secret = secret.concat(params);
    }
    return secret;
  }

  _notification({ method, params }) {
    const unprefixed = unprefix(method);
    if (unprefixed !== method) {
      const event = { params };
      this.dispatchEvent(new JSONRPCNotificationEvent(unprefixed, event));
    }
    return super._notification({ method, params });
  }

  async call(method, ...params) {
    return super.call(prefix(method), this._secret(params));
  }

  async multicall(calls) {
    const multicall = [
      calls.map(([method, ...params]) => ({
        methodName: prefix(method),
        params: this._secret(params),
      })),
    ];
    return super.multicall('system.multicall', multicall);
  }

  async batch(calls) {
    return super.batch(calls.map(([method, ...params]) => [prefix(method), this._secret(params)]));
  }

  async listNotifications() {
    const notifications = await this.call('system.listNotifications');
    return notifications.map(notification => unprefix(notification));
  }

  async listMethods() {
    const methods = await this.call('system.listMethods');
    return methods.map(method => unprefix(method));
  }
}

const Aria2_default = Aria2;

export { Aria(2)_default as default };
