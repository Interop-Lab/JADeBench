'use strict';

const fs = require('fs');
const path = require('path');

const TYPE_REFS = {
  date: { type: 'int', logicalType: 'date' },
  decimal: { type: 'bytes', logicalType: 'decimal' },
  time_ms: { type: 'long', logicalType: 'time-millis' },
  timestamp_ms: { type: 'long', logicalType: 'timestamp-millis' },
};

const PRIMITIVE_TYPES = new Set([
  'null', 'boolean', 'int', 'long', 'float', 'double', 'bytes', 'string',
]);

function copyOwnProperties(target, source) {
  if (!source) return target;
  for (const key of Object.keys(source)) target[key] = source[key];
  return target;
}

function impliedNamespace(name) {
  const index = name.lastIndexOf('.');
  return index < 0 ? undefined : name.slice(0, index);
}

function jsonEnd(source, start) {
  const opening = source[start];
  const closing = opening === '{' ? '}' : opening === '[' ? ']' : undefined;
  if (!closing) return -1;
  const stack = [closing];
  let quoted = false;
  let escaped = false;
  for (let index = start + 1; index < source.length; index++) {
    const char = source[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === '{') stack.push('}');
    else if (char === '[') stack.push(']');
    else if (char === stack[stack.length - 1] && stack.pop() && !stack.length) return index + 1;
  }
  return -1;
}

function extractJavadoc(comment) {
  const lines = comment
    .replace(/^[ \t]+|[ \t]+$/g, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''));
  if (lines[0] === '') lines.shift();
  if (lines[lines.length - 1] === '') lines.pop();
  return lines.join('\n');
}

function protocolNamespace(protocol) {
  if (protocol.namespace !== undefined) return protocol.namespace;
  const match = /^(.*)\.[^.]+$/.exec(protocol.protocol || '');
  return match ? match[1] : '';
}

class Tokenizer {
  constructor(source) {
    this._str = String(source);
    this.pos = 0;
    this.emitJavadoc = false;
    this._pendingJavadoc = null;
  }

  next(expected) {
    const token = this._nextToken();
    if (expected === undefined) return token;

    let matches;
    let silent = false;
    if (typeof expected === 'string') {
      matches = token.val === expected;
    } else {
      silent = Boolean(expected.silent);
      matches = true;
      if (expected.id !== undefined) matches = matches && token.id === expected.id;
      if (expected.val !== undefined) matches = matches && token.val === expected.val;
    }
    if (matches) return token;
    if (silent) {
      this.pos = token.pos;
      return undefined;
    }
    const description = typeof expected === 'string'
      ? JSON.stringify(expected)
      : expected.id ? `a ${expected.id}` : JSON.stringify(expected.val);
    this.error(`expected ${description}`, token);
  }

  error(message, token = {}) {
    const position = token.pos === undefined ? this.pos : token.pos;
    const prefix = this._str.slice(0, position);
    const lineNum = prefix.split('\n').length;
    const lastLineBreak = prefix.lastIndexOf('\n');
    const colNum = position - lastLineBreak;
    const value = token.val === undefined ? '' : `: ${JSON.stringify(token.val)}`;
    const error = new Error(`${message}${value} at line ${lineNum}, column ${colNum}`);
    error.token = token;
    error.lineNum = lineNum;
    error.colNum = colNum;
    throw error;
  }

  _nextToken() {
    this._skip();
    if (this._pendingJavadoc !== null) {
      const token = this._pendingJavadoc;
      this._pendingJavadoc = null;
      return token;
    }

    const start = this.pos;
    if (start >= this._str.length) return { id: '(eof)', val: '(eof)', pos: start };
    const char = this._str[start];

    if (char === '"') {
      const end = this._endOfString();
      const raw = this._str.slice(start, end);
      this.pos = end;
      try {
        return { id: 'string', val: JSON.parse(raw), pos: start };
      } catch {
        this.error('invalid JSON', { pos: start, val: raw });
      }
    }

    const numberMatch = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(this._str.slice(start));
    if (numberMatch) {
      this.pos += numberMatch[0].length;
      return { id: 'number', val: Number(numberMatch[0]), pos: start };
    }

    if (char === '`') {
      const end = this._str.indexOf('`', start + 1);
      if (end < 0) this.error('unterminated escaped name', { pos: start, val: char });
      this.pos = end + 1;
      return { id: 'name', val: this._str.slice(start + 1, end), pos: start };
    }

    const nameMatch = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(this._str.slice(start));
    if (nameMatch) {
      this.pos += nameMatch[0].length;
      return { id: 'name', val: nameMatch[0], pos: start };
    }

    this.pos++;
    return { id: 'operator', val: char, pos: start };
  }

