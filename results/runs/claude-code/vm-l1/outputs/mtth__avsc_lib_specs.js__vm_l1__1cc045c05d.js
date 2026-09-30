'use strict';

const fs = require('fs');
const path = require('path');

const TYPE_REFS = {
  date: { type: 'int', logicalType: 'date' },
  decimal: { type: 'bytes', logicalType: 'decimal' },
  time_ms: { type: 'long', logicalType: 'time-millis' },
  timestamp_ms: { type: 'long', logicalType: 'timestamp-millis' },
};

function extractJavadoc(text) {
  const lines = text.replace(/^[ \t]+|[ \t]+$/g, '').split('\n')
    .map(line => line.replace(/^\s*\* ?/, ''));
  if (!lines[0]) lines.shift();
  if (!lines.at(-1)) lines.pop();
  return lines.join('\n');
}

function protocolNamespace(protocol) {
  if (protocol.namespace) return protocol.namespace;
  const match = /^(.*)\.[^.]+$/.exec(protocol.protocol);
  return match ? match[1] : '';
}

class Tokenizer {
  constructor(source) {
    this.source = String(source);
    this.pos = 0;
    this.emitJavadoc = true;
  }

  next(expected, silent = false) {
    const comment = this._skip();
    if (comment) return this._check(comment, expected, silent);
    const start = this.pos;
    if (start >= this.source.length) return this._check({ id: '(eof)', pos: start }, expected, silent);
    const char = this.source[start];
    let token;
    if (char === '"') {
      const end = this._endOfString();
      try { token = { id: 'string', val: JSON.parse(this.source.slice(start, end)), pos: start }; }
      catch { this.error('invalid JSON'); }
      this.pos = end;
    } else if (char === '`') {
      const end = this.source.indexOf('`', start + 1);
      if (end < 0) this.error('unterminated name');
      token = { id: 'name', val: this.source.slice(start + 1, end), pos: start };
      this.pos = end + 1;
    } else if (char === '{' || char === '[') {
      const end = this._endOfJson();
      try {
        token = { id: 'json', val: JSON.parse(this.source.slice(start, end)), pos: start };
        this.pos = end;
      } catch {
        this.pos++;
        token = { id: 'operator', val: char, pos: start };
      }
    } else if (/[A-Za-z_.]/.test(char)) {
      while (/[A-Za-z0-9_.]/.test(this.source[++this.pos] || '')) {}
      token = { id: 'name', val: this.source.slice(start, this.pos), pos: start };
    } else if (/[0-9-]/.test(char)) {
      while (/[0-9eE+.\-]/.test(this.source[++this.pos] || '')) {}
      token = { id: 'number', val: Number(this.source.slice(start, this.pos)), pos: start };
    } else {
      this.pos++;
      token = { id: 'operator', val: char, pos: start };
    }
    return this._check(token, expected, silent);
  }

  _check(token, expected, silent) {
    if (expected === undefined || token.id === expected || token.val === expected) return token;
    if (silent) { this.pos = token.pos; return undefined; }
    this.error(expected === 'name' ? 'expected ID' : `expected value ${expected}`, token);
  }

  error(message, token = { pos: this.pos }) {
    const lines = this.source.slice(0, token.pos).split('\n');
    const error = new Error(`${message} at ${lines.length}:${lines.at(-1).length + 1}`);
    error.token = token;
    throw error;
  }

  _skip() {
    while (this.pos < this.source.length) {
      if (/\s/.test(this.source[this.pos])) { this.pos++; continue; }
      if (this.source.startsWith('//', this.pos)) {
        const end = this.source.indexOf('\n', this.pos + 2);
        this.pos = end < 0 ? this.source.length : end + 1;
        continue;
      }
      if (!this.source.startsWith('/*', this.pos)) break;
      const start = this.pos;
      const end = this.source.indexOf('*/', start + 2);
      if (end < 0) this.error('unterminated comment');
      const javadoc = this.source[start + 2] === '*';
      const value = this.source.slice(start + (javadoc ? 3 : 2), end);
      this.pos = end + 2;
      if (javadoc && this.emitJavadoc) return { id: 'javadoc', val: extractJavadoc(value), pos: start };
    }
  }

  _endOfString() {
    let end = this.pos + 1;
    while (end < this.source.length) {
      if (this.source[end] === '\\') end += 2;
      else if (this.source[end] === '"') return end + 1;
      else end++;
    }
    this.error('unterminated string');
  }

  _endOfJson() {
    const opening = this.source[this.pos];
    const closing = opening === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let end = this.pos; end < this.source.length; end++) {
      const char = this.source[end];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === '"') inString = false;
      } else if (char === '"') inString = true;
      else if (char === opening) depth++;
      else if (char === closing && --depth === 0) return end + 1;
    }
    return this.pos + 1;
  }
}

class Reader {
  constructor(source, options = {}) {
    this.tk = source instanceof Tokenizer ? source : new Tokenizer(source);
    this.typeRefs = { ...TYPE_REFS, ...(options.typeRefs || {}) };
  }

  static readSchema(source, options) {
    const reader = new Reader(source, options);
    const doc = reader.readDoc();
    const schema = reader.readType();
    if (doc && typeof schema === 'object') schema.doc = doc;
    reader.tk.next('(eof)');
    return schema;
  }

  static readProtocol(source, options) { return new Reader(source, options).readProtocol(); }
  readDoc() { const token = this.tk.next('javadoc', true); return token && token.val; }

  annotations(target = {}) {
    while (this.tk.next('@', true)) {
      const name = this.tk.next('name').val;
      let value = true;
      if (this.tk.next('(', true)) {
        const values = [];
        if (!this.tk.next(')', true)) {
          do values.push(this.tk.next().val); while (this.tk.next(',', true));
          this.tk.next(')');
        }
        value = values.length === 1 ? values[0] : values;
      }
      target[name] = value;
    }
    return target;
  }

