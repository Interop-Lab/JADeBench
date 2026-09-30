'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames, __commonJS = (moduleFactories, cachedModule) => function loadModule() {
  var moduleRecord = {
  };
  moduleRecord["exports"] = {
  };
  return cachedModule || (0, moduleFactories[(__getOwnPropNames)((moduleFactories))[0]])((cachedModule = moduleRecord)["exports"], cachedModule), cachedModule.exports;
}, require_constants = __commonJS({
  '../work/websockets__ws/lib/constants.js'(argument1, constantsModule) {
    'use strict';
    {
      'use strict';
      var binaryTypes = ["nodebuffer", "arraybuffer", "fragments"];
      var hasBlobSupport = ((typeof Blob)!==("undefined"));
      if (hasBlobSupport)binaryTypes.push("blob");
      constantsModule["exports"] = {
        'BINARY_TYPES': binaryTypes, 'CLOSE_TIMEOUT': 30000, 'EMPTY_BUFFER': Buffer.alloc(0), 'GUID': "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", 'hasBlob': hasBlobSupport, 'kForOnEventAttribute': (Symbol)(("kIsForOnEventAttribute")), 'kListener': (Symbol)(("kListener")), 'kStatusCode': (Symbol)(("status-code")), 'kWebSocket': (Symbol)(("websocket")), 'NOOP': () => {
        }
      };
    }
  }
}), require_buffer_util = __commonJS({
  '../work/websockets__ws/lib/buffer-util.js'(argument2, bufferUtilModule) {
    'use strict';
    var {
      EMPTY_BUFFER: EMPTY_BUFFER
    }
     = (require_constants)(), FastBuffer = Buffer[Symbol.species];
    function concat(buffers, totalLength) {
      {
        if (((buffers.length)===(0)))return EMPTY_BUFFER;
        if (((buffers.length)===(1)))return buffers[0];
        const target = Buffer.allocUnsafe(totalLength);
        let offset = 0;
        for (let index = 0;
        ((index)<(buffers.length));
        index++) {
          {
            const buffer = buffers[index];
            target.set(buffer, offset), offset+=buffer.length;
          }
        }
        if (((offset)<(totalLength)))return new FastBuffer(target.buffer, target.byteOffset, offset);
        return target;
      }
    }
    function _mask(source, mask, output, offset, length) {
      for (let index = 0;
      ((index)<(length));
      index++) {
        output[((offset)+(index))] = ((source[index]) ^ (mask[((index) & (3))]));
      }
    }
    function _unmask(buffer, mask) {
      for (let index = 0;
      ((index)<(buffer.length));
      index++) {
        buffer[index]^=mask[((index) & (3))];
      }
    }
    function toArrayBuffer(buffer) {
      {
        if (((buffer.length)===(buffer.buffer["byteLength"])))return buffer.buffer;
        return buffer.buffer["slice"](buffer.byteOffset, ((buffer.byteOffset)+(buffer.length)));
      }
    }
    function toBuffer(data) {
      {
        toBuffer["readOnly"] = (true);
        if (Buffer.isBuffer(data))return data;
        let buffer;
        if (((data) instanceof (ArrayBuffer))) {
          buffer = new FastBuffer(data);
        } else ArrayBuffer.isView(data)?buffer = new FastBuffer(data.buffer, data.byteOffset, data.byteLength): buffer = Buffer.from(data), toBuffer["readOnly"] = (false);
        return buffer;
      }
    }
    var bufferUtilExports = {
    };
    bufferUtilExports["concat"] = concat, bufferUtilExports["mask"] = _mask, bufferUtilExports["toArrayBuffer"] = toArrayBuffer, bufferUtilExports["toBuffer"] = toBuffer, bufferUtilExports["unmask"] = _unmask;
    bufferUtilModule["exports"] = bufferUtilExports;
    if (!process.env.WS_NO_BUFFER_UTIL)try {
      const bufferUtil = (require)(("bufferutil"));
      bufferUtilModule.exports["mask"] = function(source, mask, output, offset, length) {
        {
          if (((length)<(48)))(_mask)((source), (mask), (output), (offset), (length));
          else bufferUtil.mask(source, mask, output, offset, length);
        }
      }, bufferUtilModule.exports["unmask"] = function(buffer, mask) {
        {
          if (((buffer.length)<(32)))(_unmask)((buffer), (mask));
          else bufferUtil.unmask(buffer, mask);
        }
      };
    } catch (error1) {
    }
  }
}), require_limiter = __commonJS({
  '../work/websockets__ws/lib/limiter.js'(argument21, limiterModule) {
    'use strict';
    var kDone = (Symbol)(("kDone")), kRun = (Symbol)(("kRun"));
    var Limiter = class {
      constructor(concurrency) {
        this[kDone] = () => {
          this["pending"]--, this[kRun]();
        }, this["concurrency"] = ((concurrency) || (Infinity)), this["jobs"] = [], this["pending"] = 0;
      }
      ["add"](job) {
        this["jobs"]["push"](job);
        this[kRun]();
      }
      [kRun]() {
        {
          if (((this["pending"])===(this["concurrency"])))return;
          if (this["jobs"]["length"]) {
            const job = this["jobs"]["shift"]();
            this["pending"]++, (job)((this[kDone]));
          }
        }
      }
    };
    limiterModule["exports"] = Limiter;
  }
}), require_permessage_deflate = __commonJS({
  '../work/websockets__ws/lib/permessage-deflate.js'(argument24, perMessageDeflateModule) {
    'use strict';
    var zlib = (require)(("zlib")), bufferUtil = (require_buffer_util)(), Limiter = (require_limiter)(), {
      kStatusCode: kStatusCode
    }
     = (require_constants)(), FastBuffer = Buffer[Symbol.species], TRAILER = Buffer.from([0, 0, 255, 255]), kPerMessageDeflate = (Symbol)(("permessage-deflate")), kTotalLength = (Symbol)(("total-length")), kCallback = (Symbol)(("callback")), kBuffers = (Symbol)(("buffers")), kError = (Symbol)(("error"));
    var zlibLimiter, PerMessageDeflate = class {
      constructor(options) {
        this["_options"] = ((options) || ({
        }));
        this["_threshold"] = ((this["_options"]["threshold"])!==(void 0))?this["_options"]["threshold"]: 1024;
        this["_maxPayload"] = ((this["_options"]["maxPayload"]) | (0)), this["_isServer"] = !!this["_options"]["isServer"], this["_deflate"] = null, this["_inflate"] = null, this["params"] = null;
        if (!zlibLimiter) {
          const concurrencyLimit = ((this["_options"]["concurrencyLimit"])!==(void 0))?this["_options"]["concurrencyLimit"]: 10;
          zlibLimiter = new Limiter(concurrencyLimit);
        }
      }
      static get["extensionName"]() {
        return "permessage-deflate";
      }
      ["offer"]() {
        const params = {
        };
        if (this["_options"]["serverNoContextTakeover"]) {
          params["server_no_context_takeover"] = (true);
        }
        this["_options"]["clientNoContextTakeover"] && (params["client_no_context_takeover"] = (true));
        this["_options"]["serverMaxWindowBits"] && (params["server_max_window_bits"] = this["_options"]["serverMaxWindowBits"]);
        if (this["_options"]["clientMaxWindowBits"])params["client_max_window_bits"] = this["_options"]["clientMaxWindowBits"];
        else((this["_options"]["clientMaxWindowBits"])==(null)) && (params["client_max_window_bits"] = (true));
        return params;
      }
      ["accept"](configurations) {
        return configurations = this["normalizeParams"](configurations), this["params"] = this["_isServer"]?this["acceptAsServer"](configurations): this["acceptAsClient"](configurations), this["params"];
      }
      ["cleanup"]() {
        {
          this["_inflate"] && (this["_inflate"]["close"](), this["_inflate"] = null);
          if (this["_deflate"]) {
            {
              const value4 = this["_deflate"][kCallback];
              this["_deflate"]["close"](), this["_deflate"] = null, value4 && ((value4)((new Error("The deflate stream was closed while data was being processed"))));
            }
          }
        }
      }
      ["acceptAsServer"](offers) {
        const options = this["_options"], accepted = offers.find(params => {
          {
            if (((options.serverNoContextTakeover)===(false)) && params.server_no_context_takeover || params.server_max_window_bits && (((options.serverMaxWindowBits)===(false)) || ((typeof options.serverMaxWindowBits)===("number")) && ((options.serverMaxWindowBits)>(params.server_max_window_bits))) || ((typeof options.clientMaxWindowBits)===("number")) && !params.client_max_window_bits) {
              return(false);
            }
            return(true);
          }
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        options.serverNoContextTakeover && (accepted["server_no_context_takeover"] = (true));
        options.clientNoContextTakeover && (accepted["client_no_context_takeover"] = (true));
        ((typeof options.serverMaxWindowBits)===("number")) && (accepted["server_max_window_bits"] = options.serverMaxWindowBits);
        if (((typeof options.clientMaxWindowBits)===("number"))) {
          accepted["client_max_window_bits"] = options.clientMaxWindowBits;
        } else(((accepted.client_max_window_bits)===(true)) || ((options.clientMaxWindowBits)===(false))) && delete accepted.client_max_window_bits;
        return accepted;
      }
      ["acceptAsClient"](response) {
        const params = response[0];
        if (((this["_options"]["clientNoContextTakeover"])===(false)) && params.client_no_context_takeover) {
          throw new Error("Unexpected parameter \"client_no_context_takeover\"");
        }
        if (!params.client_max_window_bits) {
          ((typeof this["_options"]["clientMaxWindowBits"])===("number")) && (params["client_max_window_bits"] = this["_options"]["clientMaxWindowBits"]);
        } else {
          if (((this["_options"]["clientMaxWindowBits"])===(false)) || ((typeof this["_options"]["clientMaxWindowBits"])===("number")) && ((params.client_max_window_bits)>(this["_options"]["clientMaxWindowBits"]))) {
            throw new Error("Unexpected or invalid parameter \"client_max_window_bits\"");
          }
        }
        return params;
      }
      ["normalizeParams"](configurations) {
        return configurations.forEach(params => {
          Object.keys(params)["forEach"](key => {
            {
              let value = params[key];
              if (((value.length)>(1))) {
                throw new Error("Parameter \""+key+("\" must have only a single value"));
              }
              value = value[0];
              if (((key)===("client_max_window_bits"))) {
                if (((value)!==(true))) {
                  const value12 = +value;
                  if (!Number.isInteger(value12) || ((value12)<(8)) || ((value12)>(15))) {
                    throw new TypeError("Invalid value for parameter \""+key+"\": "+value);
                  }
                  value = value12;
                } else {
                  if (!this["_isServer"]) {
                    throw new TypeError("Invalid value for parameter \""+key+"\": "+value);
                  }
                }
              } else {
                if (((key)===("server_max_window_bits"))) {
                  const value18 = +value;
                  if (!Number.isInteger(value18) || ((value18)<(8)) || ((value18)>(15)))throw new TypeError("Invalid value for parameter \""+key+"\": "+value);
                  value = value18;
                } else {
                  if (((key)===("client_no_context_takeover")) || ((key)===("server_no_context_takeover"))) {
                    {
                      if (((value)!==(true))) {
                        throw new TypeError("Invalid value for parameter \""+key+"\": "+value);
                      }
                    }
                  } else {
                    throw new Error("Unknown parameter \""+key+'\x22');
                  }
                }
              }
              params[key] = value;
            }
          });
        }), configurations;
      }
      ["decompress"](data, fin, callback) {
        zlibLimiter.add(done => {
          this["_decompress"](data, fin, (error, result) => {
            (done)();
            (callback)((error), (result));
          });
        });
      }
      ["compress"](data, fin, callback) {
        zlibLimiter.add(done => {
          this["_compress"](data, fin, (error, result) => {
            (done)(), (callback)((error), (result));
          });
        });
      }
      ["_decompress"](data, fin, callback) {
        {
          const endpoint = this["_isServer"]?"client": "server";
          if (!this["_inflate"]) {
            const windowBitsKey = endpoint+("_max_window_bits"), windowBits = ((typeof this["params"][windowBitsKey])!==("number"))?zlib.Z_DEFAULT_WINDOWBITS: this["params"][windowBitsKey];
            this["_inflate"] = zlib.createInflateRaw({
              ...this["_options"]["zlibInflateOptions"], 'windowBits': windowBits
            }), this["_inflate"][kPerMessageDeflate] = this, this["_inflate"][kTotalLength] = 0, this["_inflate"][kBuffers] = [], this["_inflate"]['on']("error", inflateOnError), this["_inflate"]['on']("data", inflateOnData);
          }
          this["_inflate"][kCallback] = callback, this["_inflate"]["write"](data);
          if (fin)this["_inflate"]["write"](TRAILER);
          this["_inflate"]["flush"](() => {
            {
              const error = this["_inflate"][kError];
              if (error) {
                {
                  this["_inflate"]["close"](), this["_inflate"] = null, (callback)((error));
                  return;
                }
              }
              const result = bufferUtil.concat(this["_inflate"][kBuffers], this["_inflate"][kTotalLength]);
              if (this["_inflate"]["_readableState"]["endEmitted"])this["_inflate"]["close"](), this["_inflate"] = null;
              else {
                this["_inflate"][kTotalLength] = 0, this["_inflate"][kBuffers] = [], fin && this["params"][endpoint+("_no_context_takeover")] && this["_inflate"]["reset"]();
              }
              (callback)((null), (result));
            }
          });
        }
      }
      ["_compress"](data, fin, callback) {
        {
          const endpoint = this["_isServer"]?"server": "client";
          if (!this["_deflate"]) {
            {
              const windowBitsKey = endpoint+("_max_window_bits"), windowBits = ((typeof this["params"][windowBitsKey])!==("number"))?zlib.Z_DEFAULT_WINDOWBITS: this["params"][windowBitsKey];
              this["_deflate"] = zlib.createDeflateRaw({
                ...this["_options"]["zlibDeflateOptions"], 'windowBits': windowBits
              }), this["_deflate"][kTotalLength] = 0, this["_deflate"][kBuffers] = [], this["_deflate"]['on']("data", deflateOnData);
            }
          }
          this["_deflate"][kCallback] = callback, this["_deflate"]["write"](data), this["_deflate"]["flush"](zlib.Z_SYNC_FLUSH, () => {
            {
              if (!this["_deflate"]) {
                return;
              }
              let result = bufferUtil.concat(this["_deflate"][kBuffers], this["_deflate"][kTotalLength]);
              fin && (result = new FastBuffer(result.buffer, result.byteOffset, ((result.length)-(4)))), this["_deflate"][kCallback] = null, this["_deflate"][kTotalLength] = 0, this["_deflate"][kBuffers] = [], fin && this["params"][endpoint+("_no_context_takeover")] && this["_deflate"]["reset"](), (callback)((null), (result));
            }
          });
        }
      }
    };
    perMessageDeflateModule["exports"] = PerMessageDeflate;
    function deflateOnData(chunk) {
      this[kBuffers]["push"](chunk);
      this[kTotalLength]+=chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength]+=chunk.length;
      if (((this[kPerMessageDeflate]["_maxPayload"])<(1)) || ((this[kTotalLength])<=(this[kPerMessageDeflate]["_maxPayload"]))) {
        {
          this[kBuffers]["push"](chunk);
          return;
        }
      }
      this[kError] = new RangeError("Max payload size exceeded"), this[kError]["code"] = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH", this[kError][kStatusCode] = 1009, this["removeListener"]("data", inflateOnData), this["reset"]();
    }
    function inflateOnError(error) {
      this[kPerMessageDeflate]["_inflate"] = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      error[kStatusCode] = 1007;
      this[kCallback](error);
    }
  }
}), require_validation = __commonJS({
  '../work/websockets__ws/lib/validation.js'(argument155, validationModule) {
    'use strict';
    var {
      isUtf8: isUtf8
    }
     = (require)(("buffer")), {
      hasBlob: hasBlob
    }
     = (require_constants)(), tokenChars = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0];
    function isValidStatusCode(code) {
      return((code)>=(1000)) && ((code)<=(1014)) && ((code)!==(1004)) && ((code)!==(1005)) && ((code)!==(1006)) || ((code)>=(3000)) && ((code)<=(4999));
    }
    function _isValidUTF8(buffer) {
      const length = buffer.length;
      let number5 = 0;
      while (((number5)<(length))) {
        {
          if ((((buffer[number5]) & (128))===(0))) {
            number5++;
          } else {
            if ((((buffer[number5]) & (224))===(192))) {
              if ((((number5)+(1))===(length)) || (((buffer[((number5)+(1))]) & (192))!==(128)) || (((buffer[number5]) & (254))===(192))) {
                return(false);
              }
              number5+=2;
            } else {
              if ((((buffer[number5]) & (240))===(224))) {
                {
                  if ((((number5)+(2))>=(length)) || (((buffer[((number5)+(1))]) & (192))!==(128)) || (((buffer[((number5)+(2))]) & (192))!==(128)) || ((buffer[number5])===(224)) && (((buffer[((number5)+(1))]) & (224))===(128)) || ((buffer[number5])===(237)) && (((buffer[((number5)+(1))]) & (224))===(160))) {
                    return(false);
                  }
                  number5+=3;
                }
              } else {
                if ((((buffer[number5]) & (248))===(240))) {
                  {
                    if ((((number5)+(3))>=(length)) || (((buffer[((number5)+(1))]) & (192))!==(128)) || (((buffer[((number5)+(2))]) & (192))!==(128)) || (((buffer[((number5)+(3))]) & (192))!==(128)) || ((buffer[number5])===(240)) && (((buffer[((number5)+(1))]) & (240))===(128)) || ((buffer[number5])===(244)) && ((buffer[((number5)+(1))])>(143)) || ((buffer[number5])>(244))) {
                      return(false);
                    }
                    number5+=4;
                  }
                } else {
                  return(false);
                }
              }
            }
          }
        }
      }
      return(true);
    }
    function isBlob(value) {
      return hasBlob && ((typeof value)===("object")) && ((typeof value.arrayBuffer)===("function")) && ((typeof value.type)===("string")) && ((typeof value.stream)===("function")) && (((value[Symbol.toStringTag])===("Blob")) || ((value[Symbol.toStringTag])===("File")));
    }
    var validationExports = {
    };
    validationExports["isBlob"] = isBlob, validationExports["isValidStatusCode"] = isValidStatusCode, validationExports["isValidUTF8"] = _isValidUTF8, validationExports["tokenChars"] = tokenChars, validationModule["exports"] = validationExports;
    if (isUtf8)validationModule.exports["isValidUTF8"] = function(buffer) {
      return((buffer.length)<(24))?(_isValidUTF8)((buffer)): (isUtf8)((buffer));
    };
    else {
      if (!process.env.WS_NO_UTF_8_VALIDATE) {
        try {
          const utf8Validate = (require)(("utf-8-validate"));
          validationModule.exports["isValidUTF8"] = function(buffer) {
            return((buffer.length)<(32))?(_isValidUTF8)((buffer)): (utf8Validate)((buffer));
          };
        } catch (error2) {
        }
      }
    }
  }
}), {
  Duplex
}
 = require("stream"), {
  randomFillSync
}
 = require("crypto"), {
  types: {
    isUint8Array
  }
}
 = require("util"), PerMessageDeflate = require_permessage_deflate(), {
  EMPTY_BUFFER, kWebSocket, NOOP
}
 = require_constants(), {
  isBlob, isValidStatusCode
}
 = require_validation(), {
  mask: applyMask, toBuffer
}
 = require_buffer_util(), kByteLength = Symbol("kByteLength"), maskBuffer = Buffer.alloc(4);
