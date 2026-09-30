'use strict';

const tokenChars = new Uint8Array(128);

for (let code = 0x30; code <= 0x39; code++) tokenChars[code] = 1;
for (let code = 0x41; code <= 0x5a; code++) tokenChars[code] = 1;
for (let code = 0x61; code <= 0x7a; code++) tokenChars[code] = 1;

for (const character of "!#$%&'*+-.^_`|~") {
  tokenChars[character.charCodeAt(0)] = 1;
}

function push(destination, name, value) {
  if (destination[name] === undefined) {
    destination[name] = [value];
  } else {
    destination[name].push(value);
  }
}

function unexpectedCharacter(index) {
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
        if (start === -1) throw unexpectedCharacter(index);
        if (end === -1) end = index;

        extensionName = header.slice(start, end);
        start = -1;
        end = -1;

        if (code === 0x2c) {
          push(offers, extensionName, parameters);
          parameters = Object.create(null);
          extensionName = undefined;
        }
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

        push(parameters, header.slice(start, end), true);
        start = -1;
        end = -1;

        if (code === 0x2c) {
          push(offers, extensionName, parameters);
          parameters = Object.create(null);
          extensionName = undefined;
        }
      } else if (code === 0x3d && start !== -1) {
        if (end === -1) end = index;
        parameterName = header.slice(start, end);
        start = -1;
        end = -1;
      } else {
        throw unexpectedCharacter(index);
      }
    } else if (isEscaping) {
      if (tokenChars[code] !== 1) throw unexpectedCharacter(index);
      if (start === -1) start = index;
      else if (!mustUnescape) mustUnescape = true;
      isEscaping = false;
    } else if (code === 0x22 && header.charCodeAt(index - 1) !== 0x5c) {
      if (inQuotes) {
        inQuotes = false;
        end = index;
      } else if (start === -1) {
        inQuotes = true;
        start = index + 1;
      } else {
        throw unexpectedCharacter(index);
      }
    } else if (code === 0x5c && inQuotes) {
      isEscaping = true;
    } else if (code === 0x20 || code === 0x09) {
      if (end === -1 && start !== -1) end = index;
    } else if (tokenChars[code] === 1) {
      if (end !== -1) throw unexpectedCharacter(index);
      if (start === -1) start = index;
    } else if (code === 0x3b || code === 0x2c) {
      if (start === -1 || inQuotes) throw unexpectedCharacter(index);
      if (end === -1) end = index;

      let value = header.slice(start, end);
      if (mustUnescape) {
        value = value.replace(/\\/g, '');
        mustUnescape = false;
      }

      push(parameters, parameterName, value);
      parameterName = undefined;
      start = -1;
      end = -1;

      if (code === 0x2c) {
        push(offers, extensionName, parameters);
        parameters = Object.create(null);
        extensionName = undefined;
      }
    } else {
      throw unexpectedCharacter(index);
    }
  }

  if (start === -1 || inQuotes) throw unexpectedCharacter(index);
  if (end === -1) end = index;

  if (extensionName === undefined) {
    extensionName = header.slice(start, end);
  } else if (parameterName === undefined) {
    push(parameters, header.slice(start, end), true);
  } else {
    let value = header.slice(start, end);
    if (mustUnescape) value = value.replace(/\\/g, '');
    push(parameters, parameterName, value);
  }

  push(offers, extensionName, parameters);
  return offers;
}

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
                .map((value) =>
                  value === true ? parameterName : `${parameterName}=${value}`
                )
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
