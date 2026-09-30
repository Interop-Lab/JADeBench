'use strict';

function isTokenCharacter(code) {
  return (
    (code >= 0x30 && code <= 0x39) ||
    (code >= 0x41 && code <= 0x5a) ||
    (code >= 0x61 && code <= 0x7a) ||
    code === 0x21 ||
    code === 0x23 ||
    code === 0x24 ||
    code === 0x25 ||
    code === 0x26 ||
    code === 0x27 ||
    code === 0x2a ||
    code === 0x2b ||
    code === 0x2d ||
    code === 0x2e ||
    code === 0x5e ||
    code === 0x5f ||
    code === 0x60 ||
    code === 0x7c ||
    code === 0x7e
  );
}

function parse(header) {
  const protocols = new Set();
  let start = -1;
  let end = -1;
  let index = 0;

  for (; index < header.length; index++) {
    const code = header.charCodeAt(index);

    if (end === -1 && isTokenCharacter(code)) {
      if (start === -1) start = index;
    } else if (index !== 0 && (code === 0x20 || code === 0x09)) {
      if (end === -1 && start !== -1) end = index;
    } else if (code === 0x2c) {
      if (start === -1) {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }

      if (end === -1) end = index;

      const protocol = header.slice(start, end);

      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }

      protocols.add(protocol);
      start = -1;
      end = -1;
    } else {
      throw new SyntaxError(`Unexpected character at index ${index}`);
    }
  }

  if (start === -1 || end !== -1) {
    throw new SyntaxError('Unexpected end of input');
  }

  const protocol = header.slice(start, index);

  if (protocols.has(protocol)) {
    throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
  }

  protocols.add(protocol);
  return protocols;
}

module.exports = { parse };
