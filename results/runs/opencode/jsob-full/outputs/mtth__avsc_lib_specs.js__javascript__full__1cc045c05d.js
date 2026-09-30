'use strict';

const fs = require('fs');
const path = require('path');

const DATE_TYPE = { type: 'int', logicalType: 'date' };
const DECIMAL_TYPE = { type: 'bytes', logicalType: 'decimal' };
const TIME_MILLIS_TYPE = { type: 'long', logicalType: 'time-millis' };
const TIMESTAMP_MILLIS_TYPE = { type: 'long', logicalType: 'timestamp-millis' };

const TYPE_REFS = {
  date: DATE_TYPE,
  decimal: DECIMAL_TYPE,
  time_ms: TIME_MILLIS_TYPE,
  timestamp_ms: TIMESTAMP_MILLIS_TYPE,
};

function createImportHook() {
  const imported = Object.create(null);
  return function importFile({ path: importPath, importerPath }, callback) {
    const resolvedPath = path.resolve(path.dirname(importerPath), importPath);
    if (imported[resolvedPath]) {
      process.nextTick(callback);
      return;
    }
    imported[resolvedPath] = true;
    fs.readFile(resolvedPath, { encoding: 'utf8' }, (error, contents) => {
      if (error) return callback(error);
      return callback(null, { contents, path: resolvedPath });
    });
  };
}

function createSyncImportHook() {
  const imported = Object.create(null);
  return function importFile({ path: importPath, importerPath }, callback) {
    const resolvedPath = path.resolve(path.dirname(importerPath), importPath);
    if (imported[resolvedPath]) {
      callback();
      return;
    }
    imported[resolvedPath] = true;
    callback(null, {
      contents: fs.readFileSync(resolvedPath, { encoding: 'utf8' }),
      path: resolvedPath,
    });
  };
}

