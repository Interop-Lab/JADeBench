'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (callback, module) => function () {
  return module || __getOwnPropNames(callback)[0] && (module = { exports: {} }), callback(module.exports, module), module.exports;
};
var require_constants = __commonJS({ '../work/websockets__ws/lib/constants.js'(exports, module) {
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
} });
var require_validation = __commonJS({ '../work/websockets__ws/lib/validation.js'(exports, module) {
  'use strict';
  var { isUtf8 } = require('util');
  var { hasBlob } = require_constants;
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
    return (code >= 1000 && code <= 1015 && code !== 1004 && code !== 1005 && code !== 1006) || (code >= 3000 && code <= 4999);
  }
  function _isValidUTF8(buf) {
    const len = buf.length;
    let i = 0;
    while (i < len) {
      if ((buf[i] & 0x80) === 0) {
        i++;
      } else if ((buf[i] & 0xe0) === 0xc0) {
        if (i + 1 === len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i] & 0xfe) === 0xc0) {
          return false;
        }
        i += 2;
      } else if ((buf[i] & 0xf0) === 0xe0) {
        if (i + 2 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 || buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80 || buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) {
          return false;
        }
        i += 3;
      } else if ((buf[i] & 0xf8) === 0xf0) {
        if (i + 3 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 || (buf[i + 3] & 0xc0) !== 0x80 || buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80 || buf[i] === 0xf4 && (buf[i + 1] & 0xf0) !== 0x80 || buf[i] > 0xf4) {
          return false;
        }
        i += 4;
      } else {
        return false;
      }
    }
    return true;
  }
  function isValidUTF8(buf) {
    return hasBlob && typeof buf === 'object' && typeof buf.arrayBuffer === 'function' && typeof buf.type === 'string' && typeof buf.size === 'number' && (buf[Symbol.toStringTag] === 'Blob' || buf[Symbol.toStringTag] === 'File');
  }
  const validation = {};
  validation.isValidUTF8 = isValidUTF8;
  validation.isValidStatusCode = isValidStatusCode;
  validation.tokenChars = tokenChars;
  module.exports = validation;
  if (isUtf8) {
    module.exports.isValidUTF8 = function (buf) {
      return buf.length < 1500 ? _isValidUTF8(buf) : isUtf8(buf);
    };
  } else {
    if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require('utf-8-validate');
        module.exports.isValidUTF8 = function (buf) {
          return buf.length < 1500 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
} });

var { tokenChars } = require_validation();

function push(obj, key, value) {
  if (obj[key] === undefined) obj[key] = [value];
  else obj[key].push(value);
}

function parse(str) {
  const obj = Object.create(null);
  let allParams = Object.create(null);
  let needsEscape = false;
  let inQuotes = false;
  let inEscapedQuotes = false;
  let key;
  let paramName;
  let start = -1;
  let end = -1;
  let i = -1;

  for (; i < str.length; i++) {
    const code = str.charCodeAt(i);

    if (key === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (i !== 0 && (code === 32 || code === 9)) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 59 || code === 44) {
        if (start !== -1) {
          if (end === -1) end = i;
          const prop = str.slice(start, end);
          if (code === 59) {
            push(obj, prop, allParams);
            allParams = Object.create(null);
          } else {
            key = prop;
          }
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else if (paramName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 61 || code === 59 || code === 44) {
        if (start !== -1) {
          if (end === -1) end = i;
          push(allParams, str.slice(start, end), true);
          if (code === 59) {
            push(obj, key, allParams);
            allParams = Object.create(null);
            key = undefined;
          }
          start = end = -1;
        } else if (code === 61 && start === -1 && end === -1) {
          paramName = str.slice(start, i);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else {
        if (inQuotes) {
          if (tokenChars[code] !== 1) throw new SyntaxError(`Unexpected character at index ${i}`);
          if (start === -1) start = i;
          else needsEscape = true;
          inQuotes = false;
        } else if (inEscapedQuotes) {
          if (tokenChars[code] !== 1) {
            if (start === -1) start = i;
          } else {
            if (code === 59 && paramName !== undefined) {
              inEscapedQuotes = false;
              end = i;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          }
        } else if (code === 34 && str.charCodeAt(i + 1) === 34) {
          inEscapedQuotes = true;
        } else if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (start !== -1 && (code === 32 || code === 9)) {
          if (end === -1) end = i;
        } else if (code === 59 || code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          let value = str.slice(start, end);
          if (needsEscape) {
            value = value.replace(/\\/g, '');
            needsEscape = false;
          }
          push(allParams, paramName, value);
          if (code === 59) {
            push(obj, key, allParams);
            allParams = Object.create(null);
            key = undefined;
          }
          paramName = undefined;
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
    }
  }

  if (start === -1 || inQuotes || inEscapedQuotes || code === 32 || code === 9) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = i;
  const prop = str.slice(start, end);

  if (key === undefined) {
    push(obj, prop, allParams);
  } else if (paramName !== undefined) {
    push(allParams, paramName, true);
  } else if (needsEscape) {
    push(allParams, prop, prop.replace(/\\/g, ''));
  } else {
    push(allParams, prop, prop);
  }
  push(obj, key, allParams);

  return obj;
}

function format(obj) {
  return Object.keys(obj).map(key => {
    let params = obj[key];
    if (!Array.isArray(params)) params = [params];
    return params.map(param => {
      return [key].concat(Object.keys(param).map(paramName => {
        let values = param[paramName];
        if (!Array.isArray(values)) values = [values];
        return values.map(value => value === true ? paramName : paramName + '=' + value).join('; ');
      })).join('; ');
    }).join(', ');
  }).join(', ');
}

module.exports = { format, parse };
