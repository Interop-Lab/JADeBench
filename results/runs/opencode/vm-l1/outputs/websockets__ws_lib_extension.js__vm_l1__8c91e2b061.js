'use strict';

// RFC 7230 `token` characters, indexed by ASCII character code.
const tokenChars = new Uint8Array(128);
for (const character of "!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz|~") {
  tokenChars[character.charCodeAt(0)] = 1;
}

function addValue(destination, name, value) {
  if (destination[name] === undefined) destination[name] = [value];
  else destination[name].push(value);
}

function unexpectedCharacter(index) {
  return new SyntaxError(`Unexpected character at index ${index}`);
}

/**
 * Parse a Sec-WebSocket-Extensions header into extension configurations.
 *
 * Each extension maps to an array because an extension may occur more than
 * once. Parameter values are arrays for the same reason; a bare parameter is
 * represented by `true`.
 */
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
  let code = -1;
  let index = 0;

  for (; index < header.length; index++) {
    code = header.charCodeAt(index);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = index;
      } else if (index !== 0 && (code === 0x20 || code === 0x09)) {
        if (end === -1 && start !== -1) end = index;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw unexpectedCharacter(index);
        if (end === -1) end = index;

        const name = header.slice(start, end);
        if (code === 0x2c) {
          addValue(extensions, name, parameters);
          parameters = Object.create(null);
        } else {
          extensionName = name;
        }
        start = end = -1;
      } else {
        throw unexpectedCharacter(index);
      }
    } else if (parameterName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = index;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = index;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw unexpectedCharacter(index);
        if (end === -1) end = index;

        addValue(parameters, header.slice(start, end), true);
        if (code === 0x2c) {
          addValue(extensions, extensionName, parameters);
          parameters = Object.create(null);
          extensionName = undefined;
        }
        start = end = -1;
      } else if (code === 0x3d && start !== -1 && end === -1) {
        parameterName = header.slice(start, index);
        start = end = -1;
      } else {
        throw unexpectedCharacter(index);
      }
    } else if (isEscaping) {
      if (tokenChars[code] !== 1) throw unexpectedCharacter(index);
      if (start === -1) start = index;
      else if (!mustUnescape) mustUnescape = true;
      isEscaping = false;
    } else if (code === 0x22) {
      if (start === -1) {
        if (inQuotes) throw unexpectedCharacter(index);
        inQuotes = true;
      } else if (inQuotes) {
        inQuotes = false;
        end = index;
      } else {
        throw unexpectedCharacter(index);
      }
    } else if (code === 0x5c) {
      if (!inQuotes) throw unexpectedCharacter(index);
      isEscaping = true;
    } else if (code === 0x20 || code === 0x09) {
      if (inQuotes) {
        if (start === -1) start = index;
      } else if (end === -1 && start !== -1) {
        end = index;
      }
    } else if (code === 0x3b || code === 0x2c) {
      if (inQuotes) {
        if (start === -1) start = index;
        continue;
      }
      if (start === -1) throw unexpectedCharacter(index);
      if (end === -1) end = index;

      let value = header.slice(start, end);
      if (mustUnescape) value = value.replace(/\\/g, '');
      addValue(parameters, parameterName, value);

      if (code === 0x2c) {
        addValue(extensions, extensionName, parameters);
        parameters = Object.create(null);
        extensionName = undefined;
      }

      parameterName = undefined;
      start = end = -1;
      mustUnescape = false;
    } else if (tokenChars[code] === 1) {
      if (end !== -1) throw unexpectedCharacter(index);
      if (start === -1) start = index;
    } else {
      throw unexpectedCharacter(index);
    }
  }

  if (start === -1 || inQuotes || isEscaping) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = index;
  const token = header.slice(start, end);

  if (extensionName === undefined) {
    addValue(extensions, token, parameters);
  } else {
    if (parameterName === undefined) {
      addValue(parameters, token, true);
    } else {
      const value = mustUnescape ? token.replace(/\\/g, '') : token;
      addValue(parameters, parameterName, value);
    }
    addValue(extensions, extensionName, parameters);
  }

  return extensions;
}

/** Serialize parsed extension configurations for an HTTP header. */
function format(extensions) {
  return Object.keys(extensions)
    .map((extensionName) => {
      let configurations = extensions[extensionName];
      if (!Array.isArray(configurations)) configurations = [configurations];

      return configurations
        .map((parameters) => {
          const parts = [extensionName];

          for (const parameterName of Object.keys(parameters)) {
            let values = parameters[parameterName];
            if (!Array.isArray(values)) values = [values];

            parts.push(
              values
                .map((value) => (value === true ? parameterName : `${parameterName}=${value}`))
                .join('; ')
            );
          }

          return parts.join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

module.exports = { format, parse };
