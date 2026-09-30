'use strict';

const TOKEN_CHARACTER = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]$/;

function append(target, name, value) {
  if (target[name] === undefined) {
    target[name] = [value];
  } else {
    target[name].push(value);
  }
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
    const character = header[index];
    const isToken = TOKEN_CHARACTER.test(character);

    if (extensionName === undefined) {
      if (end === -1 && isToken) {
        if (start === -1) start = index;
      } else if (index !== 0 && (character === ' ' || character === '\t')) {
        if (end === -1 && start !== -1) end = index;
      } else if (character === ';' || character === ',') {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${index}`);
        }
        if (end === -1) end = index;

        extensionName = header.slice(start, end);
        start = end = -1;

        if (character === ',') {
          append(extensions, extensionName, parameters);
          parameters = Object.create(null);
          extensionName = undefined;
        }
      } else {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }
    } else if (parameterName === undefined) {
      if (end === -1 && isToken) {
        if (start === -1) start = index;
      } else if (character === ' ' || character === '\t') {
        if (end === -1 && start !== -1) end = index;
      } else if (character === ';' || character === ',') {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${index}`);
        }
        if (end === -1) end = index;

        append(parameters, header.slice(start, end), true);
        if (character === ',') {
          append(extensions, extensionName, parameters);
          parameters = Object.create(null);
          extensionName = undefined;
        }
        start = end = -1;
      } else if (character === '=' && start !== -1 && end === -1) {
        parameterName = header.slice(start, index);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }
    } else if (isEscaping) {
      if (!isToken) {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }
      if (start === -1) start = index;
      else mustUnescape = true;
      isEscaping = false;
    } else if (inQuotes) {
      if (isToken) {
        if (start === -1) start = index;
      } else if (character === '"' && start !== -1) {
        inQuotes = false;
        end = index;
      } else if (character === '\\') {
        isEscaping = true;
      } else {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }
    } else if (character === '"' && header[index - 1] === '=') {
      inQuotes = true;
    } else if (end === -1 && isToken) {
      if (start === -1) start = index;
    } else if (start !== -1 && (character === ' ' || character === '\t')) {
      if (end === -1) end = index;
    } else if (character === ';' || character === ',') {
      if (start === -1) {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }
      if (end === -1) end = index;

      let value = header.slice(start, end);
      if (mustUnescape) {
        value = value.replace(/\\/g, '');
        mustUnescape = false;
      }
      append(parameters, parameterName, value);

      if (character === ',') {
        append(extensions, extensionName, parameters);
        parameters = Object.create(null);
        extensionName = undefined;
      }
      parameterName = undefined;
      start = end = -1;
    } else {
      throw new SyntaxError(`Unexpected character at index ${index}`);
    }
  }

  if (
    start === -1 ||
    inQuotes ||
    header[index - 1] === ' ' ||
    header[index - 1] === '\t'
  ) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = index;
  const token = header.slice(start, end);

  if (extensionName === undefined) {
    append(extensions, token, parameters);
  } else if (parameterName === undefined) {
    append(parameters, token, true);
    append(extensions, extensionName, parameters);
  } else {
    append(parameters, parameterName, mustUnescape ? token.replace(/\\/g, '') : token);
    append(extensions, extensionName, parameters);
  }

  return extensions;
}

function format(extensions) {
  return Object.keys(extensions)
    .map((extensionName) => {
      const configurations = Array.isArray(extensions[extensionName])
        ? extensions[extensionName]
        : [extensions[extensionName]];

      return configurations
        .map((parameters) => {
          const formattedParameters = Object.keys(parameters).map((name) => {
            const values = Array.isArray(parameters[name])
              ? parameters[name]
              : [parameters[name]];

            return values
              .map((value) => (value === true ? name : `${name}=${value}`))
              .join('; ');
          });

          return [extensionName, ...formattedParameters].join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

module.exports = { format, parse };