  _skip() {
    while (this.pos < this._str.length) {
      const whitespace = /^\s+/.exec(this._str.slice(this.pos));
      if (whitespace) {
        this.pos += whitespace[0].length;
        continue;
      }
      if (this._str.startsWith('//', this.pos)) {
        const end = this._str.indexOf('\n', this.pos + 2);
        this.pos = end < 0 ? this._str.length : end + 1;
        continue;
      }
      if (this._str.startsWith('/*', this.pos)) {
        const start = this.pos;
        const end = this._str.indexOf('*/', start + 2);
        if (end < 0) this.error('unterminated comment', { pos: start, val: '/*' });
        const isJavadoc = this._str[start + 2] === '*';
        const bodyStart = isJavadoc ? start + 3 : start + 2;
        this.pos = end + 2;
        if (isJavadoc && this.emitJavadoc) {
          this._pendingJavadoc = {
            id: 'javadoc',
            val: extractJavadoc(this._str.slice(bodyStart, end)),
            pos: start,
          };
          return;
        }
        continue;
      }
      break;
    }
  }

  _endOfString() {
    let escaped = false;
    for (let index = this.pos + 1; index < this._str.length; index++) {
      const char = this._str[index];
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') return index + 1;
    }
    this.error('unterminated string', { pos: this.pos, val: '"' });
  }

  _endOfJson() {
    const end = jsonEnd(this._str, this.pos);
    if (end < 0) this.error('invalid JSON', { pos: this.pos });
    return end;
  }
}

class Reader {
  constructor(source, options = {}) {
    this._tk = new Tokenizer(source);
    this._tk.emitJavadoc = true;
    this._ackVoidMessages = Boolean(options.ackVoidMessages);
    this._implicitTags = !options.delimitedCollections;
    this._typeRefs = copyOwnProperties(copyOwnProperties({}, TYPE_REFS), options.typeRefs);
    this._lookahead = null;
  }

  static readProtocol(source, options) {
    const reader = new Reader(source, options);
    const protocol = reader._readProtocol();
    if (protocol.imports && protocol.imports.length) {
      throw new Error('unresolvable import');
    }
    return protocol;
  }

  static readSchema(source, options) {
    const reader = new Reader(source, options);
    const doc = reader._readJavadoc();
    const schema = reader._readType();
    if (doc && schema && typeof schema === 'object' && !Array.isArray(schema)) schema.doc = doc;
    reader._expectEof();
    return schema;
  }

  _next() {
    if (this._lookahead) {
      const token = this._lookahead;
      this._lookahead = null;
      return token;
    }
    return this._tk.next();
  }

  _peek() {
    if (!this._lookahead) this._lookahead = this._tk.next();
    return this._lookahead;
  }

  _accept(value) {
    if (this._peek().val !== value) return false;
    this._next();
    return true;
  }

  _expect(value) {
    const token = this._next();
    if (token.val !== value) this._tk.error(`expected ${JSON.stringify(value)}`, token);
    return token;
  }

  _expectId(id = 'name') {
    const token = this._next();
    if (token.id !== id) this._tk.error(`expected ${id}`, token);
    return token.val;
  }

  _expectEof() {
    const token = this._next();
    if (token.id !== '(eof)') this._tk.error('expected end of input', token);
  }

  _readProtocol() {
    const imports = this._readImports();
    const doc = this._readJavadoc();
    const annotations = this._readAnnotations();
    this._expect('protocol');
    const name = this._expectId();
    this._expect('{');

    const protocol = copyOwnProperties({ protocol: name }, annotations);
    if (doc) protocol.doc = doc;
    protocol.types = [];
    protocol.messages = {};

    while (!this._accept('}')) {
      if (this._peek().id === '(eof)') this._tk.error('unexpected end of protocol', this._peek());
      const itemDoc = this._readJavadoc();
      const itemAnnotations = this._readAnnotations();
      const first = this._peek();

      if (['record', 'error', 'fixed', 'enum'].includes(first.val)) {
        const type = this._readType(itemAnnotations, itemDoc);
        protocol.types.push(type);
        this._accept(';');
        continue;
      }

      const isVoid = first.val === 'void';
      const response = isVoid ? (this._next(), 'null') : this._readType(itemAnnotations, itemDoc);
      const messageName = this._expectId();
      if (Object.prototype.hasOwnProperty.call(protocol.messages, messageName)) {
        throw new Error(`duplicate message: ${messageName}`);
      }
      protocol.messages[messageName] = this._readMessage(response);
      if (isVoid && !this._ackVoidMessages) protocol.messages[messageName]['one-way'] = true;
    }
    this._accept(';');
    this._expectEof();
    if (!protocol.types.length) delete protocol.types;
    if (!Object.keys(protocol.messages).length) delete protocol.messages;
    if (imports.length) protocol.imports = imports;
    return protocol;
  }

