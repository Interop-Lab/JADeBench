'use strict';

const fs = require('fs');
const path = require('path');

const TYPE_REFS = {
  date: {type: 'int', logicalType: 'date'},
  decimal: {type: 'bytes', logicalType: 'decimal'},
  time_ms: {type: 'long', logicalType: 'time-millis'},
  timestamp_ms: {type: 'long', logicalType: 'timestamp-millis'}
};

class Tokenizer {
  constructor(text) {
    this.text = String(text);
    this.offset = 0;
    this.line = 1;
    this.column = 1;
    this.buffered = null;
    this.javadoc = null;
  }

  next(expected) {
    const token = this.buffered || this._readToken();
    this.buffered = null;
    if (expected !== undefined && token.value !== expected && token.type !== expected) {
      this.error(`expected ${expected}, found ${token.value || 'end of input'}`, token);
    }
    return token;
  }

  peek(value) {
    if (!this.buffered) this.buffered = this._readToken();
    return value === undefined ? this.buffered : this.buffered.value === value;
  }

  error(message, token = this.buffered) {
    token ||= {line: this.line, column: this.column};
    const error = new Error(`${message} at line ${token.line}, column ${token.column}`);
    error.line = token.line;
    error.column = token.column;
    throw error;
  }

  _advance() {
    const character = this.text[this.offset++];
    if (character === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return character;
  }

  _skip() {
    while (this.offset < this.text.length) {
      if (/\s/.test(this.text[this.offset])) {
        this._advance();
      } else if (this.text.startsWith('//', this.offset)) {
        while (this.offset < this.text.length && this._advance() !== '\n');
      } else if (this.text.startsWith('/*', this.offset)) {
        const isJavadoc = this.text.startsWith('/**', this.offset);
        this._advance();
        this._advance();
        let comment = '';
        while (this.offset < this.text.length && !this.text.startsWith('*/', this.offset)) {
          comment += this._advance();
        }
        if (this.offset >= this.text.length) this.error('unterminated comment');
        this._advance();
        this._advance();
        if (isJavadoc) this.javadoc = extractJavadoc(comment);
      } else {
        return;
      }
    }
  }

  _readToken() {
    this._skip();
    const line = this.line;
    const column = this.column;
    if (this.offset >= this.text.length) return {type: 'eof', value: '', line, column};

    const first = this.text[this.offset];
    if (/[A-Za-z_]/.test(first)) {
      let value = '';
      while (/[A-Za-z0-9_.]/.test(this.text[this.offset] || '')) value += this._advance();
      return {type: 'name', value, line, column};
    }
    if (first === '"' || first === "'") {
      const quote = this._advance();
      let raw = quote;
      while (this.offset < this.text.length) {
        const character = this._advance();
        raw += character;
        if (character === '\\') raw += this._advance();
        else if (character === quote) break;
      }
      if (!raw.endsWith(quote) || raw.length === 1) this.error('unterminated string');
      let value;
      try {
        value = quote === '"' ? JSON.parse(raw) : Function(`return ${raw}`)();
      } catch {
        this.error('invalid string literal');
      }
      return {type: 'string', value, line, column};
    }
    if (first === '-' || /[0-9]/.test(first)) {
      const rest = this.text.slice(this.offset);
      const match = rest.match(/^-?(?:0x[\da-f]+|(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)/i);
      if (match) {
        for (let i = 0; i < match[0].length; i++) this._advance();
        return {type: 'number', value: Number(match[0]), line, column};
      }
    }
    return {type: 'punctuation', value: this._advance(), line, column};
  }
}

function extractJavadoc(comment) {
  return String(comment)
    .replace(/^\*|\*\/$/g, '')
    .split(/\r?\n/)
    .map(line => line.replace(/^\s*\* ?/, '').trimEnd())
    .join('\n')
    .trim();
}

function protocolNamespace(name) {
  const index = String(name).lastIndexOf('.');
  return index < 0 ? undefined : name.slice(0, index);
}

function assembleProtocol(attributes, types = [], messages = {}) {
  const protocol = Object.assign({}, attributes);
  protocol.types = types;
  protocol.messages = messages;
  const namespace = protocol.namespace || protocolNamespace(protocol.protocol);
  if (namespace && !protocol.namespace) protocol.namespace = namespace;
  return protocol;
}

class Reader {
  constructor(source, options = {}) {
    this.options = options;
    this.tokenizer = source instanceof Tokenizer ? source : new Tokenizer(source);
    this.baseDir = options.baseDir || process.cwd();
  }

  static readProtocol(source, options) {
    return new Reader(source, options)._readProtocol();
  }

  static readSchema(source, options) {
    const reader = new Reader(source, options);
    const annotations = reader._readAnnotations();
    const schema = reader._readType(annotations);
    if (!reader.tokenizer.peek('')) reader.tokenizer.error('unexpected trailing input');
    return schema;
  }

  _takeJavadoc(target) {
    if (this.tokenizer.javadoc) {
      target.doc = this.tokenizer.javadoc;
      this.tokenizer.javadoc = null;
    }
    return target;
  }

  _readAnnotations() {
    const annotations = {};
    while (this.tokenizer.peek('@')) {
      this.tokenizer.next('@');
      const name = this.tokenizer.next('name').value;
      this.tokenizer.next('(');
      annotations[name] = this._readJsonValue();
      this.tokenizer.next(')');
    }
    return annotations;
  }

  _applyAnnotations(value, annotations) {
    const entries = Object.entries(annotations || {});
    if (!entries.length) return value;
    if (typeof value === 'string') value = {type: value};
    for (const [name, annotationValue] of entries) {
      if (TYPE_REFS[name]) Object.assign(value, TYPE_REFS[name]);
      else value[name] = annotationValue;
    }
    return value;
  }

  _readProtocol() {
    const annotations = this._readAnnotations();
    this.tokenizer.next('protocol');
    const name = this.tokenizer.next('name').value;
    const attributes = this._applyAnnotations({protocol: name}, annotations);
    this._takeJavadoc(attributes);
    this.tokenizer.next('{');
    const types = [];
    const messages = {};
    while (!this.tokenizer.peek('}')) {
      const itemAnnotations = this._readAnnotations();
      if (this.tokenizer.peek('import')) {
        this._readImports(types, messages);
      } else if (['record', 'error', 'enum', 'fixed'].includes(this.tokenizer.peek().value)) {
        types.push(this._readType(itemAnnotations));
        if (this.tokenizer.peek(';')) this.tokenizer.next(';');
      } else {
        const [messageName, message] = this._readMessage(itemAnnotations);
        messages[messageName] = message;
      }
    }
    this.tokenizer.next('}');
    return assembleProtocol(attributes, types, messages);
  }

  _readImports(types, messages) {
    this.tokenizer.next('import');
    const kind = this.tokenizer.next('name').value;
    const filename = this.tokenizer.next('string').value;
    this.tokenizer.next(';');
    const resolved = path.resolve(this.baseDir, filename);
    if (kind === 'idl') {
      const protocol = readProtocol(fs.readFileSync(resolved, 'utf8'), {
        ...this.options,
        baseDir: path.dirname(resolved)
      });
      types.push(...(protocol.types || []));
      Object.assign(messages, protocol.messages || {});
    } else if (kind === 'schema') {
      types.push(JSON.parse(fs.readFileSync(resolved, 'utf8')));
    } else if (kind === 'protocol') {
      const protocol = JSON.parse(fs.readFileSync(resolved, 'utf8'));
      types.push(...(protocol.types || []));
      Object.assign(messages, protocol.messages || {});
    } else {
      this.tokenizer.error(`unknown import type ${kind}`);
    }
  }

  _readMessage(annotations) {
    let response;
    if (this.tokenizer.peek('void')) {
      this.tokenizer.next();
      response = 'null';
    } else {
      response = this._readType();
    }
    const name = this.tokenizer.next('name').value;
    const message = this._applyAnnotations({request: [], response}, annotations);
    this._takeJavadoc(message);
    this.tokenizer.next('(');
    while (!this.tokenizer.peek(')')) {
      message.request.push(this._readField());
      if (!this.tokenizer.peek(',')) break;
      this.tokenizer.next(',');
    }
    this.tokenizer.next(')');
    if (this.tokenizer.peek('throws')) {
      this.tokenizer.next();
      message.errors = [];
      do {
        message.errors.push(this.tokenizer.next('name').value);
        if (!this.tokenizer.peek(',')) break;
        this.tokenizer.next(',');
      } while (true);
    }
    if (this.tokenizer.peek('oneway')) {
      this.tokenizer.next();
      message.oneWay = true;
    }
    this.tokenizer.next(';');
    return [name, message];
  }

  _readField() {
    const annotations = this._readAnnotations();
    let type = this._readType(annotations);
    const name = this.tokenizer.next('name').value;
    const field = {name, type};
    this._takeJavadoc(field);
    if (this.tokenizer.peek('=')) {
      this.tokenizer.next();
      field.default = this._readJsonValue();
    }
    if (this.tokenizer.peek(';')) this.tokenizer.next(';');
    return field;
  }

  _readType(annotations = {}) {
    let type;
    const token = this.tokenizer.next();
    switch (token.value) {
      case 'record':
      case 'error':
        type = this._readRecord(token.value);
        break;
      case 'enum':
        type = this._readEnum();
        break;
      case 'fixed':
        type = this._readFixed();
        break;
      case 'array':
        type = this._readArray();
        break;
      case 'map':
        type = this._readMap();
        break;
      case 'union':
        type = this._readUnion();
        break;
      default:
        if (token.type !== 'name') this.tokenizer.error('expected a type', token);
        type = token.value;
    }
    if (this.tokenizer.peek('?')) {
      this.tokenizer.next('?');
      type = ['null', type];
    }
    return this._applyAnnotations(type, annotations);
  }

  _readRecord(kind) {
    const name = this.tokenizer.next('name').value;
    const schema = {type: kind, name, fields: []};
    this._takeJavadoc(schema);
    this.tokenizer.next('{');
    while (!this.tokenizer.peek('}')) schema.fields.push(this._readField());
    this.tokenizer.next('}');
    return schema;
  }

  _readEnum() {
    const name = this.tokenizer.next('name').value;
    const schema = {type: 'enum', name, symbols: []};
    this._takeJavadoc(schema);
    this.tokenizer.next('{');
    while (!this.tokenizer.peek('}')) {
      schema.symbols.push(this.tokenizer.next('name').value);
      if (!this.tokenizer.peek(',')) break;
      this.tokenizer.next(',');
    }
    this.tokenizer.next('}');
    return schema;
  }

  _readFixed() {
    const name = this.tokenizer.next('name').value;
    this.tokenizer.next('(');
    const size = this.tokenizer.next('number').value;
    this.tokenizer.next(')');
    return this._takeJavadoc({type: 'fixed', name, size});
  }

  _readArray() {
    this.tokenizer.next('<');
    const items = this._readType(this._readAnnotations());
    this.tokenizer.next('>');
    return {type: 'array', items};
  }

  _readMap() {
    this.tokenizer.next('<');
    const values = this._readType(this._readAnnotations());
    this.tokenizer.next('>');
    return {type: 'map', values};
  }

  _readUnion() {
    const branches = [];
    this.tokenizer.next('{');
    while (!this.tokenizer.peek('}')) {
      branches.push(this._readType(this._readAnnotations()));
      if (!this.tokenizer.peek(',')) break;
      this.tokenizer.next(',');
    }
    this.tokenizer.next('}');
    return branches;
  }

  _readJsonValue() {
    const token = this.tokenizer.next();
    if (token.type === 'string' || token.type === 'number') return token.value;
    if (token.value === 'true') return true;
    if (token.value === 'false') return false;
    if (token.value === 'null') return null;
    if (token.value === '[') {
      const values = [];
      while (!this.tokenizer.peek(']')) {
        values.push(this._readJsonValue());
        if (!this.tokenizer.peek(',')) break;
        this.tokenizer.next(',');
      }
      this.tokenizer.next(']');
      return values;
    }
    if (token.value === '{') {
      const value = {};
      while (!this.tokenizer.peek('}')) {
        const key = this.tokenizer.next();
        if (key.type !== 'name' && key.type !== 'string') this.tokenizer.error('expected object key', key);
        this.tokenizer.next(':');
        value[key.value] = this._readJsonValue();
        if (!this.tokenizer.peek(',')) break;
        this.tokenizer.next(',');
      }
      this.tokenizer.next('}');
      return value;
    }
    this.tokenizer.error('invalid annotation or default value', token);
  }
}

function read(source, options = {}) {
  const text = String(source);
  const tokenizer = new Tokenizer(text);
  while (tokenizer.peek('@')) {
    tokenizer.next('@');
    tokenizer.next('name');
    tokenizer.next('(');
    // Use a temporary reader to consume the annotation's value.
    new Reader(tokenizer, options)._readJsonValue();
    tokenizer.next(')');
  }
  return tokenizer.peek('protocol')
    ? Reader.readProtocol(text, options)
    : Reader.readSchema(text, options);
}

function readProtocol(source, options) {
  return Reader.readProtocol(source, options);
}

function readSchema(source, options) {
  return Reader.readSchema(source, options);
}

module.exports = {
  Tokenizer,
  assembleProtocol,
  read,
  readProtocol,
  readSchema
};
