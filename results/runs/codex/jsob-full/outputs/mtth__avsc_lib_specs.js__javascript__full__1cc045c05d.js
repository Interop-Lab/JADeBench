'use strict';
const __getOwnPropNames = Object.getOwnPropertyNames;
const __commonJS = (modules, cachedModule) => function requireModule() {
  if (!cachedModule) {
    const module = { exports: {} };
    modules[__getOwnPropNames(modules)[0]](module.exports, module);
    cachedModule = module;
  }
  return cachedModule.exports;
};
const require_files = __commonJS({
  '../work/mtth__avsc/lib/files.js'(exports, module) {
    const fs = require('fs');
    const path = require('path');

    function createImportHook() {
      const importedPaths = {};
      return function importFile({ path: importPath, importerPath }, callback) {
        importPath = path.resolve(path.dirname(importerPath), importPath);
        if (importedPaths[importPath]) {
          process.nextTick(callback);
          return;
        }
        importedPaths[importPath] = true;
        fs.readFile(importPath, { encoding: 'utf8' }, (error, contents) => {
          if (error) return callback(error);
          return callback(null, { contents, path: importPath });
        });
      };
    }

    function createSyncImportHook() {
      const importedPaths = {};
      return function importFile({ path: importPath, importerPath }, callback) {
        importPath = path.resolve(path.dirname(importerPath), importPath);
        if (importedPaths[importPath]) {
          callback();
          return;
        }
        importedPaths[importPath] = true;
        callback(null, {
          contents: fs.readFileSync(importPath, { encoding: 'utf8' }),
          path: importPath,
        });
      };
    }

    function tryReadFileSync(filePath) {
      if (typeof filePath === 'string' && filePath.includes(path.sep)) {
        try {
          return fs.readFileSync(filePath, { encoding: 'utf8' });
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
      }
      return null;
    }

    module.exports = { createImportHook, createSyncImportHook, tryReadFileSync };
  },
});

const require_platform = __commonJS({
  '../work/mtth__avsc/lib/platform.js'(exports, module) {
    const crypto = require('crypto');

    function getHash(value, algorithm = 'md5') {
      const hash = crypto.createHash(algorithm);
      hash.end(value);
      const buffer = hash.read();
      return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
    }

    module.exports = { getHash };
  },
});

const require_utils = __commonJS({
  '../work/mtth__avsc/lib/utils.js'(exports, module) {
    'use strict';

    const platform = require_platform();
    const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

    function isBufferLike(value) {
      return value instanceof Uint8Array;
    }

    function capitalize(value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    function compare(left, right) {
      return left === right ? 0 : left < right ? -1 : 1;
    }

    let compareBuffers;
    let buffersEqual;
    if (typeof Buffer === 'function') {
      compareBuffers = Buffer.compare;
      buffersEqual = (left, right) => Buffer.prototype.equals.call(left, right);
    } else {
      compareBuffers = (left, right) => {
        if (left === right) return 0;
        const length = Math.min(left.length, right.length);
        for (let index = 0; index < length; index++) {
          if (left[index] !== right[index]) return Math.sign(left[index] - right[index]);
        }
        return Math.sign(left.length - right.length);
      };
      buffersEqual = (left, right) => left.length === right.length && compareBuffers(left, right) === 0;
    }

    function getOption(options, name, defaultValue) {
      return options[name] === undefined ? defaultValue : options[name];
    }

    function singleIndexOf(values, target) {
      if (!values) return -1;
      let foundIndex = -1;
      for (let index = 0; index < values.length; index++) {
        if (values[index] === target) {
          if (foundIndex >= 0) return -2;
          foundIndex = index;
        }
      }
      return foundIndex;
    }

    function toMap(values, getKey) {
      const result = {};
      for (const value of values) result[getKey(value)] = value;
      return result;
    }

    function objectValues(object) {
      return Object.keys(object).map((key) => object[key]);
    }

    function hasDuplicates(values, transform) {
      const seen = Object.create(null);
      for (const value of values) {
        const key = transform ? transform(value) : value;
        if (seen[key]) return true;
        seen[key] = true;
      }
      return false;
    }

    function copyOwnProperties(source, destination, overwrite) {
      for (const name of Object.getOwnPropertyNames(source)) {
        if (overwrite || !Object.prototype.hasOwnProperty.call(destination, name)) {
          Object.defineProperty(destination, name, Object.getOwnPropertyDescriptor(source, name));
        }
      }
      return destination;
    }

    function isValidName(name) {
      return NAME_PATTERN.test(name);
    }

    function qualify(name, namespace) {
      if (name.includes('.')) name = name.replace(/^\./, '');
      else if (namespace) name = namespace + '.' + name;
      name.split('.').forEach(isValidName);
      return name;
    }

    function unqualify(name) {
      const parts = name.split('.');
      return parts[parts.length - 1];
    }

    function impliedNamespace(name) {
      const match = /^(.*)\.[^.]+$/.exec(name);
      return match ? match[1] : undefined;
    }

    function jsonEnd(text, position) {
      position |= 0;
      let character = text.charAt(position++);
      if (/[\d-]/.test(character)) {
        while (/[eE\d.+-]/.test(text.charAt(position))) position++;
        return position;
      }
      if (/true|null/.test(text.slice(position - 1, position + 3))) return position + 3;
      if (/false/.test(text.slice(position - 1, position + 4))) return position + 4;

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
            if (!inString && !--depth) return position;
            break;
          case '"':
            inString = !inString;
            if (!depth && !inString) return position;
            break;
          case '\\':
            position++;
            break;
        }
      } while ((character = text.charAt(position++)));
      return -1;
    }

    function abstractFunction() {
      throw new Error('abstract');
    }

    class Lcg {
      constructor(seed) {
        const multiplier = 1103515245;
        const increment = 12345;
        const modulus = 2 ** 31;
        let state = Math.floor(seed || Math.random() * (modulus - 1));
        this._max = modulus;
        this._nextInt = () => (state = (multiplier * state + increment) % modulus);
      }

      nextBoolean() {
        return Boolean(this._nextInt() % 2);
      }

      nextInt(start, end) {
        if (end === undefined) {
          end = start;
          start = 0;
        }
        if (end === undefined) end = this._max;
        return start + Math.floor(this.nextFloat() * (end - start));
      }

      nextFloat(start, end) {
        if (end === undefined) {
          end = start;
          start = 0;
        }
        if (end === undefined) end = 1;
        return start + (end - start) * this._nextInt() / this._max;
      }

      nextString(length, flags = 'aA') {
        length |= 0;
        let characters = '';
        if (flags.includes('a')) characters += 'abcdefghijklmnopqrstuvwxyz';
        if (flags.includes('A')) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (flags.includes('#')) characters += '0123456789';
        if (flags.includes('!')) characters += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\\\';
        const result = [];
        for (let index = 0; index < length; index++) result.push(this.choice(characters));
        return result.join('');
      }

      nextBuffer(length) {
        const buffer = new Uint8Array(length);
        for (let index = 0; index < length; index++) buffer[index] = this.nextInt(256);
        return buffer;
      }

      choice(values) {
        if (!values.length) throw new Error('choosing from empty array');
        return values[this.nextInt(values.length)];
      }
    }

    class OrderedQueue {
      constructor() {
        this._index = 0;
        this._items = [];
      }

      push(item) {
        const items = this._items;
        let index = items.length;
        items.push(item);
        while (index > 0) {
          const parentIndex = (index - 1) >> 1;
          if (items[index].index >= items[parentIndex].index) break;
          [items[index], items[parentIndex]] = [items[parentIndex], items[index]];
          index = parentIndex;
        }
      }

      pop() {
        const items = this._items;
        const lastIndex = items.length - 1;
        const first = items[0];
        if (!first || first.index > this._index) return null;
        this._index++;
        if (!lastIndex) {
          items.pop();
          return first;
        }
        items[0] = items.pop();
        let index = 0;
        const midpoint = lastIndex >> 1;
        while (index < midpoint) {
          const leftIndex = (index << 1) + 1;
          const rightIndex = (index + 1) << 1;
          const childIndex = !items[rightIndex] || items[leftIndex].index <= items[rightIndex].index
            ? leftIndex
            : rightIndex;
          if (items[childIndex].index >= items[index].index) break;
          [items[index], items[childIndex]] = [items[childIndex], items[index]];
          index = childIndex;
        }
        return first;
      }
    }

    let decodeUtf8;
    if (typeof Buffer === 'function' && typeof Buffer.prototype.utf8Slice === 'function') {
      decodeUtf8 = Function.prototype.call.bind(Buffer.prototype.utf8Slice);
    } else {
      const decoder = new TextDecoder();
      decodeUtf8 = (buffer, start, end) => decoder.decode(buffer.subarray(start, end));
    }

    const utf8Encoder = new TextEncoder();
    const encodingBuffer = new Uint8Array(4096);
    const encodingChunks = [];
    function encodeUtf8(text) {
      const { read, written } = utf8Encoder.encodeInto(text, encodingBuffer);
      if (read === text.length) {
        if (!encodingChunks[written]) encodingChunks[written] = encodingBuffer.subarray(0, written);
        return encodingChunks[written];
      }
      return utf8Encoder.encode(text);
    }

    let utf8ByteLength;
    if (typeof Buffer === 'function') {
      utf8ByteLength = Buffer.byteLength;
    } else {
      utf8ByteLength = (text) => {
        let length = 0;
        while (true) {
          const { read, written } = utf8Encoder.encodeInto(text, encodingBuffer);
          length += written;
          if (read === text.length) break;
          text = text.slice(read);
        }
        return length;
      };
    }

    let bufferToBinaryString;
    if (typeof Buffer === 'function' && typeof Buffer.prototype.latin1Slice === 'function') {
      bufferToBinaryString = Function.prototype.call.bind(Buffer.prototype.latin1Slice);
    } else {
      bufferToBinaryString = (buffer) => {
        let result = '';
        let index = 0;
        for (; index + 7 < buffer.length; index += 8) {
          result += String.fromCharCode(...buffer.subarray(index, index + 8));
        }
        for (; index < buffer.length; index++) result += String.fromCharCode(buffer[index]);
        return result;
      };
    }

    let binaryStringToBuffer;
    if (typeof Buffer === 'function') {
      binaryStringToBuffer = (text) => {
        const buffer = Buffer.from(text, 'binary');
        return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
      };
    } else {
      binaryStringToBuffer = (text) => {
        const buffer = new Uint8Array(text.length);
        for (let index = 0; index < text.length; index++) buffer[index] = text.charCodeAt(index);
        return buffer;
      };
    }

    const floatView = new DataView(new ArrayBuffer(8));
    class Tap {
      constructor(data, offset) {
        this.setData(data, offset);
      }

      setData(data, offset) {
        if (typeof Buffer === 'function' && data instanceof Buffer) {
          data = new Uint8Array(data.buffer, data.byteOffset, data.length);
        }
        this.arr = data;
        this.pos = offset | 0;
        if (this.pos < 0) throw new Error('negative offset');
      }

      get length() {
        return this.arr.length;
      }

      reinitialize(capacity) {
        this.setData(new Uint8Array(capacity));
      }

      static fromBuffer(buffer, offset) {
        return new Tap(buffer, offset);
      }

      static withCapacity(capacity) {
        return new Tap(new Uint8Array(capacity));
      }

      toBuffer() {
        return this.arr.slice(0, this.pos);
      }

      subarray(start, end) {
        return this.arr.subarray(start, end);
      }

      append(data) {
        const combined = new Uint8Array(this.arr.length + data.length);
        combined.set(this.arr, 0);
        combined.set(data, this.arr.length);
        this.setData(combined, 0);
      }

      forward(data) {
        const remaining = this.arr.subarray(this.pos);
        const combined = new Uint8Array(remaining.length + data.length);
        combined.set(remaining, 0);
        combined.set(data, remaining.length);
        this.setData(combined, 0);
      }

      isValid() {
        return this.pos <= this.arr.length;
      }

      _invalidate() {
        this.pos = this.arr.length + 1;
      }

      readBoolean() {
        return Boolean(this.arr[this.pos++]);
      }

      skipBoolean() {
        this.pos++;
      }

      writeBoolean(value) {
        this.arr[this.pos++] = Boolean(value);
      }

      readLong() {
        let encoded = 0;
        let shift = 0;
        let byte;
        let hasMore;
        do {
          byte = this.arr[this.pos++];
          hasMore = byte & 128;
          encoded |= (byte & 127) << shift;
          shift += 7;
        } while (hasMore && shift < 28);

        if (hasMore) {
          let value = encoded;
          let multiplier = 268435456;
          do {
            byte = this.arr[this.pos++];
            value += (byte & 127) * multiplier;
            multiplier *= 128;
          } while (byte & 128);
          return (value % 2 ? -(value + 1) : value) / 2;
        }
        return (encoded >> 1) ^ -(encoded & 1);
      }

      skipLong() {
        while (this.arr[this.pos++] & 128) {}
      }

      writeLong(value) {
        let encoded;
        if (value >= -1073741824 && value < 1073741824) {
          encoded = value >= 0 ? value << 1 : (~value << 1) | 1;
          do {
            this.arr[this.pos] = encoded & 127;
            encoded >>= 7;
          } while (encoded && (this.arr[this.pos++] |= 128));
        } else {
          encoded = value >= 0 ? value * 2 : -value * 2 - 1;
          do {
            this.arr[this.pos] = encoded & 127;
            encoded /= 128;
          } while (encoded >= 1 && (this.arr[this.pos++] |= 128));
        }
        this.pos++;
      }

      readFloat() {
        const start = this.pos;
        this.pos += 4;
        if (this.pos > this.arr.length) return undefined;
        const bits = this.arr[start]
          | this.arr[start + 1] << 8
          | this.arr[start + 2] << 16
          | this.arr[start + 3] << 24;
        floatView.setUint32(0, bits, true);
        return floatView.getFloat32(0, true);
      }

      skipFloat() {
        this.pos += 4;
      }

      writeFloat(value) {
        const start = this.pos;
        this.pos += 4;
        if (this.pos > this.arr.length) return;
        floatView.setFloat32(0, value, true);
        const bits = floatView.getUint32(0, true);
        this.arr[start] = bits & 255;
        this.arr[start + 1] = bits >> 8 & 255;
        this.arr[start + 2] = bits >> 16 & 255;
        this.arr[start + 3] = bits >> 24;
      }

      readDouble() {
        const start = this.pos;
        this.pos += 8;
        if (this.pos > this.arr.length) return undefined;
        const lowBits = this.arr[start]
          | this.arr[start + 1] << 8
          | this.arr[start + 2] << 16
          | this.arr[start + 3] << 24;
        const highBits = this.arr[start + 4]
          | this.arr[start + 5] << 8
          | this.arr[start + 6] << 16
          | this.arr[start + 7] << 24;
        floatView.setUint32(0, lowBits, true);
        floatView.setUint32(4, highBits, true);
        return floatView.getFloat64(0, true);
      }

      skipDouble() {
        this.pos += 8;
      }

      writeDouble(value) {
        const start = this.pos;
        this.pos += 8;
        if (this.pos > this.arr.length) return;
        floatView.setFloat64(0, value, true);
        const lowBits = floatView.getUint32(0, true);
        const highBits = floatView.getUint32(4, true);
        this.arr[start] = lowBits & 255;
        this.arr[start + 1] = lowBits >> 8 & 255;
        this.arr[start + 2] = lowBits >> 16 & 255;
        this.arr[start + 3] = lowBits >> 24;
        this.arr[start + 4] = highBits & 255;
        this.arr[start + 5] = highBits >> 8 & 255;
        this.arr[start + 6] = highBits >> 16 & 255;
        this.arr[start + 7] = highBits >> 24;
      }

      readFixed(length) {
        const start = this.pos;
        this.pos += length;
        if (this.pos > this.arr.length) return undefined;
        return this.arr.slice(start, start + length);
      }

      skipFixed(length) {
        this.pos += length;
      }

      writeFixed(buffer, length = buffer.length) {
        const start = this.pos;
        this.pos += length;
        if (this.pos <= this.arr.length) this.arr.set(buffer.subarray(0, length), start);
      }

      readBytes() {
        const length = this.readLong();
        if (length < 0) {
          this._invalidate();
          return undefined;
        }
        return this.readFixed(length);
      }

      skipBytes() {
        const length = this.readLong();
        if (length < 0) this._invalidate();
        else this.pos += length;
      }

      writeBytes(buffer) {
        this.writeLong(buffer.length);
        this.writeFixed(buffer);
      }

      skipString() {
        this.skipBytes();
      }

      readString() {
        const length = this.readLong();
        if (length < 0) {
          this._invalidate();
          return '';
        }
        const start = this.pos;
        this.pos += length;
        if (this.pos > this.arr.length) return undefined;
        return decodeUtf8(this.arr, start, start + length);
      }

      writeString(text) {
        if (text.length > 21) {
          let encoded;
          const byteLength = this.isValid()
            ? (encoded = encodeUtf8(text)).length
            : utf8ByteLength(text);
          this.writeLong(byteLength);
          const start = this.pos;
          this.pos += byteLength;
          if (this.isValid() && encoded !== undefined) this.arr.set(encoded, start);
          return;
        }

        const buffer = this.arr;
        let end = this.pos + 1;
        const start = end;
        const capacity = buffer.length;
        for (let index = 0; index < text.length; index++) {
          let codePoint = text.charCodeAt(index);
          if (codePoint < 128) {
            if (end < capacity) buffer[end] = codePoint;
            end++;
          } else if (codePoint < 2048) {
            if (end + 1 < capacity) {
              buffer[end] = codePoint >> 6 | 192;
              buffer[end + 1] = codePoint & 63 | 128;
            }
            end += 2;
          } else {
            const lowSurrogate = text.charCodeAt(index + 1);
            if ((codePoint & 64512) === 55296 && (lowSurrogate & 64512) === 56320) {
              codePoint = 65536 + ((codePoint & 1023) << 10) + (lowSurrogate & 1023);
              index++;
              if (end + 3 < capacity) {
                buffer[end] = codePoint >> 18 | 240;
                buffer[end + 1] = codePoint >> 12 & 63 | 128;
                buffer[end + 2] = codePoint >> 6 & 63 | 128;
                buffer[end + 3] = codePoint & 63 | 128;
              }
              end += 4;
            } else {
              if (end + 2 < capacity) {
                buffer[end] = codePoint >> 12 | 224;
                buffer[end + 1] = codePoint >> 6 & 63 | 128;
                buffer[end + 2] = codePoint & 63 | 128;
              }
              end += 3;
            }
          }
        }
        if (this.pos <= capacity) this.writeLong(end - start);
        this.pos = end;
      }

      matchBoolean(other) {
        return this.arr[this.pos++] - other.arr[other.pos++];
      }

      matchLong(other) {
        return compare(this.readLong(), other.readLong());
      }

      matchFloat(other) {
        return compare(this.readFloat(), other.readFloat());
      }

      matchDouble(other) {
        return compare(this.readDouble(), other.readDouble());
      }

      matchFixed(other, length) {
        return compareBuffers(this.readFixed(length), other.readFixed(length));
      }

      matchBytes(other) {
        const leftLength = this.readLong();
        const leftStart = this.pos;
        this.pos += leftLength;
        const rightLength = other.readLong();
        const rightStart = other.pos;
        other.pos += rightLength;
        return compareBuffers(
          this.arr.subarray(leftStart, this.pos),
          other.arr.subarray(rightStart, other.pos),
        );
      }

      unpackLongBytes() {
        const bytes = new Uint8Array(8);
        let value = 0;
        let byteIndex = 0;
        let shift = 6;
        let byte = this.arr[this.pos++];
        const negative = byte & 1;
        bytes.fill(0);
        value |= (byte & 127) >> 1;
        while (byte & 128) {
          byte = this.arr[this.pos++];
          value |= (byte & 127) << shift;
          shift += 7;
          if (shift >= 8) {
            shift -= 8;
            bytes[byteIndex++] = value;
            value >>= 8;
          }
        }
        bytes[byteIndex] = value;
        if (negative) invertBytes(bytes, 8);
        return bytes;
      }

      packLongBytes(bytes) {
        const negative = (bytes[7] & 128) >> 7;
        if (negative) invertBytes(bytes, 8);
        const words = [
          bytes[0] | bytes[1] << 8 | bytes[2] << 16,
          bytes[3] | bytes[4] << 8 | bytes[5] << 16,
          bytes[6] | bytes[7] << 8,
        ];
        let wordCount = 3;
        while (wordCount && !words[--wordCount]) {}
        let wordIndex = 0;
        let shift = 1;
        let value = negative ? 1 : 0;
        while (wordIndex < wordCount) {
          value |= words[wordIndex++] << shift;
          shift += 24;
          while (shift > 7) {
            this.arr[this.pos++] = value & 127 | 128;
            value >>= 7;
            shift -= 7;
          }
        }
        value |= words[wordCount] << shift;
        do {
          this.arr[this.pos] = value & 127;
          value >>= 7;
        } while (value && (this.arr[this.pos++] |= 128));
        this.pos++;
        if (negative) invertBytes(bytes, 8);
      }
    }
    function invertBytes(bytes, length) {
      while (length--) bytes[length] = ~bytes[length];
    }

    function printJSON(value) {
      const seen = new Set();
      try {
        return JSON.stringify(value, (key, item) => {
          if (seen.has(item)) return '[Circular]';
          if (typeof item === 'object' && item !== null) seen.add(item);
          if (typeof BigInt !== 'undefined' && item instanceof BigInt) {
            return '[BigInt ' + item.toString() + 'n]';
          }
          return item;
        });
      } catch {
        return '[object]';
      }
    }

    module.exports = {
      abstractFunction,
      bufCompare: compareBuffers,
      bufEqual: buffersEqual,
      bufferToBinaryString,
      binaryStringToBuffer,
      capitalize,
      copyOwnProperties,
      getHash: platform.getHash,
      compare,
      getOption,
      impliedNamespace,
      isBufferLike,
      isValidName,
      jsonEnd,
      objectValues,
      qualify,
      toMap,
      singleIndexOf,
      hasDuplicates,
      unqualify,
      Lcg,
      OrderedQueue,
      Tap,
      printJSON,
    };
  }
});

