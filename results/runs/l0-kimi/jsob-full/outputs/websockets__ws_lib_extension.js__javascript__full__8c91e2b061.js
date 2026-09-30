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
      kStatusCode: Symbol('status-code'),
      kWebSocket: Symbol('websocket'),
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
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    function isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 0x80) === 0) {
          i++;
        } else if ((buf[i] & 0xe0) === 0xc0) {
          if (i + 1 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i] & 0xfe) === 0xc0) return false;
          i += 2;
        } else if ((buf[i] & 0xf0) === 0xe0) {
          if (i + 2 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 ||
              (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) ||
              (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) ||
              (buf[i] === 0xef && buf[i + 1] === 0xbf && (buf[i + 2] & 0xfe) === 0xbe)) return false;
          i += 3;
        } else if ((buf[i] & 0xf8) === 0xf0) {
          if (i + 3 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 || (buf[i + 3] & 0xc0) !== 0x80 ||
              buf[i] > 0xf4 || (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) ||
              (buf[i] === 0xf4 && buf[i + 1] > 0x8f)) return false;
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }

    function isValidUTF8Text(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 0x80) === 0) {
          i++;
        } else if ((buf[i] & 0xe0) === 0xc0) {
          if (i + 1 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i] & 0xfe) === 0xc0) return false;
          i += 2;
        } else if ((buf[i] & 0xf0) === 0xe0) {
          if (i + 2 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 ||
              (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) ||
              (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0)) return false;
          i += 3;
        } else if ((buf[i] & 0xf8) === 0xf0) {
          if (i + 3 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 || (buf[i + 3] & 0xc0) !== 0x80 ||
              buf[i] > 0xf4 || (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) ||
              (buf[i] === 0xf4 && buf[i + 1] > 0x8f)) return false;
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }

    function isBlobLike(value) {
      return hasBlob && typeof value === 'object' &&
        typeof value.arrayBuffer === 'function' &&
        typeof value.type === 'string' &&
        typeof value.stream === 'function' &&
        (value[Symbol.toStringTag] === 'Blob' || value[Symbol.toStringTag] === 'File');
    }

    const validation = {
      isBlobLike,
      isValidUTF8,
      isValidUTF8Text,
      tokenChars
    };

    module.exports = validation;

    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8Native = require('utf-8-validate');
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? isValidUTF8(buf) : isValidUTF8Native(buf);
        };
      } catch (e) {}
    }
  }
});

function push(dest, name, value) {
  if (dest[name] === undefined) {
    dest[name] = [value];
  } else {
    dest[name].push(value);
  }
}

function parse(header) {
  const result = Object.create(null);
  let params = Object.create(null);
  let quote = false;
  let escape = false;
  let paramName = undefined;
  let paramValue = undefined;
  let start = -1;
  let end = -1;
  let i = 0;

  for (; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (paramName === undefined) {
      if (start === -1 && tokenChars[code] === 1) {
        if (end === -1) start = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1 && end === -1) {
          throw new SyntaxError(`Unexpected ${String.fromCharCode(code)} at position ${i}`);
        }
        if (start === -1) start = end;
        const token = header.slice(start, end);
        if (code === 0x2c) {
          push(result, token, params);
          params = Object.create(null);
        } else {
          paramName = token;
        }
        start = end = -1;
      } else if (code === 0x3d) {
        if (end === -1) {
          throw new SyntaxError(`Unexpected = at position ${i}`);
        }
        if (start === -1) start = end;
        paramName = header.slice(start, end);
        start = end = -1;
      } else if (code === 0x09 || code === 0x20) {
        if (end !== -1) end = i;
      } else {
        throw new SyntaxError(`Unexpected ${String.fromCharCode(code)} at position ${i}`);
      }
    } else {
      if (quote) {
        if (tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x22 || code === 0x5c) {
          if (start === -1 && end === -1) {
            if (code === 0x22) {
              paramValue = header.slice(start, end);
              start = end = -1;
              quote = false;
            } else {
              escape = true;
            }
          }
        } else {
          throw new SyntaxError(`Unexpected ${String.fromCharCode(code)} at position ${i}`);
        }
      } else {
        if (start === -1 && tokenChars[code] === 1) {
          if (end === -1) start = i;
        } else if (code === 0x3b || code === 0x2c) {
          if (start === -1 && end === -1) {
            throw new SyntaxError(`Unexpected ${String.fromCharCode(code)} at position ${i}`);
          }
          if (start === -1) start = end;
          const value = header.slice(start, end);
          push(params, paramName, value);
          if (code === 0x2c) {
            push(result, paramName, params);
            params = Object.create(null);
            paramName = undefined;
          }
          start = end = -1;
        } else if (code === 0x3d) {
          if (end === -1) {
            throw new SyntaxError(`Unexpected = at position ${i}`);
          }
          if (start === -1) start = end;
          paramValue = header.slice(start, end);
          start = end = -1;
        } else if (code === 0x09 || code === 0x20) {
          if (end !== -1) end = i;
        } else if (code === 0x22) {
          quote = true;
        } else {
          throw new SyntaxError(`Unexpected ${String.fromCharCode(code)} at position ${i}`);
        }
      }
    }
  }

  if (start === -1 || quote || escape || code === 0x3b || code === 0x2c) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = i;
  const finalValue = header.slice(start, end);

  if (paramName === undefined) {
    push(result, finalValue, params);
  } else {
    if (paramValue === undefined) {
      push(params, paramName, finalValue);
    } else {
      push(params, paramName, escape ? finalValue.replace(/\\/g, '') : finalValue);
    }
    push(result, paramName, params);
  }

  return result;
}

function format(obj) {
  return Object.keys(obj).map(key => {
    let values = obj[key];
    if (!Array.isArray(values)) values = [values];
    return values.map(value => {
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).map(k => {
          let v = value[k];
          if (!Array.isArray(v)) v = [v];
          return v.map(val => val === true ? k : `${k}=${val}`).join('; ');
        }).join('; ');
      }
      return value === true ? key : `${key}=${value}`;
    }).join(', ');
  }).join(', ');
}

const { tokenChars } = require_validation();

const _0x587f58 = {};
_0x587f58.format = format;
_0x587f58.parse = parse;
module.exports = _0x587f58;
