'use strict';

// RFC 6455 token characters. A protocol name may contain visible ASCII
// characters except separators.
const tokenChars = new Uint8Array(128);
for (let code = 0x21; code <= 0x7e; code++) tokenChars[code] = 1;

for (const separator of '()<>@,;:\\"/[]?={} \t') {
  tokenChars[separator.charCodeAt(0)] = 0;
}

/**
 * Parse a Sec-WebSocket-Protocol header into its distinct protocol names.
 *
 * @param {string} header The header value
 * @returns {Set<string>} The requested subprotocols
 */
function parse(header) {
  const protocols = new Set();
  let start = -1;
  let end = -1;
  let index = 0;

  for (; index < header.length; index++) {
    const code = header.charCodeAt(index);

    if (end === -1 && tokenChars[code] === 1) {
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
