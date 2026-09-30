'use strict';

const TOKEN_CHARS = new Uint8Array(128);
for (let code = 0x21; code < 0x7f; code++) TOKEN_CHARS[code] = 1;
for (const char of '()<>@,;:\\"/[]?={} \t') TOKEN_CHARS[char.charCodeAt(0)] = 0;

function push(target, key, value) {
  if (target[key] === undefined) target[key] = [value];
  else target[key].push(value);
}

function syntaxError(kind, index) {
  return new SyntaxError(`Unexpected ${kind} at index ${index}`);
}

function parse(header) {
  const offers = Object.create(null);
  let parameters = Object.create(null);
  let extensionName;
  let parameterName;
  let start = -1;
  let end = -1;
  let inQuotes = false;
  let escaping = false;
  let mustUnescape = false;

  for (let index = 0; index < header.length; index++) {
    const code = header.charCodeAt(index);

    if (extensionName === undefined) {
      if (end === -1 && code < 128 && TOKEN_CHARS[code]) {
        if (start === -1) start = index;
      } else if (index !== 0 && (code === 0x20 || code === 0x09)) {
        if (end === -1 && start !== -1) end = index;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw syntaxError('character', index);
        if (end === -1) end = index;
        const name = header.slice(start, end);
        if (code === 0x2c) {
          push(offers, name, parameters);
          parameters = Object.create(null);
        } else {
          extensionName = name;
        }
        start = end = -1;
      } else {
        throw syntaxError('character', index);
      }
      continue;
    }

    if (parameterName === undefined) {
      if (end === -1 && code < 128 && TOKEN_CHARS[code]) {
        if (start === -1) start = index;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = index;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw syntaxError('character', index);
        if (end === -1) end = index;
        push(parameters, header.slice(start, end), true);
        if (code === 0x2c) {
          push(offers, extensionName, parameters);
          parameters = Object.create(null);
          extensionName = undefined;
        }
        start = end = -1;
      } else if (code === 0x3d && start !== -1 && end === -1) {
        parameterName = header.slice(start, index);
        start = end = -1;
      } else {
        throw syntaxError('character', index);
      }
      continue;
    }

    if (inQuotes) {
      if (code === 0x5c) {
        if (escaping) escaping = false;
        else {
          escaping = true;
          mustUnescape = true;
        }
      } else if (code === 0x22) {
        if (escaping) escaping = false;
        else {
          inQuotes = false;
          end = index;
        }
      } else if (escaping) {
        escaping = false;
      }
      continue;
    }

    if (end === -1 && code < 128 && TOKEN_CHARS[code]) {
      if (start === -1) start = index;
    } else if (code === 0x20 || code === 0x09) {
      if (end === -1 && start !== -1) end = index;
    } else if (code === 0x3b || code === 0x2c) {
      if (start === -1) throw syntaxError('character', index);
      if (end === -1) end = index;
      let value = header.slice(start, end);
      if (mustUnescape) {
        value = value.replace(/\\/g, '');
        mustUnescape = false;
      }
      push(parameters, parameterName, value);
      parameterName = undefined;
      if (code === 0x2c) {
        push(offers, extensionName, parameters);
        parameters = Object.create(null);
        extensionName = undefined;
      }
      start = end = -1;
    } else {
      throw syntaxError('character', index);
    }
  }

  if (start === -1 || end !== -1 || inQuotes) throw new SyntaxError('Unexpected end of input');
  if (end === -1) end = header.length;

  if (parameterName === undefined) {
    if (extensionName === undefined) {
      push(offers, header.slice(start, end), parameters);
    } else {
      push(parameters, header.slice(start, end), true);
      push(offers, extensionName, parameters);
    }
  } else {
    let value = header.slice(start, end);
    if (mustUnescape) value = value.replace(/\\/g, '');
    push(parameters, parameterName, value);
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
                  .map((value) => (value === true ? parameterName : `${parameterName}=${value}`))
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
