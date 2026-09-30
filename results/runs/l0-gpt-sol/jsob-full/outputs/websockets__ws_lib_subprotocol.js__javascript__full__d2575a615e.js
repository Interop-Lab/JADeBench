'use strict';

const tokenChars = new Uint8Array(128);

for (let code = 0x30; code <= 0x39; code++) tokenChars[code] = 1;
for (let code = 0x41; code <= 0x5a; code++) tokenChars[code] = 1;
for (let code = 0x61; code <= 0x7a; code++) tokenChars[code] = 1;

for (const code of [
  0x21,
  0x23,
  0x24,
  0x25,
  0x26,
  0x27,
  0x2a,
  0x2b,
  0x2d,
  0x2e,
  0x5e,
  0x5f,
  0x60,
  0x7c,
  0x7e
]) {
  tokenChars[code] = 1;
}

function parse(header) {
  const protocols = new Set();
  let start = -1;
  let end = -1;
  let i = 0;

  for (; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (end === -1 && tokenChars[code] === 1) {
      if (start === -1) start = i;
    } else if (i !== 0 && (code === 0x20 || code === 0x09)) {
      if (end === -1 && start !== -1) end = i;
    } else if (code === 0x2c) {
      if (start === -1) {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }

      if (end === -1) end = i;

      const protocol = header.slice(start, end);

      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }

      protocols.add(protocol);
      start = -1;
      end = -1;
    } else {
      throw new SyntaxError(`Unexpected character at index ${i}`);
    }
  }

  if (start === -1 || end !== -1) {
    throw new SyntaxError('Unexpected end of input');
  }

  const protocol = header.slice(start, i);

  if (protocols.has(protocol)) {
    throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
  }

  protocols.add(protocol);
  return protocols;
}

module.exports = { parse };
