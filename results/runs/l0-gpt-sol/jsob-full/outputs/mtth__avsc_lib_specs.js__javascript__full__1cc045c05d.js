'use strict';

const fs = require('fs');
const path = require('path');

class Tokenizer {
  constructor(input) {
    this.input = input;
    this.pos = -1;
  }

  peek(offset = 0) {
    return this.input[this.pos + offset];
  }

  next() {
    return this.input[++this.pos];
  }

  skip() {
    while (/\s/.test(this.peek())) this.pos++;
  }

  skipComment() {
    const start = this.pos;
    const next = this.peek(1);
    if (this.peek() !== '/') return start;

    if (next === '/') {
      this.pos += 2;
      while (this.peek() && this.peek() !== '\n') this.pos++;
      return this.pos;
    }

    if (next === '*') {
      this.pos += 2;
      while (this.peek() && !(this.peek() === '*' && this.peek(1) === '/')) {
        this.pos++;
      }
      if (this.peek()) this.pos += 2;
      return this.pos;
    }

    return start;
  }

  skipWhitespace() {
    this.skip();
    while (this.skipComment() !== this.pos) this.skip();
  }

  match(token) {
    this.skipWhitespace();
    return this.input.slice(this.pos, this.pos + token.length) === token;
  }

  consume(token) {
    this.skipWhitespace();
    if (!this.match(token)) {
      throw new Error(`expected ${token}`);
    }
    this.pos += token.length;
    return token;
  }

  readString() {
    this.skipWhitespace();
    const quote = this.next();
    if (quote !== '"' && quote !== "'") {
      throw new Error('expected string');
    }

    let value = '';
    while (this.peek()) {
      const ch = this.next();
      if (ch === quote) return value;
      if (ch === '\\') {
        const escaped = this.next();
        const escapes = {
          '"': '"',
          "'": "'",
          '\\': '\\',
          '/': '/',
          b: '\b',
          f: '\f',
          n: '\n',
          r: '\r',
          t: '\t'
        };
        if (escaped === 'u') {
          const code = this.input.slice(this.pos + 1, this.pos + 5);
          if (!/^[0-9a-f]{4}$/i.test(code)) throw new Error('invalid escape');
          value += String.fromCharCode(parseInt(code, 16));
          this.pos += 4;
        } else {
          value += Object.prototype.hasOwnProperty.call(escapes, escaped)
            ? escapes[escaped]
            : escaped;
        }
      } else {
        value += ch;
      }
    }
    throw new Error('unterminated string');
  }

  readNumber() {
    this.skipWhitespace();
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(
      this.input.slice(this.pos + 1)
    );
    if (!match) throw new Error('expected number');
    this.pos += match[0].length;
    return Number(match[0]);
  }

  readValue() {
    this.skipWhitespace();
    const ch = this.peek();
    if (ch === '"' || ch === "'") return this.readString();
    if (ch === '-' || /\d/.test(ch || '')) return this.readNumber();
    if (ch === '{') return this.readObject();
    if (ch === '[') return this.readArray();

    const match = /^(true|false|null)\b/.exec(this.input.slice(this.pos + 1));
    if (match) {
      this.pos += match[0].length;
      return match[0] === 'true' ? true : match[0] === 'false' ? false : null;
    }
    throw new Error('invalid value');
  }

  readArray() {
    this.consume('[');
    const result = [];
    this.skipWhitespace();
    if (this.match(']')) {
      this.consume(']');
      return result;
    }

    for (;;) {
      result.push(this.readValue());
      this.skipWhitespace();
      if (this.match(']')) {
        this.consume(']');
        return result;
      }
      this.consume(',');
    }
  }

  readObject() {
    this.consume('{');
    const result = {};
    this.skipWhitespace();
    if (this.match('}')) {
      this.consume('}');
      return result;
    }

    for (;;) {
      const key = this.readString();
      this.consume(':');
      result[key] = this.readValue();
      this.skipWhitespace();
      if (this.match('}')) {
        this.consume('}');
        return result;
      }
      this.consume(',');
    }
  }
}

function protocolNamespace(protocol) {
  if (protocol && protocol.namespace) return protocol.namespace;
  const name = protocol && protocol.protocol;
  if (typeof name !== 'string') return undefined;
  const index = name.lastIndexOf('.');
  return index === -1 ? undefined : name.slice(0, index);
}

function assembleProtocol(protocol, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  const files = options.importHook || (() => ({}));
  const importerPath = options.path || '';
  const imported = new Set();

  function loadFile(file, done) {
    const resolved = path.resolve(importerPath, file);
    if (imported.has(resolved)) {
      done(null);
      return;
    }
    imported.add(resolved);

    fs.readFile(resolved, 'utf8', (error, contents) => {
      if (error) return done(error);
      let parsed;
      try {
        parsed = read(contents);
      } catch (parseError) {
        parseError.path = resolved;
        return done(parseError);
      }
      done(null, parsed, resolved);
    });
  }

  const result = Object.assign({}, protocol);
  const imports = protocol && protocol.imports || [];
  let index = 0;

  function next(error) {
    if (error) return callback(error);
    if (index >= imports.length) return callback(null, result);

    const file = imports[index++];
    loadFile(file, (loadError, schema) => {
      if (loadError) return next(loadError);
      if (schema && typeof schema === 'object') {
        result.types = (result.types || []).concat(
          Array.isArray(schema) ? schema : [schema]
        );
      }
      next();
    });
  }

  if (typeof files === 'function') {
    try {
      const supplied = files(protocol);
      if (supplied && typeof supplied === 'object') {
        result.types = (result.types || []).concat(
          Array.isArray(supplied) ? supplied : [supplied]
        );
      }
    } catch (error) {
      callback(error);
      return;
    }
  }

  next();
}

function read(input) {
  if (typeof input !== 'string') return input;
  try {
    return JSON.parse(input);
  } catch (_) {
    const tokenizer = new Tokenizer(input);
    return tokenizer.readValue();
  }
}

class Reader {
  constructor(input, options) {
    this.input = new Tokenizer(input);
    this.options = options || {};
  }

  read() {
    return this.input.readValue();
  }

  static fromJSON(input, options) {
    return new Reader(input, options).read();
  }

  static fromBuffer(input, options) {
    return Reader.fromJSON(Buffer.isBuffer(input) ? input.toString() : String(input), options);
  }
}

module.exports = {
  Tokenizer,
  assembleProtocol,
  read,
  fromBuffer: Reader.fromBuffer,
  fromJSON: Reader.fromJSON
};