  _readAnnotations() {
    const annotations = {};
    while (this._accept('@')) {
      const name = this._expectId();
      let value = true;
      if (this._accept('(')) {
        value = this._readJsonValue();
        this._expect(')');
      }
      annotations[name] = value;
    }
    return annotations;
  }

  _readMessage(response) {
    const message = { request: [], response };
    this._expect('(');
    if (!this._accept(')')) {
      do message.request.push(this._readField()); while (this._accept(','));
      this._expect(')');
    }
    copyOwnProperties(message, this._readAnnotations());
    if (this._accept('throws')) {
      message.errors = [];
      do message.errors.push(this._readType()); while (this._accept(','));
    }
    if (this._accept('oneway') || (this._accept('one-way'))) message['one-way'] = true;
    this._expect(';');
    return message;
  }

  _readJavadoc() {
    const token = this._peek();
    if (token.id !== 'javadoc') return undefined;
    return this._next().val;
  }

  _readField() {
    const doc = this._readJavadoc();
    const annotations = this._readAnnotations();
    let type = this._readType();
    const nullable = this._accept('?');
    const name = this._expectId();
    const field = copyOwnProperties({ name, type }, annotations);
    if (doc) field.doc = doc;
    if (nullable) {
      field.type = [type, 'null'];
      field.default = null;
    }
    if (this._accept('=')) field.default = this._readJsonValue();
    return field;
  }

  _readType(existingAnnotations, existingDoc) {
    const doc = existingDoc === undefined ? this._readJavadoc() : existingDoc;
    const annotations = existingAnnotations || this._readAnnotations();
    const token = this._next();
    if (token.id !== 'name') this._tk.error('expected type name', token);

    let type;
    switch (token.val) {
      case 'record': type = this._readRecord(false); break;
      case 'error': type = this._readRecord(true); break;
      case 'fixed': type = this._readFixed(); break;
      case 'enum': type = this._readEnum(); break;
      case 'map': type = this._readMap(); break;
      case 'array': type = this._readArray(); break;
      case 'union': type = this._readUnion(); break;
      default:
        if (this._implicitTags && this._typeRefs[token.val]) type = copyOwnProperties({}, this._typeRefs[token.val]);
        else type = token.val;
    }

    if (Array.isArray(type) && Object.keys(annotations).length) {
      throw new Error('union annotations are not supported');
    }

    if (type && typeof type === 'object' && !Array.isArray(type)) {
      copyOwnProperties(type, annotations);
      if (doc) type.doc = doc;
    } else if (Object.keys(annotations).length || doc) {
      const wrapped = { type };
      copyOwnProperties(wrapped, annotations);
      if (doc) wrapped.doc = doc;
      type = wrapped;
    }
    return type;
  }

  _readFixed() {
    const name = this._expectId();
    this._expect('(');
    const size = this._expectId('number');
    this._expect(')');
    return { type: 'fixed', name, size: parseInt(size, 10) };
  }

  _readMap() {
    const delimited = this._accept('<');
    if (!delimited && !this._implicitTags) this._tk.error('expected "<"', this._peek());
    const values = this._readType();
    if (delimited) this._expect('>');
    return { type: 'map', values };
  }

  _readArray() {
    const delimited = this._accept('<');
    if (!delimited && !this._implicitTags) this._tk.error('expected "<"', this._peek());
    const items = this._readType();
    if (delimited) this._expect('>');
    return { type: 'array', items };
  }

  _readEnum() {
    const name = this._expectId();
    const schema = { type: 'enum', name, symbols: [] };
    this._expect('{');
    while (!this._accept('}')) {
      schema.symbols.push(this._expectId());
      if (!this._accept(',')) this._accept(';');
    }
    if (this._accept('=')) schema.default = this._expectId();
    return schema;
  }

  _readUnion() {
    const branches = [];
    this._expect('{');
    while (!this._accept('}')) {
      branches.push(this._readType());
      this._accept(',');
    }
    return branches;
  }

  _readRecord(isError) {
    const name = this._expectId();
    const schema = { type: isError ? 'error' : 'record', name, fields: [] };
    this._expect('{');
    while (!this._accept('}')) {
      schema.fields.push(this._readField());
      this._expect(';');
    }
    return schema;
  }

  _readImports() {
    const imports = [];
    while (this._peek().val === 'import') {
      this._next();
      const kind = this._expectId();
      if (!['idl', 'protocol', 'schema'].includes(kind)) this._tk.error(`invalid import kind: ${kind}`);
      const importedPath = this._expectId('string');
      this._expect(';');
      imports.push({ kind, path: importedPath });
    }
    return imports;
  }

