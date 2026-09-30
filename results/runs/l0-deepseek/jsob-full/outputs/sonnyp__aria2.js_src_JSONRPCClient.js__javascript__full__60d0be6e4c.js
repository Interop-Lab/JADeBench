const controller = new AbortController();
  const { signal } = controller;
  return new Promise((resolve, reject) => {
    target.addEventListener(eventName, resolve, { signal });
    target.addEventListener('error', reject, { signal });
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
    constructor(type, init) {
      super(type, init);
      this.error = init?.error;
    }
  };
}

class JSONRPCEvent extends Event {
  constructor(type, init) {
    super(type, init);
    this.data = init?.data;
  }
}

class JSONRPCNotificationEvent extends Event {
  constructor(type, init) {
    super(type, init);
    this.method = init?.method;
    this.params = init?.params;
  }
}

const defaultOptions = {
  autoConnect: false,
  transport: 'websocket',
  port: 80,
  host: '',
  path: 'jsonrpc'
};

class JSONRPCClient extends EventTarget {
  constructor(options) {
    super();
    this.pending = Object.create(null);
    this.id = 0;
    Object.assign(this, defaultOptions, options);
  }

  id() {
    return this.id++;
  }

  url(protocol) {
    return `${protocol}://${this.host}:${this.port}${this.path}`;
  }

  async send(message) {
    this.socket.send(JSON.stringify(message));
  }

  async request(message) {
    const response = await fetch(this.url('http'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    let data;
    try {
      data = await response.json();
      this.handleMessage(data);
    } catch (error) {
      this.dispatchEvent(new ErrorEvent('error', { error }));
      throw error;
    }
    return data;
  }

  createRequest(method, params) {
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

  async call(method, params) {
    const request = this.createRequest(method, params);
    await this.send(request);
    const { promise } = this.pending[request.id] = Promise.withResolvers();
    return promise;
  }

  async notify(method, params) {
    const request = this.createRequest(method, params);
    await this.send(request);
  }

  handleResponse({ id, error, result }) {
    const pending = this.pending[id];
    if (!pending) return;
    if (error) pending.reject(new JSONRPCError(error));
    else pending.resolve(result);
    delete this.pending[id];
  }

  handleRequest({ method, params }) {
    return this.send(method, params);
  }

  handleNotification({ method, params }) {
    const eventInit = { method, params };
    this.dispatchEvent(new JSONRPCNotificationEvent('notification', eventInit));
  }

  handleMessage(message) {
    const eventInit = { data: message };
    this.dispatchEvent(new JSONRPCEvent('message', eventInit));
    if (Array.isArray(message)) {
      for (const item of message) {
        this.handleMessage(item);
      }
    } else {
      this.handleResponse(message);
    }
  }

  handleError(error) {
    if (error.id === undefined) {
      this.handleNotification(error);
    } else if (error.id === undefined) {
      this.handleRequest(error);
    } else {
      this.handleResponse(error);
    }
  }

  async connect() {
    this.socket = new WebSocket(this.url('ws'));
    this.socket.onopen = () => {
      this.dispatchEvent(new Event('open'));
    };
    this.socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (error) {
        this.dispatchEvent(new ErrorEvent('error', { error }));
        return;
      }
      this.handleMessage(message);
    };
    this.socket.onclose = () => {
      this.dispatchEvent(new Event('close'));
    };
    this.socket.onerror = (error) => {
      this.dispatchEvent(new ErrorEvent('error', { error }));
    };
    return promiseEvent(this, 'open');
  }

  async disconnect() {
    const { socket } = this;
    socket.close();
    return promiseEvent(this, 'close');
  }

  static defaultOptions = defaultOptions;
}

export {
  JSONRPCEvent,
  JSONRPCNotificationEvent,
  JSONRPCClient as default
};
