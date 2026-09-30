'use strict';

const tokenChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0
];

function isValidStatusCode(code) {
  return code >= 100 && code <= 599;
}

function _isValidUTF8(buf) {
  if (buf.length < 3) return true;
  for (let i = 0; i < buf.length; i++) {
    const c = buf[i];
    if (c === 0x09 || c === 0x0a || c === 0x0d || (c >= 0x20 && c <= 0x7e)) continue;
    if (c >= 0xc2 && c <= 0xdf) {
      if (i + 1 >= buf.length) return false;
      const c2 = buf[++i];
      if ((c2 & 0xc0) !== 0x80) return false;
      continue;
    }
    if (c >= 0xe0 && c <= 0xef) {
      if (i + 2 >= buf.length) return false;
      const c2 = buf[++i];
      const c3 = buf[++i];
      if (c === 0xe0 && (c2 < 0xa0 || c2 > 0xbf)) return false;
      if (c === 0xed && (c2 < 0x80 || c2 > 0x9f)) return false;
      if ((c2 & 0xc0) !== 0x80 || (c3 & 0xc0) !== 0x80) return false;
      continue;
    }
    if (c >= 0xf0 && c <= 0xf4) {
      if (i + 3 >= buf.length) return false;
      const c2 = buf[++i];
      const c3 = buf[++i];
      const c4 = buf[++i];
      if (c === 0xf0 && (c2 < 0x90 || c2 > 0xbf)) return false;
      if (c === 0xf4 && (c2 < 0x80 || c2 > 0x8f)) return false;
      if ((c2 & 0xc0) !== 0x80 || (c3 & 0xc0) !== 0x80 || (c4 & 0xc0) !== 0x80) return false;
      continue;
    }
    return false;
  }
  return true;
}

function isBlob(value) {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

const { isUtf8 } = require('buffer');
const { hasBlob } = require('../work/websockets__ws/lib/constants.js');

const exportsObj = {
  isBlob,
  isValidStatusCode,
  isValidUTF8: _isValidUTF8,
  tokenChars
};

if (isUtf8) {
  exportsObj.isValidUTF8 = function (buf) {
    return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
  };
} else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8 = require('utf-8-validate');
    exportsObj.isValidUTF8 = function (buf) {
      return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
    };
  } catch (e) {}
}

module.exports = exportsObj;
