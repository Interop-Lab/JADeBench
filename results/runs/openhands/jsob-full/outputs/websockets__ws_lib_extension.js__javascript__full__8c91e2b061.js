'use strict';

const constants = (() => {
  const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
  const hasBlob = typeof Blob !== 'undefined';

  if (hasBlob) BINARY_TYPES.push('blob');

  return {
    BINARY_TYPES,
    CLOSE_TIMEOUT: 30_000,
    EMPTY_BUFFER: Buffer.alloc(0),
    GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
    hasBlob,
    kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
    kListener: Symbol('kListener'),
    kStatusCode: Symbol('status-code'),
    kWebSocket: Symbol('websocket'),
    NOOP: () => {},
  };
})();

const validation = (() => {
  const { isUtf8 } = require('buffer');
  const { hasBlob } = constants;

  const tokenChars = Array.from({ length: 128 }, (_, code) => {
    const character = String.fromCharCode(code);
    return Number(
      (code >= 48 && code <= 57) ||
        (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122) ||
        "!#$%&'*+-.^_`|~".includes(character),
    );
  });

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

  function isValidStatusCode(code) {
    return (
      (code >= 1000 &&
        code <= 1014 &&
        code !== 1004 &&
        code !== 1005 &&
        code !== 1006) ||
      (code >= 3000 && code <= 4999)
    );
  }

  function isValidUTF8(buffer) {
    const length = buffer.length;
    let index = 0;

    while (index < length) {
      if ((buffer[index] & 0x80) === 0) {
        index += 1;
      } else if ((buffer[index] & 0xe0) === 0xc0) {
        if (
          index + 1 >= length ||
          (buffer[index + 1] & 0xc0) !== 0x80 ||
          (buffer[index] & 0xfe) === 0xc0
        ) {
          return false;
        }
        index += 2;
      } else if ((buffer[index] & 0xf0) === 0xe0) {
        if (
          index + 2 >= length ||
          (buffer[index + 1] & 0xc0) !== 0x80 ||
          (buffer[index + 2] & 0xc0) !== 0x80 ||
          (buffer[index] === 0xe0 && (buffer[index + 1] & 0xe0) === 0x80) ||
          (buffer[index] === 0xed && (buffer[index + 1] & 0xe0) === 0xa0)
        ) {
          return false;
        }
        index += 3;
      } else if ((buffer[index] & 0xf8) === 0xf0) {
        if (
          index + 3 >= length ||
          (buffer[index + 1] & 0xc0) !== 0x80 ||
          (buffer[index + 2] & 0xc0) !== 0x80 ||
          (buffer[index + 3] & 0xc0) !== 0x80 ||
          (buffer[index] === 0xf0 && (buffer[index + 1] & 0xf0) === 0x80) ||
          (buffer[index] === 0xf4 && buffer[index + 1] > 0x8f) ||
          buffer[index] > 0xf4
        ) {
          return false;
        }
        index += 4;
      } else {
        return false;
      }
    }

    return true;
  }

  const exports = {
    isBlob,
    isValidStatusCode,
    isValidUTF8,
    tokenChars,
  };

  if (isUtf8) {
    exports.isValidUTF8 = (buffer) =>
      buffer.length < 24 ? isValidUTF8(buffer) : isUtf8(buffer);
  } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
    try {
      const utf8Validate = require('utf-8-validate');
      exports.isValidUTF8 = (buffer) =>
        buffer.length < 32 ? isValidUTF8(buffer) : utf8Validate(buffer);
    } catch {}
  }

  return exports;
})();

const { tokenChars } = validation;

const CHAR_TAB = 0x09;
const CHAR_SPACE = 0x20;
const CHAR_QUOTE = 0x22;
const CHAR_COMMA = 0x2c;
const CHAR_SEMICOLON = 0x3b;
const CHAR_EQUALS = 0x3d;
const CHAR_BACKSLASH = 0x5c;

function addValue(target, name, value) {
  if (target[name] === undefined) target[name] = [value];
  else target[name].push(value);
}

function unexpectedCharacter(index) {
  return new SyntaxError(`Unexpected character at index ${index}`);
}

