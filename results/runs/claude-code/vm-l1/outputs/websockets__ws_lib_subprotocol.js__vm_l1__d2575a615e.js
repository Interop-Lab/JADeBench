'use strict';

const tokenChars = new Uint8Array(128);
for (let code = 33; code < 127; code++) {
  if (!'()<>@,;:\\"/[]?={} \t'.includes(String.fromCharCode(code))) {
    tokenChars[code] = 1;
  }
}

function push(destination, name, value) {
  if (destination[name] === undefined) destination[name] = [value];
  else destination[name].push(value);
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
      } else if (index !== 0 && (code === 32 || code === 9)) {
        if (end === -1 && start !== -1) end = index;
      } else if (code === 59 || code === 44) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${index}`);
        }

        if (end === -1) end = index;
        extensionName = header.slice(start, end);

        if (code === 59) {
          start = end = -1;
        } else {
          push(offers, extensionName, parameters);
          parameters = Object.create(null);
          extensionName = undefined;
          start = end = -1;
        }
      } else {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }
    } else if (parameterName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = index;
      } else if (code === 32 || code === 9) {
        if (end === -1 && start !== -1) end = index;
      } else if (code === 59 || code === 44) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${index}`);
        }

        if (end === -1) end = index;
        push(parameters, header.slice(start, end), true);

        if (code === 44) {
          push(offers, extensionName, parameters);
          parameters = Object.create(null);
          extensionName = undefined;
        }

        start = end = -1;
      } else if (code === 61 && start !== -1 && end === -1) {
        parameterName = header.slice(start, index);
        start = -1;
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
    } else if (code === 34 && start === -1) {
      inQuotes = true;
      start = index + 1;
    } else if (inQuotes && code === 92) {
      isEscaping = true;
    } else if (inQuotes && code === 34) {
      inQuotes = false;
      end = index;
    } else if (end === -1 && tokenChars[code] === 1) {
      if (start === -1) start = index;
    } else if (start !== -1 && (code === 32 || code === 9)) {
      if (end === -1) end = index;
    } else if (code === 59 || code === 44) {
      if (start === -1 || inQuotes) {
        throw new SyntaxError(`Unexpected character at index ${index}`);
      }

      if (end === -1) end = index;
      let value = header.slice(start, end);
      if (mustUnescape) value = value.replace(/\\/g, '');
      push(parameters, parameterName, value);

      if (code === 44) {
        push(offers, extensionName, parameters);
        parameters = Object.create(null);
        extensionName = undefined;
      }

      parameterName = undefined;
      start = end = -1;
      mustUnescape = false;
    } else {
      throw new SyntaxError(`Unexpected character at index ${index}`);
    }
  }

  if (start === -1 || inQuotes) throw new SyntaxError('Unexpected end of input');
  if (end === -1) end = index;

  const token = header.slice(start, end);
  if (extensionName === undefined) {
    push(offers, token, parameters);
  } else if (parameterName === undefined) {
    push(parameters, token, true);
    push(offers, extensionName, parameters);
  } else {
    let value = token;
    if (mustUnescape) value = value.replace(/\\/g, '');
    push(parameters, parameterName, value);
    push(offers, extensionName, parameters);
  }

  return offers;
}

module.exports = { parse };
