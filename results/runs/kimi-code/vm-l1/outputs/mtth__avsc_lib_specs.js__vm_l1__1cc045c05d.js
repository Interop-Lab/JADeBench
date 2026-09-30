'use strict';

const fs = require('fs');
const path = require('path');

const TYPE_REFERENCES = {
  date: {type: 'int', logicalType: 'date'},
  decimal: {type: 'bytes', logicalType: 'decimal'},
  time_ms: {type: 'long', logicalType: 'time-millis'},
  timestamp_ms: {type: 'long', logicalType: 'timestamp-millis'},
};

class Tokenizer {
  constructor(source) {
    this._str = String(source);
    this.pos = 0;
  }

  next(expectedId, expectedValue) {
    this._skip();
    const start = this.pos;
    let token;
    if (this.pos >= this._str.length) {
      token = {pos: start, id: '(eof)'};
    } else {
      const char = this._str[this.pos];
      if ('{}[]();,=@:-<>'.includes(char)) {
        this.pos++;
        token = {pos: start, id: 'operator', val: char};
      } else if (char === '"' || char === "'") {
        token = this._readString(char, start);
      } else if (char === '`') {
        token = this._readQuotedName(start);
      } else if (/\d/.test(char)) {
        const match = /^(?:0[xX][\da-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(this._str.slice(this.pos));
        this.pos += match[0].length;
        token = {pos: start, id: 'number', val: match[0]};
      } else {
        const match = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/.exec(this._str.slice(this.pos));
        if (!match) this.error({pos: start, id: 'operator', val: char}, 'valid token');
        this.pos += match[0].length;
        token = {pos: start, id: 'name', val: match[0]};
      }
    }
    if (expectedId && token.id !== expectedId) this.error(token, `ID ${expectedId}`);
    if (expectedValue !== undefined && token.val !== expectedValue) this.error(token, `value ${expectedValue}`);
    return token;
  }

  error(token, message) {
    throw new Error(`invalid token ${JSON.stringify(token)}: ${message}`);
  }

  _skip() {
    while (this.pos < this._str.length) {
      const rest = this._str.slice(this.pos);
      const whitespace = /^\s+/.exec(rest);
      if (whitespace) {
        this.pos += whitespace[0].length;
        continue;
      }
      const lineComment = /^\/\/[^\n]*(?:\n|$)/.exec(rest);
      if (lineComment) {
        this.pos += lineComment[0].length;
        continue;
      }
      const blockComment = /^\/\*(?:.|\n)*?\*\//.exec(rest);
      if (blockComment) {
        this.pos += blockComment[0].length;
        continue;
      }
      break;
    }
  }

  _readString(quote, start) {
    let escaped = false;
    for (this.pos++; this.pos < this._str.length; this.pos++) {
      const char = this._str[this.pos];
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) {
        this.pos++;
        return {pos: start, id: 'string', val: this._str.slice(start, this.pos)};
      }
    }
    this.error({pos: start, id: 'string'}, 'unterminated string');
  }

  _readQuotedName(start) {
    const end = this._str.indexOf('`', ++this.pos);
    if (end < 0) this.error({pos: start, id: 'name'}, 'unterminated name');
    const value = this._str.slice(this.pos, end);
    this.pos = end + 1;
    return {pos: start, id: 'name', val: value};
  }
}

function extractJavadoc(source, position) {
  const prefix = source.slice(0, position);
  const end = prefix.lastIndexOf('*/');
  if (end < 0 || prefix.slice(end + 2).trim()) return undefined;
  const start = prefix.lastIndexOf('/**', end);
  if (start < 0) return undefined;
  return prefix.slice(start + 3, end)
    .split('\n')
    .map(line => line.replace(/^\s*\*?\s?/, '').replace(/\s+$/, ''))
    .join('\n')
    .trim();
}

function protocolNamespace(protocol) {
  if (protocol.namespace) return protocol.namespace;
  const index = protocol.protocol.lastIndexOf('.');
  return index < 0 ? undefined : protocol.protocol.slice(0, index);
}

class Reader {
  constructor(source, options = {}) {
    this.source = String(source);
    this.tokenizer = new Tokenizer(this.source);
    this.options = options || {};
    this.token = null;
  }

  static readProtocol(source, options) {
    return new Reader(source, options)._readProtocol();
  }

  static readSchema(source, options) {
    return new Reader(source, options)._readSchema();
  }