function parse(header) {
  const offers = Object.create(null);
  let extensionName;
  let parameterName;
  let parameters = Object.create(null);
  let mustUnescape = false;
  let escaped = false;
  let quoted = false;
  let start = -1;
  let code = -1;
  let end = -1;

  for (let index = 0; index < header.length; index += 1) {
    code = header.charCodeAt(index);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = index;
      } else if (index !== 0 && (code === CHAR_SPACE || code === CHAR_TAB)) {
        if (end === -1 && start !== -1) end = index;
      } else {
        if (code !== CHAR_SEMICOLON && code !== CHAR_COMMA) {
          throw unexpectedCharacter(index);
        }
        if (start === -1) {
          throw unexpectedCharacter(index);
        }
        if (end === -1) end = index;

        const name = header.slice(start, end);
        if (code === CHAR_COMMA) {
          addValue(offers, name, parameters);
          parameters = Object.create(null);
        } else {
          extensionName = name;
        }
        start = end = -1;
      }
    } else if (parameterName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = index;
      } else if (code === CHAR_SPACE || code === CHAR_TAB) {
        if (end === -1 && start !== -1) end = index;
      } else if (code === CHAR_SEMICOLON || code === CHAR_COMMA) {
        if (start === -1) {
          throw unexpectedCharacter(index);
        }
        if (end === -1) end = index;

        addValue(parameters, header.slice(start, end), true);
        if (code === CHAR_COMMA) {
          addValue(offers, extensionName, parameters);
          parameters = Object.create(null);
          extensionName = undefined;
        }
        start = end = -1;
      } else if (code === CHAR_EQUALS && start !== -1 && end === -1) {
        parameterName = header.slice(start, index);
        start = end = -1;
      } else {
        throw unexpectedCharacter(index);
      }
    } else if (escaped) {
      if (tokenChars[code] !== 1) {
        throw unexpectedCharacter(index);
      }
      if (start === -1) start = index;
      else if (!mustUnescape) mustUnescape = true;
      escaped = false;
    } else if (quoted) {
      if (tokenChars[code] === 1) {
        if (start === -1) start = index;
      } else if (code === CHAR_QUOTE && start !== -1) {
        quoted = false;
        end = index;
      } else if (code === CHAR_BACKSLASH) {
        escaped = true;
      } else {
        throw unexpectedCharacter(index);
      }
    } else if (code === CHAR_QUOTE && header.charCodeAt(index - 1) === CHAR_EQUALS) {
      quoted = true;
    } else if (end === -1 && tokenChars[code] === 1) {
      if (start === -1) start = index;
    } else if (start !== -1 && (code === CHAR_SPACE || code === CHAR_TAB)) {
      if (end === -1) end = index;
    } else {
      if (code !== CHAR_SEMICOLON && code !== CHAR_COMMA) {
        throw unexpectedCharacter(index);
      }
      if (start === -1) {
        throw unexpectedCharacter(index);
      }
      if (end === -1) end = index;

      let value = header.slice(start, end);
      if (mustUnescape) {
        value = value.replace(/\\/g, '');
        mustUnescape = false;
      }
      addValue(parameters, parameterName, value);

      if (code === CHAR_COMMA) {
        addValue(offers, extensionName, parameters);
        parameters = Object.create(null);
        extensionName = undefined;
      }
      parameterName = undefined;
      start = end = -1;
    }
  }

  if (
    start === -1 ||
    quoted ||
    code === CHAR_SPACE ||
    code === CHAR_TAB
  ) {
    throw new SyntaxError('Unexpected end of input');
  }
  if (end === -1) end = header.length;

  const token = header.slice(start, end);
  if (extensionName === undefined) {
    addValue(offers, token, parameters);
  } else {
    if (parameterName === undefined) {
      addValue(parameters, token, true);
    } else if (mustUnescape) {
      addValue(parameters, parameterName, token.replace(/\\/g, ''));
    } else {
      addValue(parameters, parameterName, token);
    }
    addValue(offers, extensionName, parameters);
  }

  return offers;
}

function formatParameter(parameters, parameterName) {
  let values = parameters[parameterName];
  if (!Array.isArray(values)) values = [values];

  return values
    .map((value) =>
      value === true ? parameterName : `${parameterName}=${value}`,
    )
    .join('; ');
}

function formatConfiguration(extensionName, parameters) {
  const formattedParameters = Object.keys(parameters).map((parameterName) =>
    formatParameter(parameters, parameterName),
  );
  return [extensionName].concat(formattedParameters).join('; ');
}

function format(extensions) {
  return Object.keys(extensions)
    .map((extensionName) => {
      let configurations = extensions[extensionName];
      if (!Array.isArray(configurations)) configurations = [configurations];

      return configurations
        .map((parameters) => formatConfiguration(extensionName, parameters))
        .join(', ');
    })
    .join(', ');
}

module.exports = { format, parse };
