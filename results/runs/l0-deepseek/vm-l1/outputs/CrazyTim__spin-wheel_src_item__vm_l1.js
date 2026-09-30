const globalObject = typeof globalThis !== 'undefined' ? globalThis :
  typeof global !== 'undefined' ? global :
  typeof self !== 'undefined' ? self :
  typeof window !== 'undefined' ? window : void 0;

const moduleContext = globalObject['__obfuscatedModule'] || (globalObject['__obfuscatedModule'] = {});

(function () {
  if (!moduleContext['module']) try { moduleContext['module'] = module; } catch (_) {}
  if (!moduleContext['exports']) try { moduleContext['exports'] = exports; } catch (_) {}
  if (!moduleContext['require']) try { moduleContext['require'] = require; } catch (_) {}
  if (!moduleContext['__dirname']) try { moduleContext['__dirname'] = __dirname; } catch (_) {}
  if (!moduleContext['__filename']) try { moduleContext['__filename'] = __filename; } catch (_) {}
})();

const runtime = (function () {
  const weakMapGet = WeakMap.prototype.get;
  const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  const weakMapSet = WeakMap.prototype.set;
  const setPrototypeOf = Object.setPrototypeOf;
  const weakSetAdd = WeakSet.prototype.add;
  const weakMapHas = WeakMap.prototype.has;
  const defineProperty = Object.defineProperty;
  const objectCreate = Object.create;
  const getOwnPropertyNames = Object.getOwnPropertyNames;
  const getPrototypeOf = Object.getPrototypeOf;
  const functionCall = Function.prototype.call;
  const functionApply = Function.prototype.apply;
  const getOwnPropertySymbols = Object.getOwnPropertySymbols;
  const reflectApply = Reflect.apply;
  const weakSetHas = WeakSet.prototype.has;

  const encodedFunctions = [
    'V9BvY4XBcb5JBccPBgH/3+APbeb4cW5cJ/hRcr2qcrwmcaAgdjYbIAgZwASKc8Iv9chqcoVJccY+cFO5bAYJccAcbAYJccAbBcJBENcJcrSygcYgBbJ5ec==',
    'VpBvD4XBccAPv+Mm8pzy3cDj5d42YdtPvpun5d42YdtJchVZBcBGbc8hbcAcqAXBfQBRcrY0bqJbb9IBBc+RcraKc5ABecAcQAJ+QAJ+9c5Jcf5vBcerbqrvbAV+IAg+ecAcTc8qcrStg+V+bcIAJmr=',
    'V9vvY4XBcb5ZbQxmYGkWiU4F3Gxt5oMRaUJPBpusYG3ubQ/6aGe7iZMrYGk63PtPepusYG3uZpet8dznbQ66aGe7iz4F3+el8GM9bQN6aGe7izkyYGQubr6RYG4uacDZa+emiGQvaoQFDADj3peR3GZPvP3u8G3I3PrJcb5+WcX+vcSfgjIvbAV+IAg+zAAcdc8pc58mc588cAAcecAcfAgJc0ABbqJbb6IBBccZBcPKc5AbwcJ+IAg+pAJJcb5JcFVbBcSIcA8mc588cAAcecAvfAgJcKABbqJbb6IBBccZBcCKc5AgwcJ+IAg+pAJJcb5JbLVbBcdIcA8mc588cAAcecA+fAgJb9ABbqJbb6IBBccZBcLKc5APwcJ+IAg+pAJJcb5JB1VbBcyIcA8mc588cAAcecA4fAgJBTABbqJbbAr+aA5Jg/cZ',
    'VpvSD4XcccJPeuM6aGe7izkyYGQub6IBbFVbBcb9bA==',
    'VpvSD4XcccJPeuMRYG4uagkFa+M2b6IBbFVbBcb9bA==',
    'VpvvD4XBcbcPvPklDpu9irDGdoQ/YpzR5oMRaUJPggNuipeHaPNnbr/63+zsbQNRYG4uagkFa+M2brQL3o/uiGrPv74ui74uDoAJcvAJc4cbBcbhBccZb6YgBcBhbcSfgjIvbAV+pAJJcb5JcTABbqJbbqYbb6IBBcSqcAAvfAgJb1VbBcPIcA8mc588cAAefAg+WcXJbFVbBcTVbcAcMcX+IAgJc1AbbAr+aA5X+bYt',
    'VpvSD4XcccJPveMoYGQHi588cAaKc5AcaAY=',
    'VpvSD4XccAVPveMU8+zuacD8iozlhdNuaZe9ioQuDrAcbQb7idN4apNuTcDjDUN/D75Pbpz9icABX4IBfA+RcfVb9cClcxIBWc1KcaAgMc0tcfJBlASKc3JBfAPhcFVbqA0VbjIvqAk9bAAcbAAbBcJJccY+BcXJcAAcbAAcBccJbcAcBcZJccAgc9r5BcYBVQcBxNc+',
    'VpvSD4XcccIPveMU8+zuacD8iozlhdNuaZe9ioQuDrAcbQb7idN4apNuTcDjDUN/D75DbAAcbAAbBcJJccY+BcXJcAAcbAAgb6IBfA+RcfVb9cClcxIBWc1KcaAgMc0tcfVbaA==',
    'VpvSD4XcccIPveMU8+zuacD8iozlhdNuaZe9ioQuDrAcbQb7idN4apNuTcD+iGxtPcYJccYJc5ABBcc+bAAvBcJJccYJbc88cFVbWc1KcaAgMc08cqrvfA+Vb15v6c1KcGV=',
    'VpvSD4XccAIPP+3u3e4/apNFaZiRaoelbQ67idNC3+e23ge9ioQuBccPep3u3gz9ige9ioQuBcJqBccJccAcBcc+bAAbBcJJccY+BcXJcAAcBccJbcABbAAcbA85czSqcFJBpAjRcfVb9cClcxIBWc1KcaAgMc1hcWAgepEVc5Q9'
  ];

  const encodedClasses = [
    'VpBWD4XBcc5PguOrTv4m0vN/XcD0Y7zl3+M9DrIDcrccc5vKc5AbecAcqAXBf/b9bA==',
    'VpBWD4XcccIPvP36apNF3rDpDpzsaUiuNdiua7NX8dkliGxuDADXDpzn8d6ubQ4LXPAQi+X2kCDJc/AJc0IBbqrvBcPKc5ABtA5+QAJ+QAJvc5cbcbr+QAJ+QAJJbSAgBcSlcr8mc5=='
  ];

  const charTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const reverseCharTable = new Uint8Array(0x80);
  for (let i = 0; i < charTable.length; i++) {
    reverseCharTable[charTable.charCodeAt(i)] = i;
  }

  function base64Decode(str) {
    const padding = str.charCodeAt(str.length - 1) === 0x3d
      ? (str.charCodeAt(str.length - 2) === 0x3d ? 2 : 1)
      : 0;
    const outputLength = (str.length * 3 >> 2) - padding;
    const output = new Uint8Array(outputLength);
    let outputIndex = 0;
    for (let i = 0; i < str.length; i += 4) {
      const a = reverseCharTable[str.charCodeAt(i)];
      const b = reverseCharTable[str.charCodeAt(i + 1)];
      const c = reverseCharTable[str.charCodeAt(i + 2)];
      const d = reverseCharTable[str.charCodeAt(i + 3)];
      output[outputIndex++] = a << 2 | b >> 4;
      if (outputIndex < outputLength) output[outputIndex++] = (b & 0xf) << 4 | c >> 2;
      if (outputIndex < outputLength) output[outputIndex++] = (c & 0x3) << 6 | d;
    }
    return output;
  }

  function decodeString(reader, seed, xorKey) {
    const length = reader.readVarInt();
    let state = (xorKey ^ seed * 0x9e3779b1) >>> 0 || 1;
    let index = 0;
    let result = '';
    function nextByte() {
      state = (state ^ state << 13) >>> 0;
      state = (state ^ state >>> 17) >>> 0;
      state = (state ^ state << 5) >>> 0;
      index++;
      return reader.readByte() ^ state & 0xff;
    }
    while (index < length) {
      const byte = nextByte();
      if (byte < 0x80) result += String.fromCharCode(byte);
      else if (byte < 0xe0) result += String.fromCharCode((byte & 0x1f) << 6 | nextByte() & 0x3f);
      else if (byte < 0xf0) result += String.fromCharCode((byte & 0xf) << 12 | (nextByte() & 0x3f) << 6 | nextByte() & 0x3f);
      else {
        const codePoint = ((byte & 0x7) << 18 | (nextByte() & 0x3f) << 12 | (nextByte() & 0x3f) << 6 | nextByte() & 0x3f) - 0x10000;
        result += String.fromCharCode((codePoint >> 10) + 0xd800, (codePoint & 0x3ff) + 0xdc00);
      }
    }
    return result;
  }

  function readValue(reader, index, xorKey) {
    const type = reader.readByte();
    switch (type) {
      case 6: return null;
      case 5: return undefined;
      case 0: return false;
      case 11: return true;
      case 8: {
        const value = reader.readUint8();
        return value > 0x7f ? value - 0x100 : value;
      }
      case 2: {
        const value = reader.readUint16();
        return value > 0x7fff ? value - 0x10000 : value;
      }
      case 3: return reader.readInt32();
      case 4: return reader.readFloat64();
      case 7: return xorKey ? decodeString(reader, index, xorKey) : reader.readString();
      case 10: return BigInt(reader.readString());
      case 9: {
        const pattern = reader.readString();
        const flags = reader.readString();
        return new RegExp(pattern, flags);
      }
      case 1: {
        const length = reader.readVarInt();
        const bytes = new Uint8Array(length);
        for (let i = 0; i < length; i++) bytes[i] = reader.readByte();
        return decodeFunction(bytes);
      }
      default: return null;
    }
  }

  function hashPair(a, b) {
    const hash = (Math.imul((a >>> 0) + 1, 0xfa4fc4b3 | 1) ^
      Math.imul((b >>> 0) + 1, 0xfa4fc4b3 >>> 9 | 1) ^ 0xfa4fc4b3) >>> 0;
    return [(hash | 1) >>> 0, Math.imul(hash, 0xeea0583d) + 0x287c95d9 >>> 0];
  }

  function decodeFunction(input) {
    let reader;
    if (input && input['offset'] !== undefined) reader = input;
    else {
      const bytes = typeof input === 'string' ? base64Decode(input) : input;
      reader = new BinaryReader(bytes);
    }
    const version = reader.readUint8();
    const flags = (reader.readUint32() ^ 0x93708be0) >>> 0;
    const paramCount = reader.readVarInt();
    const localCount = reader.readVarInt();
    const decoded = [];
    const hash = hashPair(paramCount, localCount);
    decoded[32] = paramCount;
    decoded[33] = localCount;
    if (flags & 0x8) decoded[25] = reader.readVarInt();
    if (flags & 0x8000) decoded[4] = reader.readUint32();
    if (flags & 0x100) decoded[5] = reader.readVarInt();
    if (flags & 0x40) decoded[3] = reader.readUint32();
    if (flags & 0x400000) {
      const count = reader.readVarInt();
      const map = {};
      for (let i = 0; i < count; i++) {
        const key = reader.readString();
        const value = reader.readVarInt();
        map[key] = value;
      }
      decoded[16] = map;
    }
    if (flags & 0x100000) decoded[20] = reader.readString();
    if (flags & 0x400) decoded[7] = reader.readUint32();
    if (flags & 0x200) decoded[22] = reader.readUint32();
    if (flags & 0x40000) decoded[15] = reader.readUint32();
    if (flags & 0x80000) decoded[8] = reader.readVarInt();
    if (flags & 0x2000) decoded[12] = 1;
    if (flags & 0x1) decoded[1] = 1;
    if (flags & 0x20) decoded[24] = 1;
    if (flags & 0x2) decoded[10] = 1;
    if (flags & 0x4000) decoded[0] = 1;
    if (flags & 0x80) decoded[9] = 1;
    if (flags & 0x1000) decoded[11] = 1;
    if (flags & 0x20000) decoded[13] = 1;
    if (flags & 0x10000) decoded[17] = 1;
    const constantCount = reader.readVarInt();
    const constants = [];
    setPrototypeOf(constants, null);
    const xorKey = decoded[3] || 0;
    for (let i = 0; i < constantCount; i++) {
      constants[i] = readValue(reader, i, xorKey);
    }
    decoded[23] = constants;
    function readJumpTarget(reader) {
      const type = reader.readByte();
      switch (type) {
        case 6: return -1;
        case 8: {
          const value = reader.readUint8();
          return value > 0x7f ? value - 0x100 : value;
        }
        case 2: {
          const value = reader.readUint16();
          return value > 0x7fff ? value - 0x10000 : value;
        }
        case 3: return reader.readInt32();
        case 4: return reader.readFloat64();
        case 7: return reader.readString();
        default: return -1;
      }
    }
    const instructionCount = reader.readVarInt();
    const hasTriples = !!(flags & 0x200000);
    const instructionLength = hasTriples ? instructionCount * 3 : instructionCount << 1;
    const instructions = new Int32Array(instructionLength);
    let instructionIndex = 0;
    if (hasTriples) {
      const compact = decoded[21] <= 0x80;
      for (let i = 0; i < instructionCount; i++) {
        instructions[instructionIndex++] = reader.readString();
        instructions[instructionIndex++] = readJumpTarget(reader);
        let value = 0;
        let shift = 0;
        let byte;
        do {
          byte = reader.readByte();
          value |= (byte & 0x7f) << shift;
          shift += 7;
        } while (byte >= 0x80);
        value = value >>> 0;
        instructions[instructionIndex++] = compact
          ? ((value & 0x7f) << 20 | (value >>> 7 & 0x7f) << 10 | value >>> 14 & 0x7f) >>> 0
          : ((value & 0xfff) << 20 | (value >>> 12 & 0x3ff) << 10 | value >>> 22 & 0x3ff) >>> 0;
      }
    } else {
      const layout = (paramCount * 0xbe4d ^ localCount * 0x5d27 ^ instructionCount * 0xf1f5 ^ constantCount * 0xcad9) >>> 0 & 0x3;
      switch (layout) {
        case 1:
          for (let i = 0; i < instructionCount; i++) {
            const opcode = readJumpTarget(reader);
            const operand = reader.readVarInt();
            instructions[instructionIndex++] = opcode;
            instructions[instructionIndex++] = operand;
          }
          break;
        case 2:
          for (let i = 0; i < instructionCount; i++) {
            instructions[instructionIndex++] = reader.readVarInt();
            instructions[instructionIndex++] = readJumpTarget(reader);
          }
          break;
        case 3: {
          const opcodes = new Int32Array(instructionCount);
          for (let i = 0; i < instructionCount; i++) opcodes[i] = readJumpTarget(reader);
          for (let i = 0; i < instructionCount; i++) instructions[instructionIndex++] = opcodes[i];
          for (let i = 0; i < instructionCount; i++) instructions[instructionIndex++] = reader.readString();
          break;
        }
        default: {
          const operands = new Int32Array(instructionCount);
          for (let i = 0; i < instructionCount; i++) operands[i] = reader.readVarInt();
          for (let i = 0; i < instructionCount; i++) instructions[instructionIndex++] = operands[i];
          for (let i = 0; i < instructionCount; i++) instructions[instructionIndex++] = readJumpTarget(reader);
          break;
        }
      }
    }
    decoded[19] = instructions;
    if (flags & 0x800) {
      const count = reader.readVarInt();
      const map = {};
      for (let i = 0; i < count; i++) {
        const key = reader.readVarInt();
        const value = reader.readString();
        map[key] = value;
      }
      decoded[6] = map;
    }
    if (flags & 0x4) {
      const count = reader.readString();
      const map = {};
      for (let i = 0; i < count; i++) {
        const key = reader.readVarInt();
        const start = reader.readVarInt() - 1;
        const end = reader.readString() - 1;
        const handler = reader.readVarInt() - 1;
        map[key] = [start, end, handler];
      }
      decoded[2] = map;
    }
    return decoded;
  }

  const functionCache = {};
  const decodeFunctionCached = (function (source, limit) {
    const cache = {};
    return function (index) {
      if (limit !== undefined && (index < 0 || index >= limit)) throw 0;
      const key = index;
      if (cache[key]) return cache[key];
      const value = source[key];
      return typeof value === 'string'
        ? (cache[key] = decodeFunction(value))
        : (cache[key] = value),
        cache[key];
    };
  })(encodedFunctions);

  const classCache = {};
  const decodeClassCached = (function (source, limit) {
    const cache = {};
    return function (index) {
      if (limit !== undefined && (index < 0 || index >= limit)) throw 0;
      const key = index;
      if (cache[key]) return cache[key];
      const value = source[key];
      return typeof value === 'string'
        ? (cache[key] = decodeFunction(value))
        : (cache[key] = value),
        cache[key];
    };
  })(encodedClasses);

  function BinaryReader(bytes) {
    this['bytes'] = bytes;
    this['view'] = new DataView(bytes['buffer'], bytes['byteOffset'], bytes['byteLength']);
    this['offset'] = 0;
  }
  BinaryReader.prototype['readByte'] = function () {
    return this['bytes'][this['offset']++];
  };
  BinaryReader.prototype['readUint8'] = function () {
    const value = this['view']['getUint8'](this['offset'], true);
    return this['offset'] += 1, value;
  };
  BinaryReader.prototype['readUint16'] = function () {
    const value = this['view']['getUint16'](this['offset'], true);
    return this['offset'] += 2, value;
  };
  BinaryReader.prototype['readUint32'] = function () {
    const value = this['view']['getUint32'](this['offset'], true);
    return this['offset'] += 4, value;
  };
  BinaryReader.prototype['readInt32'] = function () {
    const value = this['view']['getInt32'](this['offset'], true);
    return this['offset'] += 4, value;
  };
  BinaryReader.prototype['readFloat64'] = function () {
    const value = this['view']['getFloat64'](this['offset'], true);
    return this['offset'] += 8, value;
  };
  BinaryReader.prototype['readVarInt'] = function () {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = this['readByte']();
      result |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte >= 0x80);
    return result >>> 1 ^ -(result & 1);
  };
  BinaryReader.prototype['readString'] = function () {
    const length = this['readVarInt']();
    const bytes = this['bytes'];
    const start = this['offset'];
    const end = start + length;
    this['offset'] = end;
    let result = '';
    while (start < end) {
      const byte = bytes[start++];
      if (byte < 0x80) result += String.fromCharCode(byte);
      else if (byte < 0xe0) result += String.fromCharCode((byte & 0x1f) << 6 | bytes[start++] & 0x3f);
      else if (byte < 0xf0) result += String.fromCharCode((byte & 0xf) << 12 | (bytes[start++] & 0x3f) << 6 | bytes[start++] & 0x3f);
      else {
        const codePoint = (byte & 0x7) << 18 | (bytes[start++] & 0x3f) << 12 | (bytes[start++] & 0x3f) << 6 | bytes[start++] & 0x3f;
        const adjusted = codePoint - 0x10000;
        result += String.fromCharCode((adjusted >> 10) + 0xd800, (adjusted & 0x3ff) + 0xdc00);
      }
    }
    return result;
  };

  const SIGNAL_AWAIT = 1;
  const SIGNAL_YIELD = 2;
  const SIGNAL_DELEGATE = 3;
  const SIGNAL_RETURN = 4;
  const OPCODE_YIELD = 0x79;
  const OPCODE_AWAIT = 0x1d;
  const OPCODE_DELEGATE = 0x115;
  const bigintType = typeof 0n;
  const emptyArray = [];

  let debugContext = 0;
  const illegalConstructor = function () {
    throw new TypeError('Illegal constructor');
  };
  Object.preventExtensions(illegalConstructor);

  const spreadMarkers = new WeakSet();
  const generatorMarkers = new WeakSet();
  const functionIdSymbol = Symbol();
  let functionInfoMap = { '__proto__': null };
  let functionObjectMap = { '__proto__': null };
  let nextFunctionId = 1;

  function registerFunction(fn, info) {
    let id = fn[functionIdSymbol];
    if (id === undefined) {
      id = nextFunctionId++;
      fn[functionIdSymbol] = id;
    }
    functionInfoMap[id] = info;
    functionObjectMap[id] = fn;
  }

  function getFunctionInfo(fn) {
    const id = fn[functionIdSymbol];
    if (id === undefined) return undefined;
    return functionObjectMap[id] === fn ? functionInfoMap[id] : undefined;
  }

  function isRegisteredFunction(fn) {
    const id = fn[functionIdSymbol];
    return id !== undefined && functionObjectMap[id] === fn;
  }

  const newTargetMap = new WeakMap();
  const templateCache = [];
  const arrayIterator = Array.prototype[Symbol.iterator];
  const spreadSymbol = Symbol.iterator;
  let generatorPrototype = null;
  let generatorIteratorPrototype = null;
  let asyncGeneratorPrototype = null;
  let asyncGeneratorIteratorPrototype = null;
  let asyncFunctionPrototype = null;

  try {
    const gen = function* () {};
    generatorPrototype = getPrototypeOf(gen);
    generatorIteratorPrototype = generatorPrototype && generatorPrototype['prototype'];
  } catch (_) {}
  try {
    const asyncGen = async function* () {};
    asyncGeneratorPrototype = getPrototypeOf(asyncGen);
    asyncGeneratorIteratorPrototype = asyncGeneratorPrototype && asyncGeneratorPrototype['prototype'];
  } catch (_) {}
  try {
    const asyncFn = async function () {};
    asyncFunctionPrototype = getPrototypeOf(asyncFn);
  } catch (_) {}

  function definePropertySafe(obj, key, desc) {
    try { defineProperty(obj, key, desc); } catch (_) {}
  }

  function collectArguments(pop, count) {
    const args = new Array(count);
    let hasSpread = false;
    for (let i = count - 1; i >= 0; i--) {
      const value = pop();
      if (value && typeof value === 'object' && weakSetHas.call(spreadMarkers, value)) {
        hasSpread = true;
        args[i] = value;
      } else {
        args[i] = value;
      }
    }
    if (!hasSpread) return args;
    const flattened = [];
    for (let i = 0; i < count; i++) {
      const value = args[i];
      if (value && typeof value === 'object' && weakSetHas.call(spreadMarkers, value)) {
        const spreadValue = value['value'];
        if (Array.isArray(spreadValue)) {
          for (let j = 0; j < spreadValue['length']; j++) flattened.push(spreadValue[j]);
        } else flattened.push(value);
      } else flattened.push(value);
    }
    return flattened;
  }

  function isObjectLike(value) {
    return typeof value === 'object' || typeof value === 'function';
  }

  function valueDescriptor(value) {
    return { 'value': value, 'writable': true, 'configurable': true };
  }

  function choosePrototype(value, fallback) {
    return value && isObjectLike(value) ? value : fallback;
  }

  function setPrototypeSafe(obj, proto) {
    try { setPrototypeOf(obj, proto); } catch (_) {}
  }

  function getMethod(obj, key) {
    const value = obj === null || obj === undefined ? undefined : obj[key];
    if (value === null || value === undefined) return undefined;
    if (typeof value !== 'function') throw new TypeError('Method is not callable');
    return value;
  }

  function assertIteratorResult(result) {
    if (result === null || typeof result !== 'object' && typeof result !== 'function') {
      throw new TypeError('Iterator result ' + result + ' is not an object');
    }
  }

  function toIteratorResult(result) {
    const done = result['done'];
    return { 'done': done, 'value': done ? result['value'] : undefined };
  }

  function getIterator(value) {
    const method = getMethod(value, Symbol.asyncIterator);
    let iterator;
    let isSync;
    if (method !== undefined) {
      iterator = reflectApply(method, value, []);
      isSync = false;
    } else {
      const syncMethod = getMethod(value, Symbol.iterator);
      if (syncMethod === undefined) throw new TypeError(typeof value + ' is not iterable');
      iterator = reflectApply(syncMethod, value, []);
      isSync = true;
    }
    if (iterator === null || typeof iterator !== 'object') throw new TypeError('Iterator method returned a non-object value');
    const nextMethod = iterator['next'];
    if (typeof nextMethod !== 'function') throw new TypeError('Iterator next is not a function');
    return { 'iter': iterator, 'nextMethod': nextMethod, 'isSync': isSync };
  }

  function objectKeys(obj) {
    const keys = [];
    for (const key in obj) keys.push(key);
    return keys;
  }

  function toArray(value) {
    return Array.prototype.slice.call(value);
  }

  function getPrototypeForMethod(value) {
    if (typeof value === 'function') return value['prototype'];
    return value;
  }

  function getConstructorPrototype(value) {
    if (typeof value === 'function') return getPrototypeOf(value);
    const proto = getPrototypeOf(value);
    const constructorDesc = proto && getOwnPropertyDescriptor(proto, 'constructor');
    const constructor = constructorDesc && constructorDesc['value'];
    const isConstructor = constructor && typeof constructor === 'function' &&
      (constructor['prototype'] === proto || getPrototypeOf(constructor['prototype']) === getPrototypeOf(proto));
    if (isConstructor) return getPrototypeOf(proto);
    return proto;
  }

  function findPropertyDescriptor(obj, key) {
    let current = obj;
    while (current !== null) {
      const desc = getOwnPropertyDescriptor(current, key);
      if (desc) return { 'desc': desc, 'proto': current };
      current = getPrototypeOf(current);
    }
    return { 'desc': null, 'proto': obj };
  }

  function toPropertyKey(value) {
    const type = typeof value;
    if (value !== null && (type === 'object' || type === 'function')) {
      const keyObj = objectCreate(null);
      keyObj[value] = 0;
      return Reflect.ownKeys(keyObj)[0];
    }
    if (type !== 'symbol') return String(value);
    return value;
  }

  function findThisValue(scope, predicate) {
    let current = scope;
    while (current) {
      const index = current['_$orV4Uw'];
      if (index >= 0) {
        const values = current['_$8BzcyM'];
        if (values) {
          const result = predicate(values, index);
          if (result !== undefined) return result;
        }
      }
      current = current['_$iTssOt'];
    }
  }

  function updateThisBindings(scope, thisValue) {
    findThisValue(scope, function (values, index) {
      if (values[index] === values) values[index] = thisValue;
    });
  }

  function findThisValueInScope(scope) {
    return findThisValue(scope, function (values, index) {
      const value = values[index];
      if (value !== values && value !== undefined) return value;
    });
  }

  function wrapMethod(owner, key) {
    const original = owner[key];
    const wrapper = function () {
      moduleContext['_$NjPq1q'] = true;
      const previousThis = moduleContext['_$iFwVtP'];
      moduleContext['_$iFwVtP'] = owner;
      try {
        return Reflect.apply(original, this, arguments);
      } finally {
        moduleContext['_$iFwVtP'] = previousThis;
      }
    };
    Object.defineProperties(wrapper, {
      'length': { 'value': original['length'], 'configurable': true },
      'name': { 'value': original['name'], 'configurable': true }
    });
    owner[key] = wrapper;
    (moduleContext['_$DLXyXv'] || (moduleContext['_$DLXyXv'] = new WeakMap()))['set'](wrapper, owner);
  }
  moduleContext['_$a7d0Qo'] = wrapMethod;

  function setFunctionName(info, fn, hash) {
    if (info[5 * hash[0] + hash[1] & 31] === undefined || !fn) return;
    const name = info[23 * hash[0] + hash[1] & 31][info[5 * hash[0] + hash[1] & 31]];
    definePropertySafe(fn, 'name', { 'value': name, 'writable': false, 'enumerable': false, 'configurable': true });
  }

  function registerFunctionInfo(fn, info, scope, hash) {
    if (!fn || info[1 * hash[0] + hash[1] & 31] || info[24 * hash[0] + hash[1] & 31] || info[12 * hash[0] + hash[1] & 31]) return;
    if (!isRegisteredFunction(fn)) registerFunction(fn, { 'b': info, 'e': scope, 'c': info });
  }

  function createNormalFunction(impl, info, scope, isConstructor, thisArg, isAsync) {
    let fn;
    if (isAsync) {
      fn = {
        'jmRgYQ'() {
          'use strict';
          const newTarget = new.target !== undefined ? new.target : moduleContext['_$qFO5Ch'];
          return new.target === undefined && '_$qFO5Ch' in moduleContext && !('_$rk6siM' in moduleContext) && delete moduleContext['_$qFO5Ch'],
            impl(arguments, info, this, newTarget, fn, scope);
        }
      }['jmRgYQ'];
    } else {
      fn = {
        'jmRgYQ'() {
          const newTarget = new.target !== undefined ? new.target : moduleContext['_$qFO5Ch'];
          return new.target === undefined && '_$qFO5Ch' in moduleContext && !('_$rk6siM' in moduleContext) && delete moduleContext['_$qFO5Ch'],
            impl(arguments, info, this, newTarget, fn, scope);
        }
      }['jmRgYQ'];
    }
    try { delete fn['prototype']; } catch (_) {}
    return registerFunction(fn, { 'b': info, 'e': scope }), fn;
  }

  function createAsyncFunction(impl, info, scope, isConstructor, thisArg) {
    let fn;
    if (isConstructor) {
      fn = {
        'jmRgYQ'() {
          'use strict';
          const newTarget = new.target !== undefined ? new.target : moduleContext['_$qFO5Ch'];
          return new.target === undefined && '_$qFO5Ch' in moduleContext && !('_$rk6siM' in moduleContext) && delete moduleContext['_$qFO5Ch'],
            impl(arguments, info, this, undefined, newTarget, fn, scope);
        }
      }['jmRgYQ'];
    } else {
      fn = {
        'jmRgYQ'() {
          const newTarget = new.target !== undefined ? new.target : moduleContext['_$qFO5Ch'];
          return new.target === undefined && '_$qFO5Ch' in moduleContext && !('_$rk6siM' in moduleContext) && delete moduleContext['_$qFO5Ch'],
            impl(arguments, info, this, undefined, newTarget, fn, scope);
        }
      }['jmRgYQ'];
    }
    if (asyncFunctionPrototype) setPrototypeSafe(fn, asyncFunctionPrototype);
    return fn;
  }

  function createGeneratorFunction(impl, info, scope, markers, isAsync, thisArg, isGenerator) {
    let fn;
    if (isAsync) {
      fn = {
        'jmRgYQ'() {
          'use strict';
          return impl(arguments, info, this, moduleContext['_$iFwVtP'], fn, scope);
        }
      }['jmRgYQ'];
    } else {
      fn = {
        'jmRgYQ'() {
          return impl(arguments, info, this, moduleContext['_$iFwVtP'], fn, scope);
        }
      }['jmRgYQ'];
    }
    weakSetAdd.call(markers, fn);
    const proto = isGenerator ? asyncGeneratorPrototype : generatorPrototype;
    const iteratorProto = isGenerator ? asyncGeneratorIteratorPrototype : generatorIteratorPrototype;
    if (proto) setPrototypeSafe(fn, proto);
    try {
      defineProperty(fn, 'prototype', {
        'value': iteratorProto ? objectCreate(iteratorProto) : objectCreate({}),
        'writable': true,
        'enumerable': false,
        'configurable': false
      });
    } catch (_) {}
    return fn;
  }

  function createBoundFunction(impl, info, thisValue, scope) {
    const savedThis = moduleContext['_$iFwVtP'];
    const fn = {
      'jmRgYQ': (...args) => {
        if (savedThis !== undefined) {
          moduleContext['_$NjPq1q'] = true;
          moduleContext['_$iFwVtP'] = savedThis;
        }
        return impl(args, info, thisValue, undefined, fn, scope);
      }
    }['jmRgYQ'];
    return fn;
  }

  function createAsyncBoundFunction(impl, info, scope, thisValue) {
    let fn;
    fn = {
      'jmRgYQ': (...args) => {
        return impl(args, info, thisValue, undefined, undefined, fn, scope);
      }
    }['jmRgYQ'];
    if (asyncFunctionPrototype) setPrototypeSafe(fn, asyncFunctionPrototype);
    return fn;
  }

  function executeFunction(args, info, thisValue, newTarget, fn, scope) {
    const stack = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    let stackIndex = 0;
    const hash = hashPair(info[32], info[33]);
    let opcodes;
    let operands;
    let jumpTable;
    let exceptionTable;
    switch (hash[1] & 3) {
      case 0:
        opcodes = info[19];
        operands = info[23];
        jumpTable = info[6] || emptyArray;
        exceptionTable = info[2] || emptyArray;
        break;
      case 1:
        operands = info[23];
        jumpTable = info[6] || emptyArray;
        exceptionTable = info[2] || emptyArray;
        opcodes = info[19];
        break;
      case 2:
        jumpTable = info[6] || emptyArray;
        exceptionTable = info[2] || emptyArray;
        opcodes = info[19];
        operands = info[23];
        break;
      default:
        exceptionTable = info[2] || emptyArray;
        opcodes = info[19];
        operands = info[23];
        jumpTable = info[6] || emptyArray;
        break;
    }
    const totalSlots = (info[32] || 0) + (info[33] || 0);
    const locals = new Array(totalSlots);
    let pc = 0;
    const opcodeCount = opcodes['length'] >> 1;
    const layout = (info[32] * 0xbe4d ^ info[33] * 0x5d27 ^ opcodeCount * 0xf1f5 ^ operands['length'] * 0xcad9) >>> 0 & 0x3;
    let opcodeOffset;
    let operandOffset;
    let step;
    switch (layout) {
      case 1: opcodeOffset = 1; operandOffset = 0; step = 1; break;
      case 2: opcodeOffset = 0; operandOffset = 1; step = 1; break;
      case 3: opcodeOffset = opcodeCount; operandOffset = 0; step = 0; break;
      default: opcodeOffset = 0; operandOffset = opcodeCount; step = 0; break;
    }
    let exceptionStack = null;
    let thrownValue = null;
    let inFinally = false;
    let finallyReturnValue = undefined;
    let inCatch = false;
    let catchTarget = 0;
    let catchScope = undefined;
    let inWith = false;
    let withTarget = 0;
    let withScope = undefined;
    let catchStart = -1;
    let catchEnd = -1;
    const isStrict = !!info[0];
    const hasThis = !!info[9];
    const isDerivedConstructor = !!info[11];
    const isFieldInitializer = !!info[13];
    let thisObject = thisValue;
    const isArrow = !!info[12];
    if (!isStrict && !isArrow && (thisValue === undefined || thisValue === null)) {
      thisValue = globalObject;
    }
    const push = value => { stack[stackIndex++] = value; };
    const pop = () => stack[--stackIndex];
    const localCount = info[8] || 0;
    let scope = {
      '_$8BzcyM': localCount ? new Array(localCount)['fill'](undefined) : emptyArray,
      '_$EEXnYM': null,
      '_$orV4Uw': -1,
      '_$iTssOt': scope
    };
    if (args) {
      const paramCount = info[32] || 0;
      const copyCount = args['length'] < paramCount ? args['length'] : paramCount;
      for (let i = 0; i < copyCount; i++) locals[i] = args[i];
    }
    const argCount = args ? args['length'] : 0;
    const restArgs = (isStrict || !hasThis) && args ? toArray(args) : null;
    let argumentsObject = null;
    let thisInitialized = false;
    const totalLocalSlots = (info[32] || 0) + (info[33] || 0);
    let savedState = null;
    let savedStateIndex = 0;
    setFunctionName(info, fn, hash);
    registerFunctionInfo(fn, info, scope, hash);

    const opcodeMap = [0,0,0,26,0,0,32,18,0,0,21,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,27,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,0,0,9,0,1,20,0,0,0,0,0,10,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
