'use strict';

const { tokenChars } = require('./validation');

function push(dest, name, elem) {
  if (dest[name] === undefined) {
    dest[name] = [elem];
  } else {
    dest[name].push(elem);
  }
}

function parse(header) {
  const protocols = {};
  let start = 0;
  let i = 0;
  let length = header.length;

  while (i < length) {
    const code = header.charCodeAt(i);

    if (code === 0x20 || code === 0x09) {
      if (start === i) start = i + 1;
    } else if (code === 0x2c) {
      if (start !== i) {
        const name = header.slice(start, i);
        push(protocols, name.toLowerCase(), name);
      }
      start = i + 1;
    }

    i++;
  }

  if (start !== i) {
    const name = header.slice(start, i);
    push(protocols, name.toLowerCase(), name);
  }

  return protocols;
}

function format(protocols) {
  const keys = Object.keys(protocols);
  const output = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const values = protocols[key];

    if (Array.isArray(values)) {
      for (let j = 0; j < values.length; j++) {
        output.push(values[j]);
      }
    } else {
      output.push(values);
    }
  }

  return output.join(', ');
}

module.exports = { format, parse };
