const globalObject = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : undefined;
const globalStore = globalObject.__vm_global__ || (globalObject.__vm_global__ = {});

try { if (!globalStore.module) globalStore.module = module; } catch {}
try { if (!globalStore.exports) globalStore.exports = exports; } catch {}
try { if (!globalStore.require) globalStore.require = require; } catch {}
try { if (!globalStore.__dirname) globalStore.__dirname = __dirname; } catch {}
try { if (!globalStore.__filename) globalStore.__filename = __filename; } catch {}

class JSONRPCError extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.name = 'JSONRPCError';
    this.code = code;
    if (data !== undefined) this.data = data;
  }
}

if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(type, eventInit) {
      super(type, eventInit);
      this.message = eventInit?.message ?? '';
      this.filename = eventInit?.filename ?? '';
      this.lineno = eventInit?.lineno ?? 0;
      this.colno = eventInit?.colno ?? 0;
      this.error = eventInit?.error ?? null;
    }
  };
}

class JSONRPCEvent extends Event {
  constructor(type, eventInit) {
    super(type, eventInit);
    this.payload = eventInit?.payload;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, eventInit) {
    super(type, eventInit);
    this.payload = eventInit?.payload;
  }
}

class JSONRPCClient extends EventTarget {
  static defaultOptions = {
    secure: false,
    host: 'localhost',
    port: 80,
    secret: '',
    path: '/jsonrpc'
  };

  #id = 0;
  #secret;
  #socket;
  #url;
  #options;
  #pending = new Map();
  #requestQueue = [];

  constructor(options = {}) {
    super();
    this.#options = { ...JSONRPCClient.defaultOptions, ...options };
    this.#secret = this.#options.secret;
    this.#url = `${this.#options.secure ? 'wss' : 'ws'}://${this.#options.host}:${this.#options.port}${this.#options.path}`;
  }

  id() {
    return String(this.#id++);
  }

  _buildMessage(method, params) {
    if (this.#secret) {
      params = [`token:${this.#secret}`, ...params];
    }
    return {
      'jsonrpc': '2.0',
      'method': method,
      'params': params,
      'id': this.id()
    };
  }

  _send(message) {
    if (this.#socket && this.#socket.readyState === WebSocket.OPEN) {
      this.#socket.send(JSON.stringify(message));
    } else {
      this.#requestQueue.push(message);
    }
  }

  _sendMethod(method, params) {
    const message = this._buildMessage(method, params);
    this._send(message);
    return new Promise((resolve, reject) => {
      this.#pending.set(message.id, { resolve, reject });
    });
  }

  call(method, ...params) {
    return this._sendMethod(method, params);
  }

  batch(calls) {
    const messages = calls.map(([method, ...params]) => this._buildMessage(method, params));
    this._send(messages);
    return Promise.all(messages.map(message => new Promise((resolve, reject) => {
      this.#pending.set(message.id, { resolve, reject });
    })));
  }

  _onmessage(event) {
    const data = JSON.parse(event.data);
    if (Array.isArray(data)) {
      for (const message of data) this._onobject(message);
    } else {
      this._onobject(data);
    }
  }

  _onobject(message) {
    if (message.method) {
      this._onnotification(message);
    } else {
      this._onresponse(message);
    }
  }

  _onresponse(response) {
    const { id, result, error } = response;
    const pending = this.#pending.get(id);
    if (pending) {
      this.#pending.delete(id);
      if (error) {
        pending.reject(new JSONRPCError(error));
      } else {
        pending.resolve(result);
      }
    }
  }

  _onnotification(notification) {
    const { method, params } = notification;
    this.dispatchEvent(new JSONRPCNotificationEvent(method, { payload: params }));
  }

  open() {
    this.#socket = new WebSocket(this.#url);
    this.#socket.addEventListener('open', () => {
      while (this.#requestQueue.length > 0) {
        this.#socket.send(JSON.stringify(this.#requestQueue.shift()));
      }
    });
    this.#socket.addEventListener('message', (event) => this._onmessage(event));
    this.#socket.addEventListener('error', (event) => {
      this.dispatchEvent(new ErrorEvent('error', { error: event.error ?? new Error('WebSocket error') }));
    });
    this.#socket.addEventListener('close', (event) => {
      this.dispatchEvent(new Event('close'));
    });
  }

  close() {
    if (this.#socket) {
      this.#socket.close();
      this.#socket = null;
    }
  }
}

function prefix(str) {
  return `aria2.${str}`;
}

function unprefix(str) {
  return str.startsWith('aria2.') ? str.slice(6) : str;
}

class Aria2 extends JSONRPCClient {
  static prefix = prefix;
  static unprefix = unprefix;
  static defaultOptions = {
    ...JSONRPCClient.defaultOptions,
    secure: false,
    host: 'localhost',
    port: 6800,
    secret: '',
    path: '/jsonrpc'
  };

  constructor(options = {}) {
    super({ ...Aria2.defaultOptions, ...options });
  }

  call(method, ...params) {
    return super.call(prefix(method), ...params);
  }

  multicall(calls) {
    const multicallParams = calls.map(([method, ...params]) => ({
      methodName: prefix(method),
      params
    }));
    return super.call('system.multicall', [multicallParams]);
  }

  batch(calls) {
    return super.batch(calls.map(([method, ...params]) => [prefix(method), ...params]));
  }

  listNotifications() {
    return this.call('system.listNotifications');
  }

  listMethods() {
    return this.call('system.listMethods');
  }
}

const Aria2_default = Aria2;

export { Aria2_default as default };