  _readJsonValue() {
    const token = this._next();
    if (token.id === 'json' || token.id === 'string' || token.id === 'number') return token.val;
    if (token.id === 'name' && /^(?:true|false|null)$/.test(token.val)) return JSON.parse(token.val);
    if (token.val === '{' || token.val === '[') {
      const end = jsonEnd(this._tk._str, token.pos);
      if (end < 0) this._tk.error('invalid JSON', token);
      const raw = this._tk._str.slice(token.pos, end);
      try {
        this._tk.pos = end;
        return JSON.parse(raw);
      } catch {
        this._tk.error('invalid JSON', token);
      }
    }
    this._tk.error('expected JSON value', token);
  }
}

function tryReadFileSync(value) {
  if (typeof value !== 'string') return value;
  try {
    return fs.readFileSync(value, 'utf8');
  } catch {
    return value;
  }
}

function createImportHook() {
  return (info, callback) => {
    const importedPath = info.importerPath
      ? path.resolve(path.dirname(info.importerPath), info.path)
      : path.resolve(info.path);
    fs.readFile(importedPath, 'utf8', (error, contents) => {
      callback(error, error ? undefined : { path: importedPath, contents });
    });
  };
}

function createSyncImportHook() {
  return (info) => {
    const importedPath = info.importerPath
      ? path.resolve(path.dirname(info.importerPath), info.path)
      : path.resolve(info.path);
    return { path: importedPath, contents: fs.readFileSync(importedPath, 'utf8') };
  };
}

function mergeProtocol(target, imported) {
  if (imported.types) {
    for (const schema of imported.types) {
      if (schema && typeof schema === 'object' && !schema.namespace) {
        const namespace = protocolNamespace(imported);
        if (namespace) schema.namespace = namespace;
      }
      target.types.unshift(schema);
    }
  }
  if (imported.messages) {
    for (const name of Object.keys(imported.messages)) {
      if (target.messages[name]) throw new Error(`duplicate message: ${name}`);
      target.messages[name] = imported.messages[name];
    }
  }
}

function assembleProtocol(rootPath, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  const importHook = options.importHook || createImportHook();

  function load(info, done) {
    importHook(info, (error, imported) => {
      if (error) return done(error);
      try {
        const contents = imported && imported.contents !== undefined ? imported.contents : imported;
        const importedPath = imported && imported.path ? imported.path : info.path;
        if (info.kind === 'schema') return done(null, { types: [JSON.parse(contents)], messages: {} });
        if (info.kind === 'protocol') return done(null, JSON.parse(contents));

        const protocol = new Reader(contents, options)._readProtocol();
        const pending = protocol.imports || [];
        delete protocol.imports;
        protocol.types = protocol.types || [];
        protocol.messages = protocol.messages || {};
        let index = 0;
        const next = (nestedError, nestedProtocol) => {
          if (nestedError) return done(nestedError);
          if (nestedProtocol) mergeProtocol(protocol, nestedProtocol);
          if (index >= pending.length) return done(null, protocol);
          const entry = pending[index++];
          load({ ...entry, importerPath: importedPath }, next);
        };
        next();
      } catch (parseError) {
        done(parseError);
      }
    });
  }

  load({ path: rootPath, kind: 'idl' }, (error, protocol) => {
    if (error) return callback(error);
    if (!protocol) return callback(new Error('empty root import'));
    callback(null, protocol);
  });
}

function read(input, options = {}) {
  if (input && typeof input === 'object') return input;
  const source = tryReadFileSync(input);
  try {
    return JSON.parse(source);
  } catch {
    // Continue with IDL parsing.
  }

  const importHook = options.importHook || createSyncImportHook();
  const reader = new Reader(source, options);
  const first = reader._peek();
  const looksLikeProtocol = first.val === 'import' || first.val === 'protocol' || /\bprotocol\s+[`A-Za-z_]/.test(source);
  if (looksLikeProtocol) {
    const protocol = reader._readProtocol();
    if (protocol.imports && protocol.imports.length) {
      const merged = { ...protocol, types: protocol.types || [], messages: protocol.messages || {} };
      const importerPath = typeof input === 'string' && source !== input ? input : undefined;
      for (const entry of protocol.imports) {
        const imported = importHook({ ...entry, importerPath });
        const contents = imported && imported.contents !== undefined ? imported.contents : imported;
        let value;
        if (entry.kind === 'idl') value = Reader.readProtocol(contents, options);
        else if (entry.kind === 'protocol') value = JSON.parse(contents);
        else value = { types: [JSON.parse(contents)], messages: {} };
        mergeProtocol(merged, value);
      }
      delete merged.imports;
      return merged;
    }
    return protocol;
  }
  return Reader.readSchema(source, options);
}

module.exports = {
  Tokenizer,
  assembleProtocol,
  read,
  readProtocol: Reader.readProtocol,
  readSchema: Reader.readSchema,
};
