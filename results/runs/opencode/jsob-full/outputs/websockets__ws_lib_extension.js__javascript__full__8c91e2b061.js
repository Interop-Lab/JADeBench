'use strict';

// Characters allowed by RFC 7230's `token` production.  This module parses
// comma-separated items with semicolon-separated parameters.
const TOKEN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+/;

function add(object, key, value) {
  if (object[key] === undefined) object[key] = [value];
  else object[key].push(value);
}

function syntaxError(index, end) {
  if (end) throw new SyntaxError('Unexpected end of input');
  throw new SyntaxError(`Unexpected character at index ${index}`);
}

function parse(input) {
  if (typeof input !== 'string') input = String(input);

  const result = Object.create(null);
  const length = input.length;
  let index = 0;

  function token() {
    const match = TOKEN.exec(input.slice(index));
    if (!match) syntaxError(index, index === length);
    index += match[0].length;
    return match[0];
  }

  function whitespace() {
    while (input[index] === ' ' || input[index] === '\t') index++;
  }

  if (length === 0) syntaxError(index, true);

  while (index < length) {
    const name = token();
    const parameters = Object.create(null);

    for (;;) {
      const beforeWhitespace = index;
      whitespace();

      if (index === length) {
        // Whitespace by itself is not a valid terminator in the original
        // grammar, while an item ending directly after a token is valid.
        if (index !== beforeWhitespace) syntaxError(index, true);
        add(result, name, parameters);
        return result;
      }

      if (input[index] === ',') {
        index++;
        whitespace();
        if (index === length) syntaxError(index, true);
        add(result, name, parameters);
        break;
      }

      if (input[index] !== ';') syntaxError(index);
      index++;
      whitespace();
      const parameterName = token();
      let value = true;

      if (input[index] === '=') {
        index++;
        if (index === length) syntaxError(index, true);

        if (input[index] === '"') {
          index++;
          const start = index;
          const match = TOKEN.exec(input.slice(index));
          if (!match) syntaxError(index, index === length);
          index += match[0].length;
          value = input.slice(start, index);
          if (input[index] !== '"') syntaxError(index, index === length);
          index++;
        } else {
          value = token();
        }
      }

      add(parameters, parameterName, value);
    }
  }

  return result;
}

function format(value) {
  return Object.keys(value).map(name => {
    let entries = value[name];
    if (!Array.isArray(entries)) entries = [entries];

    return entries.map(parameters => {
      return [name].concat(Object.keys(parameters).map(parameterName => {
        let values = parameters[parameterName];
        if (!Array.isArray(values)) values = [values];

        return values.map(parameterValue =>
          parameterValue === true
            ? parameterName
            : `${parameterName}=${parameterValue}`
        ).join('; ');
      })).join('; ');
    }).join(', ');
  }).join(', ');
}

module.exports = { format, parse };