const files = require_files();
const utils = require_utils();
const TYPE_REFS = {
  date: { type: 'int', logicalType: 'date' },
  decimal: { type: 'bytes', logicalType: 'decimal' },
  time_ms: { type: 'long', logicalType: 'time-millis' },
  timestamp_ms: { type: 'long', logicalType: 'timestamp-millis' },
};
function assembleProtocol(filePath, options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  options = options || {};
  if (!options.importHook) options.importHook = files.createImportHook();

  loadIdlImport(filePath, '', (error, protocol) => {
    if (error) return callback(error);
    if (!protocol) return callback(new Error('empty root import'));
    const namespace = protocolNamespace(protocol) || '';
    if (protocol.types) {
      protocol.types.forEach((type) => {
        if (type.namespace === namespace) delete type.namespace;
      });
    }
    callback(null, protocol);
  });

  function loadIdlImport(importPath, importerPath, done) {
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
      loadImports(parsed.protocol, parsed.imports, resolvedPath, done);
    });
  }

  function loadImports(protocol, imports, importerPath, done) {
    const importedProtocols = [];
    processNextImport();

    function processNextImport() {
      const descriptor = imports.shift();
      if (!descriptor) {
        importedProtocols.reverse();
        try {
          importedProtocols.forEach((importedProtocol) => mergeProtocol(protocol, importedProtocol));
        } catch (error) {
          return done(error);
        }
        return done(null, protocol);
      }

      if (descriptor.kind === 'idl') {
        loadIdlImport(descriptor.name, importerPath, (error, importedProtocol) => {
          if (error) return done(error);
          if (importedProtocol) importedProtocols.push(importedProtocol);
          processNextImport();
        });
        return;
      }

      const request = {
        path: descriptor.name,
        importerPath,
        kind: descriptor.kind,
      };
      options.importHook(request, (error, importedFile) => {
        if (error) return done(error);
        switch (descriptor.kind) {
          case 'protocol':
          case 'schema': {
            if (!importedFile) return processNextImport();
            let importedValue;
            try {
              importedValue = JSON.parse(importedFile.contents);
            } catch (parseError) {
              parseError.path = importedFile.path;
              return done(parseError);
            }
            importedProtocols.push(
              descriptor.kind === 'schema' ? { types: [importedValue] } : importedValue,
            );
            processNextImport();
            return;
          }
          default:
            done(new Error('invalid import kind: ' + descriptor.kind));
        }
      });
    }
  }

  function mergeProtocol(protocol, importedProtocol) {
    const importedTypes = importedProtocol.types || [];
    importedTypes.reverse();
    importedTypes.forEach((type) => {
      if (!protocol.types) protocol.types = [];
      if (type.namespace === undefined) {
        type.namespace = protocolNamespace(importedProtocol) || '';
      }
      protocol.types.unshift(type);
    });

    Object.keys(importedProtocol.messages || {}).forEach((name) => {
      if (!protocol.messages) protocol.messages = {};
      if (protocol.messages[name]) throw new Error('duplicate message: ' + name);
      protocol.messages[name] = importedProtocol.messages[name];
    });
  }
}
function read(input) {
  let contents;
  const fileContents = files.tryReadFileSync(input);
  if (fileContents === null) {
    contents = input;
  }
  else {
    try {
      return JSON.parse(fileContents);
    }
    catch {
      assembleProtocol(input, {
        importHook: files.createSyncImportHook()
      }, (error, protocol) => {
        contents = error ? fileContents : protocol;
      });
    }
  }
  if (typeof contents !== 'string' || contents === 'null') return contents;
  try {
    return JSON.parse(contents);
  }
  catch {
    try {
      return Reader.readProtocol(contents);
    }
    catch {
      try {
        return Reader.readSchema(contents);
      }
      catch {
        return contents;
      }
    }
  }
}
class Reader {
  constructor(input, options = {}) {
    this._tk = new Tokenizer(input);
    this._ackVoidMessages = Boolean(options.ackVoidMessages);
    this._implicitTags = !options.delimitedCollections;
    this._typeRefs = options.typeRefs || TYPE_REFS;
  }

