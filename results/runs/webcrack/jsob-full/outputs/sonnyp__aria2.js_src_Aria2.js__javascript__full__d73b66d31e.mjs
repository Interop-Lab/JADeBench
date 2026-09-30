function promiseEvent(_0x5b1f86, _0xbb791) {
  const _0x4f5b49 = new AbortController();
  const {
    signal: _0x5c9b9b
  } = _0x4f5b49;
  return new Promise((_0x529ea6, _0xabfe7f) => {
    const _0x7f2c88 = {
      signal: _0x5c9b9b
    };
    _0x5b1f86.addEventListener(_0xbb791, _0x529ea6, _0x7f2c88);
    const _0x42dbd8 = {
      signal: _0x5c9b9b
    };
    _0x5b1f86.addEventListener("error", _0xabfe7f, _0x42dbd8);
  }).finally(() => _0x4f5b49.abort());
}
var JSONRPCError = class extends Error {
  constructor({
    message: _0x29c568,
    code: _0x2217de,
    data: _0x56a25f
  }) {
    super(_0x29c568);
    this.code = _0x2217de;
    if (_0x56a25f) {
      this.data = _0x56a25f;
    }
    this.name = this.constructor.name;
  }
};
if (!globalThis.ErrorEvent) {
  globalThis.ErrorEvent = class ErrorEvent extends Event {
    constructor(_0x9f1a7d, _0xe42e90) {
      super(_0x9f1a7d, _0xe42e90);
      this.error = _0xe42e90?.error;
    }
  };
}
var JSONRPCEvent = class extends Event {
  constructor(_0xc7de78, _0x2ad515) {
    super(_0xc7de78, _0x2ad515);
    this.data = _0x2ad515?.data;
  }
};
var JSONRPCNotificationEvent = class extends Event {
  constructor(_0x59b8e4, _0x284fa7) {
    super(_0x59b8e4, _0x284fa7);
    this.method = _0x284fa7?.method;
    this.params = _0x284fa7?.params;
  }
};
const _0x1f403d = {
  secure: false,
  host: "localhost",
  port: 80,
  secret: "",
  path: "/jsonrpc"
};
var JSONRPCClient = class extends EventTarget {
  constructor(_0x2c39e8) {
    super();
    this.deferreds = Object.create(null);
    this.lastId = 0;
    Object.assign(this, this.constructor.defaultOptions, _0x2c39e8);
  }
  id() {
    return this.lastId++;
  }
  url(_0x48cdd2) {
    return _0x48cdd2 + (this.secure ? "s" : "") + "://" + this.host + ":" + this.port + this.path;
  }
  async websocket(_0x43a2fd) {
    this.socket.send(JSON.stringify(_0x43a2fd));
  }
  async http(_0x388b51) {
    const _0xc54fda = await fetch(this.url("http"), {
      method: "POST",
      body: JSON.stringify(_0x388b51),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    let _0x15f769;
    try {
      _0x15f769 = await _0xc54fda.json();
      this._onmessage(_0x15f769);
    } catch (_0x4d8aad) {
      const _0x5e5df1 = {
        error: _0x4d8aad
      };
      this.dispatchEvent(new ErrorEvent("error", _0x5e5df1));
      throw _0x4d8aad;
    }
    return _0x15f769;
  }
  _buildMessage(_0x596228, _0x1f91c8) {
    if (typeof _0x596228 !== "string") {
      throw new TypeError(_0x596228 + " is not a string");
    }
    const _0x27ffaa = {
      method: _0x596228,
      "json-rpc": "2.0",
      id: this.id()
    };
    if (_0x1f91c8) {
      Object.assign(_0x27ffaa, {
        params: _0x1f91c8
      });
    }
    return _0x27ffaa;
  }
  async batch(_0x16ba9f) {
    const _0x45a2ae = _0x16ba9f.map(([_0x5a929c, _0x15846c]) => {
      return this._buildMessage(_0x5a929c, _0x15846c);
    });
    await this._send(_0x45a2ae);
    return _0x45a2ae.map(({
      id: _0x5ef151
    }) => {
      const {
        promise: _0x58425d
      } = this.deferreds[_0x5ef151] = Promise.withResolvers();
      return _0x58425d;
    });
  }
  async call(_0x20adf2, _0x42010f) {
    const _0x84d8e7 = this._buildMessage(_0x20adf2, _0x42010f);
    await this._send(_0x84d8e7);
    const {
      promise: _0x4fcf89
    } = this.deferreds[_0x84d8e7.id] = Promise.withResolvers();
    return _0x4fcf89;
  }
  async _send(_0x41e210) {
    const _0x3c42e8 = {
      data: _0x41e210
    };
    this.dispatchEvent(new JSONRPCEvent("output", _0x3c42e8));
    if (this.socket?.readyState === 1) {
      return this.websocket(_0x41e210);
    } else {
      return this.http(_0x41e210);
    }
  }
  _onresponse({
    id: _0x4cf583,
    error: _0x200378,
    result: _0x12808b
  }) {
    const _0x598556 = this.deferreds[_0x4cf583];
    if (!_0x598556) {
      return;
    }
    if (_0x200378) {
      _0x598556.reject(new JSONRPCError(_0x200378));
    } else {
      _0x598556.resolve(_0x12808b);
    }
    delete this.deferreds[_0x4cf583];
  }
  _onrequest({
    method: _0x31eb61,
    params: _0x378943
  }) {
    return this.onrequest(_0x31eb61, _0x378943);
  }
  _onnotification({
    method: _0x549b4c,
    params: _0x597464
  }) {
    const _0xc4d6f1 = {
      method: _0x549b4c,
      params: _0x597464
    };
    this.dispatchEvent(new JSONRPCNotificationEvent("notification", _0xc4d6f1));
  }
  _onmessage(_0x4ab4ce) {
    const _0x52a0f2 = {
      data: _0x4ab4ce
    };
    this.dispatchEvent(new JSONRPCEvent("input", _0x52a0f2));
    if (Array.isArray(_0x4ab4ce)) {
      for (const _0x1faa91 of _0x4ab4ce) {
        this._onobject(_0x1faa91);
      }
    } else {
      this._onobject(_0x4ab4ce);
    }
  }
  _onobject(_0x4484af) {
    if (_0x4484af.method === undefined) {
      this._onresponse(_0x4484af);
    } else if (_0x4484af.id === undefined) {
      this._onnotification(_0x4484af);
    } else {
      this._onrequest(_0x4484af);
    }
  }
  async open() {
    const _0x51e447 = this.socket = new WebSocket(this.url("ws"));
    _0x51e447.onclose = () => {
      this.dispatchEvent(new Event("close"));
    };
    _0x51e447.onmessage = _0x25837c => {
      let _0x49ee6e;
      try {
        _0x49ee6e = JSON.parse(_0x25837c.data);
      } catch (_0x475bb1) {
        const _0x1b0547 = {
          error: _0x475bb1
        };
        this.dispatchEvent(new ErrorEvent("error", _0x1b0547));
        return;
      }
      this._onmessage(_0x49ee6e);
    };
    _0x51e447.onopen = () => {
      this.dispatchEvent(new Event("open"));
    };
    _0x51e447.onerror = _0x4378fa => {
      const _0x382176 = {
        error: _0x4378fa
      };
      this.dispatchEvent(new ErrorEvent("error", _0x382176));
    };
    return promiseEvent(this, "open");
  }
  async close() {
    const {
      socket: _0x2bc771
    } = this;
    _0x2bc771.close();
    return promiseEvent(this, "close");
  }
  static defaultOptions = _0x1f403d;
};
var JSONRPCClient_default = JSONRPCClient;
function prefix(_0x5cd456) {
  if (!_0x5cd456.startsWith("system.") && !_0x5cd456.startsWith("aria2.")) {
    _0x5cd456 = "aria2." + _0x5cd456;
  }
  return _0x5cd456;
}
function unprefix(_0x48990b) {
  const _0x308a4e = _0x48990b.split("aria2.")[1];
  return _0x308a4e || _0x48990b;
}
const _0x160b24 = {
  secure: false,
  host: "localhost",
  port: 6800,
  secret: "",
  path: "/jsonrpc"
};
var Aria2 = class extends JSONRPCClient_default {
  addSecret(_0x4477b6) {
    let _0x599d1e = this.secret ? ["token:" + this.secret] : [];
    if (Array.isArray(_0x4477b6)) {
      _0x599d1e = _0x599d1e.concat(_0x4477b6);
    }
    return _0x599d1e;
  }
  _onnotification(_0x5dc64a) {
    const {
      method: _0x31cef7,
      params: _0x4fecd0
    } = _0x5dc64a;
    const _0x35e086 = unprefix(_0x31cef7);
    if (_0x35e086 !== _0x31cef7) {
      const _0x5e6945 = {
        params: _0x4fecd0
      };
      this.dispatchEvent(new JSONRPCNotificationEvent(_0x35e086, _0x5e6945));
    }
    return super._onnotification(_0x5dc64a);
  }
  async call(_0x4342ec, ..._0x14c2fb) {
    return super.call(prefix(_0x4342ec), this.addSecret(_0x14c2fb));
  }
  async multicall(_0x572ed2) {
    const _0x29a1ef = [_0x572ed2.map(([_0x14bf02, ..._0x474a42]) => {
      return {
        methodName: prefix(_0x14bf02),
        params: this.addSecret(_0x474a42)
      };
    })];
    return super.call("system.multicall", _0x29a1ef);
  }
  async batch(_0x810c12) {
    return super.batch(_0x810c12.map(([_0x47432d, ..._0x447bf1]) => [prefix(_0x47432d), this.addSecret(_0x447bf1)]));
  }
  async listNotifications() {
    const _0x48380c = await this.call("system.listNotifications");
    return _0x48380c.map(_0x17b2a1 => unprefix(_0x17b2a1));
  }
  async listMethods() {
    const _0xf14ebd = await this.call("system.listMethods");
    return _0xf14ebd.map(_0x3cf1d9 => unprefix(_0x3cf1d9));
  }
  static prefix;
  static unprefix;
  static defaultOptions = {
    ...JSONRPCClient_default.defaultOptions,
    ..._0x160b24
  };
};
var Aria2_default = Aria2;
export { Aria2_default as default };