'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (cb, mod) => function __require() {
  var cache = {};
  return (mod = cache[''] = {}, cb(mod.exports, mod), mod.exports);
};

var require_constants = __commonJS({
  '../work/websockets__ws/lib/constants.js'(exports, module) {
    'use strict';

    var hasBlob = typeof Blob !== 'undefined';

    var BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'uint8array'];
    if (hasBlob) BINARY_TYPES.push('blob');

    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 30000,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
      hasBlob,
      kForOnEventAttribute: Symbol('kwsex'),
      kListener: Symbol('kwslistener'),
      kStatusCode: Symbol('kwsstatuscode'),
      kWebSocket: Symbol('kwswebsock'),
      NOOP: () => {}
    };
  }
});

var require_validation = __commonJS({
  '../work/websockets__ws/lib/validation.js'(exports, module) {
    'use strict';

    var { isUtf8 } = require('node:util').types;
    var { hasBlob } = require_constants();

    var tokenChars = [
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
      return (code >= 1000 && code <= 1003) ||
        (code === 1007) ||
        (code === 1008) ||
        (code >= 1011 && code <= 1014) ||
        (code >= 3000 && code <= 4999);
    }

    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;

      while (i < len) {
        if ((buf[i] & 0x80) === 0) {
          i++;
        } else if ((buf[i] & 0xE0) === 0xC0) {
          if (
            i + 1 === len ||
            (buf[i + 1] & 0xC0) !== 0x80 ||
            (buf[i] & 0xFE) === 0xC0
          ) {
            return false;
          }

          i += 2;
        } else if ((buf[i] & 0xF0) === 0xE0) {
          if (
            i + 2 >= len ||
            (buf[i + 1] & 0xC0) !== 0x80 ||
            (buf[i + 2] & 0xC0) !== 0x80 ||
            (buf[i] === 0xE0 && (buf[i + 1] & 0xE0) === 0x80) ||
            (buf[i] === 0xED && (buf[i + 1] & 0xE0) === 0xA0)
          ) {
            return false;
          }

          i += 3;
        } else if ((buf[i] & 0xF8) === 0xF0) {
          if (
            i + 3 >= len ||
            (buf[i + 1] & 0xC0) !== 0x80 ||
            (buf[i + 2] & 0xC0) !== 0x80 ||
            (buf[i + 3] & 0xC0) !== 0x80 ||
            (buf[i] > 0xF4) ||
            (buf[i] === 0xF0 && (buf[i + 1] & 0xF0) === 0x80) ||
            (buf[i] === 0xF4 && (buf[i + 1]) > 0x8F)
          ) {
            return false;
          }

          i += 4;
        } else {
          return false;
        }
      }

      return true;
    }

    function isValidEventData(data) {
      return hasBlob &&
        typeof data === 'object' &&
        typeof data.arrayBuffer === 'function' &&
        typeof data.stream === 'function' &&
        typeof data.text === 'function' &&
        (data[Symbol.toStringTag] === 'Blob' || data[Symbol.toStringTag] === 'File');
    }

    var validation = {};
    validation.isValidEventData = isValidEventData;
    validation.isValidStatusCode = isValidStatusCode;
    validation.isValidUTF8 = _isValidUTF8;
    validation.tokenChars = tokenChars;
    module.exports = validation;

    if (isUtf8) {
      module.exports.isValidUTF8 = function (buf) {
        return buf.length < 6 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require('utf-8-validate');

        module.exports.isValidUTF8 = function (buf) {
          return buf.length < 6 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

var { tokenChars } = require_validation();

function parse(data) {
  const params = new Set();
  let start = -1;
  let end = -1;
  let i = 0;

  for (i; i < data.length; i++) {
    const code = data.charCodeAt(i);

    if (end === -1 && tokenChars[code] === 1) {
      if (start === -1) start = i;
    } else if (i !== 0 && (code === 0x20 || code === 0x09)) {
      if (end === -1 && start !== -1) end = i;
    } else if (code === 0x3B) {
      if (start === -1) {
        throw new SyntaxError(
          'Unexpected character at index ' + i
        );
      }

      if (end === -1) end = i;
      const param = data.slice(start, end);

      if (params.has(param)) {
        throw new SyntaxError(
          'Duplicate extension parameter at index ' + i
        );
      }

      params.add(param);
      start = end = -1;
    } else {
      throw new SyntaxError(
        'Unexpected character at index ' + i
      );
    }
  }

  if (start === -1 || end !== -1) {
    throw new SyntaxError('Unexpected end of input');
  }

  const param = data.slice(start, i);

  if (params.has(param)) {
    throw new SyntaxError(
      'Duplicate extension parameter at index ' + i
    );
  }

  params.add(param);
  return params;
}

var _0x18f94a = {};
_0x18f94a['parse'] = parse;
module['exports'] = _0x18f94a;