  static readProtocol(input, options) {
    const reader = new Reader(input, options);
    const result = reader._readProtocol();
    if (result.imports.length) throw new Error('unresolvable import');
    return result.protocol;
  }

  static readSchema(input, options) {
    const reader = new Reader(input, options);
    const doc = reader._readJavadoc();
    const schema = reader._readType(doc === undefined ? {} : { doc }, true);
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
    const doc = this._readJavadoc();
    if (doc !== undefined) protocol.doc = doc;
    this._readAnnotations(protocol);
    tokenizer.next({ val: 'protocol' });
    if (!tokenizer.next({ val: '{', silent: true })) {
      protocol.protocol = tokenizer.next({ id: 'name' }).val;
      tokenizer.next({ val: '{' });
    }

    while (!tokenizer.next({ val: '}', silent: true })) {
      if (this._readImports(imports)) continue;

      const itemDoc = this._readJavadoc();
      const type = this._readType({}, true);
      const importedType = this._readImports(imports, true);
      const savedPosition = tokenizer.pos;
      const message = importedType ? undefined : this._readMessage(type);

      if (message) {
        if (itemDoc !== undefined && message.schema.doc === undefined) {
          message.schema.doc = itemDoc;
        }
        const response = message.schema.response;
        if (response === 'void' || response && response.type === 'void') {
          const oneWay = !this._ackVoidMessages && !message.schema.errors;
          if (response === 'void') message.schema.response = 'null';
          else response.type = 'null';
          if (oneWay) message.schema['one-way'] = true;
        }
        if (messages[message.name]) throw new Error('duplicate message: ' + message.name);
        messages[message.name] = message.schema;
      } else {
        if (itemDoc) {
          if (typeof type === 'string') types.push({ doc: itemDoc, type });
          else {
            if (type.doc === undefined) type.doc = itemDoc;
            types.push(type);
          }
        } else {
          types.push(type);
        }
        tokenizer.pos = savedPosition;
        tokenizer.next({ val: ';', silent: true });
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
      while (!tokenizer.next({ val: '(', silent: true })) {
        nameParts.push(tokenizer.next().val);
      }
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
      do {
        schema.request.push(this._readField());
      } while (!tokenizer.next({ val: ')', silent: true }) && tokenizer.next({ val: ',' }));
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
    const doc = this._readJavadoc();
    const field = { type: this._readType() };
    if (doc !== undefined && field.doc === undefined) field.doc = doc;
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

  _readType(schema = {}, allowEnumDefault) {
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
        if (Object.keys(schema).length > 1) {
          throw new Error('union annotations are not supported');
        }
        return this._readUnion();
      default: {
        const typeRef = this._typeRefs[schema.type];
        if (typeRef) {
          delete schema.type;
          utils.copyOwnProperties(typeRef, schema);
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
    schema.size = Number(tokenizer.next({ id: 'number' }).val);
    tokenizer.next({ val: ')' });
    return schema;
  }

  _readMap(schema) {
    const tokenizer = this._tk;
    const implicit = this._implicitTags;
    const explicit = tokenizer.next({ val: '<', silent: implicit }) !== undefined;
    schema.values = this._readType();
    tokenizer.next({ val: '>', silent: !explicit });
    return schema;
  }

  _readArray(schema) {
    const tokenizer = this._tk;
    const implicit = this._implicitTags;
    const explicit = tokenizer.next({ val: '<', silent: implicit }) !== undefined;
    schema.items = this._readType();
    tokenizer.next({ val: '>', silent: !explicit });
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
    const types = [];
    tokenizer.next({ val: '{' });
    do {
      types.push(this._readType());
    } while (!tokenizer.next({ val: '}', silent: true }) && tokenizer.next({ val: ',' }));
    return types;
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

  _readImports(imports, typeRefs) {
    const tokenizer = this._tk;
    let count = 0;
    const start = tokenizer.pos;
    while (tokenizer.next({ val: 'import', silent: true })) {
      if (!count && typeRefs && tokenizer.next({ val: '(', silent: true })) {
        tokenizer.pos = start;
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
class Tokenizer {
  constructor(input) {
    this._str = input;
    this.pos = 0;
  }

  next(expected) {
    const token = { pos: this.pos, id: undefined, val: undefined };
    const javadoc = this._skip(expected && expected.emitJavadoc);
    if (typeof javadoc === 'string') {
      token.id = 'javadoc';
      token.val = javadoc;
    } else {
      const start = this.pos;
      const character = this._str.charAt(start);
      if (!character) {
        token.id = '(eof)';
      } else if (expected && expected.id === 'json') {
        token.id = 'json';
        this.pos = this._endOfJson();
      } else if (character === '"') {
        token.id = 'string';
        this.pos = this._endOfString();
      } else if (/[\d-]/.test(character)) {
        token.id = 'number';
        this.pos = this._endOf(/[\deE.+-]/);
      } else if (/[`A-Za-z_.]/.test(character)) {
        token.id = 'name';
        this.pos = this._endOf(/[`A-Za-z0-9_.]/);
      } else {
        token.id = 'operator';
        this.pos = start + 1;
      }

      token.val = this._str.slice(start, this.pos);
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

    let error;
    if (expected && expected.id && expected.id !== token.id) {
      error = this.error('expected ID ' + expected.id, token);
    } else if (expected && expected.val && expected.val !== token.val) {
      error = this.error('expected value ' + expected.val, token);
    }
    if (!error) return token;
    if (expected && expected.silent) {
      this.pos = token.pos;
      return undefined;
    }
    throw error;
  }

  error(message, tokenOrPosition) {
    const hasToken = typeof tokenOrPosition !== 'number';
    const position = hasToken ? tokenOrPosition.pos : tokenOrPosition;
    let lineNum = 1;
    let lastLineStart = 0;
    for (let index = 0; index < position; index++) {
      if (this._str.charAt(index) === '\n') {
        lineNum++;
        lastLineStart = index;
      }
    }
    const description = hasToken
      ? 'invalid token ' + utils.printJSON(tokenOrPosition) + ': ' + message
      : message;
    const error = new Error(description);
    error.token = hasToken ? tokenOrPosition : undefined;
    error.lineNum = lineNum;
    error.colNum = position - lastLineStart;
    return error;
  }

  _skip(emitJavadoc) {
    const input = this._str;
    let character;
    while ((character = input.charAt(this.pos)) && /\s/.test(character)) this.pos++;

    const commentStart = this.pos;
    if (character !== '/') return undefined;
    switch (input.charAt(this.pos + 1)) {
      case '/':
        this.pos += 2;
        while ((character = input.charAt(this.pos)) && character !== '\n') this.pos++;
        return this._skip(emitJavadoc);
      case '*': {
        this.pos += 2;
        const isJavadoc = input.charAt(this.pos) === '*';
        while ((character = input.charAt(this.pos++))) {
          if (character === '*' && input.charAt(this.pos) === '/') {
            this.pos++;
            if (isJavadoc && emitJavadoc) {
              return extractJavadoc(input.slice(commentStart + 3, this.pos - 2));
            }
            return this._skip(emitJavadoc);
          }
        }
        throw this.error('unterminated comment', commentStart);
      }
      default:
        return undefined;
    }
  }

  _endOf(pattern) {
    let position = this.pos;
    while (pattern.test(this._str.charAt(position))) position++;
    return position;
  }

  _endOfString() {
    let position = this.pos + 1;
    let character;
    while ((character = this._str.charAt(position))) {
      if (character === '"') return position + 1;
      position += character === '\\' ? 2 : 1;
    }
    throw this.error('unterminated string', position - 1);
  }

  _endOfJson() {
    const position = utils.jsonEnd(this._str, this.pos);
    if (position < 0) throw this.error('invalid JSON', position);
    return position;
  }
}
function extractJavadoc(comment) {
  const lines = comment
    .trim()
    .split('\n')
    .map((line, index) => index ? line.replace(/^\s*\*\s?/, '') : line);
  while (lines.length && !lines[0]) lines.shift();
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  return lines.join('\n');
}

function protocolNamespace(protocol) {
  if (protocol.namespace) return protocol.namespace;
  const match = /^(.*)\.[^.]+$/.exec(protocol.protocol);
  return match ? match[1] : undefined;
}
module.exports = {
  Tokenizer,
  assembleProtocol,
  read,
  readProtocol: Reader.readProtocol,
  readSchema: Reader.readSchema,
};