function tryReadFileSync(value) {
  if (typeof value === 'string' && value.indexOf(path.sep) !== -1) {
    try {
      return fs.readFileSync(value, { encoding: 'utf8' });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return null;
}

function copyOwnProperties(source, destination, overwrite) {
  for (const name of Object.getOwnPropertyNames(source)) {
    if (overwrite || !Object.prototype.hasOwnProperty.call(destination, name)) {
      Object.defineProperty(destination, name, Object.getOwnPropertyDescriptor(source, name));
    }
  }
  return destination;
}

function printJSON(value) {
  const seen = new Set();
  try {
    return JSON.stringify(value, (key, item) => {
      if (seen.has(item)) return '[Circular]';
      if (typeof item === 'object' && item !== null) seen.add(item);
      if (typeof BigInt !== 'undefined' && item instanceof BigInt) {
        return `[BigInt ${item.toString()}n]`;
      }
      return item;
    });
  } catch (error) {
    return '[object]';
  }
}

function jsonEnd(text, offset) {
  offset |= 0;
  let character = text.charAt(offset++);
  if (/[\d-]/.test(character)) {
    while (/[eE\d.+-]/.test(text.charAt(offset))) offset++;
    return offset;
  }
  if (/true|null/.test(text.slice(offset - 1, offset + 3))) return offset + 3;
  if (/false/.test(text.slice(offset - 1, offset + 4))) return offset + 4;

  let depth = 0;
  let inString = false;
  do {
    switch (character) {
      case '{':
      case '[':
        if (!inString) depth++;
        break;
      case '}':
      case ']':
        if (!inString && !--depth) return offset;
        break;
      case '"':
        inString = !inString;
        if (!depth && !inString) return offset;
        break;
      case '\\':
        offset++;
        break;
    }
  } while ((character = text.charAt(offset++)));
  return -1;
}

function protocolNamespace(protocol) {
  if (protocol.namespace) return protocol.namespace;
  const match = /^(.*)\.[^.]+$/.exec(protocol.protocol);
  return match ? match[1] : undefined;
}

function extractJavadoc(comment) {
  const lines = comment
    .replace(/^[ \t]+|[ \t]+$/g, '')
    .split('\n')
    .map((line, index) => index ? line.replace(/^\s*\*\s?/, '') : line);
  while (lines.length && !lines[0]) lines.shift();
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  return lines.join('\n');
}

class Tokenizer {
  constructor(text) {
    this._str = text;
    this.pos = 0;
  }

  next(expected) {
    const token = { pos: this.pos, id: undefined, val: undefined };
    let error;
    const comment = this._skip(expected && expected.emitJavadoc);

    if (typeof comment === 'string') {
      token.id = 'javadoc';
      token.val = comment;
    } else {
      const start = this.pos;
      const text = this._str;
      const character = text.charAt(start);
      if (!character) {
        token.id = '(eof)';
      } else if (expected && expected.id === 'json') {
        token.id = 'json';
        this.pos = this._endOfJson();
      } else if (character === '"') {
        token.id = 'string';
        this.pos = this._endOfString();
      } else if (/[0-9]/.test(character)) {
        token.id = 'number';
        this.pos = this._endOf(/[0-9]/);
      } else if (/[`A-Za-z_.]/.test(character)) {
        token.id = 'name';
        this.pos = this._endOf(/[`A-Za-z0-9_.]/);
      } else {
        token.id = 'operator';
        this.pos = start + 1;
      }

      token.val = text.slice(start, this.pos);
      if (token.id === 'json') {
        try {
          token.val = JSON.parse(token.val);
        } catch (parseError) {
          throw this.error('invalid JSON', token);
        }
      } else if (token.id === 'name') {
        token.val = token.val.replace(/`/g, '');
      }
    }

    if (expected && expected.id && expected.id !== token.id) {
      error = this.error(`expected ID ${expected.id}`, token);
    } else if (expected && expected.val && expected.val !== token.val) {
      error = this.error(`expected value ${expected.val}`, token);
    }

    if (error) {
      if (expected.silent) {
        this.pos = token.pos;
        return undefined;
      }
      throw error;
    }
    return token;
  }

  error(message, tokenOrPosition) {
    const hasToken = typeof tokenOrPosition !== 'number';
    const position = hasToken ? tokenOrPosition.pos : tokenOrPosition;
    let lineNum = 1;
    let lineStart = 0;
    for (let index = 0; index < position; index++) {
      if (this._str.charAt(index) === '\n') {
        lineNum++;
        lineStart = index;
      }
    }
    const detail = hasToken
      ? `invalid token ${printJSON(tokenOrPosition)}: ${message}`
      : message;
    const error = new Error(detail);
    error.token = hasToken ? tokenOrPosition : undefined;
    error.lineNum = lineNum;
    error.colNum = position - lineStart;
    return error;
  }

  _skip(emitJavadoc) {
    let character;
    while ((character = this._str.charAt(this.pos)) && /\s/.test(character)) this.pos++;
    const start = this.pos;
    if (character !== '/') return undefined;

    switch (this._str.charAt(this.pos + 1)) {
      case '/':
        this.pos += 2;
        while ((character = this._str.charAt(this.pos)) && character !== '\n') this.pos++;
        return this._skip(emitJavadoc);
      case '*': {
        this.pos += 2;
        const isJavadoc = this._str.charAt(this.pos) === '*';
        while ((character = this._str.charAt(this.pos++))) {
          if (character === '*' && this._str.charAt(this.pos) === '/') {
            this.pos++;
            return isJavadoc && emitJavadoc
              ? extractJavadoc(this._str.slice(start + 3, this.pos - 2))
              : this._skip(emitJavadoc);
          }
        }
        throw this.error('unterminated comment', start);
      }
      default:
        return undefined;
    }
  }

  _endOf(pattern) {
    let index = this.pos;
    while (pattern.test(this._str.charAt(index))) index++;
    return index;
  }

  _endOfString() {
    let index = this.pos + 1;
    let character;
    while ((character = this._str.charAt(index))) {
      if (character === '"') return index + 1;
      index += character === '\\' ? 2 : 1;
    }
    throw this.error('unterminated string', index - 1);
  }

  _endOfJson() {
    const end = jsonEnd(this._str, this.pos);
    if (end < 0) throw this.error('invalid JSON', end);
    return end;
  }
}

class Reader {
  constructor(text, options) {
    options = options || {};
    this._tk = new Tokenizer(text);
    this._ackVoidMessages = !!options.ackVoidMessages;
    this._implicitTags = !options.delimitedCollections;
    this._typeRefs = options.typeRefs || TYPE_REFS;
  }

  static readProtocol(text, options) {
    const result = new Reader(text, options)._readProtocol();
    if (result.imports.length) throw new Error('unresolvable import');
    return result.protocol;
  }

  static readSchema(text, options) {
    const reader = new Reader(text, options);
    const javadoc = reader._readJavadoc();
    const schema = reader._readType(javadoc === undefined ? {} : { doc: javadoc }, true);
    reader._tk.next({ id: '(eof)' });
    return schema;
  }

  _readProtocol() {
    const tokenizer = this._tk;
    const imports = [];
    const types = [];
    const messages = {};
    this._readImports(imports);

    const protocol = {};
    const javadoc = this._readJavadoc();
    if (javadoc !== undefined) protocol.doc = javadoc;
    this._readAnnotations(protocol);
    tokenizer.next({ val: 'protocol' });
    if (!tokenizer.next({ val: '{', silent: true })) {
      protocol.protocol = tokenizer.next({ id: 'name' }).val;
      tokenizer.next({ val: '{' });
    }

    while (!tokenizer.next({ val: '}', silent: true })) {
      if (!this._readImports(imports)) {
        let message;
        let itemJavadoc = this._readJavadoc();
        let type = this._readType({}, true);
        const hadPostTypeImport = this._readImports(imports, true);
        const rewindPosition = tokenizer.pos;
        if (!hadPostTypeImport && (message = this._readMessage(type))) {
          if (itemJavadoc !== undefined && message.schema.doc === undefined) {
            message.schema.doc = itemJavadoc;
          }
          let oneWay = false;
          if (message.schema.response === 'void' || message.schema.response.type === 'void') {
            oneWay = !this._ackVoidMessages && !message.schema.errors;
            if (message.schema.response === 'void') message.schema.response = 'null';
            else message.schema.response.type = 'null';
          }
          if (oneWay) message.schema['one-way'] = true;
          if (messages[message.name]) throw new Error(`duplicate message: ${message.name}`);
          messages[message.name] = message.schema;
        } else {
          if (itemJavadoc) {
            if (typeof type === 'string') type = { doc: itemJavadoc, type };
            else if (type.doc === undefined) type.doc = itemJavadoc;
          }
          types.push(type);
          tokenizer.pos = rewindPosition;
          tokenizer.next({ val: ';', silent: true });
        }
      }
    }

    tokenizer.next({ id: '(eof)' });
    if (types.length) protocol.types = types;
    if (Object.keys(messages).length) protocol.messages = messages;
    return { protocol, imports };
  }

  _readAnnotations(target) {
    const tokenizer = this._tk;
    while (tokenizer.next({ val: '@', silent: true })) {
      const nameParts = [];
      while (!tokenizer.next({ val: '(', silent: true })) nameParts.push(tokenizer.next().val);
      target[nameParts.join('')] = tokenizer.next({ id: 'json' }).val;
      tokenizer.next({ val: ')' });
    }
  }

  _readMessage(response) {
    const tokenizer = this._tk;
    const schema = { request: [], response };
    this._readAnnotations(schema);
    const name = tokenizer.next().val;
    if (tokenizer.next().val !== '(') return undefined;

    if (!tokenizer.next({ val: ')', silent: true })) {
      const close = { val: ')', silent: true };
      do {
        schema.request.push(this._readField());
      } while (!tokenizer.next(close) && tokenizer.next({ val: ',' }));
    }

    const suffix = tokenizer.next();
    switch (suffix.val) {
      case 'throws':
        schema.errors = [];
        do {
          schema.errors.push(this._readType());
        } while (!tokenizer.next({ val: ';', silent: true }) && tokenizer.next({ val: ',' }));
        break;
      case 'oneway':
        schema['one-way'] = true;
        tokenizer.next({ val: ';' });
        break;
      case ';':
        break;
      default:
        throw tokenizer.error('invalid message suffix', suffix);
    }
    return { name, schema };
  }

  _readJavadoc() {
    const token = this._tk.next({ id: 'javadoc', emitJavadoc: true, silent: true });
    return token && token.val;
  }

  _readField() {
    const tokenizer = this._tk;
    const javadoc = this._readJavadoc();
    const field = { type: this._readType() };
    if (javadoc !== undefined && field.doc === undefined) field.doc = javadoc;
    const optional = tokenizer.next({ id: 'operator', val: '?', silent: true });
    this._readAnnotations(field);
    field.name = tokenizer.next({ id: 'name' }).val;
    if (tokenizer.next({ val: '=', silent: true })) {
      field.default = tokenizer.next({ id: 'json' }).val;
    }
    if (optional) {
      field.type = 'default' in field && field.default !== null
        ? [field.type, 'null']
        : ['null', field.type];
    }
    return field;
  }

  _readType(schema, allowEnumDefault) {
    schema = schema || {};
    this._readAnnotations(schema);
    schema.type = this._tk.next({ id: 'name' }).val;
    switch (schema.type) {
      case 'record':
      case 'error':
        return this._readRecord(schema);
      case 'fixed':
        return this._readFixed(schema);
      case 'enum':
        return this._readEnum(schema, allowEnumDefault);
      case 'map':
        return this._readMap(schema);
      case 'array':
        return this._readArray(schema);
      case 'union':
        if (Object.keys(schema).length > 1) throw new Error('union annotations are not supported');
        return this._readUnion();
      default: {
        const reference = this._typeRefs[schema.type];
        if (reference) {
          delete schema.type;
          copyOwnProperties(reference, schema);
        }
        return Object.keys(schema).length > 1 ? schema : schema.type;
      }
    }
  }

  _readFixed(schema) {
    const tokenizer = this._tk;
    if (!tokenizer.next({ val: '(', silent: true })) {
      schema.name = tokenizer.next({ id: 'name' }).val;
      tokenizer.next({ val: '(' });
    }
    schema.size = parseInt(tokenizer.next({ id: 'number' }).val);
    tokenizer.next({ val: ')' });
    return schema;
  }

  _readMap(schema) {
    const tokenizer = this._tk;
    const implicit = undefined === tokenizer.next({ val: '<', silent: this._implicitTags });
    schema.values = this._readType();
    tokenizer.next({ val: '>', silent: implicit });
    return schema;
  }

  _readArray(schema) {
    const tokenizer = this._tk;
    const implicit = undefined === tokenizer.next({ val: '<', silent: this._implicitTags });
    schema.items = this._readType();
    tokenizer.next({ val: '>', silent: implicit });
    return schema;
  }

  _readEnum(schema, allowDefault) {
    const tokenizer = this._tk;
    if (!tokenizer.next({ val: '{', silent: true })) {
      schema.name = tokenizer.next({ id: 'name' }).val;
      tokenizer.next({ val: '{' });
    }
    schema.symbols = [];
    do {
      schema.symbols.push(tokenizer.next().val);
    } while (!tokenizer.next({ val: '}', silent: true }) && tokenizer.next({ val: ',' }));
    if (allowDefault && tokenizer.next({ val: '=', silent: true })) {
      schema.default = tokenizer.next().val;
      tokenizer.next({ val: ';' });
    }
    return schema;
  }

  _readUnion() {
    const tokenizer = this._tk;
    const branches = [];
    tokenizer.next({ val: '{' });
    do {
      branches.push(this._readType());
    } while (!tokenizer.next({ val: '}', silent: true }) && tokenizer.next({ val: ',' }));
    return branches;
  }

  _readRecord(schema) {
    const tokenizer = this._tk;
    if (!tokenizer.next({ val: '{', silent: true })) {
      schema.name = tokenizer.next({ id: 'name' }).val;
      tokenizer.next({ val: '{' });
    }
    schema.fields = [];
    while (!tokenizer.next({ val: '}', silent: true })) {
      schema.fields.push(this._readField());
      tokenizer.next({ val: ';' });
    }
    return schema;
  }

  _readImports(imports, mayFollowType) {
    const tokenizer = this._tk;
    let count = 0;
    const initialPosition = tokenizer.pos;
    while (tokenizer.next({ val: 'import', silent: true })) {
      if (!count && mayFollowType && tokenizer.next({ val: '(', silent: true })) {
        tokenizer.pos = initialPosition;
        return undefined;
      }
      const kind = tokenizer.next({ id: 'name' }).val;
      const name = JSON.parse(tokenizer.next({ id: 'string' }).val);
      tokenizer.next({ val: ';' });
      imports.push({ kind, name });
      count++;
    }
    return count;
  }
}

function mergeProtocol(target, importedProtocol) {
  const importedTypes = importedProtocol.types || [];
  importedTypes.reverse();
  for (const type of importedTypes) {
    if (!target.types) target.types = [];
    if (type.namespace === undefined) type.namespace = protocolNamespace(importedProtocol) || '';
    target.types.unshift(type);
  }
  for (const name of Object.keys(importedProtocol.messages || {})) {
    if (!target.messages) target.messages = {};
    if (target.messages[name]) throw new Error(`duplicate message: ${name}`);
    target.messages[name] = importedProtocol.messages[name];
  }
}

function assembleProtocol(filePath, options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  options = options || {};
  if (!options.importHook) options.importHook = createImportHook();

  readIdl(filePath, '', (error, protocol) => {
    if (error) return callback(error);
    if (!protocol) return callback(new Error('empty root import'));
    const namespace = protocolNamespace(protocol) || '';
    if (protocol.types) {
      for (const type of protocol.types) {
        if (type.namespace === namespace) delete type.namespace;
      }
    }
    return callback(null, protocol);
  });

  function readIdl(importPath, importerPath, done) {
    options.importHook({ path: importPath, importerPath, kind: 'idl' }, (error, importedFile) => {
      if (error) return done(error);
      if (!importedFile) return done();
      const { contents, path: resolvedPath } = importedFile;
      let parsed;
      try {
        parsed = new Reader(contents, options)._readProtocol();
      } catch (parseError) {
        parseError.path = resolvedPath;
        return done(parseError);
      }
      return resolveImports(parsed.protocol, parsed.imports, resolvedPath, done);
    });
  }

  function resolveImports(protocol, imports, importerPath, done) {
    const resolvedImports = [];
    (function nextImport() {
      const descriptor = imports.shift();
      if (!descriptor) {
        resolvedImports.reverse();
        try {
          for (const imported of resolvedImports) mergeProtocol(protocol, imported);
        } catch (error) {
          return done(error);
        }
        return done(null, protocol);
      }

      if (descriptor.kind === 'idl') {
        return readIdl(descriptor.name, importerPath, (error, imported) => {
          if (error) return done(error);
          if (imported) resolvedImports.push(imported);
          return nextImport();
        });
      }

      options.importHook({
        path: descriptor.name,
        importerPath,
        kind: descriptor.kind,
      }, (error, importedFile) => {
        if (error) return done(error);
        switch (descriptor.kind) {
          case 'protocol':
          case 'schema': {
            if (!importedFile) return nextImport();
            let parsed;
            try {
              parsed = JSON.parse(importedFile.contents);
            } catch (parseError) {
              parseError.path = importedFile.path;
              return done(parseError);
            }
            resolvedImports.push(descriptor.kind === 'schema' ? { types: [parsed] } : parsed);
            return nextImport();
          }
          default:
            return done(new Error(`invalid import kind: ${descriptor.kind}`));
        }
      });
    })();
  }
}

function read(value) {
  let parsed;
  const fileContents = tryReadFileSync(value);
  if (fileContents === null) {
    parsed = value;
  } else {
    try {
      return JSON.parse(fileContents);
    } catch (error) {
      assembleProtocol(value, { importHook: createSyncImportHook() }, (assemblyError, protocol) => {
        parsed = assemblyError ? fileContents : protocol;
      });
    }
  }

  if (typeof parsed !== 'string' || parsed === 'null') return parsed;
  try {
    return JSON.parse(parsed);
  } catch (error) {
    try {
      return Reader.readProtocol(parsed);
    } catch (protocolError) {
      try {
        return Reader.readSchema(parsed);
      } catch (schemaError) {
        return parsed;
      }
    }
  }
}

module.exports = {
  Tokenizer,
  assembleProtocol,
  read,
  readProtocol: Reader.readProtocol,
  readSchema: Reader.readSchema,
};