  _readProtocol() {
    const annotations = this._readAnnotations();
    this._expectName('protocol');
    const name = this._readName();
    const protocol = {...annotations, protocol: name};
    const namespace = protocolNamespace(protocol);
    if (namespace && name.includes('.')) protocol.protocol = name.slice(name.lastIndexOf('.') + 1);
    this._expectOperator('{');
    const imports = [];
    const types = [];
    const messages = {};
    while (!this._acceptOperator('}')) {
      const doc = this._readDoc();
      const metadata = this._readAnnotations();
      if (this._acceptName('import')) {
        const kind = this._readName();
        const filename = this._readJsonValue();
        this._expectOperator(';');
        imports.push({kind, filename});
        continue;
      }
      if (this._isTypeDeclaration()) {
        const type = this._readNamedType(metadata, doc);
        types.push(type);
        this._acceptOperator(';');
        continue;
      }
      const response = this._readType();
      const messageName = this._readName();
      this._expectOperator('(');
      const request = this._readFields(')');
      const message = {...metadata};
      if (doc) message.doc = doc;
      message.request = request;
      message.response = response === 'void' ? 'null' : response;
      if (this._acceptName('throws')) {
        message.errors = [this._readName()];
        while (this._acceptOperator(',')) message.errors.push(this._readName());
      }
      if (this._acceptName('oneway')) message['one-way'] = true;
      this._expectOperator(';');
      messages[messageName] = message;
    }
    this._expectEof();
    if (types.length) protocol.types = types;
    if (Object.keys(messages).length) protocol.messages = messages;
    return imports.length ? assembleProtocol(protocol, imports, this.options) : protocol;
  }

  _readSchema() {
    const doc = this._readDoc();
    const metadata = this._readAnnotations();
    let schema;
    if (this._isTypeDeclaration()) schema = this._readNamedType(metadata, doc);
    else {
      schema = this._readType();
      if (Object.keys(metadata).length) schema = this._applyMetadata(schema, metadata);
    }
    this._acceptOperator(';');
    this._expectEof();
    return schema;
  }

  _readNamedType(metadata = {}, doc) {
    const kind = this._readName();
    if (!['record', 'error', 'enum', 'fixed'].includes(kind)) this._error(`unknown type ${kind}`);
    const name = this._readName();
    const schema = {...metadata, type: kind, name};
    if (doc) schema.doc = doc;
    if (kind === 'fixed') {
      this._expectOperator('(');
      schema.size = this._readNumber();
      this._expectOperator(')');
      return schema;
    }
    this._expectOperator('{');
    if (kind === 'enum') {
      schema.symbols = [];
      if (!this._acceptOperator('}')) {
        do schema.symbols.push(this._readName()); while (this._acceptOperator(','));
        this._expectOperator('}');
      }
      return schema;
    }
    schema.fields = this._readFields('}');
    return schema;
  }

  _readFields(endOperator) {
    const fields = [];
    while (!this._acceptOperator(endOperator)) {
      const doc = this._readDoc();
      const metadata = this._readAnnotations();
      const type = this._readType();
      const name = this._readName();
      const field = {type, ...metadata, name};
      if (doc) field.doc = doc;
      if (this._acceptOperator('=')) field.default = this._readJsonValue();
      fields.push(field);
      if (this._acceptOperator(',')) continue;
      this._acceptOperator(';');
      if (endOperator === ')' && this._peek().val !== endOperator) this._expectOperator(',');
    }
    return fields;
  }

  _readType() {
    const metadata = this._readAnnotations();
    let type;
    if (this._acceptName('union')) {
      this._expectOperator('{');
      type = [this._readType()];
      while (this._acceptOperator(',')) type.push(this._readType());
      this._expectOperator('}');
    } else if (this._acceptName('array')) {
      this._expectOperator('<');
      const items = this._readType();
      this._expectOperator('>');
      type = {type: 'array', items};
    } else if (this._acceptName('map')) {
      this._expectOperator('<');
      const values = this._readType();
      this._expectOperator('>');
      type = {type: 'map', values};
    } else {
      const name = this._readName();
      type = TYPE_REFERENCES[name] ? {...TYPE_REFERENCES[name]} : name;
    }
    return Object.keys(metadata).length ? this._applyMetadata(type, metadata) : type;
  }

  _applyMetadata(type, metadata) {
    if (typeof type === 'string') return {...metadata, type};
    if (Array.isArray(type)) return {...metadata, type};
    return {...metadata, ...type};
  }

  _readAnnotations() {
    const metadata = {};
    while (this._acceptOperator('@')) {
      const name = this._readName();
      this._expectOperator('(');
      const value = this._readJsonValue();
      this._expectOperator(')');
      metadata[name] = value;
    }
    return metadata;
  }

