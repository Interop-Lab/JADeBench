'use strict';

var {
  scanBuffer,
  Verdict
} = require("pompelmi");
var NodeFile = globalThis.File ?? require("node:buffer").File;
var SCAN_KEYS = ["host", "port", "socket", "timeout", "retries", "retryDelay"];
function buildScanOptions(_0x3509e) {
  const _0x5f4ff4 = {};
  for (const _0x1cd373 of SCAN_KEYS) {
    if (_0x3509e[_0x1cd373] !== undefined) {
      _0x5f4ff4[_0x1cd373] = _0x3509e[_0x1cd373];
    }
  }
  return _0x5f4ff4;
}
async function toBuffer(_0xb62f6e) {
  if (Buffer.isBuffer(_0xb62f6e)) {
    return _0xb62f6e;
  }
  if (_0xb62f6e instanceof Uint8Array) {
    return Buffer.from(_0xb62f6e);
  }
  if (_0xb62f6e && typeof _0xb62f6e.arrayBuffer === "function") {
    return Buffer.from(await _0xb62f6e.arrayBuffer());
  }
  return null;
}
async function scanUpload(_0x13b0ea, _0x401067) {
  if (!_0x13b0ea) {
    return Verdict.Clean;
  }
  const _0x3f2aa5 = buildScanOptions(_0x401067 || {});
  const _0x171993 = await toBuffer(_0x13b0ea);
  if (!_0x171993 || _0x171993.length === 0) {
    return Verdict.Clean;
  }
  const _0x58bbd3 = await scanBuffer(_0x171993, _0x3f2aa5);
  if (_0x58bbd3 === Verdict.Malicious) {
    const _0x138fd7 = _0x13b0ea && typeof _0x13b0ea.name === "string" ? _0x13b0ea.name : "upload";
    const _0x10c692 = _0x401067 && _0x401067.onInfected;
    if (typeof _0x10c692 === "function") {
      const _0x58e360 = {
        filename: _0x138fd7
      };
      return _0x10c692(_0x58e360);
    }
    const _0x38a9b9 = {
      error: "Malware detected",
      filename: _0x138fd7
    };
    throw new Response(JSON.stringify(_0x38a9b9), {
      status: 422,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  return _0x58bbd3;
}
async function scanFormData(_0x2fdfb9, _0x168cc2) {
  if (!_0x2fdfb9 || typeof _0x2fdfb9.entries !== "function") {
    return;
  }
  for (const [, _0x4727d4] of _0x2fdfb9.entries()) {
    if (_0x4727d4 instanceof NodeFile || _0x4727d4 && typeof _0x4727d4.arrayBuffer === "function") {
      await scanUpload(_0x4727d4, _0x168cc2);
    }
  }
}
const _0x1d9537 = {
  scanUpload: scanUpload,
  scanFormData: scanFormData,
  Verdict: Verdict
};
module.exports = _0x1d9537;