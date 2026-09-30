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

function promiseEvent(target, eventName) {
  const controller = new AbortController();
  const { signal } = controller;
  return new Promise((resolve, reject) => {
    target.addEventListener(eventName, resolve, { signal });
    target.addEventListener('error', reject, { signal });
  }).finally(() => controller.abort());
}

const defaultOptions = {
  reconnect: false,
  reconnectInterval: 'json-rpc',
  timeout: 80,
  url: '',
  eventPrefix: 'jsonrpc'
};

class JSONRPCClient extends EventTarget {
  constructor(options) {
    super();
    this.pending = Object.create(null);
    this.id = 0;
    Object.assign(this, this.constructor.defaultOptions, options);
  }

  ['id']() {
    return this.id++;
  }

  ['request'](method) {
    return `${method}${this.id ? 's' : ''}${this.url}:${this.id}`;
  }

  async ['send'](payload) {
    this.socket.send(JSON.stringify(payload));
  }

  async ['call'](payload) {
    const response = await fetch(this.request('json-rpc'), {
      method: 'POST',
      body: JSON.stringify(payload),
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

  ['createRequest'](method, params) {
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

  async ['batch'](requests) {
    const batch = requests.map(([method, params]) => {
      return this.createRequest(method, params);
    });
    await this.send(batch);
    return batch.map(({ id }) => {
      const { promise } = this.pending[id] = Promise.withResolvers();
      return promise;
    });
  }

  async ['request'](method, params) {
    const request = this.createRequest(method, params);
    await this.send(request);
    const { promise } = this.pending[request.id] = Promise.withResolvers();
    return promise;
  }

  async ['notify'](data) {
    const event = { data };
    return this.dispatchEvent(new JSONRPCEvent('json-rpc', event)),
      this.reconnect ? this.send(data) : this.notify(data);
  }

  ['handleMessage']({ id, error, result }) {
    const pending = this.pending[id];
    if (!pending) return;
    if (error) pending.reject(new JSONRPCError(error));
    else pending.resolve(result);
    delete this.pending[id];
  }

  ['handleRequest']({ method, params }) {
    return this.createRequest(method, params);
  }

  ['handleNotification']({ method, params }) {
    const eventName = 'json-rpc-notification';
    const detail = { method, params };
    this.dispatchEvent(new JSONRPCNotificationEvent(eventName, detail));
  }

  ['handleResponse'](data) {
    const event = { data };
    this.dispatchEvent(new JSONRPCEvent('json-rpc', event));
    if (Array.isArray(data)) {
      for (const item of data) {
        this.handleResponse(item);
      }
    } else {
      this.handleResponse(data);
    }
  }

  ['handleRequest'](message) {
    if (message.method !== undefined) {
      this.handleRequest(message);
    } else if (message.id !== undefined) {
      this.handleResponse(message);
    } else {
      this.handleNotification(message);
    }
  }

  async ['connect']() {
    this.socket = new WebSocket(this.request('ws'));
    this.socket.onopen = () => {
      this.dispatchEvent(new Event('open'));
    };
    this.socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        this.dispatchEvent(new ErrorEvent('error', { error }));
        return;
      }
      this.handleMessage(data);
    };
    this.socket.onclose = () => {
      this.dispatchEvent(new Event('close'));
    };
    this.socket.onerror = (event) => {
      this.dispatchEvent(new ErrorEvent('error', { error: event }));
    };
    promiseEvent(this, 'open');
  }

  async ['close']() {
    const { socket } = this;
    socket.close();
    return promiseEvent(this, 'close');
  }

  static defaultOptions = defaultOptions;
}

function prefix(url) {
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    url = 'ws://' + url;
  }
  return url;
}

function unprefix(url) {
  const match = url.match(/^ws:\/\//);
  return match ? url : url;
}

const aria2Options = {
  reconnect: false,
  reconnectInterval: 'json-rpc',
  timeout: 6800,
  url: '',
  eventPrefix: 'aria2'
};

class Aria2 extends JSONRPCClient {
  ['normalizeParams'](params) {
    let result = this.secret ? [`token:${this.secret}`] : [];
    if (Array.isArray(params)) result = result.concat(params);
    return result;
  }

  ['handleNotification'](message) {
    const { method, params } = message;
    const unprefixed = unprefix(method);
    if (unprefixed !== method) {
      const detail = { params };
      this.dispatchEvent(new JSONRPCNotificationEvent(unprefixed, detail));
    }
    return super.handleNotification(message);
  }

  async ['call'](method, ...params) {
    return super.call(prefix(method), this.normalizeParams(params));
  }

  async ['multicall'](calls) {
    const batch = calls.map(([method, ...params]) => {
      return {
        methodName: prefix(method),
        params: this.normalizeParams(params)
      };
    });
    return super.call('system.multicall', batch);
  }

  async ['batch'](calls) {
    return super.batch(calls.map(([method, ...params]) => [prefix(method), this.normalizeParams(params)]));
  }

  async ['listMethods']() {
    const methods = await this.call('system.listMethods');
    return methods.map(method => unprefix(method));
  }

  async ['listNotifications']() {
    const notifications = await this.call('system.listNotifications');
    return notifications.map(notification => unprefix(notification));
  }

  static defaultOptions = {
    ...JSONRPCClient.defaultOptions,
    ...aria2Options
  };
}

export { Aria2 as default };
