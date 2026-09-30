'use strict';

const tokenChars = new Uint8Array(128);

for (let code = 0x21; code < 0x7f; code++) tokenChars[code] = 1;
for (const separator of '()<>@,;:\\"/[]?={} \t') {
  tokenChars[separator.charCodeAt(0)] = 0;
}

function addValue(target, name, value) {
  if (target[name] === undefined) target[name] = [value];
  else target[name].push(value);
}

function syntaxError(index) {
  return new SyntaxError(`Unexpected character at index ${index}`);
}

function skipWhitespace(header, index) {
  while (header.charCodeAt(index) === 0x20 || header.charCodeAt(index) === 0x09) {
    index++;
  }
  return index;
}

function readToken(header, index) {
  const start = index;

  while (index < header.length && tokenChars[header.charCodeAt(index)] === 1) {
    index++;
  }

  if (index === start) throw syntaxError(index);
  return [header.slice(start, index), index];
}

function readQuotedToken(header, index) {
  const start = ++index;
  let escaped = false;

  while (index < header.length) {
    const code = header.charCodeAt(index);

    if (code === 0x22) {
      if (index === start) throw syntaxError(index);

      let value = header.slice(start, index);
      if (escaped) value = value.replace(/\\/g, '');
      return [value, index + 1];
    }

    if (code === 0x5c) {
      index++;
      if (tokenChars[header.charCodeAt(index)] !== 1) throw syntaxError(index);
      escaped = true;
    } else if (tokenChars[code] !== 1) {
      throw syntaxError(index);
    }

    index++;
  }

  throw syntaxError(index);
}

function parse(header) {
  const extensions = Object.create(null);
  let index = 0;
  let extensionName;
  let parameters;
  let expectingExtension = true;

  while (index < header.length) {
    index = skipWhitespace(header, index);

    if (extensionName === undefined) {
      [extensionName, index] = readToken(header, index);
      expectingExtension = false;
      parameters = Object.create(null);
      index = skipWhitespace(header, index);
    }

    if (header.charCodeAt(index) === 0x3b) {
      index = skipWhitespace(header, index + 1);

      let parameterName;
      [parameterName, index] = readToken(header, index);
      index = skipWhitespace(header, index);

      let value = true;
      if (header.charCodeAt(index) === 0x3d) {
        index = skipWhitespace(header, index + 1);
        if (header.charCodeAt(index) === 0x22) {
          [value, index] = readQuotedToken(header, index);
        } else {
          [value, index] = readToken(header, index);
        }
        index = skipWhitespace(header, index);
      }

      addValue(parameters, parameterName, value);
      continue;
    }

    addValue(extensions, extensionName, parameters);
    extensionName = undefined;

    if (index === header.length) break;
    if (header.charCodeAt(index) !== 0x2c) throw syntaxError(index);
    expectingExtension = true;
    index++;
  }

  if (expectingExtension) throw syntaxError(index);
  if (extensionName !== undefined) addValue(extensions, extensionName, parameters);

  return extensions;
}

function format(extensions) {
  return Object.keys(extensions)
    .map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations)) configurations = [configurations];

      return configurations
        .map((parameters) => {
          const parts = [extension];

          for (const name of Object.keys(parameters)) {
            let values = parameters[name];
            if (!Array.isArray(values)) values = [values];

            for (const value of values) {
              parts.push(value === true ? name : `${name}=${value}`);
            }
          }

          return parts.join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

module.exports = { format, parse };
