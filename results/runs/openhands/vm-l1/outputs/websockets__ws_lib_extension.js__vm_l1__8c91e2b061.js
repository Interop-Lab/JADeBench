'use strict';

const tokenChars = new Uint8Array(128);

for (const char of "!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz|~") {
  tokenChars[char.charCodeAt(0)] = 1;
}

function push(destination, name, value) {
  if (destination[name] === undefined) {
    destination[name] = [value];
  } else {
    destination[name].push(value);
  }
}

function syntaxError(index) {
  return new SyntaxError(`Unexpected character at index ${index}`);
}

function parse(header) {
  const offers = Object.create(null);
  let parameters = Object.create(null);
  let mustUnescape = false;
  let isEscaping = false;
  let inQuotes = false;
  let extensionName;
  let parameterName;
  let start = -1;
  let end = -1;
  let index = 0;

  for (; index < header.length; index++) {
    const code = header.charCodeAt(index);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = index;
      } else if (index !== 0 && (code === 0x20 || code === 0x09)) {
        if (end === -1 && start !== -1) end = index;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw syntaxError(index);
        if (end === -1) end = index;

        const name = header.slice(start, end);

        if (code === 0x3b) {
          extensionName = name;
          parameters = Object.create(null);
        } else {
          push(offers, name, parameters);
        }

        start = -1;
        end = -1;
      } else {
        throw syntaxError(index);
      }
    } else if (parameterName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = index;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = index;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw syntaxError(index);
        if (end === -1) end = index;

        push(parameters, header.slice(start, end), true);

        if (code === 0x2c) {
          push(offers, extensionName, parameters);
          extensionName = undefined;
        }

        start = -1;
        end = -1;
      } else if (code === 0x3d && start !== -1 && end === -1) {
        parameterName = header.slice(start, index);
        start = -1;
      } else {
        throw syntaxError(index);
      }
    } else if (isEscaping) {
      if (tokenChars[code] !== 1) throw syntaxError(index);

      if (start === -1) {
        start = index;
      } else if (!mustUnescape) {
        mustUnescape = true;
      }

      isEscaping = false;
    } else if (inQuotes) {
      if (tokenChars[code] === 1) {
        if (start === -1) start = index;
      } else if (code === 0x22 && start !== -1) {
        inQuotes = false;
        end = index;
      } else if (code === 0x5c) {
        isEscaping = true;
      } else {
        throw syntaxError(index);
      }
    } else if (code === 0x22 && header.charCodeAt(index - 1) === 0x3d) {
      inQuotes = true;
    } else if (end === -1 && tokenChars[code] === 1) {
      if (start === -1) start = index;
    } else if (code === 0x20 || code === 0x09) {
      if (end === -1 && start !== -1) end = index;
    } else if (code === 0x3b || code === 0x2c) {
      if (start === -1) throw syntaxError(index);
      if (end === -1) end = index;

      let value = header.slice(start, end);
      if (mustUnescape) {
        value = value.replace(/\\/g, '');
        mustUnescape = false;
      }

      push(parameters, parameterName, value);

      if (code === 0x2c) {
        push(offers, extensionName, parameters);
        extensionName = undefined;
      }

      parameterName = undefined;
      start = -1;
      end = -1;
    } else {
      throw syntaxError(index);
    }
  }

  if (start === -1 || inQuotes) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = index;

  const token = header.slice(start, end);

  if (extensionName === undefined) {
    push(offers, token, parameters);
  } else {
    if (parameterName === undefined) {
      push(parameters, token, true);
    } else if (mustUnescape) {
      push(parameters, parameterName, token.replace(/\\/g, ''));
    } else {
      push(parameters, parameterName, token);
    }

    push(offers, extensionName, parameters);
  }

  return offers;
}

function format(extensions) {
  return Object.keys(extensions)
    .map((extensionName) => {
      let configurations = extensions[extensionName];
      if (!Array.isArray(configurations)) configurations = [configurations];

      return configurations
        .map((parameters) => {
          return [extensionName]
            .concat(
              Object.keys(parameters).map((parameterName) => {
                let values = parameters[parameterName];
                if (!Array.isArray(values)) values = [values];

                return values
                  .map((value) => {
                    return value === true
                      ? parameterName
                      : `${parameterName}=${value}`;
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
