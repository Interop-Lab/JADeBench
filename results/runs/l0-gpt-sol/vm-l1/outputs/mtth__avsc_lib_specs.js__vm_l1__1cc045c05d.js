'use strict';

const fs = require('fs');
const path = require('path');

const TYPE_REFS = {
  date: { type: 'int', logicalType: 'date' },
  decimal: { type: 'bytes', logicalType: 'decimal' },
  time_ms: { type: 'long', logicalType: 'time-millis' },
  timestamp_ms: { type: 'long', logicalType: 'timestamp-millis' }
};

const PRIMITIVES = new Set([
  'null',
  'boolean',
  'int',
  'long',
  'float',
  'double',
  'bytes',
  'string'
]);

class Tokenizer {
  constructor(str) {
    this.str = String(str);
    this.pos = 0;
    this.length = this.str.length;
    this.comments = [];
  }

  next() {
    this._skip();

    if (this.pos >= this.length) {
      return undefined;
    }

    const pos = this.pos;
    const c = this.str[this.pos];

    if (c === '"' || c === "'") {
      return {
        type: 'string',
        val: this._readString(),
        pos
      };
    }

    if (/[A-Za-z_$]/.test(c)) {
      this.pos++;
      while (
        this.pos < this.length &&
        /[A-Za-z0-9_.$-]/.test(this.str[this.pos])
      ) {
        this.pos++;
      }
      return {
        type: 'name',
        val: this.str.slice(pos, this.pos),
        pos
      };
    }

    if (
      /[0-9]/.test(c) ||
      (c === '-' && /[0-9]/.test(this.str[this.pos + 1] || ''))
    ) {
      const match = /^-?(?:0[xX][\da-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/.exec(
        this.str.slice(this.pos)
      );
      if (match) {
        this.pos += match[0].length;
        return {
          type: 'number',
          val: Number(match[0]),
          raw: match[0],
          pos
        };
      }
    }

    const two = this.str.slice(this.pos, this.pos + 2);
    if (
      two === '==' ||
      two === '!=' ||
      two === '<=' ||
      two === '>=' ||
      two === '&&' ||
      two === '||'
    ) {
      this.pos += 2;
      return { type: 'symbol', val: two, pos };
    }

    this.pos++;
    return { type: 'symbol', val: c, pos };
  }

  error(message, token) {
    const pos = token && token.pos !== undefined ? token.pos : this.pos;
    const before = this.str.slice(0, pos);
    const line = before.split(/\r\n?|\n/).length;
    const column = pos - Math.max(before.lastIndexOf('\n'), before.lastIndexOf('\r'));
    const err = new Error(`${message} at line ${line}, column ${column}`);
    err.pos = pos;
    err.line = line;
    err.column = column;
    return err;
  }

  _skip() {
    while (this.pos < this.length) {
      const c = this.str[this.pos];

      if (/\s/.test(c)) {
        this.pos++;
        continue;
      }

      if (c === '/' && this.str[this.pos + 1] === '/') {
        const start = this.pos;
        this.pos += 2;
        while (
          this.pos < this.length &&
          this.str[this.pos] !== '\n' &&
          this.str[this.pos] !== '\r'
        ) {
          this.pos++;
        }
        this.comments.push(this.str.slice(start, this.pos));
        continue;
      }

      if (c === '/' && this.str[this.pos + 1] === '*') {
        const start = this.pos;
        const end = this.str.indexOf('*/', this.pos + 2);
        if (end < 0) {
          throw this.error('Unterminated comment', { pos: start });
        }
        this.pos = end + 2;
        this.comments.push(this.str.slice(start, this.pos));
        continue;
      }

      break;
    }
  }

  _endOf(pattern) {
    const start = this.pos;
    while (this.pos < this.length && !pattern.test(this.str[this.pos])) {
      this.pos++;
    }
    return this.str.slice(start, this.pos);
  }

  _readString() {
    const quote = this.str[this.pos++];
    let out = '';

    while (this.pos < this.length) {
      const c = this.str[this.pos++];

      if (c === quote) {
        return out;
      }

      if (c !== '\\') {
        out += c;
        continue;
      }

      if (this.pos >= this.length) {
        break;
      }

      const escaped = this.str[this.pos++];
      switch (escaped) {
        case '"':
        case "'":
        case '\\':
        case '/':
          out += escaped;
          break;
        case 'b':
          out += '\b';
          break;
        case 'f':
          out += '\f';
          break;
        case 'n':
          out += '\n';
          break;
        case 'r':
          out += '\r';
          break;
        case 't':
          out += '\t';
          break;
        case 'u': {
          const hex = this.str.slice(this.pos, this.pos + 4);
          if (!/^[\da-fA-F]{4}$/.test(hex)) {
            throw this.error('Invalid Unicode escape');
          }
          out += String.fromCharCode(parseInt(hex, 16));
          this.pos += 4;
          break;
        }
        default:
          out += escaped;
      }
    }

    throw this.error('Unterminated string');
  }

  _endOfString() {
    return this._readString();
  }

  _endOfJson() {
    this._skip();
    const start = this.pos;
    const first = this.str[this.pos];

    if (first === '"' || first === "'") {
      return this._readString();
    }

    if (first !== '{' && first !== '[') {
      return this._endOf(/[,;)\]}]/);
    }

