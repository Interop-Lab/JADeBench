'use strict';

const __getOwnPropNames = Object.getOwnPropertyNames;

const __commonJS = (cb, mod) => function __require() {
  const ns = {};
  if (mod) {
    return mod;
  }
  const exports = (mod = { exports: {} }).exports;
  cb(exports, mod);
  return mod.exports;
};

const require_constants = __commonJS({
  '../work/websockets__ws/lib/constants.js'(exports, module) {
    'use strict';
    
    const hasBlob = typeof Blob !== 'undefined';
    const binaryTypes = ['nodebuffer', 'arraybuffer', 'fragments'];
    
    if (hasBlob) {
      binaryTypes.push('blob');
    }
    
    module.exports = {
      BINARY_TYPES: binaryTypes,
      CLOSE_TIMEOUT: 30000,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
      hasBlob: hasBlob,
      kForOnEventAttribute: Symbol('kForOnEventAttribute'),
      kListener: Symbol('kListener'),
      kStatusCode: Symbol('status'),
      kWebSocket: Symbol('websocket'),
      NOOP: () => {}
    };
  }
});

const require_validation = __commonJS({
  '../work/websockets__ws/lib/validation.js'(exports, module) {
    'use strict';
    
    const { isUtf8 } = require('buffer');
    const { hasBlob } = require_constants();
    
    const tokenChars = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 0, 1, 0, 1, 0
    ];
    
    function isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      
      while (i < len) {
        if ((buf[i] & 0x80) === 0) {
          i++;
        } else if ((buf[i] & 0xe0) === 0xc0) {
          if (i + 1 >= len || (buf[i + 1] & 0xc0) !== 0x80) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 0xf0) === 0xe0) {
          if (i + 2 >= len ||
              (buf[i + 1] & 0xc0) !== 0x80 ||
              (buf[i + 2] & 0xc0) !== 0x80 ||
              buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80 ||
              buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 0xf8) === 0xf0) {
          if (i + 3 >= len ||
              (buf[i + 1] & 0xc0) !== 0x80 ||
              (buf[i + 2] & 0xc0) !== 0x80 ||
              (buf[i + 3] & 0xc0) !== 0x80 ||
              buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80 ||
              buf[i] === 0xf4 && buf[i + 1] > 0x8f ||
              buf[i] > 0xf4) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      
      return true;
    }
    
    function isValidUTF8Text(buf) {
      return hasBlob &&
        typeof buf === 'object' &&
        typeof buf.arrayBuffer === 'function' &&
        typeof buf.slice === 'function' &&
        typeof buf.text === 'function' &&
        (buf[Symbol.toStringTag] === 'Blob' || buf[Symbol.toStringTag] === 'File');
    }
    
    const validation = {
      isValidUTF8: isValidUTF8Text,
      isValidUTF8Buffer: isValidUTF8,
      tokenChars: tokenChars
    };
    
    module.exports = validation;
    
    if (isUtf8) {
      module.exports.isValidUTF8Buffer = function(buf) {
        return buf.length < 24 ? isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8Native = require('utf-8-validate');
        module.exports.isValidUTF8Buffer = function(buf) {
          return buf.length < 32 ? isValidUTF8(buf) : isValidUTF8Native(buf);
        };
      } catch (e) {}
    }
  }
});

const { tokenChars } = require_validation();

function parse(header) {
  const seen = new Set();
  let start = -1;
  let end = -1;
  
  for (let i = 0; i < header.length; i++) {
    const code = header.charCodeAt(i);
    
    if (start === -1 && tokenChars[code] === 1) {
      if (i === 0 || header[i - 1] !== ' ') {
        start = i;
      }
    } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
      if (end === -1) {
        end = i;
      }
    } else if (code === 0x2c) {
      if (start === -1) {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
      if (end === -1) {
        end = i;
      }
      const token = header.slice(start, end);
      if (seen.has(token)) {
        throw new SyntaxError(`Duplicate "${token}" in field value`);
      }
      seen.add(token);
      start = end = -1;
    } else if (code !== 0x09 && code !== 0x20) {
      throw new SyntaxError(`Unexpected character at index ${i}`);
    }
  }
  
  if (start !== -1 || end !== -1) {
    if (start === -1) {
      throw new SyntaxError(`Unexpected character at index ${header.length}`);
    }
    const token = header.slice(start);
    if (seen.has(token)) {
      throw new SyntaxError(`Duplicate "${token}" in field value`);
    }
    seen.add(token);
  }
  
  return seen;
}

module.exports = { parse };
