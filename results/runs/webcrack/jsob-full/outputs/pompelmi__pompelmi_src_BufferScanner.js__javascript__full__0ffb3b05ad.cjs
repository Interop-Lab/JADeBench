'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x4593d4, _0x2eb75f) => function _0x4dd1a2() {
  if (!_0x2eb75f) {
    (0, _0x4593d4[__getOwnPropNames(_0x4593d4)[0]])((_0x2eb75f = {
      exports: {}
    }).exports, _0x2eb75f);
  }
  return _0x2eb75f.exports;
};
var require_verdicts = __commonJS({
  "../work/pompelmi__pompelmi/src/verdicts.js"(_0x5e014a, _0x5e03a8) {
    'use strict';

    var _0x392884 = Object.freeze({
      Clean: Symbol("Clean"),
      Malicious: Symbol("Malicious"),
      ScanError: Symbol("ScanError")
    });
    var _0x191015 = {
      Verdict: _0x392884
    };
    _0x5e03a8.exports = _0x191015;
  }
});
var net = require("net");
var {
  Verdict
} = require_verdicts();
var isBun = typeof Bun !== "undefined";
var CLAMD_INSTREAM = Buffer.from("zINSTREAM\0");
var CHUNK_SIZE = 65536;
function parseClamdResponse(_0x53dd9b) {
  const _0x4fb69c = _0x53dd9b.toString("utf8").replace(/\0/g, "").trim();
  if (_0x4fb69c === "stream: OK") {
    return Verdict.Clean;
  }
  if (_0x4fb69c.endsWith(" FOUND")) {
    return Verdict.Malicious;
  }
  return Verdict.ScanError;
}
function scanBufferViaClamd(_0x55ba10, _0x126ec8 = {}) {
  const {
    retries = 0,
    retryDelay = 1000,
    host = "127.0.0.1",
    port = 3310,
    socket: _0x36b63a,
    timeout = 15000
  } = _0x126ec8;
  function _0x37e672() {
    return new Promise((_0x6c5e82, _0x4d8aa7) => {
      var _0x215ca8 = {
        host: host,
        port: port
      };
      const _0x4817c7 = _0x36b63a ? {
        path: _0x36b63a
      } : _0x215ca8;
      const _0x10940f = net.createConnection(_0x4817c7);
      const _0x2b28f4 = [];
      let _0x3e1e81 = false;
      function _0x3b2e3e(_0x3616cf, _0x48780d) {
        if (_0x3e1e81) {
          return;
        }
        _0x3e1e81 = true;
        _0x10940f.destroy();
        _0x3616cf(_0x48780d);
      }
      _0x10940f.setTimeout(timeout);
      _0x10940f.on("timeout", () => _0x3b2e3e(_0x4d8aa7, new Error("clamd connection timed out after " + timeout + "ms")));
      _0x10940f.on("error", _0x5c5a91 => _0x3b2e3e(_0x4d8aa7, _0x5c5a91));
      _0x10940f.on("data", _0x99a141 => _0x2b28f4.push(_0x99a141));
      _0x10940f.on("end", () => _0x3b2e3e(_0x6c5e82, parseClamdResponse(Buffer.concat(_0x2b28f4))));
      _0x10940f.on("connect", () => {
        _0x10940f.write(CLAMD_INSTREAM);
        let _0x239842 = 0;
        while (_0x239842 < _0x55ba10.length) {
          const _0xb000dc = _0x55ba10.slice(_0x239842, _0x239842 + CHUNK_SIZE);
          const _0x401205 = Buffer.allocUnsafe(4);
          _0x401205.writeUInt32BE(_0xb000dc.length, 0);
          _0x10940f.write(_0x401205);
          _0x10940f.write(_0xb000dc);
          _0x239842 += _0xb000dc.length;
        }
        _0x10940f.write(Buffer.alloc(4));
        _0x10940f.end();
      });
    });
  }
  function _0x31889a(_0x5f406c) {
    return _0x37e672().catch(async _0x4b2607 => {
      if (_0x5f406c <= 0) {
        throw _0x4b2607;
      }
      await new Promise(_0x503afe => setTimeout(_0x503afe, retryDelay));
      return _0x31889a(_0x5f406c - 1);
    });
  }
  return _0x31889a(retries);
}
var _0x388b5c = {
  scanBufferViaClamd: scanBufferViaClamd
};
module.exports = _0x388b5c;