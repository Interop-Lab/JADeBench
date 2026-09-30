var SHIFT_LEFT_32 = 4294967296;
var SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
var TEXT_DECODER_MIN_LENGTH = 12;
var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");
var PBF_VARINT = 0;
var PBF_FIXED64 = 1;
var PBF_BYTES = 2;
var PBF_FIXED32 = 5;
var PbfReader = class {
  constructor(_0x1c0a1b) {
    this.buf = ArrayBuffer.isView(_0x1c0a1b) ? _0x1c0a1b : new Uint8Array(_0x1c0a1b);
    this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    this.pos = 0;
    this.type = 0;
    this._valueStart = -1;
    this.length = this.buf.length;
  }
  readFields(_0x3fc4eb, _0x26b8e9, _0x31c151 = this.length) {
    let _0x1627df;
    while (_0x1627df = this.nextField(_0x31c151)) {
      _0x3fc4eb(_0x1627df, _0x26b8e9, this);
    }
    return _0x26b8e9;
  }
  readMessage(_0x57a883, _0x1776d4) {
    return this.readFields(_0x57a883, _0x1776d4, this.readVarint() + this.pos);
  }
  readFixed32() {
    const _0x1b0174 = this.dataView.getUint32(this.pos, true);
    this.pos += 4;
    return _0x1b0174;
  }
  readSFixed32() {
    const _0x500aec = this.dataView.getInt32(this.pos, true);
    this.pos += 4;
    return _0x500aec;
  }
  readFixed64() {
    const _0x58c0db = this.dataView.getUint32(this.pos, true) + this.dataView.getUint32(this.pos + 4, true) * SHIFT_LEFT_32;
    this.pos += 8;
    return _0x58c0db;
  }
  readSFixed64() {
    const _0x559d68 = this.dataView.getUint32(this.pos, true) + this.dataView.getInt32(this.pos + 4, true) * SHIFT_LEFT_32;
    this.pos += 8;
    return _0x559d68;
  }
  readFloat() {
    const _0x37eed2 = this.dataView.getFloat32(this.pos, true);
    this.pos += 4;
    return _0x37eed2;
  }
  readDouble() {
    const _0x7b5fcc = this.dataView.getFloat64(this.pos, true);
    this.pos += 8;
    return _0x7b5fcc;
  }
  readVarint(_0x4b9ec7) {
    const _0x16fbe2 = this.buf;
    const _0x5ed66a = _0x16fbe2[this.pos++];
    if (_0x5ed66a < 128) {
      return _0x5ed66a;
    }
    let _0x450e47 = _0x5ed66a & 127;
    let _0x34b496;
    _0x34b496 = _0x16fbe2[this.pos++];
    _0x450e47 |= (_0x34b496 & 127) << 7;
    if (_0x34b496 < 128) {
      return _0x450e47;
    }
    _0x34b496 = _0x16fbe2[this.pos++];
    _0x450e47 |= (_0x34b496 & 127) << 14;
    if (_0x34b496 < 128) {
      return _0x450e47;
    }
    _0x34b496 = _0x16fbe2[this.pos++];
    _0x450e47 |= (_0x34b496 & 127) << 21;
    if (_0x34b496 < 128) {
      return _0x450e47;
    }
    _0x34b496 = _0x16fbe2[this.pos];
    _0x450e47 |= (_0x34b496 & 15) << 28;
    return readVarintRemainder(_0x450e47, _0x4b9ec7, this);
  }
  readSVarint() {
    const _0x26a8fb = this.readVarint();
    if (_0x26a8fb % 2 === 1) {
      return (_0x26a8fb + 1) / -2;
    } else {
      return _0x26a8fb / 2;
    }
  }
  readBoolean() {
    return Boolean(this.readVarint());
  }
  readString() {
    const _0x247185 = this.readVarint() + this.pos;
    const _0x3d925c = this.pos;
    this.pos = _0x247185;
    if (_0x247185 - _0x3d925c >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
      return utf8TextDecoder.decode(this.buf.subarray(_0x3d925c, _0x247185));
    }
    return readUtf8(this.buf, _0x3d925c, _0x247185);
  }
  readBytes() {
    const _0x4f2ff7 = this.readVarint() + this.pos;
    const _0x3715b0 = this.buf.subarray(this.pos, _0x4f2ff7);
    this.pos = _0x4f2ff7;
    return _0x3715b0;
  }
  readPackedVarint(_0x37bae1 = [], _0x4b60b1) {
    const _0x1da223 = this.readPackedEnd();
    while (this.pos < _0x1da223) {
      _0x37bae1.push(this.readVarint(_0x4b60b1));
    }
    return _0x37bae1;
  }
  readPackedSVarint(_0x571807 = []) {
    const _0x3850f3 = this.readPackedEnd();
    while (this.pos < _0x3850f3) {
      _0x571807.push(this.readSVarint());
    }
    return _0x571807;
  }
  readPackedBoolean(_0x55ba6b = []) {
    const _0x3dee6d = this.readPackedEnd();
    while (this.pos < _0x3dee6d) {
      _0x55ba6b.push(this.readBoolean());
    }
    return _0x55ba6b;
  }
  readPackedFloat(_0x5d6978 = []) {
    const _0x2ef7f8 = this.readPackedEnd();
    while (this.pos < _0x2ef7f8) {
      _0x5d6978.push(this.readFloat());
    }
    return _0x5d6978;
  }
  readPackedDouble(_0x47c44e = []) {
    const _0x42cc1b = this.readPackedEnd();
    while (this.pos < _0x42cc1b) {
      _0x47c44e.push(this.readDouble());
    }
    return _0x47c44e;
  }
  readPackedFixed32(_0x5aa512 = []) {
    const _0x202871 = this.readPackedEnd();
    while (this.pos < _0x202871) {
      _0x5aa512.push(this.readFixed32());
    }
    return _0x5aa512;
  }
  readPackedSFixed32(_0x47d840 = []) {
    const _0x26d561 = this.readPackedEnd();
    while (this.pos < _0x26d561) {
      _0x47d840.push(this.readSFixed32());
    }
    return _0x47d840;
  }
  readPackedFixed64(_0x3f88f5 = []) {
    const _0x57c163 = this.readPackedEnd();
    while (this.pos < _0x57c163) {
      _0x3f88f5.push(this.readFixed64());
    }
    return _0x3f88f5;
  }
  readPackedSFixed64(_0x2ebb89 = []) {
    const _0x17d86e = this.readPackedEnd();
    while (this.pos < _0x17d86e) {
      _0x2ebb89.push(this.readSFixed64());
    }
    return _0x2ebb89;
  }
  readPackedEnd() {
    if (this.type === PBF_BYTES) {
      return this.readVarint() + this.pos;
    } else {
      return this.pos + 1;
    }
  }
  nextField(_0x2347c1 = this.length) {
    if (this.pos === this._valueStart) {
      this.skip(this.type);
    }
    if (this.pos >= _0x2347c1) {
      return 0;
    }
    const _0x3b8056 = this.readVarint();
    this.type = _0x3b8056 & 7;
    this._valueStart = this.pos;
    return _0x3b8056 >>> 3;
  }
  skip(_0x2a7ff9) {
    const _0x3155f7 = _0x2a7ff9 & 7;
    if (_0x3155f7 === PBF_VARINT) {
      while (this.buf[this.pos++] > 127) {}
    } else if (_0x3155f7 === PBF_BYTES) {
      this.pos = this.readVarint() + this.pos;
    } else if (_0x3155f7 === PBF_FIXED32) {
      this.pos += 4;
    } else if (_0x3155f7 === PBF_FIXED64) {
      this.pos += 8;
    } else {
      throw new Error("Unimplemented type: " + _0x3155f7);
    }
  }
};
var PbfWriter = class {
  constructor(_0x4530a2 = new Uint8Array(16)) {
    this.buf = ArrayBuffer.isView(_0x4530a2) ? _0x4530a2 : new Uint8Array(_0x4530a2);
    this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    this.pos = 0;
    this.length = this.buf.length;
  }
  writeTag(_0x902650, _0x1056bb) {
    this.writeVarint(_0x902650 << 3 | _0x1056bb);
  }
  realloc(_0x2ba5ab) {
    let _0x645e45 = this.length || 16;
    while (_0x645e45 < this.pos + _0x2ba5ab) {
      _0x645e45 *= 2;
    }
    if (_0x645e45 !== this.length) {
      const _0x258104 = new Uint8Array(_0x645e45);
      _0x258104.set(this.buf);
      this.buf = _0x258104;
      this.dataView = new DataView(_0x258104.buffer);
      this.length = _0x645e45;
    }
  }
  finish() {
    this.length = this.pos;
    this.pos = 0;
    return this.buf.subarray(0, this.length);
  }
  writeFixed32(_0x46383a) {
    this.realloc(4);
    this.dataView.setInt32(this.pos, _0x46383a, true);
    this.pos += 4;
  }
  writeSFixed32(_0x1c75ab) {
    this.realloc(4);
    this.dataView.setInt32(this.pos, _0x1c75ab, true);
    this.pos += 4;
  }
  writeFixed64(_0x4d706b) {
    this.realloc(8);
    this.dataView.setInt32(this.pos, _0x4d706b & -1, true);
    this.dataView.setInt32(this.pos + 4, Math.floor(_0x4d706b * SHIFT_RIGHT_32), true);
    this.pos += 8;
  }
  writeSFixed64(_0x3092b4) {
    this.realloc(8);
    this.dataView.setInt32(this.pos, _0x3092b4 & -1, true);
    this.dataView.setInt32(this.pos + 4, Math.floor(_0x3092b4 * SHIFT_RIGHT_32), true);
    this.pos += 8;
  }
  writeVarint(_0x4d1d09) {
    _0x4d1d09 = +_0x4d1d09 || 0;
    if (_0x4d1d09 >= 0 && _0x4d1d09 < 128) {
      if (this.pos >= this.length) {
        this.realloc(1);
      }
      this.buf[this.pos++] = _0x4d1d09;
      return;
    }
    if (_0x4d1d09 > 268435455 || _0x4d1d09 < 0) {
      writeBigVarint(_0x4d1d09, this);
      return;
    }
    this.realloc(4);
    this.buf[this.pos++] = _0x4d1d09 & 127 | (_0x4d1d09 > 127 ? 128 : 0);
    if (_0x4d1d09 <= 127) {
      return;
    }
    this.buf[this.pos++] = (_0x4d1d09 >>>= 7) & 127 | (_0x4d1d09 > 127 ? 128 : 0);
    if (_0x4d1d09 <= 127) {
      return;
    }
    this.buf[this.pos++] = (_0x4d1d09 >>>= 7) & 127 | (_0x4d1d09 > 127 ? 128 : 0);
    if (_0x4d1d09 <= 127) {
      return;
    }
    this.buf[this.pos++] = _0x4d1d09 >>> 7 & 127;
  }
  writeSVarint(_0x24e13b) {
    this.writeVarint(_0x24e13b < 0 ? -_0x24e13b * 2 - 1 : _0x24e13b * 2);
  }
  writeBoolean(_0x25e7dd) {
    this.writeVarint(+_0x25e7dd);
  }
  writeString(_0x5090d8) {
    _0x5090d8 = String(_0x5090d8);
    this.realloc(_0x5090d8.length * 4);
    this.pos++;
    const _0x3250bb = this.pos;
    this.pos = writeUtf8(this.buf, _0x5090d8, this.pos);
    const _0x3f7be2 = this.pos - _0x3250bb;
    if (_0x3f7be2 >= 128) {
      makeRoomForExtraLength(_0x3250bb, _0x3f7be2, this);
    }
    this.pos = _0x3250bb - 1;
    this.writeVarint(_0x3f7be2);
    this.pos += _0x3f7be2;
  }
  writeFloat(_0x424c9d) {
    this.realloc(4);
    this.dataView.setFloat32(this.pos, _0x424c9d, true);
    this.pos += 4;
  }
  writeDouble(_0x2ac0df) {
    this.realloc(8);
    this.dataView.setFloat64(this.pos, _0x2ac0df, true);
    this.pos += 8;
  }
  writeBytes(_0x3bf2f2) {
    const _0x91501 = _0x3bf2f2.length;
    this.writeVarint(_0x91501);
    this.realloc(_0x91501);
    this.buf.set(_0x3bf2f2, this.pos);
    this.pos += _0x91501;
  }
  writeRawMessage(_0x57ff7b, _0x244360) {
    this.pos++;
    const _0x39024a = this.pos;
    _0x57ff7b(_0x244360, this);
    const _0x2aab8c = this.pos - _0x39024a;
    if (_0x2aab8c >= 128) {
      makeRoomForExtraLength(_0x39024a, _0x2aab8c, this);
    }
    this.pos = _0x39024a - 1;
    this.writeVarint(_0x2aab8c);
    this.pos += _0x2aab8c;
  }
  writeMessage(_0x336256, _0x3bae1d, _0x181555) {
    this.writeTag(_0x336256, PBF_BYTES);
    this.writeRawMessage(_0x3bae1d, _0x181555);
  }
  writePackedVarint(_0x450911, _0x2ed722) {
    if (_0x2ed722.length) {
      this.writeMessage(_0x450911, writePackedVarint, _0x2ed722);
    }
  }
  writePackedSVarint(_0x5cbd2f, _0x2d7b6d) {
    if (_0x2d7b6d.length) {
      this.writeMessage(_0x5cbd2f, writePackedSVarint, _0x2d7b6d);
    }
  }
  writePackedBoolean(_0x26d0e8, _0x30cd4e) {
    if (_0x30cd4e.length) {
      this.writeMessage(_0x26d0e8, writePackedBoolean, _0x30cd4e);
    }
  }
  writePackedFloat(_0x38727f, _0x34f5bb) {
    if (_0x34f5bb.length) {
      this.writeMessage(_0x38727f, writePackedFloat, _0x34f5bb);
    }
  }
  writePackedDouble(_0x1b65e5, _0x26b808) {
    if (_0x26b808.length) {
      this.writeMessage(_0x1b65e5, writePackedDouble, _0x26b808);
    }
  }
  writePackedFixed32(_0x3c4fc3, _0x129069) {
    if (_0x129069.length) {
      this.writeMessage(_0x3c4fc3, writePackedFixed32, _0x129069);
    }
  }
  writePackedSFixed32(_0x142c43, _0x593cdf) {
    if (_0x593cdf.length) {
      this.writeMessage(_0x142c43, writePackedSFixed32, _0x593cdf);
    }
  }
  writePackedFixed64(_0x51c627, _0x122370) {
    if (_0x122370.length) {
      this.writeMessage(_0x51c627, writePackedFixed64, _0x122370);
    }
  }
  writePackedSFixed64(_0x2ff257, _0xb697c2) {
    if (_0xb697c2.length) {
      this.writeMessage(_0x2ff257, writePackedSFixed64, _0xb697c2);
    }
  }
  writeBytesField(_0x4323ab, _0x7aa98a) {
    this.writeTag(_0x4323ab, PBF_BYTES);
    this.writeBytes(_0x7aa98a);
  }
  writeFixed32Field(_0x23c0df, _0x3ebfac) {
    this.writeTag(_0x23c0df, PBF_FIXED32);
    this.writeFixed32(_0x3ebfac);
  }
  writeSFixed32Field(_0x2b20a7, _0x13e99a) {
    this.writeTag(_0x2b20a7, PBF_FIXED32);
    this.writeSFixed32(_0x13e99a);
  }
  writeFixed64Field(_0x2eaa63, _0x539190) {
    this.writeTag(_0x2eaa63, PBF_FIXED64);
    this.writeFixed64(_0x539190);
  }
  writeSFixed64Field(_0x530b25, _0x466c2f) {
    this.writeTag(_0x530b25, PBF_FIXED64);
    this.writeSFixed64(_0x466c2f);
  }
  writeVarintField(_0xe7e80a, _0x3adb59) {
    this.writeTag(_0xe7e80a, PBF_VARINT);
    this.writeVarint(_0x3adb59);
  }
  writeSVarintField(_0x2494f5, _0x10796c) {
    this.writeTag(_0x2494f5, PBF_VARINT);
    this.writeSVarint(_0x10796c);
  }
  writeStringField(_0x135ac5, _0x50816d) {
    this.writeTag(_0x135ac5, PBF_BYTES);
    this.writeString(_0x50816d);
  }
  writeFloatField(_0x5d833f, _0x493cb1) {
    this.writeTag(_0x5d833f, PBF_FIXED32);
    this.writeFloat(_0x493cb1);
  }
  writeDoubleField(_0x49f8ea, _0x9cd646) {
    this.writeTag(_0x49f8ea, PBF_FIXED64);
    this.writeDouble(_0x9cd646);
  }
  writeBooleanField(_0x2968f0, _0x38de0c) {
    this.writeVarintField(_0x2968f0, +_0x38de0c);
  }
};
function readVarintRemainder(_0x2a238a, _0x583960, _0x5b0537) {
  const _0x4df124 = _0x5b0537.buf;
  let _0x684780;
  let _0x79f977;
  _0x79f977 = _0x4df124[_0x5b0537.pos++];
  _0x684780 = (_0x79f977 & 112) >> 4;
  if (_0x79f977 < 128) {
    return toNum(_0x2a238a, _0x684780, _0x583960);
  }
  _0x79f977 = _0x4df124[_0x5b0537.pos++];
  _0x684780 |= (_0x79f977 & 127) << 3;
  if (_0x79f977 < 128) {
    return toNum(_0x2a238a, _0x684780, _0x583960);
  }
  _0x79f977 = _0x4df124[_0x5b0537.pos++];
  _0x684780 |= (_0x79f977 & 127) << 10;
  if (_0x79f977 < 128) {
    return toNum(_0x2a238a, _0x684780, _0x583960);
  }
  _0x79f977 = _0x4df124[_0x5b0537.pos++];
  _0x684780 |= (_0x79f977 & 127) << 17;
  if (_0x79f977 < 128) {
    return toNum(_0x2a238a, _0x684780, _0x583960);
  }
  _0x79f977 = _0x4df124[_0x5b0537.pos++];
  _0x684780 |= (_0x79f977 & 127) << 24;
  if (_0x79f977 < 128) {
    return toNum(_0x2a238a, _0x684780, _0x583960);
  }
  _0x79f977 = _0x4df124[_0x5b0537.pos++];
  _0x684780 |= (_0x79f977 & 1) << 31;
  if (_0x79f977 < 128) {
    return toNum(_0x2a238a, _0x684780, _0x583960);
  }
  throw new Error("Expected varint not more than 10 bytes");
}
function toNum(_0x1298ca, _0x3af8b0, _0x384af3) {
  if (_0x384af3) {
    return _0x3af8b0 * 4294967296 + (_0x1298ca >>> 0);
  } else {
    return (_0x3af8b0 >>> 0) * 4294967296 + (_0x1298ca >>> 0);
  }
}
function writeBigVarint(_0xccd962, _0x1b3075) {
  let _0xfff612;
  let _0x146e33;
  if (_0xccd962 >= 0) {
    _0xfff612 = _0xccd962 % 4294967296 | 0;
    _0x146e33 = _0xccd962 / 4294967296 | 0;
  } else {
    _0xfff612 = ~(-_0xccd962 % 4294967296);
    _0x146e33 = ~(-_0xccd962 / 4294967296);
    if (_0xfff612 ^ -1) {
      _0xfff612 = _0xfff612 + 1 | 0;
    } else {
      _0xfff612 = 0;
      _0x146e33 = _0x146e33 + 1 | 0;
    }
  }
  if (_0xccd962 >= 18446744073709552000 || _0xccd962 < -18446744073709552000) {
    throw new Error("Given varint doesn't fit into 10 bytes");
  }
  _0x1b3075.realloc(10);
  writeBigVarintLow(_0xfff612, _0x146e33, _0x1b3075);
  writeBigVarintHigh(_0x146e33, _0x1b3075);
}
function writeBigVarintLow(_0x1908c5, _0x5d4fd9, _0x1788fa) {
  _0x1788fa.buf[_0x1788fa.pos++] = _0x1908c5 & 127 | 128;
  _0x1908c5 >>>= 7;
  _0x1788fa.buf[_0x1788fa.pos++] = _0x1908c5 & 127 | 128;
  _0x1908c5 >>>= 7;
  _0x1788fa.buf[_0x1788fa.pos++] = _0x1908c5 & 127 | 128;
  _0x1908c5 >>>= 7;
  _0x1788fa.buf[_0x1788fa.pos++] = _0x1908c5 & 127 | 128;
  _0x1908c5 >>>= 7;
  _0x1788fa.buf[_0x1788fa.pos] = _0x1908c5 & 127;
}
function writeBigVarintHigh(_0x1900c5, _0x48c510) {
  const _0x4126da = (_0x1900c5 & 7) << 4;
  _0x48c510.buf[_0x48c510.pos++] |= _0x4126da | ((_0x1900c5 >>>= 3) ? 128 : 0);
  if (!_0x1900c5) {
    return;
  }
  _0x48c510.buf[_0x48c510.pos++] = _0x1900c5 & 127 | ((_0x1900c5 >>>= 7) ? 128 : 0);
  if (!_0x1900c5) {
    return;
  }
  _0x48c510.buf[_0x48c510.pos++] = _0x1900c5 & 127 | ((_0x1900c5 >>>= 7) ? 128 : 0);
  if (!_0x1900c5) {
    return;
  }
  _0x48c510.buf[_0x48c510.pos++] = _0x1900c5 & 127 | ((_0x1900c5 >>>= 7) ? 128 : 0);
  if (!_0x1900c5) {
    return;
  }
  _0x48c510.buf[_0x48c510.pos++] = _0x1900c5 & 127 | ((_0x1900c5 >>>= 7) ? 128 : 0);
  if (!_0x1900c5) {
    return;
  }
  _0x48c510.buf[_0x48c510.pos++] = _0x1900c5 & 127;
}
function makeRoomForExtraLength(_0x4d6ce2, _0x1fb141, _0x31fbc6) {
  const _0x1d8b0 = _0x1fb141 <= 16383 ? 1 : _0x1fb141 <= 2097151 ? 2 : _0x1fb141 <= 268435455 ? 3 : Math.floor(Math.log(_0x1fb141) / (Math.LN2 * 7));
  _0x31fbc6.realloc(_0x1d8b0);
  _0x31fbc6.buf.copyWithin(_0x4d6ce2 + _0x1d8b0, _0x4d6ce2, _0x31fbc6.pos);
}
function writePackedVarint(_0x48a6cf, _0xd82f14) {
  const _0x45fa95 = _0x48a6cf.length;
  let _0x97bebb = _0xd82f14.buf;
  let _0x10fd1e = _0xd82f14.pos;
  let _0x5c928 = _0xd82f14.length;
  for (let _0xaabdcf = 0; _0xaabdcf < _0x45fa95; _0xaabdcf++) {
    let _0x4dd5b9 = _0x48a6cf[_0xaabdcf];
    if (_0x4dd5b9 < 0 || _0x10fd1e + 10 > _0x5c928) {
      _0xd82f14.pos = _0x10fd1e;
      _0xd82f14.writeVarint(_0x4dd5b9);
      _0x97bebb = _0xd82f14.buf;
      _0x10fd1e = _0xd82f14.pos;
      _0x5c928 = _0xd82f14.length;
      continue;
    }
    while (_0x4dd5b9 > 127) {
      _0x97bebb[_0x10fd1e++] = _0x4dd5b9 % 128 | 128;
      _0x4dd5b9 = Math.floor(_0x4dd5b9 / 128);
    }
    _0x97bebb[_0x10fd1e++] = _0x4dd5b9;
  }
  _0xd82f14.pos = _0x10fd1e;
}
function writePackedSVarint(_0x244522, _0x4597b9) {
  for (let _0x1ee8b0 = 0; _0x1ee8b0 < _0x244522.length; _0x1ee8b0++) {
    _0x4597b9.writeSVarint(_0x244522[_0x1ee8b0]);
  }
}
function writePackedFloat(_0x3f6c31, _0xe867bf) {
  for (let _0x12cf74 = 0; _0x12cf74 < _0x3f6c31.length; _0x12cf74++) {
    _0xe867bf.writeFloat(_0x3f6c31[_0x12cf74]);
  }
}
function writePackedDouble(_0x426b5e, _0x4f781e) {
  for (let _0x4a3253 = 0; _0x4a3253 < _0x426b5e.length; _0x4a3253++) {
    _0x4f781e.writeDouble(_0x426b5e[_0x4a3253]);
  }
}
function writePackedBoolean(_0x3b59b0, _0x1f1c50) {
  for (let _0x56ce53 = 0; _0x56ce53 < _0x3b59b0.length; _0x56ce53++) {
    _0x1f1c50.writeBoolean(_0x3b59b0[_0x56ce53]);
  }
}
function writePackedFixed32(_0x581578, _0x5bc743) {
  for (let _0x5b59b4 = 0; _0x5b59b4 < _0x581578.length; _0x5b59b4++) {
    _0x5bc743.writeFixed32(_0x581578[_0x5b59b4]);
  }
}
function writePackedSFixed32(_0x5643c7, _0x3ecc62) {
  for (let _0x3d3c50 = 0; _0x3d3c50 < _0x5643c7.length; _0x3d3c50++) {
    _0x3ecc62.writeSFixed32(_0x5643c7[_0x3d3c50]);
  }
}
function writePackedFixed64(_0x5d9cec, _0xf90f21) {
  for (let _0x38b41d = 0; _0x38b41d < _0x5d9cec.length; _0x38b41d++) {
    _0xf90f21.writeFixed64(_0x5d9cec[_0x38b41d]);
  }
}
function writePackedSFixed64(_0x1da6a1, _0x4f883b) {
  for (let _0x10b639 = 0; _0x10b639 < _0x1da6a1.length; _0x10b639++) {
    _0x4f883b.writeSFixed64(_0x1da6a1[_0x10b639]);
  }
}
function readUtf8(_0x5b2c03, _0x29c5ca, _0x153b21) {
  let _0x186e5f = "";
  let _0x337383 = _0x29c5ca;
  while (_0x337383 < _0x153b21) {
    const _0x132175 = _0x5b2c03[_0x337383];
    let _0x27dd7a = null;
    let _0x651db1 = _0x132175 > 239 ? 4 : _0x132175 > 223 ? 3 : _0x132175 > 191 ? 2 : 1;
    if (_0x337383 + _0x651db1 > _0x153b21) {
      break;
    }
    let _0x284ed3;
    let _0x218340;
    let _0x3c6b88;
    if (_0x651db1 === 1) {
      if (_0x132175 < 128) {
        _0x27dd7a = _0x132175;
      }
    } else if (_0x651db1 === 2) {
      _0x284ed3 = _0x5b2c03[_0x337383 + 1];
      if ((_0x284ed3 & 192) === 128) {
        _0x27dd7a = (_0x132175 & 31) << 6 | _0x284ed3 & 63;
        if (_0x27dd7a <= 127) {
          _0x27dd7a = null;
        }
      }
    } else if (_0x651db1 === 3) {
      _0x284ed3 = _0x5b2c03[_0x337383 + 1];
      _0x218340 = _0x5b2c03[_0x337383 + 2];
      if ((_0x284ed3 & 192) === 128 && (_0x218340 & 192) === 128) {
        _0x27dd7a = (_0x132175 & 15) << 12 | (_0x284ed3 & 63) << 6 | _0x218340 & 63;
        if (_0x27dd7a <= 2047 || _0x27dd7a >= 55296 && _0x27dd7a <= 57343) {
          _0x27dd7a = null;
        }
      }
    } else if (_0x651db1 === 4) {
      _0x284ed3 = _0x5b2c03[_0x337383 + 1];
      _0x218340 = _0x5b2c03[_0x337383 + 2];
      _0x3c6b88 = _0x5b2c03[_0x337383 + 3];
      if ((_0x284ed3 & 192) === 128 && (_0x218340 & 192) === 128 && (_0x3c6b88 & 192) === 128) {
        _0x27dd7a = (_0x132175 & 15) << 18 | (_0x284ed3 & 63) << 12 | (_0x218340 & 63) << 6 | _0x3c6b88 & 63;
        if (_0x27dd7a <= 65535 || _0x27dd7a >= 1114112) {
          _0x27dd7a = null;
        }
      }
    }
    if (_0x27dd7a === null) {
      _0x27dd7a = 65533;
      _0x651db1 = 1;
    } else if (_0x27dd7a > 65535) {
      _0x27dd7a -= 65536;
      _0x186e5f += String.fromCharCode(_0x27dd7a >>> 10 & 1023 | 55296);
      _0x27dd7a = _0x27dd7a & 1023 | 56320;
    }
    _0x186e5f += String.fromCharCode(_0x27dd7a);
    _0x337383 += _0x651db1;
  }
  return _0x186e5f;
}
function writeUtf8(_0x4aa7ef, _0x31b10e, _0x5be101) {
  for (let _0x3e4ba4 = 0, _0x3b4bd3, _0x3d0bc9; _0x3e4ba4 < _0x31b10e.length; _0x3e4ba4++) {
    _0x3b4bd3 = _0x31b10e.charCodeAt(_0x3e4ba4);
    if (_0x3b4bd3 > 55295 && _0x3b4bd3 < 57344) {
      if (_0x3d0bc9) {
        if (_0x3b4bd3 < 56320) {
          _0x4aa7ef[_0x5be101++] = 239;
          _0x4aa7ef[_0x5be101++] = 191;
          _0x4aa7ef[_0x5be101++] = 189;
          _0x3d0bc9 = _0x3b4bd3;
          continue;
        } else {
          _0x3b4bd3 = _0x3d0bc9 - 55296 << 10 | _0x3b4bd3 - 56320 | 65536;
          _0x3d0bc9 = null;
        }
      } else {
        if (_0x3b4bd3 > 56319 || _0x3e4ba4 + 1 === _0x31b10e.length) {
          _0x4aa7ef[_0x5be101++] = 239;
          _0x4aa7ef[_0x5be101++] = 191;
          _0x4aa7ef[_0x5be101++] = 189;
        } else {
          _0x3d0bc9 = _0x3b4bd3;
        }
        continue;
      }
    } else if (_0x3d0bc9) {
      _0x4aa7ef[_0x5be101++] = 239;
      _0x4aa7ef[_0x5be101++] = 191;
      _0x4aa7ef[_0x5be101++] = 189;
      _0x3d0bc9 = null;
    }
    if (_0x3b4bd3 < 128) {
      _0x4aa7ef[_0x5be101++] = _0x3b4bd3;
    } else {
      if (_0x3b4bd3 < 2048) {
        _0x4aa7ef[_0x5be101++] = _0x3b4bd3 >> 6 | 192;
      } else {
        if (_0x3b4bd3 < 65536) {
          _0x4aa7ef[_0x5be101++] = _0x3b4bd3 >> 12 | 224;
        } else {
          _0x4aa7ef[_0x5be101++] = _0x3b4bd3 >> 18 | 240;
          _0x4aa7ef[_0x5be101++] = _0x3b4bd3 >> 12 & 63 | 128;
        }
        _0x4aa7ef[_0x5be101++] = _0x3b4bd3 >> 6 & 63 | 128;
      }
      _0x4aa7ef[_0x5be101++] = _0x3b4bd3 & 63 | 128;
    }
  }
  return _0x5be101;
}
export { PbfReader, PbfWriter };