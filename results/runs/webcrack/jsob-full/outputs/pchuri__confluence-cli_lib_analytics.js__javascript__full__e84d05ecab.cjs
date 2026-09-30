var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x183b41, _0xcee95a) => function _0x1aefeb() {
  if (!_0xcee95a) {
    (0, _0x183b41[__getOwnPropNames(_0x183b41)[0]])((_0xcee95a = {
      exports: {}
    }).exports, _0xcee95a);
  }
  return _0xcee95a.exports;
};
var require_link_style = __commonJS({
  "../work/pchuri__confluence-cli/lib/link-style.js"(_0x1cfa3b, _0x27162e) {
    var _0x16179c = ["smart", "plain", "wiki"];
    function _0x5b3cae({
      isCloud = false,
      linkStyle = null
    } = {}) {
      if (_0x16179c.includes(linkStyle)) {
        return linkStyle;
      }
      if (isCloud) {
        return "smart";
      } else {
        return "plain";
      }
    }
    const _0x573664 = {
      VALID_LINK_STYLES: _0x16179c,
      resolveLinkStyle: _0x5b3cae
    };
    _0x27162e.exports = _0x573664;
  }
});
var require_output = __commonJS({
  "../work/pchuri__confluence-cli/lib/output.js"(_0x2f79ef, _0x1df48d) {
    'use strict';

    var _0x4a9f64 = require("chalk");
    var _0x56581e = false;
    function _0x5f0cff(_0x4d2d59) {
      _0x56581e = Boolean(_0x4d2d59);
    }
    function _0x5c62ba() {
      return _0x56581e;
    }
    function _0x23de84(_0xd5b310) {
      console.log(JSON.stringify(_0xd5b310, null, 2));
    }
    var _0x1bf2b6 = new Set(["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET", "ECONNABORTED", "EAI_AGAIN", "EPIPE", "EHOSTUNREACH", "ENETUNREACH"]);
    function _0x530361(_0x28c6aa) {
      const _0x5c1cc1 = _0x28c6aa?.response?.status;
      if (_0x5c1cc1 === 401 || _0x5c1cc1 === 403) {
        return "AUTH_FAILED";
      }
      if (_0x5c1cc1 === 404) {
        return "NOT_FOUND";
      }
      if (typeof _0x5c1cc1 === "number" && _0x5c1cc1 >= 400) {
        return "API_ERROR";
      }
      if (_0x28c6aa?.code && _0x1bf2b6.has(_0x28c6aa.code)) {
        return "NETWORK";
      }
      if (_0x28c6aa instanceof Error) {
        return "VALIDATION";
      }
      return "UNKNOWN";
    }
    function _0x531bf7(_0x17127d, _0x5c9e9d = {}) {
      const _0x1ea6c8 = "status" in _0x5c9e9d ? _0x5c9e9d.status : _0x17127d?.response?.status ?? null;
      const _0x2c1e7f = "details" in _0x5c9e9d ? _0x5c9e9d.details : _0x17127d?.response?.data ?? null;
      const _0x4b59fe = {
        error: _0x5c9e9d.message ?? _0x17127d?.message ?? String(_0x17127d),
        code: _0x5c9e9d.code ?? _0x530361(_0x17127d),
        status: _0x1ea6c8 ?? null,
        details: _0x2c1e7f ?? null
      };
      console.error(JSON.stringify(_0x4b59fe, null, 2));
    }
    var _0x22fc9f = false;
    function _0x219d8b(_0xd6b598, _0x21e13e = {}) {
      if (_0xd6b598) {
        return true;
      }
      const _0x42818c = typeof _0x21e13e.format === "string" ? _0x21e13e.format.toLowerCase() : "";
      if (_0x42818c === "json") {
        if (!_0x22fc9f) {
          _0x22fc9f = true;
          console.error(_0x4a9f64.yellow("Warning: \"--format json\" is deprecated and will be removed in a future major version. Use the global \"--json\" flag instead."));
        }
        return true;
      }
      return false;
    }
    const _0x3ac58d = {
      emitJson: _0x23de84,
      emitJsonError: _0x531bf7,
      classifyErrorCode: _0x530361,
      jsonRequested: _0x219d8b,
      setJsonMode: _0x5f0cff,
      isJsonMode: _0x5c62ba
    };
    _0x1df48d.exports = _0x3ac58d;
  }
});
var require_netrc = __commonJS({
  "../work/pchuri__confluence-cli/lib/netrc.js"(_0x38abec, _0x52dcf7) {
    var _0x5dadd6 = require("fs");
    var _0x4a3303 = require("path");
    var _0x2d28ec = require("os");
    var _0x508529 = require("chalk");
    var {
      isJsonMode: _0x4b6b9d
    } = require_output();
    function _0x500ed7() {
      if (process.env.NETRC) {
        return process.env.NETRC;
      }
      const _0x373812 = process.platform === "win32" ? "_netrc" : ".netrc";
      return _0x4a3303.join(_0x2d28ec.homedir(), _0x373812);
    }
    function _0x4d91c3(_0x2f31fd) {
      const _0x5d8f67 = [];
      const _0xd5b27a = /"((?:[^"\\]|\\.)*)"|(\S+)/g;
      let _0x41229d;
      while ((_0x41229d = _0xd5b27a.exec(_0x2f31fd)) !== null) {
        _0x5d8f67.push(_0x41229d[1] !== undefined ? _0x41229d[1].replace(/\\(.)/g, "$1") : _0x41229d[2]);
      }
      return _0x5d8f67;
    }
    function _0x26df62(_0x182288) {
      const _0x6338ac = [];
      let _0x402a4b = null;
      let _0x5f5ae2 = false;
      for (const _0x571e11 of _0x182288.split("\n")) {
        if (_0x5f5ae2) {
          if (_0x571e11.trim() === "") {
            _0x5f5ae2 = false;
          }
          continue;
        }
        if (_0x571e11.trimStart().startsWith("#")) {
          continue;
        }
        const _0x1bf932 = _0x4d91c3(_0x571e11);
        for (let _0x29c838 = 0; _0x29c838 < _0x1bf932.length; _0x29c838++) {
          const _0x46ad41 = _0x1bf932[_0x29c838];
          switch (_0x46ad41) {
            case "machine":
              const _0x7d24dd = {
                machine: _0x1bf932[++_0x29c838],
                login: undefined,
                password: undefined
              };
              _0x402a4b = _0x7d24dd;
              _0x6338ac.push(_0x402a4b);
              break;
            case "default":
              const _0x33894e = {
                machine: null,
                login: undefined,
                password: undefined
              };
              _0x402a4b = _0x33894e;
              _0x6338ac.push(_0x402a4b);
              break;
            case "macdef":
              _0x5f5ae2 = true;
              _0x29c838 = _0x1bf932.length;
              break;
            case "login":
              if (_0x402a4b) {
                _0x402a4b.login = _0x1bf932[++_0x29c838];
              }
              break;
            case "password":
              if (_0x402a4b) {
                _0x402a4b.password = _0x1bf932[++_0x29c838];
              }
              break;
            default:
              _0x29c838++;
              break;
          }
        }
      }
      return _0x6338ac;
    }
    function _0x365c54({
      machine: _0x1d4ea9,
      login: _0x1f09bd
    } = {}) {
      const _0x2a10f8 = (_0x1d4ea9 || "").trim().toLowerCase();
      if (!_0x2a10f8) {
        return null;
      }
      const _0x12ffa5 = _0x500ed7();
      let _0x16d781;
      try {
        _0x16d781 = _0x5dadd6.readFileSync(_0x12ffa5, "utf8");
      } catch (_0x4303e8) {
        if (_0x4303e8.code === "ENOENT") {
          return null;
        }
        if (!_0x4b6b9d()) {
          console.error(_0x508529.yellow("⚠ Failed to read netrc file at " + _0x12ffa5 + ": " + _0x4303e8.message));
        }
        return null;
      }
      const _0x297e0f = _0x26df62(_0x16d781);
      const _0x2b8f39 = _0x297e0f.find(_0x14621d => _0x14621d.machine && _0x14621d.machine.toLowerCase() === _0x2a10f8 && (_0x1f09bd == null || _0x14621d.login === _0x1f09bd));
      if (!_0x2b8f39) {
        return null;
      }
      const _0x3e035a = {
        machine: _0x2b8f39.machine,
        login: _0x2b8f39.login,
        password: _0x2b8f39.password
      };
      return _0x3e035a;
    }
    const _0x213b6d = {
      getNetrcPath: _0x500ed7,
      parseNetrc: _0x26df62,
      lookupNetrc: _0x365c54
    };
    _0x52dcf7.exports = _0x213b6d;
  }
});
var require_config = __commonJS({
  "../work/pchuri__confluence-cli/lib/config.js"(_0xce7eb9, _0x596677) {
    var _0x5c358e = require("fs");
    var _0x497571 = require("path");
    var _0x5dcf04 = require("os");
    var _0x2eb0f9 = require("inquirer");
    var _0x410ce4 = require("chalk");
    var _0x529203 = "default";
    var _0x2449bf = null;
    function _0x141daf() {
      if (process.env.CONFLUENCE_CONFIG_DIR) {
        return process.env.CONFLUENCE_CONFIG_DIR;
      }
      const _0x284159 = _0x497571.join(_0x5dcf04.homedir(), ".confluence-cli");
      const _0x2a27f4 = process.env.XDG_CONFIG_HOME || _0x497571.join(_0x5dcf04.homedir(), ".config");
      const _0x1f4343 = _0x497571.join(_0x2a27f4, "confluence-cli");
      if (_0x5c358e.existsSync(_0x284159) && !_0x5c358e.existsSync(_0x1f4343)) {
        return _0x284159;
      }
      return _0x1f4343;
    }
    function _0x4fc197() {
      if (!_0x2449bf) {
        _0x2449bf = _0x141daf();
      }
      return _0x2449bf;
    }
    function _0xebc140() {
      return _0x497571.join(_0x4fc197(), "config.json");
    }
    var _0x1034d1 = _0x4fc197();
    var _0x57ae66 = _0xebc140();
    var _0x25c9b8 = [{
      name: "Basic (credentials)",
      value: "basic"
    }, {
      name: "Bearer token",
      value: "bearer"
    }, {
      name: "Client certificate (mTLS)",
      value: "mtls"
    }, {
      name: "Cookie (Enterprise SSO)",
      value: "cookie"
    }, {
      name: "None (auth injected by reverse proxy)",
      value: "none"
    }];
    var _0x3d6c35 = ["basic", "bearer", "mtls", "cookie", "none"];
    var {
      VALID_LINK_STYLES: _0x35fe41
    } = require_link_style();
    var {
      lookupNetrc: _0x2a8c4a,
      getNetrcPath: _0x443327
    } = require_netrc();
    var {
      isJsonMode: _0x23f5d2
    } = require_output();
    var _0xf8625d = (_0x2ec277, _0x261f0c) => {
      if (_0x2ec277 === undefined || _0x2ec277 === null || _0x2ec277 === "") {
        return undefined;
      }
      const _0x32e4f1 = String(_0x2ec277).trim().toLowerCase();
      if (_0x35fe41.includes(_0x32e4f1)) {
        return _0x32e4f1;
      }
      const _0x1aedde = _0x261f0c ? _0x261f0c + " " : "";
      if (!_0x23f5d2()) {
        console.error(_0x410ce4.yellow("⚠ Invalid linkStyle " + _0x1aedde + "\"" + _0x2ec277 + "\"; valid values: " + _0x35fe41.join(", ") + ". Falling back to auto-detection."));
      }
      return undefined;
    };
    var _0x3a23a7 = _0x184bf9 => /^[a-zA-Z0-9_-]+$/.test(_0x184bf9);
    var _0xd81e6c = _0x508f3f => _0xf8b333 => {
      if (!_0xf8b333 || !_0xf8b333.trim()) {
        return _0x508f3f + " is required";
      }
      return true;
    };
    var _0x363f0f = [{
      name: "HTTPS (recommended)",
      value: "https"
    }, {
      name: "HTTP",
      value: "http"
    }];
    var _0x6712aa = _0x388c88 => {
      const _0x274f57 = (_0x388c88 || "").trim().toLowerCase();
      if (_0x274f57 === "http" || _0x274f57 === "https") {
        return _0x274f57;
      }
      return "https";
    };
    var _0x2d944c = _0x3137b9 => {
      return (_0x3137b9 || "").trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
    };
    var _0x169ce7 = _0x46d6ff => {
      return (_0x46d6ff || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    };
    var _0x170a1c = (_0x1c396c, _0x12bbac) => {
      const _0x5626e5 = (_0x1c396c || "").trim().toLowerCase();
      if (_0x3d6c35.includes(_0x5626e5)) {
        return _0x5626e5;
      }
      if (_0x12bbac) {
        return "basic";
      } else {
        return "bearer";
      }
    };
    var _0x1ecc94 = _0x48ae1c => {
      if (typeof _0x48ae1c !== "string") {
        return undefined;
      }
      const _0x204c68 = _0x48ae1c.trim();
      return _0x204c68 || undefined;
    };
    var _0x1e49ab = _0x1fdb0f => {
      if (!_0x1fdb0f) {
        return undefined;
      }
      const _0x1dd30f = {
        caCert: _0x1ecc94(_0x1fdb0f.caCert),
        clientCert: _0x1ecc94(_0x1fdb0f.clientCert),
        clientKey: _0x1ecc94(_0x1fdb0f.clientKey)
      };
      if (!_0x1dd30f.caCert && !_0x1dd30f.clientCert && !_0x1dd30f.clientKey) {
        return undefined;
      }
      return _0x1dd30f;
    };
    var _0x274e00 = (_0x571577, _0x5dbf79 = "mTLS") => {
      const _0x37b96c = _0x1e49ab(_0x571577);
      if (!_0x37b96c) {
        return [_0x5dbf79 + " requires a client certificate and client key."];
      }
      const _0x38bbdc = [];
      if (!_0x37b96c.clientCert) {
        _0x38bbdc.push(_0x5dbf79 + " requires a client certificate.");
      } else if (!_0x5c358e.existsSync(_0x37b96c.clientCert)) {
        _0x38bbdc.push(_0x5dbf79 + " client certificate file not found: " + _0x37b96c.clientCert);
      }
      if (!_0x37b96c.clientKey) {
        _0x38bbdc.push(_0x5dbf79 + " requires a client key.");
      } else if (!_0x5c358e.existsSync(_0x37b96c.clientKey)) {
        _0x38bbdc.push(_0x5dbf79 + " client key file not found: " + _0x37b96c.clientKey);
      }
      if (_0x37b96c.caCert && !_0x5c358e.existsSync(_0x37b96c.caCert)) {
        _0x38bbdc.push(_0x5dbf79 + " CA certificate file not found: " + _0x37b96c.caCert);
      }
      return _0x38bbdc;
    };
    var _0x4dd745 = _0x2023bc => {
      if (_0x6712aa(_0x2023bc) === "http") {
        return "mTLS authentication requires HTTPS and is not compatible with HTTP.";
      }
      return null;
    };
    var _0x4e77bb = (_0x7d2a0a, _0x31b3cd) => {
      const _0x21ec0d = [];
      if (_0x7d2a0a.authType === "none") {
        return _0x21ec0d;
      }
      if (_0x7d2a0a.authType === "basic" && !_0x7d2a0a.email) {
        _0x21ec0d.push("Basic authentication requires an email address or username.");
      }
      if (_0x7d2a0a.authType === "cookie" && !_0x7d2a0a.cookie) {
        _0x21ec0d.push("Cookie authentication requires a cookie value.");
      }
      if (_0x7d2a0a.authType !== "mtls" && _0x7d2a0a.authType !== "cookie" && !_0x7d2a0a.token) {
        _0x21ec0d.push("Bearer or basic authentication requires a token.");
      }
      if (_0x7d2a0a.authType === "mtls") {
        _0x21ec0d.push(..._0x274e00(_0x7d2a0a.mtls, _0x31b3cd));
        const _0x9aae7b = _0x4dd745(_0x7d2a0a.protocol);
        if (_0x9aae7b) {
          _0x21ec0d.push(_0x9aae7b);
        }
      }
      return _0x21ec0d;
    };
    var _0x93f9be = (_0xec0144, _0x207bd4, _0x352b1d, _0x216fcb) => ({
      type: "input",
      name: _0xec0144,
      message: _0x207bd4,
      when: _0x216fcb || (_0x28e426 => _0x28e426.authType === "mtls"),
      validate: _0x23c660 => {
        const _0x5dfb49 = (_0x23c660 || "").trim();
        if (!_0x5dfb49) {
          if (_0x352b1d) {
            return _0x207bd4.replace(/:$/, "") + " is required for mTLS.";
          } else {
            return true;
          }
        }
        if (!_0x5c358e.existsSync(_0x5dfb49)) {
          return "File not found: " + _0x5dfb49;
        }
        return true;
      }
    });
    var _0x558320 = _0x575307 => {
      const _0x11d82d = _0x2d944c(_0x575307);
      if (_0x11d82d.endsWith(".atlassian.net")) {
        return "/wiki/rest/api";
      }
      return "/rest/api";
    };
    var _0x2c97aa = (_0x4344e2, _0x379b7d) => {
      const _0x1b5544 = (_0x4344e2 || "").trim();
      if (!_0x1b5544) {
        return _0x558320(_0x379b7d);
      }
      if (!_0x1b5544.startsWith("/")) {
        throw new Error("Confluence API path must start with \"/\".");
      }
      const _0x1d3284 = _0x1b5544.replace(/\/+$/, "");
      return _0x1d3284 || _0x558320(_0x379b7d);
    };
    function _0x39eea1({
      throwOnError = false
    } = {}) {
      if (!_0x5c358e.existsSync(_0x57ae66)) {
        return null;
      }
      try {
        const _0x455a05 = JSON.parse(_0x5c358e.readFileSync(_0x57ae66, "utf8"));
        if (_0x455a05.domain && !_0x455a05.profiles) {
          const _0x9139a = {
            domain: _0x455a05.domain,
            protocol: _0x455a05.protocol,
            apiPath: _0x455a05.apiPath,
            token: _0x455a05.token,
            authType: _0x455a05.authType
          };
          const _0x2e1c32 = _0x9139a;
          const _0x1f6ed3 = _0x1e49ab(_0x455a05.mtls);
          if (_0x1f6ed3) {
            _0x2e1c32.mtls = _0x1f6ed3;
          }
          if (_0x455a05.email) {
            _0x2e1c32.email = _0x455a05.email;
          }
          if (_0x455a05.cookie) {
            _0x2e1c32.cookie = _0x455a05.cookie;
          }
          const _0x20e0e8 = {
            activeProfile: _0x529203,
            profiles: {}
          };
          _0x20e0e8.profiles[_0x529203] = _0x2e1c32;
          return _0x20e0e8;
        }
        return _0x455a05;
      } catch (_0x109a8d) {
        if (throwOnError) {
          throw _0x109a8d;
        }
        console.error(_0x410ce4.yellow("⚠ Failed to parse config file at " + _0x57ae66 + ": " + _0x109a8d.message));
        console.error(_0x410ce4.yellow("  Run \"confluence init\" to recreate it."));
        return null;
      }
    }
    function _0x443254(_0x4f38d1) {
      if (!_0x5c358e.existsSync(_0x1034d1)) {
        _0x5c358e.mkdirSync(_0x1034d1, {
          recursive: true,
          mode: 448
        });
      } else {
        _0x5c358e.chmodSync(_0x1034d1, 448);
      }
      _0x5c358e.writeFileSync(_0x57ae66, JSON.stringify(_0x4f38d1, null, 2), {
        mode: 384
      });
      _0x5c358e.chmodSync(_0x57ae66, 384);
    }
    var _0x4c50cd = _0x560bdc => {
      const _0x2b08df = [];
      if (_0x560bdc.domain && (typeof _0x560bdc.domain !== "string" || !_0x560bdc.domain.trim())) {
        _0x2b08df.push("--domain cannot be empty");
      }
      if (_0x560bdc.token !== undefined && (typeof _0x560bdc.token !== "string" || !_0x560bdc.token.trim())) {
        _0x2b08df.push("--token cannot be empty");
      }
      if (_0x560bdc.email && (typeof _0x560bdc.email !== "string" || !_0x560bdc.email.trim())) {
        _0x2b08df.push("--email cannot be empty");
      }
      if (_0x560bdc.apiPath) {
        if (typeof _0x560bdc.apiPath !== "string" || !_0x560bdc.apiPath.startsWith("/")) {
          _0x2b08df.push("--api-path must start with \"/\"");
        } else {
          try {
            _0x2c97aa(_0x560bdc.apiPath, _0x560bdc.domain || "example.com");
          } catch (_0x41351e) {
            _0x2b08df.push("--api-path is invalid: " + _0x41351e.message);
          }
        }
      }
      if (_0x560bdc.protocol && (typeof _0x560bdc.protocol !== "string" || !["http", "https"].includes(_0x560bdc.protocol.toLowerCase()))) {
        _0x2b08df.push("--protocol must be \"http\" or \"https\"");
      }
      if (_0x560bdc.authType && (typeof _0x560bdc.authType !== "string" || !_0x3d6c35.includes(_0x560bdc.authType.toLowerCase()))) {
        _0x2b08df.push("--auth-type must be \"basic\", \"bearer\", \"mtls\", \"cookie\", or \"none\"");
      }
      const _0x529bd0 = typeof _0x560bdc.authType === "string" && _0x560bdc.authType ? _0x170a1c(_0x560bdc.authType, Boolean(_0x560bdc.email)) : null;
      if (_0x529bd0 === "basic" && !_0x560bdc.email) {
        _0x2b08df.push("--email is required when using basic authentication (use your username for on-premise)");
      }
      if (_0x529bd0 === "mtls") {
        _0x274e00(_0x560bdc.mtls, "--auth-type mtls").forEach(_0x1b6029 => {
          _0x2b08df.push(_0x1b6029);
        });
        const _0x50aa28 = _0x4dd745(_0x560bdc.protocol);
        if (_0x50aa28) {
          _0x2b08df.push(_0x50aa28);
        }
      }
      if (_0x529bd0 === "cookie" && _0x560bdc.cookie !== undefined && (typeof _0x560bdc.cookie !== "string" || !_0x560bdc.cookie.trim())) {
        _0x2b08df.push("--cookie cannot be empty when using cookie authentication");
      }
      return _0x2b08df;
    };
    var _0x1bed37 = (_0x10ccde, _0xb236a4) => {
      const _0xe715a2 = {
        domain: _0x169ce7(_0x10ccde.domain),
        protocol: _0x6712aa(_0x10ccde.protocol),
        apiPath: _0x2c97aa(_0x10ccde.apiPath, _0x10ccde.domain),
        authType: _0x10ccde.authType
      };
      if (_0x10ccde.token) {
        _0xe715a2.token = _0x10ccde.token.trim();
      }
      if (_0x10ccde.authType === "basic" && _0x10ccde.email) {
        _0xe715a2.email = _0x10ccde.email.trim();
      }
      if (_0x10ccde.authType === "cookie" && _0x10ccde.cookie) {
        _0xe715a2.cookie = _0x10ccde.cookie.trim();
      }
      const _0x5cbcc0 = _0x1e49ab(_0x10ccde.mtls);
      if (_0x5cbcc0) {
        _0xe715a2.mtls = _0x5cbcc0;
      }
      if (_0x10ccde.readOnly) {
        _0xe715a2.readOnly = true;
      }
      const _0x513d32 = {
        activeProfile: _0x529203,
        profiles: {}
      };
      const _0xd1bb87 = _0x39eea1() || _0x513d32;
      if (!_0xd1bb87.profiles || typeof _0xd1bb87.profiles !== "object") {
        _0xd1bb87.profiles = {};
      }
      const _0x1cacff = _0xb236a4 || _0xd1bb87.activeProfile || _0x529203;
      _0xd1bb87.profiles[_0x1cacff] = _0xe715a2;
      if (!_0xd1bb87.activeProfile || !_0xd1bb87.profiles[_0xd1bb87.activeProfile]) {
        _0xd1bb87.activeProfile = _0x1cacff;
      }
      _0x443254(_0xd1bb87);
      console.log(_0x410ce4.green("✅ Configuration saved successfully!"));
      if (_0xb236a4) {
        console.log("Profile: " + _0x410ce4.cyan(_0x1cacff));
      }
      console.log("Config file location: " + _0x410ce4.gray(_0x57ae66));
      console.log(_0x410ce4.yellow("\n💡 Tip: You can regenerate this config anytime by running \"confluence init\""));
    };
    var _0x4b11e0 = async _0x3c2a6d => {
      const _0x1e14c8 = [];
      if (!_0x3c2a6d.protocol) {
        const _0xd9cbae = {
          type: "list",
          name: "protocol",
          message: "Protocol:",
          choices: _0x363f0f,
          default: "https"
        };
        _0x1e14c8.push(_0xd9cbae);
      }
      if (!_0x3c2a6d.domain) {
        _0x1e14c8.push({
          type: "input",
          name: "domain",
          message: "Confluence domain (e.g., yourcompany.atlassian.net):",
          validate: _0xd81e6c("Domain")
        });
      }
      if (!_0x3c2a6d.apiPath) {
        _0x1e14c8.push({
          type: "input",
          name: "apiPath",
          message: "REST API path (Cloud: /wiki/rest/api, Server: /rest/api):",
          default: _0x579531 => _0x558320(_0x3c2a6d.domain || _0x579531.domain),
          validate: (_0x6a3a, _0x41ff0f) => {
            const _0x1d0905 = (_0x6a3a || "").trim();
            if (!_0x1d0905) {
              return true;
            }
            if (!_0x1d0905.startsWith("/")) {
              return "API path must start with \"/\"";
            }
            try {
              const _0x10ced7 = _0x3c2a6d.domain || _0x41ff0f.domain;
              _0x2c97aa(_0x1d0905, _0x10ced7);
              return true;
            } catch (_0x225a3d) {
              return _0x225a3d.message;
            }
          }
        });
      }
      const _0x184b63 = Boolean(_0x3c2a6d.email);
      if (!_0x3c2a6d.authType) {
        const _0x50b36f = {
          type: "list",
          name: "authType",
          message: "Authentication method:",
          choices: _0x25c9b8,
          default: _0x184b63 ? "basic" : "bearer"
        };
        _0x1e14c8.push(_0x50b36f);
      }
      if (!_0x3c2a6d.email) {
        _0x1e14c8.push({
          type: "input",
          name: "email",
          message: "Email / username:",
          when: _0x17d994 => {
            const _0x3b1021 = _0x3c2a6d.authType || _0x17d994.authType;
            return _0x3b1021 === "basic";
          },
          validate: _0xd81e6c("Email / username")
        });
      }
      if (!_0x3c2a6d.token) {
        _0x1e14c8.push({
          type: "password",
          name: "token",
          message: "API token / password (optional, can be left blank):",
          when: _0x48753f => {
            const _0x24a681 = _0x3c2a6d.authType || _0x48753f.authType;
            return _0x24a681 !== "mtls" && _0x24a681 !== "cookie" && _0x24a681 !== "none";
          }
        });
      }
      if (!_0x3c2a6d.cookie) {
        _0x1e14c8.push({
          type: "password",
          name: "cookie",
          message: "Cookie (format: \"name=value\" or \"name=value; name2=value2\"):",
          when: _0x4c4ba6 => {
            const _0x54a702 = _0x3c2a6d.authType || _0x4c4ba6.authType;
            return _0x54a702 === "cookie";
          },
          validate: _0xd81e6c("Cookie")
        });
      }
      const _0x22c59b = _0x1e49ab(_0x3c2a6d.mtls);
      const _0xcb3a11 = _0x5c7572 => {
        const _0x2bd794 = _0x3c2a6d.authType || _0x5c7572.authType;
        return _0x2bd794 === "mtls";
      };
      if (!_0x22c59b || !_0x22c59b.clientCert) {
        _0x1e14c8.push(_0x93f9be("tlsClientCert", "Path to client certificate file (PEM):", true, _0xcb3a11));
      }
      if (!_0x22c59b || !_0x22c59b.clientKey) {
        _0x1e14c8.push(_0x93f9be("tlsClientKey", "Path to client key file (PEM):", true, _0xcb3a11));
      }
      if (!_0x22c59b || !_0x22c59b.caCert) {
        _0x1e14c8.push(_0x93f9be("tlsCaCert", "Path to CA certificate file (PEM, optional):", false, _0xcb3a11));
      }
      if (_0x1e14c8.length === 0) {
        return _0x3c2a6d;
      }
      const _0x5e154d = await _0x2eb0f9.prompt(_0x1e14c8);
      const _0x2049be = {
        ..._0x3c2a6d,
        ..._0x5e154d
      };
      return _0x2049be;
    };
    var _0xbf8985 = (_0x31719e, _0x4b8a1b, _0x2cd820) => {
      if (_0x31719e !== "basic" && _0x31719e !== "bearer") {
        const _0x59f044 = {
          token: undefined,
          attempted: false
        };
        return _0x59f044;
      }
      const _0x7e0199 = _0x2d944c(_0x4b8a1b);
      if (!_0x7e0199) {
        const _0x1e7af1 = {
          token: undefined,
          attempted: false
        };
        return _0x1e7af1;
      }
      const _0x1103b6 = _0x31719e === "basic" ? _0x2cd820 : undefined;
      const _0x27b6db = {
        machine: _0x7e0199,
        login: _0x1103b6
      };
      const _0x2bc2b3 = _0x2a8c4a(_0x27b6db);
      const _0x165d10 = {
        token: _0x2bc2b3 ? _0x2bc2b3.password : undefined,
        attempted: true
      };
      return _0x165d10;
    };
    async function _0x427deb(_0x450509 = {}) {
      const _0x20407c = _0x450509.profile;
      if (_0x20407c && !_0x3a23a7(_0x20407c)) {
        console.error(_0x410ce4.red("❌ Invalid profile name. Use only letters, numbers, hyphens, and underscores."));
        process.exit(1);
      }
      const _0x58305d = _0x450509.readOnly || false;
      const _0x2f3364 = {
        protocol: _0x450509.protocol,
        domain: _0x450509.domain,
        apiPath: _0x450509.apiPath,
        authType: typeof _0x450509.authType === "string" && _0x450509.authType ? _0x450509.authType.trim().toLowerCase() : _0x450509.authType,
        email: _0x450509.email,
        token: _0x450509.token,
        cookie: _0x450509.cookie,
        mtls: _0x450509.mtls || {
          caCert: _0x450509.tlsCaCert,
          clientCert: _0x450509.tlsClientCert,
          clientKey: _0x450509.tlsClientKey
        }
      };
      const _0x5fc344 = Object.values(_0x2f3364).some(_0xdcf033 => _0xdcf033);
      if (!_0x5fc344) {
        console.log(_0x410ce4.blue("🚀 Confluence CLI Configuration"));
        if (_0x20407c) {
          console.log("Profile: " + _0x410ce4.cyan(_0x20407c));
        }
        console.log("Please provide your Confluence connection details:\n");
        const _0x3cae10 = {
          type: "list",
          name: "protocol",
          message: "Protocol:",
          choices: _0x363f0f,
          default: "https"
        };
        const _0x5b22ca = await _0x2eb0f9.prompt([_0x3cae10, {
          type: "input",
          name: "domain",
          message: "Confluence domain (e.g., yourcompany.atlassian.net):",
          validate: _0xd81e6c("Domain")
        }, {
          type: "input",
          name: "apiPath",
          message: "REST API path (Cloud: /wiki/rest/api, Server: /rest/api):",
          default: _0x1a20fc => _0x558320(_0x1a20fc.domain),
          validate: (_0x1e7a5e, _0x50fe38) => {
            const _0xc8cef5 = (_0x1e7a5e || "").trim();
            if (!_0xc8cef5) {
              return true;
            }
            if (!_0xc8cef5.startsWith("/")) {
              return "API path must start with \"/\"";
            }
            try {
              _0x2c97aa(_0xc8cef5, _0x50fe38.domain);
              return true;
            } catch (_0x1c85b5) {
              return _0x1c85b5.message;
            }
          }
        }, {
          type: "list",
          name: "authType",
          message: "Authentication method:",
          choices: _0x25c9b8,
          default: "basic"
        }, {
          type: "input",
          name: "email",
          message: "Email / username:",
          when: _0x497913 => _0x497913.authType === "basic",
          validate: _0xd81e6c("Email / username")
        }, {
          type: "password",
          name: "token",
          message: "API token / password (optional, can be left blank):",
          when: _0xb69709 => _0xb69709.authType !== "mtls" && _0xb69709.authType !== "cookie" && _0xb69709.authType !== "none"
        }, {
          type: "password",
          name: "cookie",
          message: "Cookie (format: \"name=value\" or \"name=value; name2=value2\"):",
          when: _0xbd5e73 => _0xbd5e73.authType === "cookie",
          validate: _0xd81e6c("Cookie")
        }, _0x93f9be("tlsClientCert", "Path to client certificate file (PEM):", true), _0x93f9be("tlsClientKey", "Path to client key file (PEM):", true), _0x93f9be("tlsCaCert", "Path to CA certificate file (PEM, optional):", false)]);
        const _0x281c70 = {
          ..._0x5b22ca
        };
        _0x281c70.readOnly = _0x58305d;
        const _0x134e6b = _0x281c70;
        if (_0x5b22ca.authType === "mtls") {
          const _0xdd15d4 = {
            clientCert: _0x5b22ca.tlsClientCert,
            clientKey: _0x5b22ca.tlsClientKey,
            caCert: _0x5b22ca.tlsCaCert || undefined
          };
          _0x134e6b.mtls = _0xdd15d4;
        }
        _0x1bed37(_0x134e6b, _0x20407c);
        return;
      }
      const _0x5366b8 = _0x4c50cd(_0x2f3364);
      if (_0x5366b8.length > 0) {
        console.error(_0x410ce4.red("❌ Configuration Error:"));
        _0x5366b8.forEach(_0x280924 => {
          console.error(_0x410ce4.red("  • " + _0x280924));
        });
        process.exit(1);
      }
      const _0x1b9284 = Boolean(_0x2f3364.domain && (_0x2f3364.authType === "mtls" || _0x2f3364.authType === "none" || _0x2f3364.authType === "cookie" && _0x2f3364.cookie || _0x2f3364.token && (_0x2f3364.authType || _0x2f3364.email)));
      if (_0x1b9284) {
        try {
          let _0x5bcac7 = _0x2f3364.authType;
          if (!_0x5bcac7) {
            _0x5bcac7 = _0x2f3364.email ? "basic" : "bearer";
          }
          const _0x2036b1 = _0x170a1c(_0x5bcac7, Boolean(_0x2f3364.email));
          const _0x2f7f52 = _0x2f3364.domain.trim();
          if (_0x2036b1 === "basic" && !_0x2f3364.email) {
            console.error(_0x410ce4.red("❌ Email is required for basic authentication"));
            process.exit(1);
          }
          if (_0x2036b1 !== "mtls" && _0x2036b1 !== "cookie" && _0x2036b1 !== "none" && !_0x2f3364.token) {
            console.error(_0x410ce4.red("❌ Token is required for basic or bearer authentication"));
            process.exit(1);
          }
          if (_0x2036b1 === "cookie" && !_0x2f3364.cookie) {
            console.error(_0x410ce4.red("❌ Cookie is required for cookie authentication"));
            process.exit(1);
          }
          if (_0x2f3364.apiPath) {
            _0x2c97aa(_0x2f3364.apiPath, _0x2f7f52);
          }
          const _0x4c8657 = {
            domain: _0x2f7f52,
            protocol: _0x6712aa(_0x2f3364.protocol),
            apiPath: _0x2f3364.apiPath || _0x558320(_0x2f7f52),
            token: _0x2f3364.token,
            authType: _0x2036b1,
            email: _0x2f3364.email,
            cookie: _0x2f3364.cookie,
            mtls: _0x2f3364.mtls,
            readOnly: _0x58305d
          };
          _0x1bed37(_0x4c8657, _0x20407c);
        } catch (_0x42e1fe) {
          console.error(_0x410ce4.red("❌ " + _0x42e1fe.message));
          process.exit(1);
        }
        return;
      }
      try {
        console.log(_0x410ce4.blue("🚀 Confluence CLI Configuration"));
        if (_0x20407c) {
          console.log("Profile: " + _0x410ce4.cyan(_0x20407c));
        }
        console.log("Completing configuration with interactive prompts:\n");
        const _0x1d18a3 = await _0x4b11e0(_0x2f3364);
        _0x1d18a3.authType = _0x170a1c(_0x1d18a3.authType, Boolean(_0x1d18a3.email));
        if (_0x1d18a3.authType === "mtls") {
          _0x1d18a3.mtls = _0x1e49ab({
            clientCert: _0x1d18a3.tlsClientCert || _0x1d18a3.mtls && _0x1d18a3.mtls.clientCert,
            clientKey: _0x1d18a3.tlsClientKey || _0x1d18a3.mtls && _0x1d18a3.mtls.clientKey,
            caCert: _0x1d18a3.tlsCaCert || _0x1d18a3.mtls && _0x1d18a3.mtls.caCert
          });
        }
        const _0x4d41ed = {
          ..._0x1d18a3
        };
        _0x4d41ed.readOnly = _0x58305d;
        _0x1bed37(_0x4d41ed, _0x20407c);
      } catch (_0x295cfd) {
        console.error(_0x410ce4.red("❌ " + _0x295cfd.message));
        process.exit(1);
      }
    }
    function _0x4ddc6f(_0x2515c3, {
      throwOnError = false
    } = {}) {
      const _0x5825f0 = process.env.CONFLUENCE_DOMAIN || process.env.CONFLUENCE_HOST;
      const _0x2f4577 = process.env.CONFLUENCE_API_TOKEN || process.env.CONFLUENCE_PASSWORD;
      const _0x186b4b = process.env.CONFLUENCE_EMAIL || process.env.CONFLUENCE_USERNAME;
      const _0xbf56a7 = process.env.CONFLUENCE_AUTH_TYPE ? process.env.CONFLUENCE_AUTH_TYPE.trim().toLowerCase() : undefined;
      const _0x241eca = process.env.CONFLUENCE_API_PATH;
      const _0x63dd9f = process.env.CONFLUENCE_PROTOCOL;
      const _0x3cdaca = process.env.CONFLUENCE_READ_ONLY;
      const _0x16d77 = process.env.CONFLUENCE_FORCE_CLOUD;
      const _0x3db1fc = _0xf8625d(process.env.CONFLUENCE_LINK_STYLE, "from CONFLUENCE_LINK_STYLE");
      const _0x3bfd35 = process.env.CONFLUENCE_COOKIE;
      const _0x4fa369 = {
        caCert: process.env.CONFLUENCE_TLS_CA_CERT,
        clientCert: process.env.CONFLUENCE_TLS_CLIENT_CERT,
        clientKey: process.env.CONFLUENCE_TLS_CLIENT_KEY
      };
      const _0x14166e = _0x1e49ab(_0x4fa369);
      const _0x1f270d = _0x2f4577 || _0xbf56a7 === "mtls" || _0x14166e || _0xbf56a7 === "cookie" || _0x3bfd35 || _0xbf56a7 === "none";
      if (_0x5825f0 && _0x1f270d) {
        const _0x281f6e = _0xbf56a7 || (_0x14166e && !_0x2f4577 ? "mtls" : undefined) || (_0x3bfd35 && !_0x2f4577 ? "cookie" : undefined);
        const _0x30920b = _0x170a1c(_0x281f6e, Boolean(_0x186b4b));
        let _0x194524;
        try {
          _0x194524 = _0x2c97aa(_0x241eca, _0x5825f0);
        } catch (_0x5e471d) {
          if (throwOnError) {
            throw _0x5e471d;
          }
          console.error(_0x410ce4.red("❌ " + _0x5e471d.message));
          process.exit(1);
        }
        const _0x41cd9f = {
          authType: _0x30920b,
          token: _0x2f4577,
          email: _0x186b4b,
          cookie: _0x3bfd35,
          mtls: _0x14166e,
          protocol: _0x63dd9f
        };
        const _0x4feb4f = _0x4e77bb(_0x41cd9f, "CONFLUENCE_AUTH_TYPE=mtls");
        if (_0x4feb4f.length > 0) {
          if (throwOnError) {
            throw new Error(_0x4feb4f.join(" "));
          }
          console.error(_0x410ce4.red("❌ " + _0x4feb4f.join(" ")));
          if (_0x30920b === "basic" && !_0x186b4b) {
            console.log(_0x410ce4.yellow("Set CONFLUENCE_EMAIL (or CONFLUENCE_USERNAME for on-premise) or switch to bearer auth by setting CONFLUENCE_AUTH_TYPE=bearer."));
          }
          if (_0x30920b === "mtls" && !_0x14166e) {
            console.log(_0x410ce4.yellow("Set CONFLUENCE_TLS_CLIENT_CERT and CONFLUENCE_TLS_CLIENT_KEY. Optionally set CONFLUENCE_TLS_CA_CERT."));
          }
          if (_0x30920b === "cookie" && !_0x3bfd35) {
            console.log(_0x410ce4.yellow("Set CONFLUENCE_COOKIE with your session cookie (e.g., \"JSESSIONID=...\")."));
          }
          process.exit(1);
        }
        return {
          domain: _0x169ce7(_0x5825f0),
          protocol: _0x6712aa(_0x63dd9f),
          apiPath: _0x194524,
          token: _0x2f4577 ? _0x2f4577.trim() : undefined,
          email: _0x186b4b ? _0x186b4b.trim() : undefined,
          cookie: _0x3bfd35 ? _0x3bfd35.trim() : undefined,
          authType: _0x30920b,
          mtls: _0x14166e,
          readOnly: _0x3cdaca === "true",
          forceCloud: _0x16d77 === "true",
          linkStyle: _0x3db1fc
        };
      }
      const _0x4b549e = _0x2515c3 || process.env.CONFLUENCE_PROFILE || null;
      const _0x1b7728 = {
        throwOnError: throwOnError
      };
      const _0x108d92 = _0x39eea1(_0x1b7728);
      if (!_0x108d92) {
        if (throwOnError) {
          throw new Error("No configuration found!");
        }
        console.error(_0x410ce4.red("❌ No configuration found!"));
        console.log(_0x410ce4.yellow("Please run \"confluence init\" to set up your configuration."));
        console.log(_0x410ce4.gray("Or set environment variables: CONFLUENCE_DOMAIN, CONFLUENCE_API_TOKEN (or CONFLUENCE_PASSWORD), CONFLUENCE_EMAIL (or CONFLUENCE_USERNAME), and optionally CONFLUENCE_API_PATH, CONFLUENCE_PROTOCOL."));
        process.exit(1);
      }
      const _0x4d30db = _0x4b549e || _0x108d92.activeProfile || _0x529203;
      const _0x4b90b = _0x108d92.profiles && _0x108d92.profiles[_0x4d30db];
      if (!_0x4b90b) {
        if (throwOnError) {
          throw new Error("Profile \"" + _0x4d30db + "\" not found!");
        }
        console.error(_0x410ce4.red("❌ Profile \"" + _0x4d30db + "\" not found!"));
        const _0x311e08 = _0x108d92.profiles ? Object.keys(_0x108d92.profiles) : [];
        if (_0x311e08.length > 0) {
          console.log(_0x410ce4.yellow("Available profiles: " + _0x311e08.join(", ")));
        }
        console.log(_0x410ce4.yellow("Run \"confluence init --profile <name>\" to create it, or \"confluence profile list\" to see available profiles."));
        process.exit(1);
      }
      try {
        const _0xd03112 = _0x169ce7(_0x4b90b.domain);
        let _0x3471e8 = _0x1ecc94(_0x4b90b.token);
        const _0xf62342 = _0x4b90b.email ? _0x4b90b.email.trim() : undefined;
        const _0x550240 = _0x1ecc94(_0x4b90b.cookie);
        const _0x1e8e77 = _0x170a1c(_0x4b90b.authType, Boolean(_0xf62342));
        const _0x3c094a = _0x1e49ab(_0x4b90b.mtls);
        let _0x843580;
        if (!_0xd03112) {
          if (throwOnError) {
            throw new Error("Configuration file is missing required values.");
          }
          console.error(_0x410ce4.red("❌ Configuration file is missing required values."));
          console.log(_0x410ce4.yellow("Run \"confluence init\" to refresh your settings."));
          process.exit(1);
        }
        let _0x584ca8 = false;
        if (!_0x3471e8) {
          const _0x485528 = _0xbf8985(_0x1e8e77, _0xd03112, _0xf62342);
          _0x3471e8 = _0x485528.token;
          _0x584ca8 = _0x485528.attempted;
        }
        const _0x49b0a5 = {
          authType: _0x1e8e77,
          token: _0x3471e8,
          email: _0xf62342,
          cookie: _0x550240,
          mtls: _0x3c094a,
          protocol: _0x4b90b.protocol
        };
        const _0x54636b = _0x4e77bb(_0x49b0a5, "mTLS authentication");
        if (_0x54636b.length > 0) {
          if (throwOnError) {
            throw new Error(_0x54636b.join(" "));
          }
          console.error(_0x410ce4.red("❌ " + _0x54636b.join(" ")));
          if (_0x584ca8 && !_0x3471e8) {
            console.log(_0x410ce4.yellow("No profile token found, and no matching " + _0x443327() + " entry for machine \"" + _0x2d944c(_0xd03112) + "\"."));
          }
          console.log(_0x410ce4.yellow("Please rerun \"confluence init\" to refresh your settings."));
          process.exit(1);
        }
        try {
          _0x843580 = _0x2c97aa(_0x4b90b.apiPath, _0xd03112);
        } catch (_0x21eb8a) {
          if (throwOnError) {
            throw _0x21eb8a;
          }
          console.error(_0x410ce4.red("❌ " + _0x21eb8a.message));
          console.log(_0x410ce4.yellow("Please rerun \"confluence init\" to update your API path."));
          process.exit(1);
        }
        const _0xdd1893 = _0x3cdaca !== undefined ? _0x3cdaca === "true" : Boolean(_0x4b90b.readOnly);
        const _0x59cb05 = _0x16d77 !== undefined ? _0x16d77 === "true" : Boolean(_0x4b90b.forceCloud);
        const _0x12d49e = _0x3db1fc ?? _0xf8625d(_0x4b90b.linkStyle, "in profile \"" + _0x4d30db + "\"");
        return {
          domain: _0xd03112,
          protocol: _0x6712aa(_0x4b90b.protocol),
          apiPath: _0x843580,
          token: _0x3471e8,
          email: _0xf62342,
          cookie: _0x550240,
          authType: _0x1e8e77,
          mtls: _0x3c094a,
          readOnly: _0xdd1893,
          forceCloud: _0x59cb05,
          linkStyle: _0x12d49e
        };
      } catch (_0x56412d) {
        if (throwOnError) {
          throw _0x56412d;
        }
        console.error(_0x410ce4.red("❌ Error reading configuration file:"), _0x56412d.message);
        console.log(_0x410ce4.yellow("Please run \"confluence init\" to recreate your configuration."));
        process.exit(1);
      }
    }
    function _0x399f81() {
      const _0x32d4c5 = _0x39eea1();
      if (!_0x32d4c5 || !_0x32d4c5.profiles || Object.keys(_0x32d4c5.profiles).length === 0) {
        return {
          activeProfile: null,
          profiles: []
        };
      }
      return {
        activeProfile: _0x32d4c5.activeProfile,
        profiles: Object.keys(_0x32d4c5.profiles).map(_0x188db1 => ({
          name: _0x188db1,
          active: _0x188db1 === _0x32d4c5.activeProfile,
          domain: _0x32d4c5.profiles[_0x188db1].domain,
          readOnly: Boolean(_0x32d4c5.profiles[_0x188db1].readOnly)
        }))
      };
    }
    function _0x55c560(_0x3f586f) {
      const _0x2811c3 = _0x39eea1();
      if (!_0x2811c3) {
        throw new Error("No configuration file found. Run \"confluence init\" first.");
      }
      if (!_0x2811c3.profiles || !_0x2811c3.profiles[_0x3f586f]) {
        const _0x510f93 = _0x2811c3.profiles ? Object.keys(_0x2811c3.profiles) : [];
        throw new Error("Profile \"" + _0x3f586f + "\" not found. Available: " + _0x510f93.join(", "));
      }
      _0x2811c3.activeProfile = _0x3f586f;
      _0x443254(_0x2811c3);
    }
    function _0x84e649(_0x50d067) {
      const _0x2c94e6 = _0x39eea1();
      if (!_0x2c94e6) {
        throw new Error("No configuration file found. Run \"confluence init\" first.");
      }
      if (!_0x2c94e6.profiles || !_0x2c94e6.profiles[_0x50d067]) {
        throw new Error("Profile \"" + _0x50d067 + "\" not found.");
      }
      if (Object.keys(_0x2c94e6.profiles).length === 1) {
        throw new Error("Cannot delete the only remaining profile.");
      }
      delete _0x2c94e6.profiles[_0x50d067];
      if (_0x2c94e6.activeProfile === _0x50d067) {
        _0x2c94e6.activeProfile = Object.keys(_0x2c94e6.profiles)[0];
      }
      _0x443254(_0x2c94e6);
    }
    function _0x480c63() {
      _0x2449bf = null;
    }
    const _0x2be93b = {
      initConfig: _0x427deb,
      getConfig: _0x4ddc6f,
      listProfiles: _0x399f81,
      setActiveProfile: _0x55c560,
      deleteProfile: _0x84e649,
      isValidProfileName: _0x3a23a7,
      getConfigDir: _0x4fc197,
      getConfigFile: _0xebc140,
      _resetConfigDirCache: _0x480c63,
      CONFIG_DIR: _0x1034d1,
      CONFIG_FILE: _0x57ae66,
      DEFAULT_PROFILE: _0x529203
    };
    _0x596677.exports = _0x2be93b;
  }
});
var path = require("path");
var fs = require("fs");
var {
  getConfigDir
} = require_config();
var Analytics = class {
  constructor() {
    this.enabled = process.env.CONFLUENCE_CLI_ANALYTICS !== "false";
    this.configDir = getConfigDir();
    this.statsFile = path.join(this.configDir, "stats.json");
  }
  track(_0x21e04c, _0x22c345 = true) {
    if (!this.enabled) {
      return;
    }
    try {
      let _0x25eca2 = {};
      if (fs.existsSync(this.statsFile)) {
        _0x25eca2 = JSON.parse(fs.readFileSync(this.statsFile, "utf8"));
      }
      if (!_0x25eca2.commands) {
        _0x25eca2.commands = {};
      }
      if (!_0x25eca2.firstUsed) {
        _0x25eca2.firstUsed = new Date().toISOString();
      }
      _0x25eca2.lastUsed = new Date().toISOString();
      const _0x19e596 = _0x21e04c + "_" + (_0x22c345 ? "success" : "error");
      _0x25eca2.commands[_0x19e596] = (_0x25eca2.commands[_0x19e596] || 0) + 1;
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, {
          recursive: true
        });
      }
      fs.writeFileSync(this.statsFile, JSON.stringify(_0x25eca2, null, 2));
    } catch (_0xbbe2ec) {}
  }
  getStats() {
    if (!fs.existsSync(this.statsFile)) {
      return null;
    }
    try {
      return JSON.parse(fs.readFileSync(this.statsFile, "utf8"));
    } catch (_0x569bc6) {
      return null;
    }
  }
  showStats() {
    const _0xe681f2 = this.getStats();
    if (!_0xe681f2) {
      console.log("No usage statistics available.");
      return;
    }
    console.log("📊 Usage Statistics:");
    console.log("First used: " + new Date(_0xe681f2.firstUsed).toLocaleDateString());
    console.log("Last used: " + new Date(_0xe681f2.lastUsed).toLocaleDateString());
    console.log("\nCommand usage:");
    Object.entries(_0xe681f2.commands).forEach(([_0x515a45, _0x41ba35]) => {
      console.log("  " + _0x515a45 + ": " + _0x41ba35 + " times");
    });
  }
};
module.exports = Analytics;