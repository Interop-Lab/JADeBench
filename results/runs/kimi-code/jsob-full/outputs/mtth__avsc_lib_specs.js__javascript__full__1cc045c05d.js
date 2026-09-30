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
  constructor(source) {
    this._str = source;
    this.pos = 0;
  }

  next(expected) {
    const token = {pos: this.pos, id: undefined, val: undefined};
    const javadoc = this._skip(expected && expected.emitJavadoc);

    if (typeof javadoc === 'string') {
      token.id = 'javadoc';
      token.val = javadoc;
    } else {
      const tokenStart = this.pos;
      const first = this._str.charAt(tokenStart);

      if (!first) {
        token.id = '(eof)';
      } else if (expected && expected.id === 'json') {
        token.id = 'json';
        this.pos = this._endOfJson();
      } else if (first === '"') {
        token.id = 'string';
        this.pos = this._endOfString();
      } else if (/[0-9]/.test(first)) {
        token.id = 'number';
        this.pos = this._endOf(/[0-9]/);
      } else if (/[`A-Za-z_.]/.test(first)) {
        token.id = 'name';
        this.pos = this._endOf(/[`A-Za-z0-9_.]/);
      } else {
        token.id = 'operator';
        this.pos = tokenStart + 1;
      }

      token.val = this._str.slice(tokenStart, this.pos);
      if (token.id === 'json') {
        try {
          token.val = JSON.parse(token.val);
        } catch {
          throw this.error('invalid JSON', token);
        }
      } else if (token.id === 'name') {
        token.val = token.val.replace(/`/g, '');
      }
    }

    let mismatch;
    if (expected && expected.id && expected.id !== token.id) {
      mismatch = this.error(`expected ID ${expected.id}`, token);
    } else if (expected && expected.val && expected.val !== token.val) {
      mismatch = this.error(`expected value ${expected.val}`, token);
    }

    if (!mismatch) return token;
    if (expected.silent) {
      this.pos = token.pos;
      return undefined;
    }
    throw mismatch;
  }

  error(message, tokenOrPosition) {
    const isToken = typeof tokenOrPosition !== 'number';
    const position = isToken ? tokenOrPosition.pos : tokenOrPosition;
    let lineNum = 1;
    let lineStart = -1;
    for (let index = 0; index < position; index++) {
      if (this._str.charAt(index) === '\n') {
        lineNum++;
        lineStart = index;
      }
    }
    const text = isToken
      ? `invalid token ${printJSON(tokenOrPosition)}: ${message}`
      : message;
    const error = new Error(text);
    error.token = isToken ? tokenOrPosition : undefined;
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
            if (isJavadoc && emitJavadoc) {
              return extractJavadoc(this._str.slice(start + 3, this.pos - 2));
            }
            return this._skip(emitJavadoc);
          }
        }
        throw this.error('unterminated comment', start);
      }
      default:
        return undefined;
    }
  }

  _endOf(pattern) {
    let end = this.pos;
    while (pattern.test(this._str.charAt(end))) end++;
    return end;
  }

  _endOfString() {
    let end = this.pos + 1;
    let character;
    while ((character = this._str.charAt(end))) {
      if (character === '"') return end + 1;
      end += character === '\\' ? 2 : 1;
    }
    throw this.error('unterminated string', end - 1);
  }

  _endOfJson() {
    const end = jsonEnd(this._str, this.pos);
    if (end < 0) throw this.error('invalid JSON', end);
    return end;
  }
}

class Reader {
  constructor(source, options = {}) {
    options = options || {};
    this._tk = new Tokenizer(source);
    this._ackVoidMessages = !!options.ackVoidMessages;
    this._implicitTags = !options.delimitedCollections;
    this._typeRefs = options.typeRefs || TYPE_REFS;
  }

  static readProtocol(source, options) {
    const result = new Reader(source, options)._readProtocol();
    if (result.imports.length) throw new Error('unresolvable import');
    return result.protocol;
  }

  static readSchema(source, options) {
    const reader = new Reader(source, options);
    const doc = reader._readJavadoc();
    const schema = reader._readType(doc === undefined ? {} : {doc}, true);
    reader._tk.next({id: '(eof)'});
    return schema;
  }

  _readProtocol() {
    const tokenizer = this._tk;
    const imports = [];
    const types = [];
    const messages = {};

    this._readImports(imports);
    const protocol = {};
    const doc = this._readJavadoc();
    if (doc !== undefined) protocol.doc = doc;
    this._readAnnotations(protocol);
    tokenizer.next({val: 'protocol'});
    if (!tokenizer.next({val: '{', silent: true})) {
      protocol.protocol = tokenizer.next({id: 'name'}).val;
      tokenizer.next({val: '{'});
    }

    while (!tokenizer.next({val: '}', silent: true})) {
      if (this._readImports(imports)) continue;
      const itemDoc = this._readJavadoc();
      const item = this._readType({}, true);
      const imported = this._readImports(imports, true);
      let message;
      const position = tokenizer.pos;
      if (!imported) message = this._readMessage(item);

      if (message) {
        if (itemDoc !== undefined && message.schema.doc === undefined) message.schema.doc = itemDoc;
        let isOneWay = false;
        if (message.schema.response === 'void' || message.schema.response.type === 'void') {
          isOneWay = !this._ackVoidMessages && !message.schema.errors;
          if (message.schema.response === 'void') message.schema.response = 'null';
          else message.schema.response.type = 'null';
        }
        if (isOneWay) message.schema['one-way'] = true;
        if (messages[message.name]) throw new Error(`duplicate message: ${message.name}`);
        messages[message.name] = message.schema;
      } else {
        if (itemDoc) {
          if (typeof item === 'string') item = {doc: itemDoc, type: item};
          else if (item.doc === undefined) item.doc = itemDoc;
        }
        types.push(item);
        tokenizer.pos = position;
        tokenizer.next({val: ';', silent: true});
      }
    }

    tokenizer.next({id: '(eof)'});
    if (types.length) protocol.types = types;
    if (Object.keys(messages).length) protocol.messages = messages;
    return {protocol, imports};
  }

  _readAnnotations(target) {
    const tokenizer = this._tk;
    while (tokenizer.next({val: '@', silent: true})) {
      const parts = [];
      while (!tokenizer.next({val: '(', silent: true})) parts.push(tokenizer.next().val);
      target[parts.join('')] = tokenizer.next({id: 'json'}).val;
      tokenizer.next({val: ')'});
    }
  }

  _readMessage(response) {
    const tokenizer = this._tk;
    const schema = {request: [], response};
    this._readAnnotations(schema);
    const name = tokenizer.next().val;
    if (tokenizer.next().val !== '(') return undefined;

    if (!tokenizer.next({val: ')', silent: true})) {
      do {
        schema.request.push(this._readField());
      } while (!tokenizer.next({val: ')', silent: true}) && tokenizer.next({val: ','}));
    }

    const suffix = tokenizer.next();
    switch (suffix.val) {
      case 'throws':
        schema.errors = [];
        do {
          schema.errors.push(this._readType());
        } while (!tokenizer.next({val: ';', silent: true}) && tokenizer.next({val: ','}));
        break;
      case 'oneway':
        schema['one-way'] = true;
        tokenizer.next({val: ';'});
        break;
      case ';':
        break;
      default:
        throw tokenizer.error('invalid message suffix', suffix);
    }
    return {name, schema};
  }

  _readJavadoc() {
    const token = this._tk.next({id: 'javadoc', emitJavadoc: true, silent: true});
    return token && token.val;
  }

  _readField() {
    const tokenizer = this._tk;
    const doc = this._readJavadoc();
    const field = {type: this._readType()};
    if (doc !== undefined) field.doc = doc;
    const optional = tokenizer.next({id: 'operator', val: '?', silent: true});
    this._readAnnotations(field);
    field.name = tokenizer.next({id: 'name'}).val;
    if (tokenizer.next({val: '=', silent: true})) field.default = tokenizer.next({id: 'json'}).val;
    if (optional) {
      field.type = 'default' in field && field.default !== null
        ? [field.type, 'null']
        : ['null', field.type];
    }
    return field;
  }

  _readType(schema = {}, allowEnumDefault) {
    this._readAnnotations(schema);
    schema.type = this._tk.next({id: 'name'}).val;
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
    if (!tokenizer.next({val: '(', silent: true})) {
      schema.name = tokenizer.next({id: 'name'}).val;
      tokenizer.next({val: '('});
    }
    schema.size = parseInt(tokenizer.next({id: 'number'}).val);
    tokenizer.next({val: ')'});
    return schema;
  }

  _readMap(schema) {
    const tokenizer = this._tk;
    const implicit = this._implicitTags;
    const missingOpeningTag = tokenizer.next({val: '<', silent: implicit}) === undefined;
    schema.values = this._readType();
    tokenizer.next({val: '>', silent: missingOpeningTag});
    return schema;
  }

  _readArray(schema) {
    const tokenizer = this._tk;
    const implicit = this._implicitTags;
    const missingOpeningTag = tokenizer.next({val: '<', silent: implicit}) === undefined;
    schema.items = this._readType();
    tokenizer.next({val: '>', silent: missingOpeningTag});
    return schema;
  }

  _readEnum(schema, allowDefault) {
    const tokenizer = this._tk;
    if (!tokenizer.next({val: '{', silent: true})) {
      schema.name = tokenizer.next({id: 'name'}).val;
      tokenizer.next({val: '{'});
    }
    schema.symbols = [];
    do {
      schema.symbols.push(tokenizer.next().val);
    } while (!tokenizer.next({val: '}', silent: true}) && tokenizer.next({val: ','}));
    if (allowDefault && tokenizer.next({val: '=', silent: true})) {
      schema.default = tokenizer.next().val;
      tokenizer.next({val: ';'});
    }
    return schema;
  }

  _readUnion() {
    const tokenizer = this._tk;
    const types = [];
    tokenizer.next({val: '{'});
    do {
      types.push(this._readType());
    } while (!tokenizer.next({val: '}', silent: true}) && tokenizer.next({val: ','}));
    return types;
  }

  _readRecord(schema) {
    const tokenizer = this._tk;
    if (!tokenizer.next({val: '{', silent: true})) {
      schema.name = tokenizer.next({id: 'name'}).val;
      tokenizer.next({val: '{'});
    }
    schema.fields = [];
    while (!tokenizer.next({val: '}', silent: true})) {
      schema.fields.push(this._readField());
      tokenizer.next({val: ';'});
    }
    return schema;
  }

  _readImports(imports, silent) {
    const tokenizer = this._tk;
    let found = false;

    while (true) {
      const position = tokenizer.pos;
      if (!tokenizer.next({val: 'import', silent: true})) return found;

      try {
        const kind = tokenizer.next({id: 'name'}).val;
        const name = tokenizer.next({id: 'string'}).val;
        tokenizer.next({val: ';'});
        imports.push({kind, name: JSON.parse(name)});
        found = true;
      } catch (error) {
        if (!silent) throw error;
        tokenizer.pos = position;
        return found;
      }
    }
  }
}

function extractJavadoc(comment) {
  const lines = comment.trim().split('\n').map((line, index) =>
    index ? line.replace(/^\s*\*\s?/, '') : line
  );
  while (lines.length && !lines[0]) lines.shift();
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  return lines.join('\n');
}

function protocolNamespace(protocol) {
  if (protocol.namespace) return protocol.namespace;
  const match = /^(.*)\.[^.]+$/.exec(protocol.protocol);
  return match ? match[1] : undefined;
}

function assembleProtocol(rootPath, options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  options = options || {};
  const importHook = options.importHook || createImportHook();

  loadIdl(rootPath, '', (error, root) => {
    if (error) return callback(error);
    if (!root) return callback(new Error('empty root import'));
    mergeImports(root.protocol, root.imports, root.path, error => {
      if (error) return callback(error);
      const namespace = protocolNamespace(root.protocol) || '';
      if (root.protocol.types) {
        root.protocol.types.forEach(type => {
          if (type.namespace === namespace) delete type.namespace;
        });
      }
      callback(null, root.protocol);
    });
  });

  function loadIdl(name, importerPath, done) {
    importHook({path: name, importerPath, kind: 'idl'}, (error, result) => {
      if (error || !result) return done(error);
      let parsed;
      try {
        parsed = new Reader(result.contents, options)._readProtocol();
      } catch (parseError) {
        parseError.path = result.path;
        return done(parseError);
      }
      parsed.path = result.path;
      done(null, parsed);
    });
  }

  function mergeImports(protocol, imports, importerPath, done) {
    const next = imports.shift();
    if (!next) return done();
    if (next.kind === 'idl') {
      return loadIdl(next.name, importerPath, (error, parsed) => {
        if (error) return done(error);
        if (!parsed) return mergeImports(protocol, imports, importerPath, done);
        mergeImports(parsed.protocol, parsed.imports, parsed.path, error => {
          if (error) return done(error);
          mergeProtocol(protocol, parsed.protocol);
          mergeImports(protocol, imports, importerPath, done);
        });
      });
    }
    importHook({path: next.name, importerPath, kind: next.kind}, (error, result) => {
      if (error) return done(error);
      if (!result) return mergeImports(protocol, imports, importerPath, done);
      if (next.kind !== 'protocol' && next.kind !== 'schema') {
        return done(new Error(`invalid import kind: ${next.kind}`));
      }
      let parsed;
      try {
        parsed = JSON.parse(result.contents);
      } catch (parseError) {
        parseError.path = result.path;
        return done(parseError);
      }
      mergeProtocol(protocol, next.kind === 'schema' ? {types: [parsed]} : parsed);
      mergeImports(protocol, imports, importerPath, done);
    });
  }
}

function mergeProtocol(target, imported) {
  const types = imported.types || [];
  types.reverse().forEach(type => {
    if (!target.types) target.types = [];
    if (type.namespace === undefined) type.namespace = protocolNamespace(imported) || '';
    target.types.unshift(type);
  });
  Object.keys(imported.messages || {}).forEach(name => {
    if (!target.messages) target.messages = {};
    if (target.messages[name]) throw new Error(`duplicate message: ${name}`);
    target.messages[name] = imported.messages[name];
  });
}

function read(input) {
  const contents = tryReadFileSync(input);
  if (contents !== null) {
    try {
      return JSON.parse(contents);
    } catch {
      let result;
      let error;
      assembleProtocol(input, {importHook: createSyncImportHook()}, (assemblyError, protocol) => {
        error = assemblyError;
        result = protocol;
      });
      if (!error) return result;
    }
  }

  const source = contents === null ? input : contents;
  if (typeof source !== 'string' || source === 'null') return source;
  try {
    return JSON.parse(source);
  } catch {
    try {
      return Reader.readProtocol(source);
    } catch {
      try {
        return Reader.readSchema(source);
      } catch {
        return source;
      }
    }
  }
}

function createImportHook() {
  const seen = Object.create(null);
  return ({path: importPath, importerPath}, callback) => {
    const resolved = path.resolve(path.dirname(importerPath), importPath);
    if (seen[resolved]) return process.nextTick(callback);
    seen[resolved] = true;
    fs.readFile(resolved, {encoding: 'utf8'}, (error, contents) => {
      callback(error, error ? undefined : {contents, path: resolved});
    });
  };
}

function createSyncImportHook() {
  const seen = Object.create(null);
  return ({path: importPath, importerPath}, callback) => {
    const resolved = path.resolve(path.dirname(importerPath), importPath);
    if (seen[resolved]) return callback();
    seen[resolved] = true;
    callback(null, {contents: fs.readFileSync(resolved, {encoding: 'utf8'}), path: resolved});
  };
}

function tryReadFileSync(value) {
  if (typeof value === 'string' && value.includes(path.sep)) {
    try {
      return fs.readFileSync(value, {encoding: 'utf8'});
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return null;
}

function copyOwnProperties(source, target) {
  Object.keys(source).forEach(key => {
    target[key] = source[key];
  });
}

function jsonEnd(source, start) {
  const first = source.charAt(start);
  if (first === '"') {
    let index = start + 1;
    while (index < source.length) {
      if (source[index] === '"') return index + 1;
      index += source[index] === '\\' ? 2 : 1;
    }
    return -1;
  }
  if (first !== '{' && first !== '[') return jsonPrimitiveEnd(source, start);
  const stack = [first === '{' ? '}' : ']'];
  let inString = false;
  for (let index = start + 1; index < source.length; index++) {
    const character = source[index];
    if (inString) {
      if (character === '\\') index++;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '{') stack.push('}');
    else if (character === '[') stack.push(']');
    else if (character === stack[stack.length - 1] && !stack.pop()) return index + 1;
  }
  return -1;
}

function jsonPrimitiveEnd(source, start) {
  let end = start;
  while (end < source.length && !/[\s,;)}\]]/.test(source[end])) end++;
  return end;
}

function printJSON(value) {
  return JSON.stringify(value);
}

module.exports = {
  Tokenizer,
  assembleProtocol,
  read,
  readProtocol: Reader.readProtocol,
  readSchema: Reader.readSchema
};