  _readJsonValue() {
    const token = this._next();
    if (token.id === 'string') return parseString(token.val);
    if (token.id === 'number') return Number(token.val);
    if (token.id === 'name') {
      if (token.val === 'true') return true;
      if (token.val === 'false') return false;
      if (token.val === 'null') return null;
      return token.val;
    }
    if (token.val === '-') return -this._readNumber();
    if (token.val === '[') {
      const values = [];
      if (!this._acceptOperator(']')) {
        do values.push(this._readJsonValue()); while (this._acceptOperator(','));
        this._expectOperator(']');
      }
      return values;
    }
    if (token.val === '{') {
      const value = {};
      if (!this._acceptOperator('}')) {
        do {
          const keyToken = this._next();
          const key = keyToken.id === 'string' ? parseString(keyToken.val) : keyToken.val;
          this._expectOperator(':');
          value[key] = this._readJsonValue();
        } while (this._acceptOperator(','));
        this._expectOperator('}');
      }
      return value;
    }
    this._error('expected JSON value', token);
  }

  _readDoc() {
    const position = this._peek().pos;
    return extractJavadoc(this.source, position);
  }

  _isTypeDeclaration() {
    const token = this._peek();
    return token.id === 'name' && ['record', 'error', 'enum', 'fixed'].includes(token.val);
  }

  _readName() {
    return this._next('name').val;
  }

  _readNumber() {
    return Number(this._next('number').val);
  }

  _peek() {
    if (!this.token) this.token = this.tokenizer.next();
    return this.token;
  }

  _next(id, value) {
    const token = this.token || this.tokenizer.next();
    this.token = null;
    if (id && token.id !== id) this.tokenizer.error(token, `expected ID ${id}`);
    if (value !== undefined && token.val !== value) this.tokenizer.error(token, `expected value ${value}`);
    return token;
  }

  _acceptName(value) {
    const token = this._peek();
    if (token.id !== 'name' || token.val !== value) return false;
    this.token = null;
    return true;
  }

  _acceptOperator(value) {
    const token = this._peek();
    if (token.id !== 'operator' || token.val !== value) return false;
    this.token = null;
    return true;
  }

  _expectName(value) {
    this._next('name', value);
  }

  _expectOperator(value) {
    this._next('operator', value);
  }

  _expectEof() {
    this._next('(eof)');
  }

  _error(message, token = this._peek()) {
    this.tokenizer.error(token, message);
  }
}

function parseString(value) {
  if (value[0] === '"') return JSON.parse(value);
  return value.slice(1, -1).replace(/\\(['\\])/g, '$1');
}

function defaultImportHook({path: filename}) {
  return fs.readFileSync(filename, 'utf8');
}

function assembleProtocol(protocol, imports, options = {}) {
  const result = {...protocol};
  const importedTypes = [];
  const importedMessages = {};
  const baseDirectory = options.dirname || (options.filename ? path.dirname(options.filename) : process.cwd());
  const importHook = options.importHook || defaultImportHook;
  for (const entry of imports) {
    const filename = path.resolve(baseDirectory, entry.filename);
    let source;
    try {
      source = importHook({path: filename, kind: entry.kind});
    } catch (error) {
      throw new Error(`unresolvable import: ${entry.filename}`, {cause: error});
    }
    if (source === undefined) throw new Error(`unresolvable import: ${entry.filename}`);
    let imported;
    if (entry.kind === 'idl') imported = Reader.readProtocol(source, {...options, filename});
    else if (entry.kind === 'protocol') imported = typeof source === 'string' ? JSON.parse(source) : source;
    else if (entry.kind === 'schema') imported = typeof source === 'string' ? JSON.parse(source) : source;
    else throw new Error(`invalid import type: ${entry.kind}`);
    if (entry.kind === 'schema') importedTypes.push(imported);
    else {
      if (imported.types) importedTypes.push(...imported.types);
      if (imported.messages) Object.assign(importedMessages, imported.messages);
    }
  }
  if (importedTypes.length || result.types) result.types = [...importedTypes, ...(result.types || [])];
  if (Object.keys(importedMessages).length || result.messages) result.messages = {...importedMessages, ...(result.messages || {})};
  return result;
}

function read(source, options) {
  if (typeof source !== 'string') return source;
  const trimmed = source.trim();
  if (!trimmed) return source;
  if (trimmed[0] === '{' || trimmed[0] === '[' || trimmed[0] === '"') {
    try {
      return JSON.parse(trimmed);
    } catch (_) {}
  }
  const probe = new Reader(source, options);
  probe._readAnnotations();
  const isProtocol = probe._peek().val === 'protocol';
  const reader = new Reader(source, options);
  return isProtocol ? reader._readProtocol() : reader._readSchema();
}

module.exports = {
  Tokenizer,
  assembleProtocol,
  read,
  readProtocol: Reader.readProtocol,
  readSchema: Reader.readSchema,
};
