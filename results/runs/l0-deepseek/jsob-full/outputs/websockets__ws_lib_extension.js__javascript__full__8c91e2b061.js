'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
    const { hasBlob } = require_constants();

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
        (value[Symbol.toStringTag] === 'Blob' || value[Symbol.toStringTag] === 'File')
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

var { tokenChars } = require_validation();

function push(dest, name, value) {
  if (dest[name] === undefined) dest[name] = [value];
  else dest[name].push(value);
}

function parse(header) {
  const result = Object.create(null);
  let obj = Object.create(null);
  let esc = false;
  let quoted = false;
  let comment = false;
  let name;
  let value;
  let start = -1;
  let end = -1;
  let code = -1;
  let i = 0;

  for (; i < header.length; i++) {
    code = header.charCodeAt(i);

    if (name === undefined) {
      if (code === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (i !== 0 && (code === 0x20 || code === 0x09)) {
        if (end === -1 && start === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (end === -1) end = i;
        const key = header.slice(start, end);
        if (code === 0x2c) {
          push(result, key, obj);
          obj = Object.create(null);
        } else {
          name = key;
        }
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else if (value === undefined) {
      if (code === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (end === -1) end = i;
        push(obj, name, header.slice(start, end));
        if (code === 0x2c) {
          push(result, name, obj);
          obj = Object.create(null);
          name = undefined;
        }
        start = end = -1;
      } else if (code === 0x22) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (end === -1) end = i;
        push(obj, name, header.slice(start, end));
        if (code === 0x2c) {
          push(result, name, obj);
          obj = Object.create(null);
          name = undefined;
        }
        start = end = -1;
      } else if (code === 0x3d && start === -1 && end === -1) {
        value = header.slice(start, i);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else {
      if (quoted) {
        if (tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x22 && start === -1) {
          quoted = false;
          end = i;
        } else if (code === 0x5c) {
          esc = true;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (comment) {
        if (tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x29 && start === -1) {
          comment = false;
          end = i;
        } else if (code === 0x28) {
          quoted = true;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else {
        if (code === 0x22 && header.charCodeAt(i + 1) === 0x22) {
          quoted = true;
        } else if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (start === -1 && (code === 0x20 || code === 0x09)) {
          if (end === -1) end = i;
        } else if (code === 0x3b || code === 0x2c) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          let val = header.slice(start, end);
          if (esc) {
            val = val.replace(/\\/g, '');
            esc = false;
          }
          push(obj, name, val);
          if (code === 0x2c) {
            push(result, name, obj);
            obj = Object.create(null);
            name = undefined;
          }
          value = undefined;
          start = end = -1;
        } else if (code === 0x3d || code === 0x22) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          let val = header.slice(start, end);
          if (esc) {
            val = val.replace(/\\/g, '');
            esc = false;
          }
          push(obj, name, val);
          if (code === 0x22) {
            push(result, name, obj);
            obj = Object.create(null);
            name = undefined;
          }
          value = undefined;
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
    }
  }

  if (start === -1 || comment || code === 0x2c || code === 0x3b) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = i;
  const token = header.slice(start, end);

  if (name === undefined) {
    push(result, token, obj);
  } else if (value === undefined) {
    push(obj, token, true);
  } else if (esc) {
    push(obj, name, token.replace(/\\/g, ''));
  } else {
    push(obj, name, token);
  }

  push(result, name, obj);

  return result;
}

function format(obj) {
  return Object.keys(obj).map((name) => {
    let values = obj[name];
    if (!Array.isArray(values)) values = [values];
    return values.map((value) => {
      return Object.keys(value).map((key) => {
        let val = value[key];
        if (!Array.isArray(val)) val = [val];
        return val.map((v) => (v === true ? key : `${key}=${v}`)).join('; ');
      }).join('; ');
    }).join(', ');
  }).join(', ');
}

const _587f58 = {};
_587f58.format = format;
_587f58.parse = parse;
module.exports = _587f58;
