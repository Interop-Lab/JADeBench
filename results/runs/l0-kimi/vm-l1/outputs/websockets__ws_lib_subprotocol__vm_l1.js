'use strict';

const tokenChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

function parse(header) {
  'use strict';

  if (typeof header !== 'string') {
    throw new TypeError('header must be a string');
  }

  const end = header.length;
  let start = 0;
  let lookback = null;

  for (let i = 0; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (code === 0x20 || code === 0x09) {
      if (lookback === 0x20 || lookback === 0x09) {
        throw new SyntaxError(`Unexpected whitespace at position ${i}`);
      }
      lookback = code;
      continue;
    }

    if (code === 0x2c) {
      if (i === 0) {
        throw new SyntaxError(`Unexpected character at position ${i}`);
      }
      if (lookback === 0x2c) {
        throw new SyntaxError(`Unexpected character at position ${i}`);
      }
      lookback = code;
      start = i + 1;
      continue;
    }

    if (code < 0x21 || code > 0x7e) {
      throw new SyntaxError(`Unexpected character at position ${i}`);
    }

    if (!tokenChars[code]) {
      throw new SyntaxError(`Unexpected character at position ${i}`);
    }

    lookback = code;
  }

  if (lookback === 0x2c) {
    throw new SyntaxError(`Unexpected character at position ${end - 1}`);
  }

  const protocols = [];
  let protocol = '';
  let inProtocol = false;

  for (let i = start; i < end; i++) {
    const code = header.charCodeAt(i);

    if (code === 0x20 || code === 0x09) {
      if (inProtocol) {
        protocols.push(protocol);
        protocol = '';
        inProtocol = false;
      }
      continue;
    }

    if (code === 0x2c) {
      if (inProtocol) {
        protocols.push(protocol);
        protocol = '';
        inProtocol = false;
      }
      continue;
    }

    protocol += header[i];
    inProtocol = true;
  }

  if (inProtocol) {
    protocols.push(protocol);
  }

  return protocols;
}

module.exports = { parse, tokenChars };
