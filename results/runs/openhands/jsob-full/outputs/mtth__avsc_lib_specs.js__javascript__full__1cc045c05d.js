'use strict';
var createCommonJsLoader = (moduleFactories, cachedModule) => function requireModule() {
  if (!cachedModule) {
    const moduleRecord = {
      exports: {}
    };
    const factoryName = Object.getOwnPropertyNames(moduleFactories)[0];
    moduleFactories[factoryName](moduleRecord.exports, moduleRecord);
    cachedModule = moduleRecord;
  }
  return cachedModule.exports;
}, loadFiles = createCommonJsLoader({
  '../work/mtth__avsc/lib/files.js'(_unusedExports, filesModule) {
    'use strict';
    const fs = require('fs');
    const path = require('path');
    function createImportHook() {
      const importedPaths = {};
      return function importFile({
        path: importPath, importerPath
      }, callback) {
        importPath = path.resolve(path.dirname(importerPath), importPath);
        if (importedPaths[importPath]) {
          process.nextTick(callback);
          return ;
        }
        importedPaths[importPath] = true;
        fs.readFile(importPath, {
          encoding: 'utf8'
        }, (error, contents) => {
          if (error) return callback(error);
          return callback(null, {
            contents, path: importPath
          });
        });
      };
    }
    function createSyncImportHook() {
      const importedPaths = {};
      return function importFile({
        path: importPath, importerPath
      }, callback) {
        importPath = path.resolve(path.dirname(importerPath), importPath);
        if (importedPaths[importPath]) {
          callback();
          return ;
        }
        importedPaths[importPath] = true;
        callback(null, {
          contents: fs.readFileSync(importPath, {
            encoding: 'utf8'
          }), path: importPath,
        });
      };
    }
    function tryReadFileSync(filePath) {
      if (typeof filePath === 'string' && filePath.indexOf(path.sep) !== - 1) {
        try {
          return fs.readFileSync(filePath, {
            encoding: 'utf8'
          });
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
      }
      return null;
    }
    filesModule.exports = {
      createImportHook, createSyncImportHook, tryReadFileSync
    };
  }
}), loadPlatform = createCommonJsLoader({
  '../work/mtth__avsc/lib/platform.js'(_unusedExports, platformModule) {
    const crypto = require('crypto');
    function getHash(data, algorithm = 'md5') {
      const hash = crypto.createHash(algorithm);
      hash.end(data);
      const digest = hash.read();
      return new Uint8Array(digest.buffer, digest.byteOffset, digest.length);
    }
    platformModule.exports = {
      getHash
    };
  }
}), loadUtils = createCommonJsLoader({
  '../work/mtth__avsc/lib/utils.js'(_unusedExports, utilsModule) {
    'use strict';
    const platform = loadPlatform();
    const validNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
    function isBufferLike(value) {
      return value instanceof Uint8Array;
    }
    function capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
    function compare(left, right) {
      return left === right?0: left < right? - 1: 1;
    }
    let bufCompare;
    let bufEqual;
    if (typeof Buffer === 'function') {
      bufCompare = Buffer.compare;
      bufEqual = (left, right) => Buffer.prototype.equals.call(left, right);
    } else {
      bufCompare = (left, right) => {
        if (left === right) return 0;
        const commonLength = Math.min(left.length, right.length);
        for (let index = 0; index < commonLength; index++) {
          if (left[index] !== right[index]) return Math.sign(left[index] - right[index]);
        }
        return Math.sign(left.length - right.length);
      };
      bufEqual = (left, right) => left.length === right.length && bufCompare(left, right) === 0;
    }
    function getOption(options, key, defaultValue) {
      const value = options[key];
      return value === undefined?defaultValue: value;
    }
    function singleIndexOf(values, searchedValue) {
      if (!values) return - 1;
      let matchedIndex = - 1;
      for (let index = 0; index < values.length; index++) {
        if (values[index] !== searchedValue) continue;
        if (matchedIndex >= 0) return - 2;
        matchedIndex = index;
      }
      return matchedIndex;
    }
    function toMap(values, keyFunction) {
      const map = {};
      for (const value of values) map[keyFunction(value)] = value;
      return map;
    }
    function objectValues(object) {
      return Object.keys(object).map((key) => object[key]);
    }
    function hasDuplicates(values, transform) {
      const seen = Object.create(null);
      for (let value of values) {
        if (transform) value = transform(value);
        if (seen[value]) return true;
        seen[value] = true;
      }
      return false;
    }
    function copyOwnProperties(source, target, overwrite) {
      for (const propertyName of Object.getOwnPropertyNames(source)) {
        if (!Object.prototype.hasOwnProperty.call(target, propertyName) || overwrite) {
          const descriptor = Object.getOwnPropertyDescriptor(source, propertyName);
          Object.defineProperty(target, propertyName, descriptor);
        }
      }
      return target;
    }
    function isValidName(name) {
      return validNamePattern.test(name);
    }
    function qualify(name, namespace) {
      if (name.includes('.')) name = name.replace(/^\./, '');
      else if (namespace) name = namespace + '.' + name;
      name.split('.').forEach((part) => {
        if (!isValidName(part)) throw new Error('invalid name: ' + printJSON(name));
      });
      return name;
    }
    function unqualify(name) {
      const parts = name.split('.');
      return parts[parts.length - 1];
    }
    function impliedNamespace(name) {
      const match = /^(.*)\.[^.]+$/.exec(name);
      return match?match[1]: undefined;
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
          case '{': case '[': if (!inString) depth++;
          break;
          case '}': case ']': if (!inString && !-- depth) return position;
          break;
          case '"': inString = !inString;
          if (!depth && !inString) return position;
          break;
          case '\\': position++;
          break;
        }
      }
      while ((character = text.charAt(position++)));
      return - 1;
    }
    function abstractFunction() {
      throw new Error('abstract');
    }
    var Lcg = class {
      constructor(seed) {
        {
          let multiplier1 = 1103515245, increment = 12345, modulus = Math.pow(2, 31), state = Math.floor(seed || (Math.random() * ((modulus - 1))));
          this._max = modulus, this._nextInt = function() {
            return state = (((((multiplier1 * state)) + increment)) % modulus), state;
          };
        }
      }
      nextBoolean() {
        return !!(this._nextInt() % 2);
      }
      nextInt(lower1, upper1) {
        if ((upper1 === undefined)) {
          upper1 = lower1, lower1 = 0;
        }
        return upper1 = (upper1 === undefined)?this._max: upper1, (lower1 + Math.floor((this.nextFloat() * ((upper1 - lower1)))));
      }
      nextFloat(lower2, upper2) {
        {
          if ((upper2 === undefined)) {
            upper2 = lower2, lower2 = 0;
          }
          return upper2 = (upper2 === undefined)?1: upper2, (lower2 + ((((((upper2 - lower2)) * this._nextInt()))/this._max)));
        }
      }
      nextString(length4, characterClasses) {
        {
          length4 |= 0, characterClasses = (characterClasses || 'aA');
          let characterPool = '';
          (characterClasses.indexOf('a') > ( - 1)) && (characterPool += "abcdefghijklmnopqrstuvwxyz");
          (characterClasses.indexOf('A') > ( - 1)) && (characterPool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
          (characterClasses.indexOf('#') > ( - 1)) && (characterPool += "0123456789");
          (characterClasses.indexOf('!') > ( - 1)) && (characterPool += "~`!@#$%^&*()_+-={}[]:\";'<>?,./|\\");
          let characters = [];
          for (let index6 = 0; (index6 < length4); index6++) {
            characters.push(this.choice(characterPool));
          }
          return characters.join('');
        }
      }
      nextBuffer(length5) {
        {
          let buffer1 = new Uint8Array(length5);
          for (let index7 = 0; (index7 < length5); index7++) {
            buffer1[index7] = this.nextInt(256);
          }
          return buffer1;
        }
      }
      choice(choices) {
        let length6 = choices.length;
        if (!length6) {
          throw new Error("choosing from empty array");
        }
        return choices[this.nextInt(length6)];
      }
    }, OrderedQueue = class {
      constructor() {
        this._index = 0, this._items = [];
      }
      push(item) {
        {
          let items1 = this._items, index8 = (items1.length | 0), parentIndex;
          items1.push(item);
          while ((index8 > 0) && (items1[index8].index < items1[parentIndex = (((index8 - 1)) >> 1)].index)) {
            item = items1[index8], items1[index8] = items1[parentIndex], items1[parentIndex] = item, index8 = parentIndex;
          }
        }
      }
      pop() {
        {
          let items2 = this._items, lastIndex = (((items2.length - 1)) | 0), nextItem = items2[0];
          if (!nextItem || (nextItem.index > this._index)) {
            return null;
          }
          this._index++;
          if (!lastIndex) return items2.pop(), nextItem;
          items2[0] = items2.pop();
          let firstLeafIndex = (lastIndex >> 1), index9 = 0, leftIndex, rightIndex, childIndex, parentItem, childItem, leftItem, rightItem;
          while ((index9 < firstLeafIndex)) {
            parentItem = items2[index9], leftIndex = (((index9 << 1)) + 1), rightIndex = (((index9 + 1)) << 1), leftItem = items2[leftIndex], rightItem = items2[rightIndex];
            !rightItem || (leftItem.index <= rightItem.index)?(childItem = leftItem, childIndex = leftIndex): childItem = rightItem, childIndex = rightIndex;
            if ((childItem.index >= parentItem.index)) break;
            items2[childIndex] = parentItem, items2[index9] = childItem, index9 = childIndex;
          }
          return nextItem;
        }
      }
    }, utf8Slice;
    if (((typeof Buffer) === "function") && ((typeof Buffer.prototype.utf8Slice) === "function")) {
      utf8Slice = Function.prototype.call.bind(Buffer.prototype.utf8Slice);
    } else {
      const textDecoder = new TextDecoder();
      utf8Slice = function(buffer2, start1, end1) {
        return textDecoder.decode(buffer2.subarray(start1, end1));
      };
    }
    var textEncoder = new TextEncoder(), utf8ScratchBuffer = new Uint8Array(4096), utf8EncodingCache = [];
    function encodeUtf8(text3) {
      const {
        read: charsRead1, written: bytesWritten1
      }
      = textEncoder.encodeInto(text3, utf8ScratchBuffer);
      if ((charsRead1 === text3.length)) return !utf8EncodingCache[bytesWritten1] && (utf8EncodingCache[bytesWritten1] = utf8ScratchBuffer.subarray(0, bytesWritten1)), utf8EncodingCache[bytesWritten1];
      return textEncoder.encode(text3);
    }
    var utf8ByteLength;
    if (((typeof Buffer) === "function")) utf8ByteLength = Buffer.byteLength;
    else {
      utf8ByteLength = function(text4) {
        {
          let byteLength1 = 0;
          for (; ; ) {
            {
              const {
                read: charsRead2, written: bytesWritten2
              }
              = textEncoder.encodeInto(text4, utf8ScratchBuffer);
              byteLength1 += bytesWritten2;
              if ((charsRead2 === text4.length)) break;
              text4 = text4.slice(charsRead2);
            }
          }
          return byteLength1;
        }
      };
    }
    var bufferToBinaryString;
    if (((typeof Buffer) === "function") && ((typeof Buffer.prototype.latin1Slice) === "function")) bufferToBinaryString = Function.prototype.call.bind(Buffer.prototype.latin1Slice);
    else {
      bufferToBinaryString = function(buffer3) {
        {
          let result1 = '', index10 = 0, length7 = buffer3.length;
          for (; (((index10 + 7)) < length7); index10 += 8) {
            result1 += String.fromCharCode(buffer3[index10], buffer3[(index10 + 1)], buffer3[(index10 + 2)], buffer3[(index10 + 3)], buffer3[(index10 + 4)], buffer3[(index10 + 5)], buffer3[(index10 + 6)], buffer3[(index10 + 7)]);
          }
          for (; (index10 < length7); index10++) {
            result1 += String.fromCharCode(buffer3[index10]);
          }
          return result1;
        }
      };
    }
    var binaryStringToBuffer;
    ((typeof Buffer) === "function")?binaryStringToBuffer = function(binaryString1) {
      {
        let buffer4 = Buffer.from(binaryString1, "binary");
        return new Uint8Array(buffer4.buffer, buffer4.byteOffset, buffer4.length);
      }
    }
    : binaryStringToBuffer = function(binaryString2) {
      {
        let bytes1 = new Uint8Array(binaryString2.length);
        for (let index11 = 0; (index11 < binaryString2.length); index11++) {
          bytes1[index11] = binaryString2.charCodeAt(index11);
        }
        return Buffer.from(bytes1);
      }
    };
    var floatView = new DataView(new ArrayBuffer(8)), Tap = class TapClass {
      constructor(buffer6, position2) {
        this.setData(buffer6, position2);
      }
      setData(buffer7, position3) {
        {
          if (((typeof Buffer) === "function") && (buffer7 instanceof Buffer)) {
            buffer7 = new Uint8Array(buffer7.buffer, buffer7.byteOffset, buffer7.length);
          }
          this.arr = buffer7, this.pos = (position3 | 0);
          if ((this.pos < 0)) throw new Error("negative offset");
        }
      }
      getlength() {
        return this.arr.length;
      }
      reinitialize(capacity1) {
        this.setData(new Uint8Array(capacity1));
      }
      static fromBuffer(buffer9, position4) {
        return new TapClass(buffer9, position4);
      }
      static withCapacity(capacity2) {
        let resizedBuffer = new Uint8Array(capacity2);
        return new TapClass(resizedBuffer);
      }
      toBuffer() {
        return this.arr.slice(0, this.pos);
      }
      subarray(start2, end2) {
        return this.arr.subarray(start2, end2);
      }
      append(buffer10) {
        {
          const combinedBuffer1 = new Uint8Array((this.arr.length + buffer10.length));
          combinedBuffer1.set(this.arr, 0), combinedBuffer1.set(buffer10, this.arr.length), this.setData(combinedBuffer1, 0);
        }
      }
      forward(buffer11) {
        {
          const unreadBuffer = this.arr.subarray(this.pos), combinedBuffer2 = new Uint8Array((unreadBuffer.length + buffer11.length));
          combinedBuffer2.set(unreadBuffer, 0), combinedBuffer2.set(buffer11, unreadBuffer.length), this.setData(combinedBuffer2, 0);
        }
      }
      isValid() {
        return (this.pos <= this.arr.length);
      }
      _invalidate() {
        this.pos = (this.arr.length + 1);
      }
      readBoolean() {
        return !!this.arr[this.pos++];
      }
      skipBoolean() {
        this.pos++;
      }
      writeBoolean(value5) {
        this.arr[this.pos++] = !!value5;
      }
      readLong() {
        let value6 = 0, shift = 0, buffer12 = this.arr, byte1, hasMoreBytes, value7, multiplier2;
        do {
          byte1 = buffer12[this.pos++], hasMoreBytes = (byte1 & 128), value6 |= (((byte1 & 127)) << shift), shift += 7;
        }
        while (hasMoreBytes && (shift < 28));
        if (hasMoreBytes) {
          value7 = value6, multiplier2 = 268435456;
          do {
            byte1 = buffer12[this.pos++], value7 += (((byte1 & 127)) * multiplier2), multiplier2 *= 128;
          }
          while ((byte1 & 128));
          return (((value7 % 2)? - (value7 + 1): value7)/2);
        }
        return (((value6 >> 1)) ^ ( - (value6 & 1)));
      }
      skipLong() {
        let buffer13 = this.arr;
        while ((buffer13[this.pos++] & 128)) {}
      }
      writeLong(value8) {
        let buffer14 = this.arr, value9, value10;
        if ((value8 >= ( - 1073741824)) && (value8 < 1073741824)) {
          value10 = (value8 >= 0)?(value8 << 1): ((((~value8) << 1)) | 1);
          do {
            buffer14[this.pos] = (value10 & 127), value10 >>= 7;
          }
          while (value10 && (buffer14[this.pos++] |= 128));
        } else {
          {
            value9 = (value8 >= 0)?(value8 * 2): (((( - value8) * 2)) - 1);
            do {
              buffer14[this.pos] = (value9 & 127), value9 /= 128;
            }
            while ((value9 >= 1) && (buffer14[this.pos++] |= 128));
          }
        }
        this.pos++;
      }
      readFloat() {
        let start3 = this.pos;
        this.pos += 4;
        if ((this.pos > this.arr.length)) {
          return 0;
        }
        return floatView.setUint32(0, (((((this.arr[start3] | ((this.arr[(start3 + 1)] << 8)))) | ((this.arr[(start3 + 2)] << 16)))) | ((this.arr[(start3 + 3)] << 24))), true), floatView.getFloat32(0, true);
      }
      skipFloat() {
        this.pos += 4;
      }
      writeFloat(value11) {
        {
          let start4 = this.pos;
          this.pos += 4;
          if ((this.pos > this.arr.length)) return ;
          floatView.setFloat32(0, value11, true);
          const bits = floatView.getUint32(0, true);
          this.arr[start4] = (bits & 255), this.arr[(start4 + 1)] = (((bits >> 8)) & 255), this.arr[(start4 + 2)] = (((bits >> 16)) & 255), this.arr[(start4 + 3)] = (bits >> 24);
        }
      }
      readDouble() {
        let start5 = this.pos;
        this.pos += 8;
        if ((this.pos > this.arr.length)) {
          return 0;
        }
        floatView.setUint32(0, (((((this.arr[start5] | ((this.arr[(start5 + 1)] << 8)))) | ((this.arr[(start5 + 2)] << 16)))) | ((this.arr[(start5 + 3)] << 24))), true), floatView.setUint32(4, (((((this.arr[(start5 + 4)] | ((this.arr[(start5 + 5)] << 8)))) | ((this.arr[(start5 + 6)] << 16)))) | ((this.arr[(start5 + 7)] << 24))), true);
        return floatView.getFloat64(0, true);
      }
      skipDouble() {
        this.pos += 8;
      }
      writeDouble(value12) {
        {
          let start6 = this.pos;
          this.pos += 8;
          if ((this.pos > this.arr.length)) {
            return ;
          }
          floatView.setFloat64(0, value12, true);
          const lowBits = floatView.getUint32(0, true), highBits = floatView.getUint32(4, true);
          this.arr[start6] = (lowBits & 255), this.arr[(start6 + 1)] = (((lowBits >> 8)) & 255), this.arr[(start6 + 2)] = (((lowBits >> 16)) & 255), this.arr[(start6 + 3)] = (lowBits >> 24), this.arr[(start6 + 4)] = (highBits & 255), this.arr[(start6 + 5)] = (((highBits >> 8)) & 255), this.arr[(start6 + 6)] = (((highBits >> 16)) & 255), this.arr[(start6 + 7)] = (highBits >> 24);
        }
      }
      readFixed(length9) {
        {
          let start7 = this.pos;
          this.pos += length9;
          if ((this.pos > this.arr.length)) {
            return ;
          }
          return this.arr.slice(start7, (start7 + length9));
        }
      }
      skipFixed(length10) {
        this.pos += length10;
      }
      writeFixed(buffer15, length11) {
        {
          length11 = length11 || buffer15.length;
          let start8 = this.pos;
          this.pos += length11;
          if ((this.pos > this.arr.length)) return ;
          this.arr.set(buffer15.subarray(0, length11), start8);
        }
      }
      readBytes() {
        let length12 = this.readLong();
        if ((length12 < 0)) {
          this._invalidate();
          return ;
        }
        return this.readFixed(length12);
      }
      skipBytes() {
        {
          let length13 = this.readLong();
          if ((length13 < 0)) {
            this._invalidate();
            return ;
          }
          this.pos += length13;
        }
      }
      writeBytes(buffer16) {
        {
          let length14 = buffer16.length;
          this.writeLong(length14), this.writeFixed(buffer16, length14);
        }
      }
      skipString() {
        {
          let length15 = this.readLong();
          if ((length15 < 0)) {
            this._invalidate();
            return ;
          }
          this.pos += length15;
        }
      }
      readString() {
        {
          let length16 = this.readLong();
          if ((length16 < 0)) return this._invalidate(), '';
          let position5 = this.pos;
          this.pos += length16;
          if ((this.pos > this.arr.length)) {
            return ;
          }
          let buffer17 = this.arr, end3 = (position5 + length16);
          if ((length16 > 24)) {
            return utf8Slice(buffer17, position5, end3);
          }
          let value13 = '';
          while ((((position5 + 3)) < end3)) {
            let byte0 = buffer17[position5], byte1 = buffer17[(position5 + 1)], byte2 = buffer17[(position5 + 2)], byte3 = buffer17[(position5 + 3)];
            if ((((((((byte0 | byte1)) | byte2)) | byte3)) & 128)) return value13 += utf8Slice(buffer17, position5, end3), value13;
            value13 += String.fromCharCode(byte0, byte1, byte2, byte3), position5 += 4;
          }
          while ((position5 < end3)) {
            let trailingByte = buffer17[position5];
            if ((trailingByte & 128)) return value13 += utf8Slice(buffer17, position5, end3), value13;
            value13 += String.fromCharCode(trailingByte), position5++;
          }
          return value13;
        }
      }
      writeString(value14) {
        {
          let buffer18 = this.arr;
          const characterLength = value14.length;
          if ((characterLength > 21)) {
            {
              let byteLength2, encoded;
              if (this.isValid()) encoded = encodeUtf8(value14), byteLength2 = encoded.length;
              else {
                byteLength2 = utf8ByteLength(value14);
              }
              this.writeLong(byteLength2);
              let start9 = this.pos;
              this.pos += byteLength2;
              if (this.isValid() && ((typeof encoded) != "undefined")) {
                buffer18.set(encoded, start9);
              }
            }
          } else {
            let position6 = (this.pos + 1), dataStart = position6, capacity3 = buffer18.length;
            for (let index12 = 0; (index12 < characterLength); index12++) {
              {
                let codePoint = value14.charCodeAt(index12), lowSurrogate;
                if ((codePoint < 128)) {
                  {
                    if ((position6 < capacity3)) buffer18[position6] = codePoint;
                    position6++;
                  }
                } else {
                  if ((codePoint < 2048)) {
                    {
                      if ((((position6 + 1)) < capacity3)) {
                        buffer18[position6] = (((codePoint >> 6)) | 192), buffer18[(position6 + 1)] = (((codePoint & 63)) | 128);
                      }
                      position6 += 2;
                    }
                  } else {
                    if ((((codePoint & 64512)) === 55296) && ((((lowSurrogate = value14.charCodeAt((index12 + 1))) & 64512)) === 56320)) {
                      codePoint = (((65536 + ((((codePoint & 1023)) << 10)))) + ((lowSurrogate & 1023))), index12++;
                      if ((((position6 + 3)) < capacity3)) {
                        buffer18[position6] = (((codePoint >> 18)) | 240), buffer18[(position6 + 1)] = (((((codePoint >> 12)) & 63)) | 128), buffer18[(position6 + 2)] = (((((codePoint >> 6)) & 63)) | 128), buffer18[(position6 + 3)] = (((codePoint & 63)) | 128);
                      }
                      position6 += 4;
                    } else(((position6 + 2)) < capacity3) && (buffer18[position6] = (((codePoint >> 12)) | 224), buffer18[(position6 + 1)] = (((((codePoint >> 6)) & 63)) | 128), buffer18[(position6 + 2)] = (((codePoint & 63)) | 128)), position6 += 3;
                  }
                }
              }
            }
            (this.pos <= capacity3) && this.writeLong((position6 - dataStart)), this.pos = position6;
          }
        }
      }
      matchBoolean(otherTap1) {
        return this.arr[this.pos++] - otherTap1.arr[otherTap1.pos++];
      }
      matchLong(otherTap2) {
        {
          let left2 = this.readLong(), right2 = otherTap2.readLong();
          return (left2 === right2)?0: (left2 < right2)? - 1: 1;
        }
      }
      matchFloat(otherTap3) {
        {
          let left3 = this.readFloat(), right3 = otherTap3.readFloat();
          return (left3 === right3)?0: (left3 < right3)? - 1: 1;
        }
      }
      matchDouble(otherTap4) {
        let left4 = this.readDouble(), right4 = otherTap4.readDouble();
        return (left4 === right4)?0: (left4 < right4)? - 1: 1;
      }
      matchFixed(otherTap5, length17) {
        return bufCompare(this.readFixed(length17), otherTap5.readFixed(length17));
      }
      matchBytes(otherTap6) {
        {
          let leftLength = this.readLong(), leftStart = this.pos;
          this.pos += leftLength;
          let rightLength = otherTap6.readLong(), rightStart = otherTap6.pos;
          otherTap6.pos += rightLength;
          let leftBytes = this.arr.subarray(leftStart, this.pos), rightBytes = otherTap6.arr.subarray(rightStart, otherTap6.pos);
          return bufCompare(leftBytes, rightBytes);
        }
      }
      unpackLongBytes() {
        let bytes2 = new Uint8Array(8), value15 = 0, outputIndex = 0, bitOffset = 6;
        let buffer19 = this.arr, byte2 = buffer19[this.pos++], isNegative1 = (byte2 & 1);
        bytes2.fill(0), value15 |= (((byte2 & 127)) >> 1);
        while ((byte2 & 128)) {
          byte2 = buffer19[this.pos++], value15 |= (((byte2 & 127)) << bitOffset), bitOffset += 7, (bitOffset >= 8) && (bitOffset -= 8, bytes2[outputIndex++] = value15, value15 >>= 8);
        }
        bytes2[outputIndex] = value15;
        if (isNegative1) {
          invertBytes(bytes2, 8);
        }
        return bytes2;
      }
      packLongBytes(bytes3) {
        {
          let isNegative2 = (((bytes3[7] & 128)) >> 7), buffer20 = this.arr, bitCount = 1, index13 = 0, lastSignificantIndex = 3, value16;
          isNegative2?(invertBytes(bytes3, 8), value16 = 1): value16 = 0;
          let chunks = [(((bytes3[0] | ((bytes3[1] << 8)))) | ((bytes3[2] << 16))), (((bytes3[3] | ((bytes3[4] << 8)))) | ((bytes3[5] << 16))), (bytes3[6] | ((bytes3[7] << 8)))];
          while (lastSignificantIndex && !chunks[-- lastSignificantIndex]) {}
          while ((index13 < lastSignificantIndex)) {
            value16 |= (chunks[index13++] << bitCount), bitCount += 24;
            while ((bitCount > 7)) {
              buffer20[this.pos++] = (((value16 & 127)) | 128), value16 >>= 7, bitCount -= 7;
            }
          }
          value16 |= (chunks[lastSignificantIndex] << bitCount);
          do {
            buffer20[this.pos] = (value16 & 127), value16 >>= 7;
          }
          while (value16 && (buffer20[this.pos++] |= 128));
          this.pos++, isNegative2 && invertBytes(bytes3, 8);
        }
      }
    };
    function invertBytes(buffer, length) {
      while (length--) buffer[length] = ~buffer[length];
    }
    function printJSON(value) {
      const seen = new Set();
      try {
        return JSON.stringify(value, (key, propertyValue) => {
          if (seen.has(propertyValue)) return '[Circular]';
          if (typeof propertyValue === 'object' && propertyValue !== null) seen.add(propertyValue);
          if (typeof BigInt !== 'undefined' && propertyValue instanceof BigInt) {
            return '[BigInt ' + propertyValue.toString() + 'n]';
          }
          return propertyValue;
        });
      } catch {
        return '[object]';
      }
    }
    utilsModule.exports = {
      abstractFunction, bufCompare, bufEqual, bufferToBinaryString, binaryStringToBuffer, capitalize, copyOwnProperties, getHash: platform.getHash, compare, getOption, impliedNamespace, isBufferLike, isValidName, jsonEnd, objectValues, qualify, toMap, singleIndexOf, hasDuplicates, unqualify, Lcg, OrderedQueue, Tap, printJSON,
    };
  }
}), files = loadFiles(), utils = loadUtils();
const TYPE_REFS = {
  date: {
    type: 'int', logicalType: 'date'
  }, decimal: {
    type: 'bytes', logicalType: 'decimal'
  }, time_ms: {
    type: 'long', logicalType: 'time-millis'
  }, timestamp_ms: {
    type: 'long', logicalType: 'timestamp-millis'
  },
};
function assembleProtocol(rootPath, options2, callback3) {
  if (!callback3 && ((typeof options2) == "function")) {
    callback3 = options2, options2 = undefined;
  }
  options2 = (options2 || ({}));
  if (!options2.importHook) {
    options2.importHook = files.createImportHook();
  }
  readIdlImport(rootPath, '', ((error4, protocol1) => {
    if (error4) {
      {
        callback3(error4);
        return ;
      }
    }
    if (!protocol1) {
      callback3((new Error("empty root import")));
      return ;
    }
    let types1 = protocol1.types;
    if (types1) {
      {
        let namespace2 = protocolNamespace(protocol1) || '';
        types1.forEach(type1 => {
          {
            if ((type1.namespace === namespace2)) {
              delete type1.namespace;
            }
          }
        });
      }
    }
    callback3(null, protocol1);
  }));
  function readIdlImport(importPath3, importerPath3, callback4) {
    const request1 = {};
    request1.path = importPath3;
    request1.importerPath = importerPath3, request1.kind = "idl", options2.importHook(request1, (error5, result2) => {
      {
        if (error5) {
          {
            callback4(error5);
            return ;
          }
        }
        if (!result2) {
          {
            callback4();
            return ;
          }
        }
        const {
          contents: contents2, path: resolvedPath
        }
        = result2;
        let protocol2;
        try {
          {
            let reader1 = new Reader(contents2, options2);
            protocol2 = reader1._readProtocol(contents2, options2);
          }
        } catch (error6) {
          {
            error6.path = resolvedPath, callback4(error6);
            return ;
          }
        }
        resolveProtocolImports(protocol2.protocol, protocol2.imports, resolvedPath, callback4);
      }
    });
  }
  function resolveProtocolImports(protocol3, imports1, protocolPath, callback5) {
    let importedProtocols = [];
    resolveNextImport();
    function resolveNextImport() {
      {
        let importDescriptor1 = imports1.shift();
        if (!importDescriptor1) {
          {
            importedProtocols.reverse();
            try {
              importedProtocols.forEach(importedProtocol1 => {
                mergeProtocol(protocol3, importedProtocol1);
              });
            } catch (error7) {
              callback5(error7);
              return ;
            }
            callback5(null, protocol3);
            return ;
          }
        }
        if ((importDescriptor1.kind === "idl")) readIdlImport(importDescriptor1.name, protocolPath, ((error8, nestedProtocol) => {
          {
            if (error8) {
              {
                callback5(error8);
                return ;
              }
            }
            if (nestedProtocol) {
              importedProtocols.push(nestedProtocol);
            }
            resolveNextImport();
          }
        }));
        else {
          {
            const request2 = {};
            request2.path = importDescriptor1.name, request2.importerPath = protocolPath, request2.kind = importDescriptor1.kind, options2.importHook(request2, (error9, result3) => {
              {
                if (error9) {
                  {
                    callback5(error9);
                    return ;
                  }
                }
                switch (importDescriptor1.kind) {
                  case "protocol": case "schema": {
                    if (!result3) {
                      {
                        resolveNextImport();
                        return ;
                      }
                    }
                    let importedSchema;
                    try {
                      importedSchema = JSON.parse(result3.contents);
                    } catch (error10) {
                      {
                        error10.path = result3.path, callback5(error10);
                        return ;
                      }
                    }
                    const schemaProtocol = {};
                    schemaProtocol.types = [importedSchema];
                    let importedProtocol2 = (importDescriptor1.kind === "schema")?schemaProtocol: importedSchema;
                    importedProtocols.push(importedProtocol2), resolveNextImport();
                    return ;
                  }
                  default: callback5((new Error("invalid import kind: " + importDescriptor1.kind)));
                }
              }
            });
          }
        }
      }
    }
  }
  function mergeProtocol(target2, source2) {
    let sourceTypes = source2.types || [];
    sourceTypes.reverse(), sourceTypes.forEach(type2 => {
      {
        !target2.types && (target2.types = []);
        if ((type2.namespace === undefined)) {
          type2.namespace = protocolNamespace(source2) || '';
        }
        target2.types.unshift(type2);
      }
    });
    Object.keys(source2.messages || {}).forEach(messageName => {
      {
        !target2.messages && (target2.messages = {});
        if (target2.messages[messageName]) throw new Error("duplicate message: " + messageName);
        target2.messages[messageName] = source2.messages[messageName];
      }
    });
  }
}
function read(pathOrSource) {
  let source3, fileContents = files.tryReadFileSync(pathOrSource);
  if ((fileContents === null)) source3 = pathOrSource;
  else try {
    return JSON.parse(fileContents);
  } catch (error11) {
    let options3 = {
      'importHook': files.createSyncImportHook()
    };
    assembleProtocol(pathOrSource, options3, ((error12, protocol4) => {
      source3 = error12?fileContents: protocol4;
    }));
  }
  if (((typeof source3) != "string") || (source3 === "null")) {
    return source3;
  }
  try {
    return JSON.parse(source3);
  } catch (error13) {
    try {
      return Reader.readProtocol(source3);
    } catch (error14) {
      try {
        return Reader.readSchema(source3);
      } catch (error15) {
        return source3;
      }
    }
  }
}
var Reader = class Reader {
  constructor(source4, options4) {
    options4 = options4 || {};
    this._tk = new Tokenizer(source4);
    this._ackVoidMessages = !!options4.ackVoidMessages;
    this._implicitTags = !options4.delimitedCollections;
    this._typeRefs = options4.typeRefs || TYPE_REFS;
  }
  static readProtocol(source, options) {
    const result = new Reader(source, options)._readProtocol();
    if (result.imports.length) throw new Error('unresolvable import');
    return result.protocol;
  }
  static readSchema(source, options) {
    const reader = new Reader(source, options);
    const javadoc = reader._readJavadoc();
    const schema = reader._readType(javadoc === undefined?{}
    : {
      doc: javadoc
    }, true);
    reader._tk.next({
      id: '(eof)'
    });
    return schema;
  }
  _readProtocol() {
    let tokenizer1 = this._tk, imports2 = [], types2 = [], messages = {};
    this._readImports(imports2);
    let protocol6 = {}, javadoc2 = this._readJavadoc();
    (javadoc2 !== undefined) && (protocol6.doc = javadoc2);
    this._readAnnotations(protocol6);
    const protocolKeyword = {};
    protocolKeyword.val = "protocol", tokenizer1.next(protocolKeyword);
    const anonymousBrace1 = {};
    anonymousBrace1.val = '{', anonymousBrace1.silent = true;
    if (!tokenizer1.next(anonymousBrace1)) {
      {
        const protocolName = {};
        protocolName.id = "name", protocol6.protocol = tokenizer1.next(protocolName).val;
        const namedBrace1 = {};
        namedBrace1.val = '{', tokenizer1.next(namedBrace1);
      }
    }
    const closeBrace1 = {};
    closeBrace1.val = '}', closeBrace1.silent = true;
    while (!tokenizer1.next(closeBrace1)) {
      {
        if (!this._readImports(imports2)) {
          let declarationJavadoc = this._readJavadoc(), declarationType = this._readType({}, true), importCount1 = this._readImports(imports2, true), message1 = undefined, declarationEnd = tokenizer1.pos;
          if (!importCount1 && (message1 = this._readMessage(declarationType))) {
            if ((declarationJavadoc !== undefined) && (message1.schema.doc === undefined)) {
              message1.schema.doc = declarationJavadoc;
            }
            let inferOneWay = false;
            if ((message1.schema.response === "void") || (message1.schema.response.type === "void")) {
              inferOneWay = !this._ackVoidMessages && !message1.schema.errors;
              if ((message1.schema.response === "void")) message1.schema.response = "null";
              else {
                message1.schema.response.type = "null";
              }
            }
            inferOneWay && (message1.schema["one-way"] = true);
            if (messages[message1.name]) {
              throw new Error("duplicate message: " + message1.name);
            }
            messages[message1.name] = message1.schema;
          } else {
            {
              if (declarationJavadoc) {
                {
                  if (((typeof declarationType) == "string")) declarationType = {
                    'doc': declarationJavadoc, 'type': declarationType
                  };
                  else(declarationType.doc === undefined) && (declarationType.doc = declarationJavadoc);
                }
              }
              types2.push(declarationType), tokenizer1.pos = declarationEnd;
              const typeSemicolon = {};
              typeSemicolon.val = ';', typeSemicolon.silent = true, tokenizer1.next(typeSemicolon);
            }
          }
          declarationJavadoc = undefined;
        }
      }
    }
    const expectedEof2 = {};
    expectedEof2.id = "(eof)", tokenizer1.next(expectedEof2);
    if (types2.length) {
      protocol6.types = types2;
    }
    Object.keys(messages).length && (protocol6.messages = messages);
    const result4 = {};
    return result4.protocol = protocol6, result4.imports = imports2, result4;
  }
  _readAnnotations(schema2) {
    let tokenizer2 = this._tk;
    const atSign = {};
    atSign.val = '@', atSign.silent = true;
    while (tokenizer2.next(atSign)) {
      let nameParts = [];
      const openParen = {};
      openParen.val = '(', openParen.silent = true;
      while (!tokenizer2.next(openParen)) {
        nameParts.push(tokenizer2.next().val);
      }
      const annotationValue = {};
      annotationValue.id = "json", schema2[nameParts.join('')] = tokenizer2.next(annotationValue).val;
      const closeParen1 = {};
      closeParen1.val = ')', tokenizer2.next(closeParen1);
    }
  }
  _readMessage(responseType) {
    let tokenizer3 = this._tk;
    const messageSeed = {};
    messageSeed.request = [], messageSeed.response = responseType;
    let message2 = messageSeed;
    this._readAnnotations(message2);
    let name5 = tokenizer3.next().val;
    if ((tokenizer3.next().val !== '(')) return ;
    const emptyRequestClose = {};
    emptyRequestClose.val = ')', emptyRequestClose.silent = true;
    if (!tokenizer3.next(emptyRequestClose)) {
      {
        const requestClose = {};
        requestClose.val = ')', requestClose.silent = true;
        const requestComma = {};
        requestComma.val = ',';
        do {
          message2.request.push(this._readField());
        }
        while (!tokenizer3.next(requestClose) && tokenizer3.next(requestComma));
      }
    }
    let suffix = tokenizer3.next();
    switch (suffix.val) {
      case "throws": message2.errors = [];
      const errorsSemicolon = {};
      errorsSemicolon.val = ';', errorsSemicolon.silent = true;
      const errorComma = {};
      errorComma.val = ',';
      do {
        message2.errors.push(this._readType());
      }
      while (!tokenizer3.next(errorsSemicolon) && tokenizer3.next(errorComma));
      break;
      case "oneway": message2["one-way"] = true;
      const oneWaySemicolon = {};
      oneWaySemicolon.val = ';', tokenizer3.next(oneWaySemicolon);
      break;
      case ';': break;
      default: throw tokenizer3.error("invalid message suffix", suffix);
    }
    const result5 = {};
    result5.name = name5, result5.schema = message2;
    return result5;
  }
  _readJavadoc() {
    const javadocSpec = {};
    javadocSpec.id = "javadoc";
    javadocSpec.emitJavadoc = true, javadocSpec.silent = true;
    let token1 = this._tk.next(javadocSpec);
    if (token1) {
      return token1.val;
    }
  }
  _readField() {
    let tokenizer4 = this._tk, javadoc3 = this._readJavadoc(), schema3 = {
      'type': this._readType()
    };
    (javadoc3 !== undefined) && (schema3.doc === undefined) && (schema3.doc = javadoc3);
    const nullableMarker = {};
    nullableMarker.id = "operator", nullableMarker.val = '?', nullableMarker.silent = true;
    const nullableToken = tokenizer4.next(nullableMarker);
    this._readAnnotations(schema3);
    const fieldName = {};
    fieldName.id = "name", schema3.name = tokenizer4.next(fieldName).val;
    const defaultEquals1 = {};
    defaultEquals1.val = '=', defaultEquals1.silent = true;
    if (tokenizer4.next(defaultEquals1)) {
      schema3.default = tokenizer4.next({
        'id': "json"
      }).val;
    }
    return nullableToken && (schema3.type = ("default" in schema3) && (schema3.default !== null)?[schema3.type, "null"]: ["null", schema3.type]), schema3;
  }
  _readType(schema4, allowEnumDefault) {
    schema4 = (schema4 || ({})), this._readAnnotations(schema4);
    const typeName = {};
    typeName.id = "name", schema4.type = this._tk.next(typeName).val;
    switch (schema4.type) {
      case "record": case "error": return this._readRecord(schema4);
      case "fixed": return this._readFixed(schema4);
      case "enum": return this._readEnum(schema4, allowEnumDefault);
      case "map": return this._readMap(schema4);
      case "array": return this._readArray(schema4);
      case "union": if ((Object.keys(schema4).length > 1)) {
        throw new Error("union annotations are not supported");
      }
      return this._readUnion();
      default: {
        {
          let referencedType = this._typeRefs[schema4.type];
          if (referencedType) {
            delete schema4.type, utils.copyOwnProperties(referencedType, schema4);
          }
          return (Object.keys(schema4).length > 1)?schema4: schema4.type;
        }
      }
    }
  }
  _readFixed(schema5) {
    let tokenizer5 = this._tk;
    const anonymousOpenParen = {};
    anonymousOpenParen.val = '(', anonymousOpenParen.silent = true;
    if (!tokenizer5.next(anonymousOpenParen)) {
      {
        const fixedName = {};
        fixedName.id = "name", schema5.name = tokenizer5.next(fixedName).val;
        const namedOpenParen = {};
        namedOpenParen.val = '(', tokenizer5.next(namedOpenParen);
      }
    }
    schema5.size = parseInt(tokenizer5.next({
      'id': "number"
    }).val);
    const closeParen2 = {};
    return closeParen2.val = ')', tokenizer5.next(closeParen2), schema5;
  }
  _readMap(schema6) {
    let tokenizer6 = this._tk, implicitTags1 = this._implicitTags;
    const openTag1 = {};
    openTag1.val = '<', openTag1.silent = implicitTags1;
    let usesImplicitTags1 = (tokenizer6.next(openTag1) === undefined);
    schema6.values = this._readType();
    const closeTag1 = {};
    return closeTag1.val = '>', closeTag1.silent = usesImplicitTags1, tokenizer6.next(closeTag1), schema6;
  }
  _readArray(schema7) {
    let tokenizer7 = this._tk, implicitTags2 = this._implicitTags;
    const openTag2 = {};
    openTag2.val = '<', openTag2.silent = implicitTags2;
    let usesImplicitTags2 = (tokenizer7.next(openTag2) === undefined);
    schema7.items = this._readType();
    const closeTag2 = {};
    return closeTag2.val = '>', closeTag2.silent = usesImplicitTags2, tokenizer7.next(closeTag2), schema7;
  }
  _readEnum(schema8, allowDefault) {
    let tokenizer8 = this._tk;
    const anonymousBrace2 = {};
    anonymousBrace2.val = '{', anonymousBrace2.silent = true;
    if (!tokenizer8.next(anonymousBrace2)) {
      const enumName = {};
      enumName.id = "name", schema8.name = tokenizer8.next(enumName).val;
      const namedBrace2 = {};
      namedBrace2.val = '{', tokenizer8.next(namedBrace2);
    }
    schema8.symbols = [];
    const closeBrace2 = {};
    closeBrace2.val = '}', closeBrace2.silent = true;
    const symbolComma = {};
    symbolComma.val = ',';
    do {
      schema8.symbols.push(tokenizer8.next().val);
    }
    while (!tokenizer8.next(closeBrace2) && tokenizer8.next(symbolComma));
    const defaultEquals2 = {};
    defaultEquals2.val = '=', defaultEquals2.silent = true;
    if (allowDefault && tokenizer8.next(defaultEquals2)) {
      {
        schema8.default = tokenizer8.next().val;
        const semicolon1 = {};
        semicolon1.val = ';', tokenizer8.next(semicolon1);
      }
    }
    return schema8;
  }
  _readUnion() {
    let tokenizer9 = this._tk;
    let branches = [];
    const openBrace = {};
    openBrace.val = '{';
    tokenizer9.next(openBrace);
    const closeBrace3 = {};
    closeBrace3.val = '}', closeBrace3.silent = true;
    const branchComma = {};
    branchComma.val = ',';
    do {
      branches.push(this._readType());
    }
    while (!tokenizer9.next(closeBrace3) && tokenizer9.next(branchComma));
    return branches;
  }
  _readRecord(schema9) {
    let tokenizer10 = this._tk;
    const anonymousBrace3 = {};
    anonymousBrace3.val = '{', anonymousBrace3.silent = true;
    if (!tokenizer10.next(anonymousBrace3)) {
      {
        const recordName = {};
        recordName.id = "name", schema9.name = tokenizer10.next(recordName).val;
        const namedBrace3 = {};
        namedBrace3.val = '{', tokenizer10.next(namedBrace3);
      }
    }
    schema9.fields = [];
    const closeBrace4 = {};
    closeBrace4.val = '}', closeBrace4.silent = true;
    while (!tokenizer10.next(closeBrace4)) {
      {
        schema9.fields.push(this._readField());
        const fieldSemicolon = {};
        fieldSemicolon.val = ';', tokenizer10.next(fieldSemicolon);
      }
    }
    return schema9;
  }
  _readImports(imports3, stopAtInlineImport) {
    let tokenizer11 = this._tk, importCount2 = 0, initialPosition = tokenizer11.pos;
    const importKeyword = {};
    importKeyword.val = "import", importKeyword.silent = true;
    while (tokenizer11.next(importKeyword)) {
      {
        const inlineOpenParen = {};
        inlineOpenParen.val = '(', inlineOpenParen.silent = true;
        if (((!importCount2) && stopAtInlineImport) && tokenizer11.next(inlineOpenParen)) {
          {
            tokenizer11.pos = initialPosition;
            return ;
          }
        }
        const importKindToken = {};
        importKindToken.id = "name";
        let importKind = tokenizer11.next(importKindToken).val;
        const importPathToken = {};
        importPathToken.id = "string";
        let importPath4 = JSON.parse(tokenizer11.next(importPathToken).val);
        const semicolon2 = {};
        semicolon2.val = ';', tokenizer11.next(semicolon2);
        const importDescriptor2 = {};
        importDescriptor2.kind = importKind, importDescriptor2.name = importPath4, imports3.push(importDescriptor2), importCount2++;
      }
    }
    return importCount2;
  }
}, Tokenizer = class {
  constructor(source7) {
    this._str = source7, this.pos = 0;
  }
  next(expected) {
    const token = {
      pos: this.pos, id: undefined, val: undefined
    };
    const javadoc = this._skip(expected && expected.emitJavadoc);
    if (typeof javadoc === 'string') {
      token.id = 'javadoc';
      token.val = javadoc;
    } else {
      const start = this.pos;
      const firstCharacter = this._str.charAt(start);
      if (!firstCharacter) {
        token.id = '(eof)';
      } else if (expected && expected.id === 'json') {
        token.id = 'json';
        this.pos = this._endOfJson();
      } else if (firstCharacter === '"') {
        token.id = 'string';
        this.pos = this._endOfString();
      } else if (/[0-9]/.test(firstCharacter)) {
        token.id = 'number';
        this.pos = this._endOf(/[0-9]/);
      } else if (/[\x60A-Za-z_.]/.test(firstCharacter)) {
        token.id = 'name';
        this.pos = this._endOf(/[\x60A-Za-z0-9_.]/);
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
        token.val = token.val.replace(/\x60/g, '');
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
    const position = hasToken?tokenOrPosition.pos: tokenOrPosition;
    let lineNumber = 1;
    let lastNewline = 0;
    for (let index = 0; index < position; index++) {
      if (this._str.charAt(index) === '\n') {
        lineNumber++;
        lastNewline = index;
      }
    }
    const formattedMessage = hasToken?'invalid token ' + utils.printJSON(tokenOrPosition) + ': ' + message: message;
    const error = new Error(formattedMessage);
    error.token = hasToken?tokenOrPosition: undefined;
    error.lineNum = lineNumber;
    error.colNum = position - lastNewline;
    return error;
  }
  _skip(emitJavadoc) {
    let character;
    while ((character = this._str.charAt(this.pos)) && /\s/.test(character)) this.pos++;
    const commentStart = this.pos;
    if (character !== '/') return undefined;
    switch (this._str.charAt(this.pos + 1)) {
      case '/': this.pos += 2;
      while ((character = this._str.charAt(this.pos)) && character !== '\n') this.pos++;
      return this._skip(emitJavadoc);
      case '*': {
        this.pos += 2;
        const isJavadoc = this._str.charAt(this.pos) === '*';
        while ((character = this._str.charAt(this.pos++))) {
          if (character === '*' && this._str.charAt(this.pos) === '/') {
            this.pos++;
            if (isJavadoc && emitJavadoc) {
              return extractJavadoc(this._str.slice(commentStart + 3, this.pos - 2));
            }
            return this._skip(emitJavadoc);
          }
        }
        throw this.error('unterminated comment', commentStart);
      }
      default: return undefined;
    }
  }
  _endOf(pattern) {
    let end = this.pos;
    while (pattern.test(this._str.charAt(end))) end++;
    return end;
  }
  _endOfString() {
    let position = this.pos + 1;
    let character;
    while ((character = this._str.charAt(position))) {
      if (character === '"') return position + 1;
      position += character === '\\\\'?2: 1;
    }
    throw this.error('unterminated string', position - 1);
  }
  _endOfJson() {
    const end = utils.jsonEnd(this._str, this.pos);
    if (end < 0) throw this.error('invalid JSON', end);
    return end;
  }
};
function extractJavadoc(rawJavadoc) {
  const lines = rawJavadoc.trim().split('\n').map((line, index) => {
    return index?line.replace(/^\s*\*\s?/, ''): line;
  });
  while (lines.length && !lines[0]) lines.shift();
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  return lines.join('\n');
}
function protocolNamespace(protocol) {
  if (protocol.namespace) return protocol.namespace;
  const match = /^(.*)\.[^.]+$/.exec(protocol.protocol);
  return match?match[1]: undefined;
}
module.exports = {
  Tokenizer, assembleProtocol, read, readProtocol: Reader.readProtocol, readSchema: Reader.readSchema,
};
