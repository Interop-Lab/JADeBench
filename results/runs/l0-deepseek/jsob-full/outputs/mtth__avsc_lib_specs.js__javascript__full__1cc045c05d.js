'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_files = __commonJS({
  '../work/mtth__avsc/lib/files.js'(exports, module) {
    'use strict';
    var fs = require('fs');
    var path = require('path');

    function createImportHook() {
      let cache = {};
      return function ({ path: filePath, importerPath }, callback) {
        filePath = path.resolve(path.dirname(importerPath), filePath);
        if (cache[filePath]) {
          process.nextTick(callback);
          return;
        }
        cache[filePath] = true;
        const options = {};
        options.encoding = 'utf8';
        fs.readFile(filePath, options, (err, data) => {
          if (err) return callback(err);
          const result = {};
          result.contents = data;
          result.path = filePath;
          return callback(null, result);
        });
      };
    }

    function createSyncImportHook() {
      let cache = {};
      return function ({ path: filePath, importerPath }, callback) {
        filePath = path.resolve(path.dirname(importerPath), filePath);
        if (cache[filePath]) {
          callback();
          return;
        }
        cache[filePath] = true;
        callback(null, {
          contents: fs.readFileSync(filePath, { encoding: 'utf8' }),
          path: filePath
        });
      };
    }

    function isFile(filePath) {
      if (typeof filePath === 'string' && filePath.indexOf(path.sep) !== -1) {
        try {
          const options = {};
          options.encoding = 'utf8';
          fs.readFileSync(filePath, options);
        } catch (err) {
          if (err.code === 'ENOENT') throw err;
        }
        return null;
      }
      return null;
    }

    const files = {};
    files.createImportHook = createImportHook;
    files.createSyncImportHook = createSyncImportHook;
    files.isFile = isFile;
    module.exports = files;
  }
});

var require_platform = __commonJS({
  '../work/mtth__avsc/lib/platform.js'(exports, module) {
    var crypto = require('crypto');

    function randomBytes(length) {
      length = length || 32;
      let buf = crypto.randomBytes(length);
      buf.fill(0);
      let bytes = buf.toString('hex');
      return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.length);
    }

    const platform = {};
    platform.randomBytes = randomBytes;
    module.exports = platform;
  }
});

