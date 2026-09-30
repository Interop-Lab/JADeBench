function promiseEvent(_0x4f94a0, _0x351ac6) {
  const _0x4c947e = new AbortController();
  const {
    signal: _0xbaf653
  } = _0x4c947e;
  return new Promise((_0x25274a, _0x5ee80f) => {
    const _0x56155b = {
      signal: _0xbaf653
    };
    _0x4f94a0.addEventListener(_0x351ac6, _0x25274a, _0x56155b);
    const _0xa4b938 = {
      signal: _0xbaf653
    };
    _0x4f94a0.addEventListener("error", _0x5ee80f, _0xa4b938);
  }).finally(() => _0x4c947e.abort());
}
var JSONRPCError = class extends Error {
  constructor({
    message: _0x5c4296,
    code: _0x492ab0,
    data: _0x381f50
  }) {
    super(_0x5c4296);
    this.code = _0x492ab0;
    if (_0x381f50) {
      this.data = _0x381f50;
    }
    this.name = this.constructor.name;
  }
};
if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(_0x3dc1d5, _0x109fea) {
      super(_0x3dc1d5, _0x109fea);
      this.error = _0x109fea?.error;
    }
  };
}
var JSONRPCEvent = class extends Event {
  constructor(_0x208a3c, _0x48094a) {
    super(_0x208a3c, _0x48094a);
    this.data = _0x48094a?.data;
  }
};
var JSONRPCNotificationEvent = class extends Event {
  constructor(_0x52d170, _0x213d74) {
    super(_0x52d170, _0x213d74);
    this.method = _0x213d74?.method;
    this.params = _0x213d74?.params;
  }
};
const _0xe4cb0e = {
  secure: false,
  host: "localhost",
  port: 80,
  secret: "",
  path: "/jsonrpc"
};
var JSONRPCClient = class extends EventTarget {
  constructor(_0x55b84d) {
    super();
    this.deferreds = Object.create(null);
    this.lastId = 0;
    Object.assign(this, this.constructor.defaultOptions, _0x55b84d);
  }
  id() {
    return this.lastId++;
  }
  url(_0x1d7971) {
    return _0x1d7971 + (this.secure ? "s" : "") + "://" + this.host + ":" + this.port + this.path;
  }
  async websocket(_0x4a13ec) {
    this.socket.send(JSON.stringify(_0x4a13ec));
  }
  async http(_0x1dbca5) {
    const _0x197e2c = await fetch(this.url("http"), {
      method: "POST",
      body: JSON.stringify(_0x1dbca5),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    let _0x12af06;
    try {
      _0x12af06 = await _0x197e2c.json();
      this._onmessage(_0x12af06);
    } catch (_0x494f2b) {
      const _0x4488b5 = {
        error: _0x494f2b
      };
      this.dispatchEvent(new ErrorEvent("error", _0x4488b5));
      throw _0x494f2b;
    }
    return _0x12af06;
  }
  _buildMessage(_0x411ab0, _0xb28dab) {
    if (typeof _0x411ab0 !== "string") {
      throw new TypeError(_0x411ab0 + " is not a string");
    }
    const _0x496dbb = {
      method: _0x411ab0,
      "json-rpc": "2.0",
      id: this.id()
    };
    if (_0xb28dab) {
      Object.assign(_0x496dbb, {
        params: _0xb28dab
      });
    }
    return _0x496dbb;
  }
  async batch(_0x56814d) {
    const _0x386344 = _0x56814d.map(([_0x401309, _0x2c2b15]) => {
      return this._buildMessage(_0x401309, _0x2c2b15);
    });
    await this._send(_0x386344);
    return _0x386344.map(({
      id: _0x318c78
    }) => {
      const {
        promise: _0xc42d36
      } = this.deferreds[_0x318c78] = Promise.withResolvers();
      return _0xc42d36;
    });
  }
  async call(_0x1f9943, _0x4f6546) {
    const _0x4c487e = this._buildMessage(_0x1f9943, _0x4f6546);
    await this._send(_0x4c487e);
    const {
      promise: _0x261a74
    } = this.deferreds[_0x4c487e.id] = Promise.withResolvers();
    return _0x261a74;
  }
  async _send(_0x1904de) {
    const _0x6e057a = {
      data: _0x1904de
    };
    this.dispatchEvent(new JSONRPCEvent("output", _0x6e057a));
    if (this.socket?.readyState === 1) {
      return this.websocket(_0x1904de);
    } else {
      return this.http(_0x1904de);
    }
  }
  _onresponse({
    id: _0x378f1f,
    error: _0x4d29b3,
    result: _0x470abe
  }) {
    const _0x4104ae = this.deferreds[_0x378f1f];
    if (!_0x4104ae) {
      return;
    }
    if (_0x4d29b3) {
      _0x4104ae.reject(new JSONRPCError(_0x4d29b3));
    } else {
      _0x4104ae.resolve(_0x470abe);
    }
    delete this.deferreds[_0x378f1f];
  }
  _onrequest({
    method: _0x2d197e,
    params: _0x2f48ac
  }) {
    return this.onrequest(_0x2d197e, _0x2f48ac);
  }
  _onnotification({
    method: _0x19897b,
    params: _0x44d6c6
  }) {
    const _0x328321 = {
      method: _0x19897b,
      params: _0x44d6c6
    };
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", _0x328321));
  }
  _onmessage(_0x3328b3) {
    const _0x440f2d = {
      data: _0x3328b3
    };
    this.dispatchEvent(new JSONRPCEvent("input", _0x440f2d));
    if (Array.isArray(_0x3328b3)) {
      for (const _0x498927 of _0x3328b3) {
        this._onobject(_0x498927);
      }
    } else {
      this._onobject(_0x3328b3);
    }
  }
  _onobject(_0x3b6003) {
    if (_0x3b6003.method === undefined) {
      this._onresponse(_0x3b6003);
    } else if (_0x3b6003.id === undefined) {
      this._onnotification(_0x3b6003);
    } else {
      this._onrequest(_0x3b6003);
    }
  }
  async open() {
    const _0x48c16c = this.socket = new WebSocket(this.url("ws"));
    _0x48c16c.onclose = () => {
      this.dispatchEvent(new Event("close"));
    };
    _0x48c16c.onmessage = _0x5ecb41 => {
      let _0x5d537b;
      try {
        _0x5d537b = JSON.parse(_0x5ecb41.data);
      } catch (_0x44ea4f) {
        const _0x2af005 = {
          error: _0x44ea4f
        };
        this.dispatchEvent(new ErrorEvent("error", _0x2af005));
        return;
      }
      this._onmessage(_0x5d537b);
    };
    _0x48c16c.onopen = () => {
      this.dispatchEvent(new Event("open"));
    };
    _0x48c16c.onerror = _0x123fb0 => {
      const _0x33a89f = {
        error: _0x123fb0
      };
      this.dispatchEvent(new ErrorEvent("error", _0x33a89f));
    };
    return promiseEvent(this, "open");
  }
  async close() {
    const {
      socket: _0x16ff88
    } = this;
    _0x16ff88.close();
    return promiseEvent(this, "close");
  }
  static defaultOptions = _0xe4cb0e;
};
var JSONRPCClient_default = JSONRPCClient;
export { JSONRPCEvent, JSONRPCNotificationEvent, JSONRPCClient_default as default };