    const openings = [];
    let quote = null;
    let escaped = false;

    while (this.pos < this.length) {
      const c = this.str[this.pos++];

      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (c === '\\') {
          escaped = true;
        } else if (c === quote) {
          quote = null;
        }
        continue;
      }

      if (c === '"' || c === "'") {
        quote = c;
      } else if (c === '{' || c === '[') {
        openings.push(c);
      } else if (c === '}' || c === ']') {
        const opening = openings.pop();
        if (
          (opening === '{' && c !== '}') ||
          (opening === '[' && c !== ']')
        ) {
          throw this.error('Mismatched JSON delimiter');
        }
        if (!openings.length) {
          return this.str.slice(start, this.pos);
        }
      }
    }

    throw this.error('Unterminated JSON value');
  }
}

class Reader {
  constructor(str, opts) {
    this.str = String(str);
    this.opts = opts || {};
    this.tokenizer = new Tokenizer(this.str);
    this.tokens = [];
    this.index = 0;
    this.pendingDoc = undefined;

    let token;
    while ((token = this.tokenizer.next()) !== undefined) {
      this.tokens.push(token);
    }
  }

  static readProtocol(str, opts) {
    return new Reader(str, opts)._readProtocol();
  }

  static readSchema(str, opts) {
    return new Reader(str, opts)._readSchema();
  }

  _peek(offset) {
    return this.tokens[this.index + (offset || 0)];
  }

  _value(offset) {
    const token = this._peek(offset);
    return token && token.val;
  }

  _next() {
    return this.tokens[this.index++];
  }

  _accept(value) {
    if (this._value() === value) {
      return this._next();
    }
    return undefined;
  }

  _expect(value) {
    const token = this._next();
    if (!token || token.val !== value) {
      throw this.tokenizer.error(
        `Expected ${JSON.stringify(value)}, got ${
          token ? JSON.stringify(token.val) : 'end of input'
        }`,
        token
      );
    }
    return token;
  }

  _expectName() {
    const token = this._next();
    if (!token || (token.type !== 'name' && token.type !== 'string')) {
      throw this.tokenizer.error('Expected a name', token);
    }
    return token.val;
  }