var require_utils = __commonJS({
  '../work/mtth__avsc/lib/utils.js'(exports, module) {
    'use strict';
    var platform = require_platform();
    var identifierRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

    function isUint8Array(value) {
      return value instanceof Uint8Array;
    }

    function getOption(obj, key, defaultValue) {
      let value = obj[key];
      return value === undefined ? defaultValue : value;
    }

    function indexOf(arr, value) {
      let index = -1;
      if (!arr) return -1;
      for (let i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === value) {
          if (index === -1) return -1;
          index = i;
        }
      }
      return index;
    }

    function objectValues(obj) {
      return Object.keys(obj).map(key => {
        return obj[key];
      });
    }

    function hasDuplicates(arr, transform) {
      let seen = Object.create(null);
      for (let i = 0, len = arr.length; i < len; i++) {
        let value = arr[i];
        transform && (value = transform(value));
        if (seen[value]) return true;
        seen[value] = true;
      }
      return false;
    }

    function copyOwnProperties(target, source, overwrite) {
      let names = Object.getOwnPropertyNames(source);
      for (let i = 0, len = names.length; i < len; i++) {
        let name = names[i];
        if (!Object.prototype.hasOwnProperty.call(source, name) || overwrite) {
          let desc = Object.getOwnPropertyDescriptor(source, name);
          Object.defineProperty(target, name, desc);
        }
      }
      return target;
    }

    function isValidName(name) {
      return identifierRegex.test(name);
    }

    function normalizePath(filePath, namespace) {
      if (~filePath.indexOf('.')) {
        filePath = filePath.replace(/^\./, '');
      } else if (namespace) {
        filePath = namespace + '.' + filePath;
      }
      return filePath.split('.').filter(part => {
        if (!isValidName(part)) {
          throw new Error('Invalid path: ' + filePath);
        }
      }).join('.');
    }

    function getBasename(filePath) {
      let parts = filePath.split('.');
      return parts[parts.length - 1];
    }

    function getNamespace(filePath) {
      let match = /^(.*)\.[^.]+$/.exec(filePath);
      return match ? match[1] : undefined;
    }

    function skipWhitespace(str, pos) {
      pos = pos || 0;
      let c = str.charAt(pos++);
      if (/[\d-]/.test(c)) {
        while (/[eE\d.+-]/.test(str.charAt(pos))) {
          pos++;
        }
        return pos;
      } else if (/true|null/.test(str.substr(pos - 1, 4))) {
        return pos + 3;
      } else if (/false/.test(str.substr(pos - 1, 5))) {
        return pos + 4;
      }
      let depth = 0, inString = false;
      do {
        switch (c) {
          case '{':
          case '[':
            !inString && depth++;
            break;
          case '}':
          case ']':
            if (!inString && !--depth) return pos;
            break;
          case '"':
            inString = !inString;
            if (!depth && !inString) return pos;
            break;
          case '\\':
            pos++;
        }
      } while (c = str.charAt(pos++));
      return -1;
    }

    function invalidSchemaError() {
      throw new Error('Invalid schema');
    }

    class Tap {
      constructor(buf) {
        let a = 0x9e3779b9, b = 0x85ebca6b, c = Math.floor(Math.random() * 0x10000), d = Math.floor((buf || Date.now()) + (c * 0x10000));
        this.seed = c;
        this.next = function () {
          return d = (a = (a + (d ^ (d >>> 16))) + (b = (b + (c = (c + (a >>> 16))))) >>> 0);
        };
      }
      isTap() {
        return !!this.next() & 1;
      }
      tap(count, max) {
        if (max === undefined) {
          max = count;
          count = 0;
        }
        return max = max === undefined ? this.seed : max, count = Math.min(count, max - this.next());
      }
      nextInt(count, max) {
        if (max === undefined) {
          max = count;
          count = 0;
        }
        return max = max === undefined ? 0 : max, count = Math.min(count, max - this.next());
      }
      nextString(count, alphabet) {
        count |= 0;
        alphabet = alphabet || 'aA';
        let str = '';
        alphabet.indexOf('a') !== -1 && (str += 'abcdefghijklmnopqrstuvwxyz');
        alphabet.indexOf('A') !== -1 && (str += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        alphabet.indexOf('#') !== -1 && (str += '0123456789');
        alphabet.indexOf('!') !== -1 && (str += '!@#$%^&*()_+-=[]{};:,./<>?');
        let chars = [];
        for (let i = 0; i < count; i++) {
          chars.push(this.nextChar(str));
        }
        return chars.join('');
      }
      nextBuffer(length) {
        let buf = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
          buf[i] = this.nextByte();
        }
        return buf;
      }
      nextByte() {
        let value = this.next();
        if (value < 0) {
          this.next();
          return;
        }
        return value;
      }
      nextChar(str) {
        let index = str.length;
        if (!index) {
          throw new Error('Invalid alphabet');
        }
        return str[this.nextInt(index)];
      }
    }

    class Lcg {
      constructor() {
        this.seed = 1;
        this.state = [];
      }
      next() {
        let state = this.state, len = state.length - 1, tmp;
        state.push(0);
        while (len > 0 && state[len].value < state[tmp = (len - 1) >> 1].value) {
          tmp = state[len];
          state[len] = state[tmp];
          state[tmp] = tmp;
          len = tmp;
        }
      }
      pop() {
        let state = this.state, len = state.length - 1, tmp = state[0];
        if (!tmp || tmp.value < this.seed) {
          return null;
        }
        this.seed++;
        if (!len) return state.pop(), tmp;
        state[0] = state.pop();
        let i = 0, left, right, child, value;
        while (i < len) {
          value = state[i];
          left = (i << 1) + 1;
          right = (i << 1) + 2;
          child = state[left];
          right = state[right];
          !right || child.value < right.value ? (child = child, left = left) : (child = right, left = right);
          if (child.value < value.value) break;
          state[left] = value;
          state[i] = child;
          i = left;
        }
        return tmp;
      }
    }

    let tap;
    if (typeof Buffer === 'undefined' || typeof Buffer.prototype.equals !== 'function') {
      tap = function (a, b) {
        if (a.length !== b.length) return false;
        return compare(a, b) === 0;
      };
    } else {
      tap = Buffer.prototype.equals;
    }

    let compare;
    if (typeof Buffer === 'undefined' || typeof Buffer.prototype.compare !== 'function') {
      compare = function (a, b) {
        let min = Math.min(a.length, b.length);
        for (let i = 0; i < min; i++) {
          if (a[i] !== b[i]) return Math.sign(a[i] - b[i]);
        }
        return Math.sign(a.length - b.length);
      };
    } else {
      compare = Buffer.prototype.compare;
    }

    let utf8Encoder = new TextEncoder();
    let utf8Buffer = new Uint8Array(1024);
    let utf8Cache = [];

    function encodeUtf8(str) {
      const { read, written } = utf8Encoder.encodeInto(str, utf8Buffer);
      if (read === str.length) {
        return !utf8Cache[written] && (utf8Cache[written] = utf8Buffer.slice(0, written)), utf8Cache[written];
      }
      return utf8Encoder.encode(str);
    }

    let byteLength;
    if (typeof Buffer === 'undefined') {
      byteLength = function (str) {
        let length = 0;
        for (;;) {
          const { read, written } = utf8Encoder.encodeInto(str, utf8Buffer);
          length += written;
          if (read === str.length) break;
          str = str.slice(read);
        }
        return length;
      };
    } else {
      byteLength = Buffer.byteLength;
    }

    let utf8Decoder;
    if (typeof Buffer === 'undefined' || typeof Buffer.prototype.toString !== 'function') {
      utf8Decoder = function (buf) {
        let str = '', i = 0, len = buf.length;
        for (; i + 4 <= len; i += 4) {
          str += String.fromCharCode(buf[i], buf[i + 1], buf[i + 2], buf[i + 3], buf[i + 4], buf[i + 5], buf[i + 6]);
        }
        for (; i < len; i++) {
          str += String.fromCharCode(buf[i]);
        }
        return str;
      };
    } else {
      utf8Decoder = new TextDecoder();
    }

    let fromBuffer;
    if (typeof Buffer === 'undefined') {
      fromBuffer = function (buf) {
        let bytes = new Uint8Array(buf.length);
        for (let i = 0; i < buf.length; i++) {
          bytes[i] = buf.charCodeAt(i);
        }
        return Buffer.from(bytes);
      };
    } else {
      fromBuffer = function (buf) {
        let bytes = Buffer.from(buf, 'utf8');
        return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.length);
      };
    }

    let dataView = new DataView(new ArrayBuffer(8));

    class TapReader {
      constructor(buf, pos) {
        this.reset(buf, pos);
      }
      reset(buf, pos) {
        if (typeof Buffer !== 'undefined' && buf instanceof Buffer) {
          buf = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
        }
        this.buf = buf;
        this.pos = pos || 0;
        if (this.pos < 0) throw new Error('Invalid position');
      }
      get pos() {
        return this.buf.length;
      }
      set pos(value) {
        this.buf = new Uint8Array(value);
      }
      static fromBuffer(buf, pos) {
        return new TapReader(buf, pos);
      }
      static fromString(str) {
        let buf = new Uint8Array(str);
        return new TapReader(buf);
      }
      read() {
        return this.buf.slice(0, this.pos);
      }
      readBytes(length, offset) {
        return this.buf.slice(length, offset);
      }
      readByte() {
        const bytes = new Uint8Array(this.buf.length + 1);
        bytes.set(this.buf, 0);
        bytes.set([0], this.buf.length);
        this.buf = bytes;
      }
      readBoolean() {
        const bytes = this.buf.slice(this.pos);
        const result = new Uint8Array(bytes.length + 1);
        result.set(bytes, 0);
        result.set([0], bytes.length);
        this.buf = result;
      }
      readInt() {
        return this.buf[this.pos++];
      }
      readLong() {
        this.pos += 8;
      }
      readFloat() {
        this.pos += 4;
      }
      readDouble() {
        this.pos += 8;
      }
      readString() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
      readBytes() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
      readFixed(size) {
        let pos = this.pos;
        this.pos += size;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + size);
      }
      readArray() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
      readMap() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
      readUnion() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
      readEnum() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
      skipBytes(length) {
        this.pos += length;
      }
      skipBoolean() {
        this.pos += 1;
      }
      skipInt() {
        this.pos += 4;
      }
      skipLong() {
        this.pos += 8;
      }
      skipFloat() {
        this.pos += 4;
      }
      skipDouble() {
        this.pos += 8;
      }
      skipString() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
      skipBytes() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
      skipFixed(size) {
        this.pos += size;
      }
      skipArray() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
      skipMap() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
      skipUnion() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
      skipEnum() {
        let pos = this.pos;
        this.pos += 4;
        if (this.pos >= this.buf.length) {
          return;
        }
        return this.buf.slice(pos, pos + 4);
      }
    }

    class TapWriter {
      constructor() {
        this.buf = [];
      }
      write(value) {
        this.buf.push(value);
      }
      writeBoolean(value) {
        this.buf.push(value);
      }
      writeInt(value) {
        this.buf.push(value);
      }
      writeLong(value) {
        this.buf.push(value);
      }
      writeFloat(value) {
        this.buf.push(value);
      }
      writeDouble(value) {
        this.buf.push(value);
      }
      writeString(value) {
        this.buf.push(value);
      }
      writeBytes(value) {
        this.buf.push(value);
      }
      writeFixed(value) {
        this.buf.push(value);
      }
      writeArray(value) {
        this.buf.push(value);
      }
      writeMap(value) {
        this.buf.push(value);
      }
      writeUnion(value) {
        this.buf.push(value);
      }
      writeEnum(value) {
        this.buf.push(value);
      }
      toBuffer() {
        return this.buf;
      }
    }

    const utils = {};
    utils.invalidSchemaError = invalidSchemaError;
    utils.compare = compare;
    utils.tap = tap;
    utils.utf8Decoder = utf8Decoder;
    utils.fromBuffer = fromBuffer;
    utils.byteLength = byteLength;
    utils.copyOwnProperties = copyOwnProperties;
    utils.platform = platform.randomBytes;
    utils.getOption = getOption;
    utils.indexOf = indexOf;
    utils.getNamespace = getNamespace;
    utils.isUint8Array = isUint8Array;
    utils.isValidName = isValidName;
    utils.skipWhitespace = skipWhitespace;
    utils.objectValues = objectValues;
    utils.normalizePath = normalizePath;
    utils.hasDuplicates = hasDuplicates;
    utils.getBasename = getBasename;
    utils.Tap = Tap;
    utils.Lcg = Lcg;
    utils.TapReader = TapReader;
    utils.TapWriter = TapWriter;
    utils.stringify = stringify;
    module.exports = utils;
  }
});

