'use strict';

const tokenCharacters = new Set(
  "!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz|~"
);

function parse(header) {
  const protocols = new Set();
  let start = -1;
  let end = -1;
  let index = 0;

  for (; index < header.length; index++) {
    const character = header[index];

    if (end === -1 && tokenCharacters.has(character)) {
      if (start === -1) start = index;
    } else if (character === ' ' || character === '\t') {
      if (end === -1 && start !== -1) end = index;
    } else if (character === ',') {
      if (start === -1) {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }

      if (end === -1) end = index;

      const protocol = header.slice(start, end);

      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }

      protocols.add(protocol);
      start = end = -1;
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
