'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x2ec809, _0x3cfe27) => function _0x45a96c() {
  var _0x13019d = {
    'lzOAb': function(_0x3a7857, _0x32225a) {
      return _0x3a7857(_0x32225a);
    }
  };
  var _0x237ee1 = {};
  _0x237ee1['exports'] = {};
  return _0x3cfe27 || (0, _0x2ec809[__getOwnPropNames(_0x2ec809)[0]])((_0x3cfe27 = _0x237ee1)['exports'], _0x3cfe27), _0x3cfe27['exports'];
};

var require_constants = __commonJS({
  '../work/websockets__ws/lib/constants.js'(_0x281811, _0x18abf1) {
    'use strict';
    var _0x5e59e5 = {
      'ZdRAM': '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
      'UDBZp': 'nodebuffer',
      'VrtMT': function(_0x474612, _0x3a63ef) {
        return _0x474612(_0x3a63ef);
      },
      'bvNAM': 'arraybuffer',
      'VDOtq': function(_0x3b564, _0x2f4604) {
        return _0x3b564(_0x2f4604);
      },
      'kcWwo': 'fragments',
      'BRnPT': 'message',
      'llIcf': 'close',
      'CeIaj': 'ping',
      'fTmxK': 'pong',
      'rcXcc': 'error',
      'rZSdY': function(_0x52140b, _0x4a9d81) {
        return _0x52140b !== _0x4a9d81;
      },
      'YgGJS': 'undefined',
      'gPcUi': 'blob'
    };
    var _0x116108 = _0x5e59e5['ZdRAM'].split('|');
    var _0x330192 = 0;
    while (!![]) {
      switch (_0x116108[_0x330192++]) {
        case '0':
          _0x18abf1['exports'] = {
            'BINARY_TYPES': _0x3b0f92,
            'CLOSE_TIMEOUT': 30000,
            'EMPTY_BUFFER': Buffer.alloc(0),
            'GUID': _0x5e59e5['ZdRAM'],
            'hasBlob': _0x837aaf,
            'kForOnEventAttribute': _0x5e59e5['VrtMT'](Symbol, _0x5e59e5['kcWwo']),
            'kListener': _0x5e59e5['VDOtq'](Symbol, _0x5e59e5['BRnPT']),
            'kStatusCode': _0x5e59e5['VrtMT'](Symbol, _0x5e59e5['llIcf']),
            'kWebSocket': _0x5e59e5['VrtMT'](Symbol, _0x5e59e5['CeIaj']),
            'NOOP': () => {}
          };
          continue;
        case '1':
          'use strict';
          continue;
        case '2':
          var _0x3b0f92 = [_0x5e59e5['bvNAM'], _0x5e59e5['gPcUi'], _0x5e59e5['fTmxK']];
          continue;
        case '3':
          var _0x837aaf = _0x5e59e5['VDOtq'](typeof Blob, _0x5e59e5['YgGJS']);
          continue;
        case '4':
          if (_0x837aaf) _0x3b0f92['push'](_0x5e59e5['rcXcc']);
          continue;
      }
      break;
    }
  }
});

var { EMPTY_BUFFER } = require_constants();
var FastBuffer = Buffer[Symbol.species];

function concat(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER;
  if (list.length === 1) return list[0];
  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;
  for (let i = 0; i < list.length; i++) {
    const buf = list[i];
    target.set(buf, offset);
    offset += buf.length;
  }
  if (offset < totalLength) {
    return new FastBuffer(target.buffer, target.byteOffset, offset);
  }
  return target;
}

function _mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

function _unmask(buffer, mask) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

function toArrayBuffer(buf) {
  if (buf.byteLength === buf.buffer.byteLength) {
    return buf.buffer;
  }
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function toBuffer(data) {
  toBuffer.readOnly = true;
  if (Buffer.isBuffer(data)) return data;
  let buf;
  if (data instanceof ArrayBuffer) {
    buf = new FastBuffer(data);
  } else if (ArrayBuffer.isView(data)) {
    buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buf = Buffer.from(data);
    toBuffer.readOnly = false;
  }
  return buf;
}

var _0x1d8347 = {};
_0x1d8347['concat'] = concat;
_0x1d8347['mask'] = _mask;
_0x1d8347['toArrayBuffer'] = toArrayBuffer;
_0x1d8347['toBuffer'] = toBuffer;
_0x1d8347['unmask'] = _unmask;
module['exports'] = _0x1d8347;

if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil = require('bufferutil');
    module['exports']['mask'] = function(source, mask, output, offset, length) {
      if (length < 12) {
        _mask(source, mask, output, offset, length);
      } else {
        bufferUtil.mask(source, mask, output, offset, length);
      }
    };
    module['exports']['unmask'] = function(buffer, mask) {
      if (buffer.length < 32) {
        _unmask(buffer, mask);
      } else {
        bufferUtil.unmask(buffer, mask);
      }
    };
  } catch (_0x4f4c90) {}
}
