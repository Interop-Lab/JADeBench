const vm_0x2ce27c_8b4eb9 = (() => {
  const g = typeof globalThis !== 'undefined' ? globalThis :
    typeof window !== 'undefined' ? window :
    typeof self !== 'undefined' ? self :
    typeof global !== 'undefined' ? global : void 0;
  return g.__vm_0x2ce27c_8b4eb9__ || (g.__vm_0x2ce27c_8b4eb9__ = {});
})();

if (!vm_0x2ce27c_8b4eb9.module) try { vm_0x2ce27c_8b4eb9.module = module; } catch (_) {}
if (!vm_0x2ce27c_8b4eb9.exports) try { vm_0x2ce27c_8b4eb9.exports = exports; } catch (_) {}
if (!vm_0x2ce27c_8b4eb9.require) try { vm_0x2ce27c_8b4eb9.require = require; } catch (_) {}
if (!vm_0x2ce27c_8b4eb9.__dirname) try { vm_0x2ce27c_8b4eb9.__dirname = __dirname; } catch (_) {}
if (!vm_0x2ce27c_8b4eb9.__filename) try { vm_0x2ce27c_8b4eb9.__filename = __filename; } catch (_) {}

class JSONRPCError extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

class JSONRPCEvent extends Event {
  constructor(type, detail) {
    super(type, detail);
    this.detail = detail;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, detail) {
    super(type, detail);
    this.detail = detail;
  }
}

class JSONRPCClient extends EventTarget {
  constructor(options = {}) {
    super();
    this.options = { ...JSONRPCClient.defaultOptions, ...options };
    this._id = 0;
    this._pending = new Map();
    this._ws = null;
    this._connected = false;
  }

  static defaultOptions = {
    secure: false,
    host: 'localhost',
    port: 80,
    secret: '',
    path: '/jsonrpc'
  };

  id() {
    return ++this._id;
  }

  _buildMessage(method, params) {
    return {
      jsonrpc: '2.0',
      id: this.id(),
      method,
      params: params ?? []
    };
  }

  _send(method, params) {
    if (!this._ws || this._ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    const message = this._buildMessage(method, params);
    this._ws.send(JSON.stringify(message));
    return message.id;
  }

  _onmessage(event) {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (_) {
      return;
    }
    this._onobject(data);
  }

  _onobject(obj) {
    if (obj && obj.method !== undefined) {
      this._onnotification(obj);
      return;
    }
    if (obj && obj.id !== undefined) {
      this._onresponse(obj);
    }
  }

  _onnotification(obj) {
    const event = new JSONRPCNotificationEvent('notification', obj);
    this.dispatchEvent(event);
  }

  _onresponse(obj) {
    const pending = this._pending.get(obj.id);
    if (!pending) return;
    this._pending.delete(obj.id);
    if (obj.error) {
      pending.reject(new JSONRPCError(obj.error));
    } else {
      pending.resolve(obj.result);
    }
  }

  _onrequest(obj) {
    const event = new JSONRPCEvent('request', obj);
    this.dispatchEvent(event);
  }

  open() {
    if (this._ws) return;
    const { secure, host, port, path } = this.options;
    const protocol = secure ? 'wss' : 'ws';
    const url = `${protocol}://${host}:${port}${path}`;
    this._ws = new WebSocket(url);
    this._ws.addEventListener('message', (event) => this._onmessage(event));
    this._ws.addEventListener('open', () => {
      this._connected = true;
      this.dispatchEvent(new Event('open'));
    });
    this._ws.addEventListener('close', () => {
      this._connected = false;
      this.dispatchEvent(new Event('close'));
    });
    this._ws.addEventListener('error', (event) => {
      this.dispatchEvent(new Event('error', event));
    });
  }

  close() {
    if (this._ws) {
      this._ws.close();
      this._ws = null;
      this._connected = false;
    }
  }

  call(method, params) {
    return new Promise((resolve, reject) => {
      const id = this._send(method, params);
      this._pending.set(id, { resolve, reject });
    });
  }

  notify(method, params) {
    this._send(method, params);
  }

  batch(requests) {
    return Promise.all(requests.map((request) => {
      if (request.method !== undefined) {
        return this.call(request.method, request.params);
      }
      return Promise.resolve();
    }));
  }

  listMethods() {
    return this.call('system.listMethods');
  }

  listNotifications() {
    return this.call('system.listNotifications');
  }
}

class Aria2 extends JSONRPCClient {
  static defaultOptions = {
    ...JSONRPCClient.defaultOptions,
    secure: false,
    host: 'localhost',
    port: 6800,
    secret: '',
    path: '/jsonrpc'
  };

  addSecret(secret) {
    this.options.secret = secret;
  }

  _buildMessage(method, params) {
    const message = super._buildMessage(method, params);
    if (this.options.secret) {
      message.params = [`token:${this.options.secret}`, ...(message.params ?? [])];
    }
    return message;
  }

  call(method, ...params) {
    return super.call(method, params);
  }

  multicall(methods) {
    return this.call('system.multicall', methods);
  }

  batch(requests) {
    return super.batch(requests);
  }

  listMethods() {
    return super.listMethods();
  }

  listNotifications() {
    return super.listNotifications();
  }
}

function prefix(str) {
  return `aria2.${str}`;
}

function unprefix(str) {
  return str.startsWith('aria2.') ? str.slice(6) : str;
}

function promiseEvent(target, type) {
  return new Promise((resolve, reject) => {
    target.addEventListener(type, resolve, { once: true });
    target.addEventListener('error', reject, { once: true });
  });
}

vm_0x2ce27c_8b4eb9.JSONRPCError = JSONRPCError;
vm_0x2ce27c_8b4eb9.JSONRPCEvent = JSONRPCEvent;
vm_0x2ce27c_8b4eb9.JSONRPCNotificationEvent = JSONRPCNotificationEvent;
vm_0x2ce27c_8b4eb9.JSONRPCClient = JSONRPCClient;
vm_0x2ce27c_8b4eb9.JSONRPCClient_default = JSONRPCClient;
vm_0x2ce27c_8b4eb9.Aria2 = Aria2;
vm_0x2ce27c_8b4eb9.Aria2_default = Aria2;
vm_0x2ce27c_8b4eb9.prefix = prefix;
vm_0x2ce27c_8b4eb9.unprefix = unprefix;
vm_0x2ce27c_8b4eb9.promiseEvent = promiseEvent;

globalThis.JSONRPCError = JSONRPCError;
globalThis.JSONRPCEvent = JSONRPCEvent;
globalThis.JSONRPCNotificationEvent = JSONRPCNotificationEvent;
globalThis.JSONRPCClient = JSONRPCClient;
globalThis.JSONRPCClient_default = JSONRPCClient;
globalThis.Aria2 = Aria2;
globalThis.Aria2_default = Aria2;
globalThis.prefix = prefix;
globalThis.unprefix = unprefix;
globalThis.promiseEvent = promiseEvent;

export { Aria2 as default };
