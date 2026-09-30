'use strict';

const tokenChars = new Uint8Array(128);

for (let code = 0x21; code <= 0x7e; code++) tokenChars[code] = 1;
for (const separator of '()<>@,;:\\"/[]?={} \t') {
  tokenChars[separator.charCodeAt(0)] = 0;
}

function appendValue(target, name, value) {
  if (target[name] === undefined) target[name] = [value];
  else target[name].push(value);
}

function parse(header) {
  const extensions = Object.create(null);
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
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${index}`);
        }

        if (end === -1) end = index;
        const name = header.slice(start, end);

        if (code === 0x3b) {
          extensionName = name;
        } else {
          appendValue(extensions, name, parameters);
          parameters = Object.create(null);
        }

        start = -1;
        end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }
    } else if (parameterName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = index;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = index;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${index}`);
        }

        if (end === -1) end = index;
        appendValue(parameters, header.slice(start, end), true);

        if (code === 0x2c) {
          appendValue(extensions, extensionName, parameters);
          parameters = Object.create(null);
          extensionName = undefined;
        }

        start = -1;
        end = -1;
      } else if (code === 0x3d && start !== -1 && end === -1) {
        parameterName = header.slice(start, index);
        start = -1;
        end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }
    } else if (isEscaping) {
      if (tokenChars[code] !== 1) {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }

      if (start === -1) start = index;
      else if (!mustUnescape) mustUnescape = true;
      isEscaping = false;
    } else if (code === 0x22) {
      if (start === -1) {
        if (header.charCodeAt(index - 1) !== 0x3d) {
          throw new SyntaxError(`Unexpected character at index ${index}`);
        }
        inQuotes = true;
      } else if (inQuotes) {
        inQuotes = false;
        end = index;
      } else {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }
    } else if (code === 0x5c) {
      if (inQuotes) isEscaping = true;
      else throw new SyntaxError(`Unexpected character at index ${index}`);
    } else if (code === 0x20 || code === 0x09) {
      if (inQuotes) {
        if (start === -1) start = index;
        else if (end !== -1) end = index;
      } else if (end === -1 && start !== -1) {
        end = index;
      }
    } else if (code === 0x3b || code === 0x2c) {
      if (inQuotes || start === -1) {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }

      if (end === -1) end = index;
      let value = header.slice(start, end);
      if (mustUnescape) value = value.replace(/\\/g, '');
      appendValue(parameters, parameterName, value);

      if (code === 0x2c) {
        appendValue(extensions, extensionName, parameters);
        parameters = Object.create(null);
        extensionName = undefined;
      }

      parameterName = undefined;
      start = -1;
      end = -1;
      mustUnescape = false;
    } else if (tokenChars[code] === 1) {
      if (end !== -1) {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }
      if (start === -1) start = index;
    } else {
      throw new SyntaxError(`Unexpected character at index ${index}`);
    }
  }

  if (start === -1 || inQuotes || isEscaping) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = index;
  const finalToken = header.slice(start, end);

  if (extensionName === undefined) {
    appendValue(extensions, finalToken, parameters);
  } else if (parameterName === undefined) {
    appendValue(parameters, finalToken, true);
    appendValue(extensions, extensionName, parameters);
  } else {
    const value = mustUnescape ? finalToken.replace(/\\/g, '') : finalToken;
    appendValue(parameters, parameterName, value);
    appendValue(extensions, extensionName, parameters);
  }

  return extensions;
}

function format(extensions) {
  return Object.keys(extensions)
    .map((extensionName) => {
      let configurations = extensions[extensionName];
      if (!Array.isArray(configurations)) configurations = [configurations];

      return configurations
        .map((parameters) => {
          const formattedParameters = Object.keys(parameters).map((name) => {
            let values = parameters[name];
            if (!Array.isArray(values)) values = [values];

            return values
              .map((value) => (value === true ? name : `${name}=${value}`))
              .join('; ');
          });

          return [extensionName].concat(formattedParameters).join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

module.exports = { format, parse };
