'use strict';

function loadConstants() {
  const hasBlob = typeof Blob !== 'undefined';
  const binaryTypes = ['nodebuffer', 'arraybuffer', 'fragments'];

  if (hasBlob) binaryTypes.push('blob');

  return {
    BINARY_TYPES: binaryTypes,
    CLOSE_TIMEOUT: 30_000,
    EMPTY_BUFFER: Buffer.alloc(0),
    GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
    hasBlob,
    kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
    kListener: Symbol('kListener'),
    kStatusCode: Symbol('status-code'),
    kWebSocket: Symbol('websocket'),
    NOOP: () => {}
  };
}

function createTokenCharacterTable() {
  const tokenChars = Array(128).fill(0);
  const punctuation = "!#$%&'*+-.^_`|~";

  for (const character of punctuation) {
    tokenChars[character.charCodeAt(0)] = 1;
  }

  for (let code = 0x30; code <= 0x39; code++) tokenChars[code] = 1;
  for (let code = 0x41; code <= 0x5a; code++) tokenChars[code] = 1;
  for (let code = 0x61; code <= 0x7a; code++) tokenChars[code] = 1;

  return tokenChars;
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
      index++;
    } else if ((buffer[index] & 0xe0) === 0xc0) {
      if (
        index + 1 === length ||
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

function isBlob(value, hasBlob) {
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

function loadValidation() {
  const { isUtf8 } = require('buffer');
  const constants = loadConstants();
  const tokenChars = createTokenCharacterTable();
  const validation = {
    isBlob: (value) => isBlob(value, constants.hasBlob),
    isValidStatusCode,
    isValidUTF8,
    tokenChars
  };

  if (isUtf8) {
    validation.isValidUTF8 = (buffer) =>
      buffer.length < 24 ? isValidUTF8(buffer) : isUtf8(buffer);
  } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
    try {
      const isValidUTF8Native = require('utf-8-validate');

      validation.isValidUTF8 = (buffer) =>
        buffer.length < 32 ? isValidUTF8(buffer) : isValidUTF8Native(buffer);
    } catch {}
  }

  return validation;
}

const { tokenChars } = loadValidation();

function parse(header) {
  const protocols = new Set();
  let tokenStart = -1;
  let tokenEnd = -1;
  let index = 0;

  for (; index < header.length; index++) {
    const code = header.charCodeAt(index);

    if (tokenEnd === -1 && tokenChars[code] === 1) {
      if (tokenStart === -1) tokenStart = index;
    } else if (index !== 0 && (code === 0x20 || code === 0x09)) {
      if (tokenEnd === -1 && tokenStart !== -1) tokenEnd = index;
    } else if (code === 0x2c) {
      if (tokenStart === -1) {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }

      if (tokenEnd === -1) tokenEnd = index;

      const protocol = header.slice(tokenStart, tokenEnd);

      if (protocols.has(protocol)) {
        throw new SyntaxError(
          'The "' + protocol + '" subprotocol is duplicated'
        );
      }

      protocols.add(protocol);
      tokenStart = -1;
      tokenEnd = -1;
    } else {
      throw new SyntaxError(`Unexpected character at index ${index}`);
    }
  }

  if (tokenStart === -1 || tokenEnd !== -1) {
    throw new SyntaxError('Unexpected end of input');
  }

  const protocol = header.slice(tokenStart, index);

  if (protocols.has(protocol)) {
    throw new SyntaxError('The "' + protocol + '" subprotocol is duplicated');
  }

  protocols.add(protocol);
  return protocols;
}

module.exports = { parse };