  _readValue() {
    const token = this._next();
    if (!token) {
      throw this.tokenizer.error('Expected a value');
    }

    if (token.type === 'string' || token.type === 'number') {
      return token.val;
    }

    if (token.val === 'true') {
      return true;
    }
    if (token.val === 'false') {
      return false;
    }
    if (token.val === 'null') {
      return null;
    }

    if (token.val === '[') {
      const values = [];
      while (!this._accept(']')) {
        values.push(this._readValue());
        if (!this._accept(',')) {
          this._expect(']');
          break;
        }
      }
      return values;
    }

    if (token.val === '{') {
      const value = {};
      while (!this._accept('}')) {
        const key = this._expectName();
        this._expect(':');
        value[key] = this._readValue();
        if (!this._accept(',')) {
          this._expect('}');
          break;
        }
      }
      return value;
    }

    return token.val;
  }

  _readAnnotations(target) {
    target = target || {};

    while (this._accept('@')) {
      const name = this._expectName();
      let value = true;

      if (this._accept('(')) {
        const args = [];
        if (!this._accept(')')) {
          do {
            args.push(this._readValue());
          } while (this._accept(','));
          this._expect(')');
        }
        value = args.length < 2 ? args[0] : args;
      }

      target[name] = value;
    }

    return target;
  }

  _readSchema() {
    const annotations = this._readAnnotations({});
    const schema = this._readType(true);
    return Object.keys(annotations).length
      ? this._applyAnnotations(schema, annotations)
      : schema;
  }

