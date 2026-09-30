function promiseEvent(_0x475814, _0x24791d) {
  const _0x5854c1 = new AbortController();
  const {
    signal: _0x26ed65
  } = _0x5854c1;
  return new Promise((_0x37e0f4, _0x530feb) => {
    const _0x2d8e2b = {
      signal: _0x26ed65
    };
    _0x475814.addEventListener(_0x24791d, _0x37e0f4, _0x2d8e2b);
    const _0x44ee37 = {
      signal: _0x26ed65
    };
    _0x475814.addEventListener("error", _0x530feb, _0x44ee37);
  }).finally(() => _0x5854c1.abort());
}
var JSONRPCError = class extends Error {
  constructor({
    message: _0x10e8c8,
    code: _0x3459f8,
    data: _0x573ec8
  }) {
    super(_0x10e8c8);
    this.code = _0x3459f8;
    if (_0x573ec8) {
      this.data = _0x573ec8;
    }
    this.name = this.constructor.name;
  }
};
if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(_0xefeb58, _0x470d65) {
      super(_0xefeb58, _0x470d65);
      this.error = _0x470d65?.error;
    }
  };
}
var JSONRPCEvent = class extends Event {
  constructor(_0x3c245e, _0x4b31de) {
    super(_0x3c245e, _0x4b31de);
    this.data = _0x4b31de?.data;
  }
};
var JSONRPCNotificationEvent = class extends Event {
  constructor(_0xe458e7, _0x7ffb30) {
    super(_0xe458e7, _0x7ffb30);
    this.method = _0x7ffb30?.method;
    this.params = _0x7ffb30?.params;
  }
};
const _0xe1a4c6 = {
  secure: false,
  host: "localhost",
  port: 80,
  secret: "",
  path: "/jsonrpc"
};
var JSONRPCClient = class extends EventTarget {
  constructor(_0x13a1a4) {
    super();
    this.deferreds = Object.create(null);
    this.lastId = 0;
    Object.assign(this, this.constructor.defaultOptions, _0x13a1a4);
  }
  id() {
    return this.lastId++;
  }
  url(_0x58e389) {
    return _0x58e389 + (this.secure ? "s" : "") + "://" + this.host + ":" + this.port + this.path;
  }
  async websocket(_0x451b01) {
    this.socket.send(JSON.stringify(_0x451b01));
  }
  async http(_0x549207) {
    const _0x4b41a7 = await fetch(this.url("http"), {
      method: "POST",
      body: JSON.stringify(_0x549207),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    let _0x1840c9;
    try {
      _0x1840c9 = await _0x4b41a7.json();
      this._onmessage(_0x1840c9);
    } catch (_0x456889) {
      const _0x197aea = {
        error: _0x456889
      };
      this.dispatchEvent(new ErrorEvent("error", _0x197aea));
      throw _0x456889;
    }
    return _0x1840c9;
  }
  _buildMessage(_0x329fb8, _0x104e98) {
    if (typeof _0x329fb8 !== "string") {
      throw new TypeError(_0x329fb8 + " is not a string");
    }
    const _0x3fec6 = {
      method: _0x329fb8,
      "json-rpc": "2.0",
      id: this.id()
    };
    if (_0x104e98) {
      Object.assign(_0x3fec6, {
        params: _0x104e98
      });
    }
    return _0x3fec6;
  }
  async batch(_0xc778fd) {
    const _0x460b31 = _0xc778fd.map(([_0x5f2867, _0x420af1]) => {
      return this._buildMessage(_0x5f2867, _0x420af1);
    });
    await this._send(_0x460b31);
    return _0x460b31.map(({
      id: _0x15c261
    }) => {
      const {
        promise: _0x21b5c8
      } = this.deferreds[_0x15c261] = Promise.withResolvers();
      return _0x21b5c8;
    });
  }
  async call(_0x66f0e5, _0x4a9c17) {
    const _0x4ac142 = this._buildMessage(_0x66f0e5, _0x4a9c17);
    await this._send(_0x4ac142);
    const {
      promise: _0xe36f4c
    } = this.deferreds[_0x4ac142.id] = Promise.withResolvers();
    return _0xe36f4c;
  }
  async _send(_0x1af336) {
    const _0x8129c8 = {
      data: _0x1af336
    };
    this.dispatchEvent(new JSONRPCEvent("output", _0x8129c8));
    if (this.socket?.readyState === 1) {
      return this.websocket(_0x1af336);
    } else {
      return this.http(_0x1af336);
    }
  }
  _onresponse({
    id: _0x4940e1,
    error: _0x573d6a,
    result: _0x38e414
  }) {
    const _0x3d13b7 = this.deferreds[_0x4940e1];
    if (!_0x3d13b7) {
      return;
    }
    if (_0x573d6a) {
      _0x3d13b7.reject(new JSONRPCError(_0x573d6a));
    } else {
      _0x3d13b7.resolve(_0x38e414);
    }
    ;
  }
  _onrequest({
    method: _0x5b9a0f,
    params: _0x3b7173
  }) {
    return this.onrequest(_0x5b9a0f, _0x3b7173);
  }
  _onnotification({
    method: _0x215791,
    params: _0x3579eb
  }) {
    const _0x2725ff = {
      method: _0x215791,
      params: _0x3579eb
    };
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", _0x2725ff));
  }
  _onmessage(_0x310601) {
    const _0x44d68e = {
      data: _0x310601
    };
    this.dispatchEvent(new JSONRPCEvent("input", _0x44d68e));
    if (Array.isArray(_0x310601)) {
      for (const _0x25c11c of _0x310601) {
        this._onobject(_0x25c11c);
      }
    } else {
      this._onobject(_0x310601);
    }
  }
  _onobject(_0x2089a3) {
    if (_0x2089a3.method === undefined) {
      this._onresponse(_0x2089a3);
    } else if (_0x2089a3.id === undefined) {
      this._onnotification(_0x2089a3);
    } else {
      this._onrequest(_0x2089a3);
    }
  }
  async open() {
    const _0x37c590 = this.socket = new WebSocket(this.url("ws"));
    _0x37c590.onclose = () => {
      this.dispatchEvent(new Event("close"));
    };
    _0x37c590.onmessage = _0x371846 => {
      let _0x47e3e4;
      try {
        _0x47e3e4 = JSON.parse(_0x371846.data);
      } catch (_0x5efe18) {
        const _0x2657d8 = {
          error: _0x5efe18
        };
        this.dispatchEvent(new ErrorEvent("error", _0x2657d8));
        return;
      }
      this._onmessage(_0x47e3e4);
    };
    _0x37c590.onopen = () => {
      this.dispatchEvent(new Event("open"));
    };
    _0x37c590.onerror = _0x48c6b4 => {
      const _0x1649f0 = {
        error: _0x48c6b4
      };
      this.dispatchEvent(new ErrorEvent("error", _0x1649f0));
    };
    return promiseEvent(this, "open");
  }
  async close() {
    const {
      socket: _0x450799
    } = this;
    _0x450799.close();
    return promiseEvent(this, "close");
  }
  static defaultOptions = _0xe1a4c6;
};
var JSONRPCClient_default = JSONRPCClient;
export { JSONRPCEvent, JSONRPCNotificationEvent, JSONRPCClient_default as default };