  readType() {
    const props = this.annotations();
    const name = this.tk.next('name').val;
    let schema;
    if (name === 'record' || name === 'error') schema = this.record(name);
    else if (name === 'enum') schema = this.enumeration();
    else if (name === 'fixed') schema = this.fixed();
    else if (name === 'array' || name === 'map') {
      this.tk.next('<');
      schema = { type: name, [name === 'array' ? 'items' : 'values']: this.readType() };
      this.tk.next('>');
    } else if (name === 'union') {
      schema = [];
      this.tk.next('{');
      do schema.push(this.readType()); while (this.tk.next(',', true));
      this.tk.next('}');
    } else schema = name === 'void' ? 'null' : (this.typeRefs[name] ? { ...this.typeRefs[name] } : name);
    if (Object.keys(props).length) {
      if (Array.isArray(schema)) throw new Error('union annotations are not supported');
      schema = Object.assign(typeof schema === 'string' ? { type: schema } : schema, props);
    }
    return schema;
  }

  field() {
    const doc = this.readDoc();
    let type = this.readType();
    if (this.tk.next('?', true)) type = ['null', type];
    const field = { name: this.tk.next('name').val, type };
    if (doc) field.doc = doc;
    if (this.tk.next('=', true)) field.default = this.tk.next().val;
    return field;
  }

  record(kind) {
    const schema = { type: 'record', name: this.tk.next('name').val, fields: [] };
    if (kind === 'error') schema.error = true;
    this.tk.next('{');
    while (!this.tk.next('}', true)) { schema.fields.push(this.field()); this.tk.next(';'); }
    return schema;
  }

  enumeration() {
    const schema = { type: 'enum', name: this.tk.next('name').val, symbols: [] };
    this.tk.next('{');
    while (!this.tk.next('}', true)) { schema.symbols.push(this.tk.next('name').val); this.tk.next(',', true); }
    if (this.tk.next('=', true)) schema.default = this.tk.next('name').val;
    return schema;
  }

  fixed() {
    const name = this.tk.next('name').val;
    this.tk.next('('); const size = this.tk.next('number').val; this.tk.next(')');
    return { type: 'fixed', name, size };
  }

  message() {
    const response = this.readType();
    const name = this.tk.next('name').val;
    const message = { request: [], response };
    this.tk.next('(');
    if (!this.tk.next(')', true)) {
      do message.request.push(this.field()); while (this.tk.next(',', true));
      this.tk.next(')');
    }
    if (this.tk.next('throws', true)) {
      message.errors = [];
      do message.errors.push(this.readType()); while (this.tk.next(',', true));
    }
    if (this.tk.next('oneway', true) || this.tk.next('one-way', true)) message.oneWay = true;
    this.tk.next(';');
    return [name, message];
  }

  readProtocol() {
    const imports = [];
    while (this.tk.next('import', true)) {
      const kind = this.tk.next('name').val;
      this.tk.next('('); const name = this.tk.next('string').val; this.tk.next(')'); this.tk.next(';');
      imports.push({ kind, name });
    }
    const doc = this.readDoc();
    const annotations = this.annotations();
    this.tk.next('protocol');
    const protocol = { ...annotations, protocol: this.tk.next('name').val, types: [], messages: {}, imports };
    if (doc) protocol.doc = doc;
    this.tk.next('{');
    while (!this.tk.next('}', true)) {
      const itemDoc = this.readDoc();
      const position = this.tk.pos;
      const token = this.tk.next();
      this.tk.pos = position;
      if (['record', 'error', 'enum', 'fixed'].includes(token.val)) {
        const type = this.readType(); if (itemDoc) type.doc = itemDoc; protocol.types.push(type); this.tk.next(';', true);
      } else {
        const [name, message] = this.message(); if (itemDoc) message.doc = itemDoc;
        if (protocol.messages[name]) throw new Error(`duplicate message: ${name}`);
        protocol.messages[name] = message;
      }
    }
    this.tk.next('(eof)');
    return protocol;
  }
}

function read(source, options) {
  const text = String(source);
  const tk = new Tokenizer(text);
  const first = tk.next();
  return first.val === 'protocol' || first.val === 'import' ? Reader.readProtocol(text, options) : Reader.readSchema(text, options);
}

function assembleProtocol(source, options = {}, filename) {
  const protocol = typeof source === 'string' ? Reader.readProtocol(source, options) : source;
  const hook = options.importHook || ((name, parent) => {
    const file = path.resolve(parent ? path.dirname(parent) : process.cwd(), name);
    return { path: file, contents: fs.readFileSync(file, 'utf8') };
  });
  const types = [], messages = {};
  for (const entry of protocol.imports || []) {
    const loaded = hook(entry.name, filename);
    const text = typeof loaded === 'string' ? loaded : loaded.contents;
    if (text == null) throw new Error(`unresolvable import: ${entry.name}`);
    if (entry.kind === 'schema') types.push(JSON.parse(text));
    else {
      const imported = entry.kind === 'idl' ? assembleProtocol(text, options, loaded.path) : JSON.parse(text);
      types.push(...(imported.types || [])); Object.assign(messages, imported.messages || {});
    }
  }
  protocol.types = [...types, ...(protocol.types || [])];
  protocol.messages = { ...messages, ...(protocol.messages || {}) };
  const namespace = protocolNamespace(protocol); if (namespace && !protocol.namespace) protocol.namespace = namespace;
  delete protocol.imports;
  return protocol;
}

module.exports = { Tokenizer, assembleProtocol, read, readProtocol: Reader.readProtocol, readSchema: Reader.readSchema };