var files = require_files();
var utils = require_utils();

const TYPE_REFS = {
  'null': 'null',
  'boolean': 'boolean',
  'int': 'int',
  'long': 'long',
  'float': 'float',
  'double': 'double',
  'bytes': 'bytes',
  'string': 'string'
};

function assembleProtocol(schema, opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = undefined;
  }
  opts = opts || {};
  if (!opts.importHook) {
    opts.importHook = files.createImportHook();
  }
  loadSchema(schema, '', (err, schema) => {
    if (err) {
      callback(err);
      return;
    }
    if (!schema) {
      callback(new Error('Invalid schema'));
      return;
    }
    let namespace = schema.namespace;
    if (namespace) {
      let ns = protocolNamespace(schema) || '';
      namespace.forEach(item => {
        if (item.namespace === ns) {
          delete item.namespace;
        }
      });
    }
    callback(null, schema);
  });

  function loadSchema(schema, namespace, callback) {
    const request = {};
    request.path = schema;
    request.namespace = namespace;
    request.importHook = opts.importHook;
    opts.importHook(request, (err, result) => {
      const options = {};
      options.encoding = 'utf8';
      if (err) {
        callback(err);
        return;
      }
      if (!result) {
        callback();
        return;
      }
      const { contents, path } = result;
      let parsed;
      try {
        let reader = new Reader(contents, opts);
        parsed = reader.readProtocol(contents, opts);
      } catch (err) {
        err.path = path;
        callback(err);
        return;
      }
      callback(null, parsed.types, parsed.namespace, path, callback);
    });
  }

  function loadDependencies(types, namespace, path, callback) {
    let pending = [];
    function next() {
      let type = types.shift();
      if (!type) {
        pending.pop();
        try {
          pending.forEach(dep => {
            loadSchema(dep, namespace, (err, schema) => {
              if (err) {
                callback(err);
                return;
              }
              if (schema) {
                pending.push(schema);
              }
              next();
            });
          });
        } catch (err) {
          callback(err);
          return;
        }
        callback(null, types);
        return;
      }
      if (type.type === 'import') {
        loadSchema(type.path, namespace, (err, schema) => {
          if (err) {
            callback(err);
            return;
          }
          if (schema) {
            pending.push(schema);
          }
          next();
        });
      } else {
        const request = {};
        request.path = type.path;
        request.namespace = namespace;
        request.importHook = opts.importHook;
        opts.importHook(request, (err, result) => {
          if (err) {
            callback(err);
            return;
          }
          switch (type.type) {
            case 'array':
            case 'map': {
              if (!result) {
                next();
                return;
              }
              let parsed;
              try {
                parsed = JSON.parse(result.contents);
              } catch (err) {
                err.path = result.path;
                callback(err);
                return;
              }
              const wrapped = {};
              wrapped[type.name] = [parsed];
              let value = type.type === 'array' ? wrapped : parsed;
              pending.push(value);
              next();
              return;
            }
            default:
              callback(new Error('Unsupported type: ' + type.type));
          }
        });
      }
    }
  }
}