  _readProtocol() {
    const annotations = this._readAnnotations({});
    this._expect('protocol');

    const protocol = {
      protocol: this._expectName()
    };

    this._applyAnnotations(protocol, annotations);
    this._expect('{');

    const imports = [];
    const types = [];
    const messages = {};

    while (!this._accept('}')) {
      if (!this._peek()) {
        throw this.tokenizer.error('Unterminated protocol');
      }

      const memberAnnotations = this._readAnnotations({});

      if (this._accept('import')) {
        const kind = this._expectName();
        const file = this._readValue();
        this._accept(';');
        imports.push({ kind, name: file });
        continue;
      }

      if (
        this._value() === 'record' ||
        this._value() === 'error' ||
        this._value() === 'enum' ||
        this._value() === 'fixed'
      ) {
        const type = this._readNamedType(memberAnnotations);
        types.push(type);
        this._accept(';');
        continue;
      }

      const response = this._readType();
      const name = this._expectName();
      this._expect('(');

      const request = [];
      if (!this._accept(')')) {
        do {
          const fieldAnnotations = this._readAnnotations({});
          const field = this._readField(false);
          this._applyAnnotations(field, fieldAnnotations);
          request.push(field);
        } while (this._accept(','));
        this._expect(')');
      }

      const message = { request, response };

      if (this._accept('throws')) {
        message.errors = [];
        do {
          message.errors.push(this._readType());
        } while (this._accept(','));
      }

      if (this._accept('oneway')) {
        message.oneWay = true;
      }

      this._accept(';');
      this._applyAnnotations(message, memberAnnotations);
      messages[name] = message;
    }

    if (types.length) {
      protocol.types = types;
    }
    if (Object.keys(messages).length) {
      protocol.messages = messages;
    }
    if (imports.length) {
      Object.defineProperty(protocol, 'imports', {
        value: imports,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }

    return protocol;
  }

  _readNamedType(annotations) {
    const kind = this._expectName();

    switch (kind) {
      case 'record':
      case 'error':
        return this._readRecord(kind, annotations);
      case 'enum':
        return this._readEnum(annotations);
      case 'fixed':
        return this._readFixed(annotations);
      default:
        throw this.tokenizer.error(`Invalid named type: ${kind}`);
    }
  }

  _readRecord(kind, annotations) {
    const schema = {
      type: kind,
      name: this._expectName(),
      fields: []
    };

    this._applyAnnotations(schema, annotations);
    this._expect('{');

    while (!this._accept('}')) {
      const fieldAnnotations = this._readAnnotations({});
      const field = this._readField(true);
      this._applyAnnotations(field, fieldAnnotations);
      schema.fields.push(field);
      this._accept(';');
    }

    return schema;
  }

  _readEnum(annotations) {
    const schema = {
      type: 'enum',
      name: this._expectName(),
      symbols: []
    };

    this._applyAnnotations(schema, annotations);
    this._expect('{');

    while (!this._accept('}')) {
      schema.symbols.push(this._expectName());
      if (!this._accept(',')) {
        this._accept(';');
      }
    }

    return schema;
  }

  _readFixed(annotations) {
    const schema = {
      type: 'fixed',
      name: this._expectName()
    };

    this._applyAnnotations(schema, annotations);
    this._expect('(');
    schema.size = this._readValue();
    this._expect(')');
    return schema;
  }

  _readField(allowDefault) {
    const type = this._readType();
    const name = this._expectName();
    const field = { name, type };

    if (allowDefault && this._accept('=')) {
      field.default = this._readValue();
    }

    return field;
  }

  _readType(allowNamedDefinition) {
    const annotations = this._readAnnotations({});
    let type;

    if (
      allowNamedDefinition &&
      (this._value() === 'record' ||
        this._value() === 'error' ||
        this._value() === 'enum' ||
        this._value() === 'fixed')
    ) {
      type = this._readNamedType(annotations);
      return type;
    }

    const name = this._expectName();

    if (name === 'array') {
      this._expect('<');
      type = { type: 'array', items: this._readType() };
      this._expect('>');
    } else if (name === 'map') {
      this._expect('<');
      type = { type: 'map', values: this._readType() };
      this._expect('>');
    } else if (name === 'union') {
      const branches = [];
      this._expect('{');
      while (!this._accept('}')) {
        branches.push(this._readType());
        if (!this._accept(',')) {
          this._accept(';');
        }
      }
      type = branches;
    } else if (name === 'decimal') {
      const logical = { type: 'bytes', logicalType: 'decimal' };
      if (this._accept('(')) {
        logical.precision = this._readValue();
        if (this._accept(',')) {
          logical.scale = this._readValue();
        }
        this._expect(')');
      }
      type = logical;
    } else if (TYPE_REFS[name]) {
      type = Object.assign({}, TYPE_REFS[name]);
    } else {
      type = name;
    }

    if (this._accept('?')) {
      type = ['null', type];
    }

    return this._applyAnnotations(type, annotations);
  }

  _applyAnnotations(schema, annotations) {
    const keys = Object.keys(annotations);
    if (!keys.length) {
      return schema;
    }

    if (
      schema === null ||
      typeof schema !== 'object' ||
      Array.isArray(schema)
    ) {
      schema = { type: schema };
    }

    for (const key of keys) {
      const value = annotations[key];
      switch (key) {
        case 'namespace':
        case 'doc':
        case 'aliases':
        case 'order':
        case 'logicalType':
        case 'precision':
        case 'scale':
        case 'java-class':
        case 'java-key-class':
          schema[key] = value;
          break;
        default:
          schema[key] = value;
      }
    }

    return schema;
  }
}

function extractJavadoc(comment) {
  if (comment == null) {
    return undefined;
  }

  let str = String(comment).trim();

  if (str.startsWith('/**')) {
    str = str.slice(3);
  } else if (str.startsWith('/*')) {
    str = str.slice(2);
  } else if (str.startsWith('//')) {
    str = str
      .split(/\r\n?|\n/)
      .map(line => line.replace(/^\s*\/\/\s?/, ''))
      .join('\n');
  }

  if (str.endsWith('*/')) {
    str = str.slice(0, -2);
  }

  str = str
    .split(/\r\n?|\n/)
    .map(line => line.replace(/^\s*\*\s?/, '').replace(/\s+$/, ''))
    .join('\n')
    .trim();

  return str || undefined;
}

function protocolNamespace(protocol) {
  if (!protocol || typeof protocol !== 'object') {
    return undefined;
  }

  if (protocol.namespace) {
    return protocol.namespace;
  }

  const name = protocol.protocol || protocol.name;
  if (typeof name !== 'string') {
    return undefined;
  }

  const index = name.lastIndexOf('.');
  return index < 0 ? undefined : name.slice(0, index);
}

function mergeNamedTypes(target, source) {
  const types = target.types || (target.types = []);
  const names = new Set(types.map(type => type && type.name));

  for (const type of source || []) {
    if (!type || !names.has(type.name)) {
      types.push(type);
      if (type && type.name) {
        names.add(type.name);
      }
    }
  }

  if (!types.length) {
    delete target.types;
  }
}

function mergeMessages(target, source) {
  if (!source) {
    return;
  }
  target.messages = Object.assign(target.messages || {}, source);
}

function normalizeImport(imported, kind) {
  if (kind === 'schema') {
    return { types: [imported] };
  }
  return imported;
}

function assembleProtocol(protocol, basePath, opts) {
  opts = opts || {};
  basePath = basePath || process.cwd();

  if (typeof protocol === 'string') {
    protocol = Reader.readProtocol(protocol, opts);
  }

  const imports = protocol.imports || [];
  if (!imports.length) {
    return protocol;
  }

  const importHook =
    opts.importHook ||
    function defaultImportHook(info, cb) {
      fs.readFile(info.path, 'utf8', cb);
    };

  const load = info =>
    new Promise((resolve, reject) => {
      let settled = false;
      const done = (err, value) => {
        if (settled) {
          return;
        }
        settled = true;
        err ? reject(err) : resolve(value);
      };

      try {
        const result = importHook(info, done);
        if (result && typeof result.then === 'function') {
          result.then(value => done(null, value), done);
        } else if (result !== undefined && importHook.length < 2) {
          done(null, result);
        }
      } catch (err) {
        done(err);
      }
    });

  return Promise.all(
    imports.map(async entry => {
      const filePath = path.resolve(basePath, entry.name);
      let imported = await load({
        path: filePath,
        kind: entry.kind,
        importer: protocol
      });

      if (Buffer.isBuffer(imported)) {
        imported = imported.toString();
      }

      if (typeof imported === 'string') {
        if (entry.kind === 'idl') {
          imported = Reader.readProtocol(imported, opts);
          imported = await assembleProtocol(
            imported,
            path.dirname(filePath),
            opts
          );
        } else {
          imported = JSON.parse(imported);
        }
      }

      return normalizeImport(imported, entry.kind);
    })
  ).then(importedProtocols => {
    for (const imported of importedProtocols) {
      if (!imported) {
        continue;
      }
      mergeNamedTypes(protocol, imported.types);
      mergeMessages(protocol, imported.messages);
    }

    delete protocol.imports;
    return protocol;
  });
}

function read(str, opts) {
  opts = opts || {};

  if (Buffer.isBuffer(str)) {
    str = str.toString();
  }

  if (str && typeof str === 'object') {
    return str;
  }

  const input = String(str);
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error('Empty schema');
  }

  if (trimmed[0] === '{' || trimmed[0] === '[' || trimmed[0] === '"') {
    return JSON.parse(trimmed);
  }

  if (opts.type === 'schema') {
    return Reader.readSchema(input, opts);
  }

  if (opts.type === 'protocol') {
    return Reader.readProtocol(input, opts);
  }

  const probe = new Reader(input, opts);
  let index = 0;
  while (
    probe.tokens[index] &&
    probe.tokens[index].val === '@'
  ) {
    index += 2;
    if (probe.tokens[index] && probe.tokens[index].val === '(') {
      let depth = 1;
      index++;
      while (probe.tokens[index] && depth) {
        if (probe.tokens[index].val === '(') {
          depth++;
        } else if (probe.tokens[index].val === ')') {
          depth--;
        }
        index++;
      }
    }
  }

  return probe.tokens[index] && probe.tokens[index].val === 'protocol'
    ? probe._readProtocol()
    : probe._readSchema();
}

module.exports = {
  Tokenizer,
  assembleProtocol,
  read,
  readProtocol: Reader.readProtocol,
  readSchema: Reader.readSchema
};
