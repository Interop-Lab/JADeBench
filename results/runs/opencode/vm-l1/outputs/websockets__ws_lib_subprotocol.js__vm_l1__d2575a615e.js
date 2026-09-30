'use strict';

function isTokenCharacter(code) {
  if (
    (code >= 0x30 && code <= 0x39) ||
    (code >= 0x41 && code <= 0x5a) ||
    (code >= 0x61 && code <= 0x7a)
  ) {
    return true;
  }

  // RFC 7230 token punctuation.
  switch (code) {
    case 0x21: // !
    case 0x23: // #
    case 0x24: // $
    case 0x25: // %
    case 0x26: // &
    case 0x27: // '
    case 0x2a: // *
    case 0x2b: // +
    case 0x2d: // -
    case 0x2e: // .
    case 0x5e: // ^
    case 0x5f: // _
    case 0x60: // `
    case 0x7c: // |
    case 0x7e: // ~
      return true;
    default:
      return false;
  }
}

/**
 * Parse a Sec-WebSocket-Protocol header into its requested protocol names.
 *
 * Spaces and horizontal tabs may surround comma-separated names, but not
 * occur inside a name. Empty, malformed, and duplicate names are rejected.
 */
function parse(header) {
  const protocols = new Set();
  let start = -1;
  let end = -1;

  for (let index = 0; index < header.length; index++) {
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

  const protocol = header.slice(start);
  if (protocols.has(protocol)) {
    throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
  }

  protocols.add(protocol);
  return protocols;
}

module.exports = { parse };
