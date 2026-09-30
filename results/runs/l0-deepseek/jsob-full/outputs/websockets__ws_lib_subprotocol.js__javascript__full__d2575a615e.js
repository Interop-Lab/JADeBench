'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (callback, module) => function () {
  var moduleObj = {};
  moduleObj.exports = {};
  (module || callback(__getOwnPropNames(callback)[0]))((module = moduleObj.exports), module);
  return module.exports;
};

var require_constants = __commonJS({
  '../work/websockets__ws/lib/constants.js'(exports, module) {
    'use strict';

    const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
    const hasBlob = typeof Blob !== 'undefined';

    if (hasBlob) BINARY_TYPES.push('blob');

    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 30000,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
      hasBlob,
      kForOnEventAttribute: Symbol('kForOnEventAttribute'),
      kListener: Symbol('kListener'),
      kStatusCode: Symbol('kStatusCode'),
      kWebSocket: Symbol('kWebSocket'),
      NOOP: () => {}
    };
  }
});

var require_validation = __commonJS({
  '../work/websockets__ws/lib/validation.js'(exports, module) {
    'use strict';

    const { isUtf8 } = require('buffer');
    const { hasBlob } = require_constants;

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
      return (
        (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) ||
        (code >= 3000 && code <= 4999)
      );
    }

    function isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;

      while (i < len) {
        if ((buf[i] & 0x80) === 0) {
          i++;
        } else if ((buf[i] & 0xe0) === 0xc0) {
          if (
            i + 1 === len ||
            (buf[i + 1] & 0xc0) !== 0x80 ||
            (buf[i] & 0xfe) === 0xc0
          ) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 0xf0) === 0xe0) {
          if (
            i + 2 >= len ||
            (buf[i + 1] & 0xc0) !== 0x80 ||
            (buf[i + 2] & 0xc0) !== 0x80 ||
            (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) ||
            (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0)
          ) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 0xf8) === 0xf0) {
          if (
            i + 3 >= len ||
            (buf[i + 1] & 0xc0) !== 0x80 ||
            (buf[i + 2] & 0xc0) !== 0x80 ||
            (buf[i + 3] & 0xc0) !== 0x80 ||
            (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) ||
            (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
            buf[i] > 0xf4
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

    function isBlob(value) {
      return (
        hasBlob &&
        typeof value === 'object' &&
        typeof value.arrayBuffer === 'function' &&
        typeof value.type === 'string' &&
        typeof value.stream === 'function' &&
        (value[Symbol.toStringTag] === 'Blob' ||
          value[Symbol.toStringTag] === 'File')
      );
    }

    const validation = {
      isBlob,
      isValidStatusCode,
      isValidUTF8,
      tokenChars
    };

    module.exports = validation;

    if (isUtf8) {
      module.exports.isValidUTF8 = function (buf) {
        return buf.length < 24 ? isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const utf8Validate = require('utf-8-validate');
        module.exports.isValidUTF8 = function (buf) {
          return buf.length < 32 ? isValidUTF8(buf) : utf8Validate(buf);
        };
      } catch (e) {}
    }
  }
});

const { tokenChars } = require_validation();

function parse(header) {
  const extensions = new Set();
  let start = -1;
  let end = -1;
  let i = 0;

  for (i; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (end === -1 && tokenChars[code] === 1) {
      if (start === -1) start = i;
    } else if (i !== 0 && (code === 0x20 || code === 0x09)) {
      if (end === -1 && start !== -1) end = i;
    } else if (code === 0x3b || code === 0x2c) {
      if (start === -1) {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }

      if (end === -1) end = i;
      const value = header.slice(start, end);

      if (extensions.has(value)) {
        throw new SyntaxError(`The "${value}" extension is specified more than once`);
      }

      extensions.add(value);
      start = end = -1;
    } else {
      throw new SyntaxError(`Unexpected character at index ${i}`);
    }
  }

  if (start === -1 || end !== -1) {
    throw new SyntaxError('Unexpected end of header');
  }

  const value = header.slice(start, i);

  if (extensions.has(value)) {
    throw new SyntaxError(`The "${value}" extension is specified more than once`);
  }

  extensions.add(value);
  return extensions;
}

const exports = {};
exports.parse = parse;
module.exports = exports;
