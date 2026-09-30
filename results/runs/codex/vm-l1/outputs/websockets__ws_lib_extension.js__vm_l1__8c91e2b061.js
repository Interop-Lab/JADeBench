'use strict';

const tokenChars = new Array(128).fill(false);
for (const character of "!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz|~") {
  tokenChars[character.charCodeAt(0)] = true;
}

function unexpectedCharacter(index) {
  throw new SyntaxError(`Unexpected character at index ${index}`);
}

function unexpectedEnd() {
  throw new SyntaxError('Unexpected end of input');
}

function skipWhitespace(input, index, length) {
  while (index < length) {
    const character = input.charCodeAt(index);
    if (character !== 0x20 && character !== 0x09) break;
    index += 1;
  }
  return index;
}

function readToken(input, index, length) {
  const start = index;
  while (index < length && tokenChars[input.charCodeAt(index)]) index += 1;
  return [input.slice(start, index), index];
}

function parse(input) {
  const length = input.length;
  if (!length) unexpectedEnd();

  const entries = Object.create(null);
  let index = 0;

  while (index < length) {
    const entryStart = index;
    let entryName;
    [entryName, index] = readToken(input, index, length);
    if (index === entryStart) unexpectedCharacter(index);

    const parameters = Object.create(null);
    let entryComplete = false;

    while (!entryComplete) {
      if (index === length) {
        entryComplete = true;
        break;
      }

      index = skipWhitespace(input, index, length);
      if (index === length) unexpectedEnd();

      const separator = input.charCodeAt(index);
      if (separator === 0x2c) {
        index = skipWhitespace(input, index + 1, length);
        if (index === length) unexpectedEnd();
        entryComplete = true;
        break;
      }
      if (separator !== 0x3b) unexpectedCharacter(index);

      index = skipWhitespace(input, index + 1, length);
      if (index === length) unexpectedEnd();

      const parameterStart = index;
      let parameterName;
      [parameterName, index] = readToken(input, index, length);
      if (index === parameterStart) unexpectedCharacter(index);

      let parameterValue = true;
      if (index < length && input.charCodeAt(index) === 0x3d) {
        index += 1;
        if (index === length) unexpectedEnd();

        if (input.charCodeAt(index) === 0x22) {
          const valueStart = ++index;
          while (index < length) {
            const character = input.charCodeAt(index);
            if (character === 0x22) break;
            if (character === 0x5c) {
              index += 1;
              if (index === length) unexpectedEnd();
              if (!tokenChars[input.charCodeAt(index)]) unexpectedCharacter(index);
            } else if (!tokenChars[character]) {
              unexpectedCharacter(index);
            }
            index += 1;
          }
          if (index === length) unexpectedEnd();
          if (index === valueStart) unexpectedCharacter(index);
          parameterValue = input.slice(valueStart, index).replace(/\\/g, '');
          index += 1;
        } else {
          const valueStart = index;
          [parameterValue, index] = readToken(input, index, length);
          if (index === valueStart) unexpectedCharacter(index);
        }
      }

      if (parameters[parameterName]) parameters[parameterName].push(parameterValue);
      else parameters[parameterName] = [parameterValue];
    }

    if (entries[entryName]) entries[entryName].push(parameters);
    else entries[entryName] = [parameters];
  }

  return entries;
}

function formatParameter(name, value) {
  return value === true ? name : `${name}=${value}`;
}

function formatParameters(name, value) {
  return Array.isArray(value)
    ? value.map((item) => formatParameter(name, item)).join('; ')
    : formatParameter(name, value);
}

function formatEntry(name, parameters) {
  return [name]
    .concat(Object.keys(parameters).map((parameter) => formatParameters(parameter, parameters[parameter])))
    .join('; ');
}

function formatEntries(name, entries) {
  return Array.isArray(entries)
    ? entries.map((parameters) => formatEntry(name, parameters)).join(', ')
    : formatEntry(name, entries);
}

function format(value) {
  return Object.keys(value).map((name) => formatEntries(name, value[name])).join(', ');
}

module.exports = { format, parse };