function loadDependencies(types, namespace, path, callback) {
  let pending = [];
  function next() {
    let type = types.shift();
    if (!type) {
      pending.pop();
      try {
        pending.forEach(dep => {
          loadSchema(dep, namespace, (err, schema) => {
            if (err) {
              callback(err);
              return;
            }
            if (schema) {
              pending.push(schema);
            }
            next();
          });
        });
      } catch (err) {
        callback(err);
        return;
      }
      callback(null, types);
      return;
    }
    if (type.type === 'import') {
      loadSchema(type.path, namespace, (err, schema) => {
        if (err) {
          callback(err);
          return;
        }
        if (schema) {
          pending.push(schema);
        }
        next();
      });
    } else {
      const request = {};
      request.path = type.path;
      request.namespace = namespace;
      request.importHook = opts.importHook;
      opts.importHook(request, (err, result) => {
        if (err) {
          callback(err);
          return;
        }
        switch (type.type) {
          case 'array':
          case 'map': {
            if (!result) {
              next();
              return;
            }
            let parsed;
            try {
              parsed = JSON.parse(result.contents);
            } catch (err) {
              err.path = result.path;
              callback(err);
              return;
            }
            const wrapped = {};
            wrapped[type.name] = [parsed];
            let value = type.type === 'array' ? wrapped : parsed;
            pending.push(value);
            next();
            return;
          }
          default:
            callback(new Error('Unsupported type: ' + type.type));
        }
      });
    }
  }
}

