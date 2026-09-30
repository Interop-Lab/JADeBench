class JSONRPCError extends Error {
  constructor({ message, code, data }) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

class JSONRPCEvent extends Event {
  constructor(type, detail) {
    super(type, { detail });
    this.detail = detail;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, detail) {
    super(type, { detail });
    this.detail = detail;
  }
}

class JSONRPCClient extends EventTarget {
  constructor(options = {}) {
    super();
    this._options = { ...JSONRPCClient.defaultOptions, ...options };
    this._id = 0;
    this._requests = new Map();
    this._websocket = null;
    this._closed = false;
  }

  id() {
    return ++this._id;
  }

  websocket(ws) {
    if (this._websocket) {
      this._websocket.removeEventListener('message', this._onmessage);
      this._websocket.removeEventListener('close', this._onclose);
    }
    this._websocket = ws;
    if (ws) {
      ws.addEventListener('message', this._onmessage);
      ws.addEventListener('close', this._onclose);
    }
  }

  get url() {
    const { secure, host, port, path, secret } = this._options;
    const protocol = secure ? 'wss' : 'ws';
    const url = `${protocol}://${host}:${port}${path}`;
    return secret ? `${url}?secret=${secret}` : url;
  }

  open() {
    if (this._websocket) return;
    this._closed = false;
    this._websocket = new WebSocket(this.url);
    this._websocket.addEventListener('message', this._onmessage);
    this._websocket.addEventListener('close', this._onclose);
  }

  close() {
    this._closed = true;
    if (this._websocket) {
      this._websocket.close();
    }
  }

  _send(message) {
    if (!this._websocket || this._websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    this._websocket.send(JSON.stringify(message));
  }

  _onmessage(event) {
    const data = JSON.parse(event.data);
    if (data.id !== undefined && this._requests.has(data.id)) {
      const { resolve, reject } = this._requests.get(data.id);
      this._requests.delete(data.id);
      if (data.error) {
        reject(new JSONRPCError(data.error));
      } else {
        resolve(data.result);
      }
    } else if (data.method) {
      this.dispatchEvent(new JSONRPCNotificationEvent(data.method, data.params));
    }
  }

  _onclose() {
    if (!this._closed) {
      setTimeout(() => this.open(), 1000);
    }
  }

  call(method, params = []) {
    return new Promise((resolve, reject) => {
      const id = this.id();
      this._requests.set(id, { resolve, reject });
      this._send({ jsonrpc: '2.0', id, method, params });
    });
  }

  notify(method, params = []) {
    this._send({ jsonrpc: '2.0', method, params });
  }

  batch(calls) {
    return Promise.all(calls.map(([method, params]) => this.call(method, params)));
  }

  static defaultOptions = {
    secure: false,
    host: 'localhost',
    port: 80,
    secret: '',
    path: '/jsonrpc'
  };
}

export { JSONRPCEvent, JSONRPCNotificationEvent };
export default JSONRPCClient;