var RANDOM_POOL_SIZE = 8192, randomPool, randomPoolPointer = RANDOM_POOL_SIZE, DEFAULT = 0, DEFLATING = 1, GET_BLOB_DATA = 2, Sender = class _Sender {
  constructor(socket, extensions, generateMask) {
    this["_extensions"] = ((extensions) || ({
    }));
    generateMask && (this["_generateMask"] = generateMask, this["_maskBuffer"] = Buffer.alloc(4)), this["_socket"] = socket, this["_firstFragment"] = (true), this["_compress"] = (false), this["_bufferedBytes"] = 0, this["_queue"] = [], this["_state"] = DEFAULT, this["onerror"] = NOOP, this[kWebSocket] = void 0;
  }
  static["frame"](data, options) {
    let mask, merge = (false), offset = 2, skipMasking = (false);
    if (options.mask) {
      {
        mask = options.maskBuffer || maskBuffer;
        if (options.generateMask) {
          options.generateMask(mask);
        } else {
          {
            ((randomPoolPointer)===(RANDOM_POOL_SIZE)) && (((randomPool)===(void 0)) && (randomPool = Buffer.alloc(RANDOM_POOL_SIZE)), (randomFillSync)((randomPool), (0), (RANDOM_POOL_SIZE)), randomPoolPointer = 0);
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
        }
        skipMasking = (((((mask[0]) | (mask[1])) | (mask[2])) | (mask[3]))===(0)), offset = 6;
      }
    }
    let dataLength;
    ((typeof data)===("string"))?(!options.mask || skipMasking) && ((options[kByteLength])!==(void 0))?dataLength = options[kByteLength]: (data = Buffer.from(data), dataLength = data.length): dataLength = data.length, merge = options.mask && options.readOnly && !skipMasking;
    let payloadLength = dataLength;
    if (((dataLength)>=(65536)))offset+=8, payloadLength = 127;
    else((dataLength)>(125)) && (offset+=2, payloadLength = 126);
    const target = Buffer.allocUnsafe(merge?((dataLength)+(offset)): offset);
    target[0] = options.fin?((options.opcode) | (128)): options.opcode;
    if (options.rsv1)target[0]|=64;
    target[1] = payloadLength;
    if (((payloadLength)===(126)))target.writeUInt16BE(dataLength, 2);
    else((payloadLength)===(127)) && (target[2] = target[3] = 0, target.writeUIntBE(dataLength, 4, 6));
    if (!options.mask)return[target, data];
    target[1]|=128, target[((offset)-(4))] = mask[0], target[((offset)-(3))] = mask[1], target[((offset)-(2))] = mask[2];
    target[((offset)-(1))] = mask[3];
    if (skipMasking)return[target, data];
    if (merge) {
      return(applyMask)((data), (mask), (target), (offset), (dataLength)), [target];
    }
    return(applyMask)((data), (mask), (data), (0), (dataLength)), [target, data];
  }
  ["close"](code, data, mask, callback) {
    let buffer;
    if (((code)===(void 0)))buffer = EMPTY_BUFFER;
    else {
      if (((typeof code)!==("number")) || !(isValidStatusCode)((code))) {
        throw new TypeError("First argument must be a valid error code number");
      } else {
        if (((data)===(void 0)) || !data.length)buffer = Buffer.allocUnsafe(2), buffer.writeUInt16BE(code, 0);
        else {
          const dataLength = Buffer.byteLength(data);
          if (((dataLength)>(123))) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buffer = Buffer.allocUnsafe(((2)+(dataLength))), buffer.writeUInt16BE(code, 0);
          if (((typeof data)===("string")))buffer.write(data, 2);
          else {
            if ((isUint8Array)((data)))buffer.set(data, 2);
            else throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
      }
    }
    var frameOptionsBuilder = {
    };
    frameOptionsBuilder[kByteLength] = buffer.length, frameOptionsBuilder["fin"] = (true), frameOptionsBuilder["generateMask"] = this["_generateMask"], frameOptionsBuilder["mask"] = mask, frameOptionsBuilder["maskBuffer"] = this["_maskBuffer"], frameOptionsBuilder["opcode"] = 8, frameOptionsBuilder["readOnly"] = (false), frameOptionsBuilder["rsv1"] = (false);
    const frameOptions = frameOptionsBuilder;
    ((this["_state"])!==(DEFAULT))?this["enqueue"]([this["dispatch"], buffer, (false), frameOptions, callback]): this["sendFrame"](_Sender.frame(buffer, frameOptions), callback);
  }
  ["ping"](data, mask, callback) {
    let byteLength, readOnly;
    if (((typeof data)===("string")))byteLength = Buffer.byteLength(data), readOnly = (false);
    else {
      if ((isBlob)((data)))byteLength = data.size, readOnly = (false);
      else {
        data = (toBuffer)((data)), byteLength = data.length, readOnly = toBuffer.readOnly;
      }
    }
    if (((byteLength)>(125)))throw new RangeError("The data size must not be greater than 125 bytes");
    var frameOptionsBuilder = {
    };
    frameOptionsBuilder[kByteLength] = byteLength, frameOptionsBuilder["fin"] = (true), frameOptionsBuilder["generateMask"] = this["_generateMask"], frameOptionsBuilder["mask"] = mask, frameOptionsBuilder["maskBuffer"] = this["_maskBuffer"], frameOptionsBuilder["opcode"] = 9, frameOptionsBuilder["readOnly"] = readOnly, frameOptionsBuilder["rsv1"] = (false);
    const frameOptions = frameOptionsBuilder;
    if ((isBlob)((data))) {
      {
        if (((this["_state"])!==(DEFAULT))) {
          this["enqueue"]([this["getBlobData"], data, (false), frameOptions, callback]);
        } else {
          this["getBlobData"](data, (false), frameOptions, callback);
        }
      }
    } else((this["_state"])!==(DEFAULT))?this["enqueue"]([this["dispatch"], data, (false), frameOptions, callback]): this["sendFrame"](_Sender.frame(data, frameOptions), callback);
  }
  ["pong"](data, mask, callback) {
    let byteLength, readOnly;
    if (((typeof data)===("string")))byteLength = Buffer.byteLength(data), readOnly = (false);
    else(isBlob)((data))?(byteLength = data.size, readOnly = (false)): (data = (toBuffer)((data)), byteLength = data.length, readOnly = toBuffer.readOnly);
    if (((byteLength)>(125)))throw new RangeError("The data size must not be greater than 125 bytes");
    var frameOptionsBuilder = {
    };
    frameOptionsBuilder[kByteLength] = byteLength, frameOptionsBuilder["fin"] = (true), frameOptionsBuilder["generateMask"] = this["_generateMask"], frameOptionsBuilder["mask"] = mask, frameOptionsBuilder["maskBuffer"] = this["_maskBuffer"], frameOptionsBuilder["opcode"] = 10, frameOptionsBuilder["readOnly"] = readOnly, frameOptionsBuilder["rsv1"] = (false);
    const frameOptions = frameOptionsBuilder;
    if ((isBlob)((data))) {
      {
        if (((this["_state"])!==(DEFAULT))) {
          this["enqueue"]([this["getBlobData"], data, (false), frameOptions, callback]);
        } else {
          this["getBlobData"](data, (false), frameOptions, callback);
        }
      }
    } else((this["_state"])!==(DEFAULT))?this["enqueue"]([this["dispatch"], data, (false), frameOptions, callback]): this["sendFrame"](_Sender.frame(data, frameOptions), callback);
  }
  ["send"](data, options, callback) {
    const perMessageDeflate = this["_extensions"][PerMessageDeflate.extensionName];
    let opcode = options.binary?2: 1, rsv1 = options.compress, byteLength, readOnly;
    if (((typeof data)===("string")))byteLength = Buffer.byteLength(data), readOnly = (false);
    else {
      if ((isBlob)((data))) {
        byteLength = data.size, readOnly = (false);
      } else {
        data = (toBuffer)((data)), byteLength = data.length, readOnly = toBuffer.readOnly;
      }
    }
    if (this["_firstFragment"]) {
      this["_firstFragment"] = (false), ((rsv1) && (perMessageDeflate)) && perMessageDeflate.params[perMessageDeflate._isServer?"server_no_context_takeover": "client_no_context_takeover"] && (rsv1 = ((byteLength)>=(perMessageDeflate._threshold))), this["_compress"] = rsv1;
    } else {
      rsv1 = (false), opcode = 0;
    }
    if (options.fin)this["_firstFragment"] = (true);
    var frameOptionsBuilder = {
    };
    frameOptionsBuilder[kByteLength] = byteLength, frameOptionsBuilder["fin"] = options.fin, frameOptionsBuilder["generateMask"] = this["_generateMask"], frameOptionsBuilder["mask"] = options.mask, frameOptionsBuilder["maskBuffer"] = this["_maskBuffer"];
    frameOptionsBuilder["opcode"] = opcode;
    frameOptionsBuilder["readOnly"] = readOnly, frameOptionsBuilder["rsv1"] = rsv1;
    const frameOptions = frameOptionsBuilder;
    if ((isBlob)((data))) {
      ((this["_state"])!==(DEFAULT))?this["enqueue"]([this["getBlobData"], data, this["_compress"], frameOptions, callback]): this["getBlobData"](data, this["_compress"], frameOptions, callback);
    } else {
      if (((this["_state"])!==(DEFAULT)))this["enqueue"]([this["dispatch"], data, this["_compress"], frameOptions, callback]);
      else {
        this["dispatch"](data, this["_compress"], frameOptions, callback);
      }
    }
  }
  ["getBlobData"](blob, compress, options, callback) {
    this["_bufferedBytes"]+=options[kByteLength], this["_state"] = GET_BLOB_DATA;
    blob.arrayBuffer()["then"](arrayBuffer => {
      {
        if (this["_socket"]["destroyed"]) {
          {
            const error = new Error("The socket was closed while the blob was being read");
            process.nextTick(callCallbacks, this, error, callback);
            return;
          }
        }
        this["_bufferedBytes"]-=options[kByteLength];
        const data = (toBuffer)((arrayBuffer));
        if (!compress) {
          this["_state"] = DEFAULT, this["sendFrame"](_Sender.frame(data, options), callback), this["dequeue"]();
        } else this["dispatch"](data, compress, options, callback);
      }
    })["catch"](error => {
      process.nextTick(onError, this, error, callback);
    });
  }
  ["dispatch"](data, compress, options, callback) {
    if (!compress) {
      {
        this["sendFrame"](_Sender.frame(data, options), callback);
        return;
      }
    }
    const perMessageDeflate = this["_extensions"][PerMessageDeflate.extensionName];
    this["_bufferedBytes"]+=options[kByteLength];
    this["_state"] = DEFLATING, perMessageDeflate.compress(data, options.fin, (error, data) => {
      if (this["_socket"]["destroyed"]) {
        {
          const error = new Error("The socket was closed while data was being compressed");
          (callCallbacks)((this), (error), (callback));
          return;
        }
      }
      this["_bufferedBytes"]-=options[kByteLength], this["_state"] = DEFAULT, options["readOnly"] = (false), this["sendFrame"](_Sender.frame(data, options), callback), this["dequeue"]();
    });
  }
  ["dequeue"]() {
    while (((this["_state"])===(DEFAULT)) && this["_queue"]["length"]) {
      {
        const params = this["_queue"]["shift"]();
        this["_bufferedBytes"]-=params[3][kByteLength], Reflect.apply(params[0], this, params.slice(1));
      }
    }
  }
  ["enqueue"](params) {
    this["_bufferedBytes"]+=params[3][kByteLength], this["_queue"]["push"](params);
  }
  ["sendFrame"](list, callback) {
    ((list.length)===(2))?(this["_socket"]["cork"](), this["_socket"]["write"](list[0]), this["_socket"]["write"](list[1], callback), this["_socket"]["uncork"]()): this["_socket"]["write"](list[0], callback);
  }
};
module["exports"] = Sender;
function callCallbacks(sender, error, callback) {
  if (((typeof callback)===("function")))(callback)((error));
  for (let index = 0;
  ((index)<(sender._queue["length"]));
  index++) {
    {
      const params = sender._queue[index], callback = params[((params.length)-(1))];
      if (((typeof callback)===("function")))(callback)((error));
    }
  }
}
function onError(sender, error, callback) {
  (callCallbacks)((sender), (error), (callback)), sender.onerror(error);
}
