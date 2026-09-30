'use strict';

const { tokenChars } = require('./validation');

function push(destination, name, value) {
  if (destination[name] === undefined) {
    destination[name] = [value];
  } else {
    destination[name].push(value);
  }
}

function parse(header) {
  const offers = Object.create(null);
  let index = 0;

  function fail(position) {
    throw new SyntaxError(`Unexpected character at index ${position}`);
  }

  function skipWhitespace() {
    while (index < header.length) {
      const code = header.charCodeAt(index);
      if (code !== 0x20 && code !== 0x09) break;
      index++;
    }
  }

  function readToken() {
    const start = index;

    while (
      index < header.length &&
      tokenChars[header.charCodeAt(index)] === 1
    ) {
      index++;
    }

    return index === start ? undefined : header.slice(start, index);
  }

  function readQuotedValue() {
    index++;

    let value = '';
    let segmentStart = index;

    while (index < header.length) {
      const code = header.charCodeAt(index);

      if (code === 0x22) {
        value += header.slice(segmentStart, index);
        index++;
        return value;
      }

      if (code === 0x5c) {
        value += header.slice(segmentStart, index);
        index++;

        if (index >= header.length) {
          throw new SyntaxError('Unexpected end of input');
        }

        const escapedCode = header.charCodeAt(index);
        if (
          escapedCode !== 0x09 &&
          (escapedCode < 0x20 || escapedCode > 0x7e)
        ) {
          fail(index);
        }

        value += header[index++];
        segmentStart = index;
        continue;
      }

      if (code !== 0x09 && (code < 0x20 || code > 0x7e)) {
        fail(index);
      }

      index++;
    }

    throw new SyntaxError('Unexpected end of input');
  }

  skipWhitespace();

  while (index < header.length) {
    const extensionName = readToken();

    if (extensionName === undefined) {
      fail(index);
    }

    const params = Object.create(null);
    skipWhitespace();

    while (index < header.length && header.charCodeAt(index) === 0x3b) {
      index++;
      skipWhitespace();

      const parameterName = readToken();
      if (parameterName === undefined) {
        if (index >= header.length) {
          throw new SyntaxError('Unexpected end of input');
        }
        fail(index);
      }

      skipWhitespace();

      let value = true;

      if (index < header.length && header.charCodeAt(index) === 0x3d) {
        index++;
        skipWhitespace();

        if (index >= header.length) {
          throw new SyntaxError('Unexpected end of input');
        }

        if (header.charCodeAt(index) === 0x22) {
          value = readQuotedValue();
        } else {
          value = readToken();
          if (value === undefined) fail(index);
        }

        skipWhitespace();
      }

      push(params, parameterName, value);

      if (
        index < header.length &&
        header.charCodeAt(index) !== 0x3b &&
        header.charCodeAt(index) !== 0x2c
      ) {
        fail(index);
      }
    }

    push(offers, extensionName, params);

    if (index >= header.length) break;

    if (header.charCodeAt(index) !== 0x2c) {
      fail(index);
    }

    index++;
    skipWhitespace();

    if (index >= header.length) {
      throw new SyntaxError('Unexpected end of input');
    }
  }

  if (Object.keys(offers).length === 0) {
    throw new SyntaxError('Unexpected end of input');
  }

  return offers;
}

function format(extensions) {
  return Object.keys(extensions)
    .map((extension) => {
      let configurations = extensions[extension];

      if (!Array.isArray(configurations)) {
        configurations = [configurations];
      }

      return configurations
        .map((params) => {
          return [extension]
            .concat(
              Object.keys(params).map((name) => {
                let values = params[name];

                if (!Array.isArray(values)) {
                  values = [values];
                }

                return values
                  .map((value) => {
                    return value === true ? name : `${name}=${value}`;
                  })
                  .join('; ');
              })
            )
            .join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

module.exports = { format, parse };