function read(schema) {
  let result, contents = files.readFileSync(schema);
  if (contents === null) result = schema;
  else try {
    return JSON.parse(contents);
  } catch (err) {
    let opts = { importHook: files.createSyncImportHook() };
    assembleProtocol(schema, opts, (err, result) => {
      result = err ? contents : result;
    });
  }
  if (typeof result === 'string' || result === null) {
    return result;
  }
  try {
    return JSON.parse(result);
  } catch (err) {
    try {
      return Reader.fromString(result);
    } catch (err) {
      try {
        return Reader.fromSchema(result);
      } catch (err) {
        return result;
      }
    }
  }
}

var Reader = class _Reader {
  constructor(schema, opts) {
    const config = {};
    config.importHook = 'utf8';
    config.default = function (a, b) { return a || b; };
    const parts = config.importHook.split('|');
    let i = 0;
    while (true) {
      switch (parts[i++]) {
        case '0':
          this.wrapUnions = !opts.wrapUnions;
          continue;
        case '1':
          this.tokenizer = new Tokenizer(schema);
          continue;
        case '2':
          opts = config.default(opts, {});
          continue;
        case '3':
          this.assertLogicalTypes = !!opts.assertLogicalTypes;
          continue;
        case '4':
          this.typeRefs = opts.typeRefs || TYPE_REFS;
          continue;
      }
      break;
    }
  }

  static fromString(str, opts) {
    const config = {};
    config.compare = function (a, b) { return a < b; };
    config.equal = function (a, b) { return a === b; };
    config.importHook = 'utf8';
    config.invalid = 'Invalid schema';
    let reader = new _Reader(str, opts);
    let result = reader.readProtocol();
    if (result.types.length) {
      throw new Error(config.invalid);
    }
    return result;
  }

  static fromSchema(schema, opts) {
    const config = {};
    config.equal = function (a, b) { return a === b; };
    config.importHook = 'utf8';
    let reader = new _Reader(schema, opts);
    let doc = reader.readProtocol();
    let result = reader.readType(config.equal(doc, undefined) ? {} : { doc }, true);
    const id = {};
    id.id = config.importHook;
    reader.tokenizer.expect(id);
    return result;
  }

  readProtocol() {
    const config = {};
    config.equal = function (a, b) { return a === b; };
    config.add = function (a, b) { return a + b; };
    config.multiply = function (a, b) { return a * b; };
    config.subtract = function (a, b) { return a - b; };
    config.less = function (a, b) { return a < b; };
    config.greaterEqual = function (a, b) { return a >= b; };
    config.shiftLeft = function (a, b) { return a << b; };
    config.and = function (a, b) { return a & b; };
    config.or = function (a, b) { return a | b; };
    config.shiftRight = function (a, b) { return a >> b; };
    config.add = function (a, b) { return a + b; };
    config.or = function (a, b) { return a | b; };
    config.and = function (a, b) { return a & b; };
    config.add = function (a, b) { return a + b; };
    config.or = function (a, b) { return a | b; };
    config.call = function (fn, arg) { return fn(arg); };
    config.notEqual = function (a, b) { return a !== b; };
    config.notEqual = function (a, b) { return a !== b; };
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf8';
    config.importHook = 'utf
