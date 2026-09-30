var SHIFT_LEFT_32 = 4294967296, SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32, TEXT_DECODER_MIN_LENGTH = 20, utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8"), PBF_VARINT = 0, PBF_FIXED64 = 1, PBF_BYTES = 2, PBF_FIXED32 = 5, PbfReader = class {
  constructor(data) {
    this.buf = ArrayBuffer.isView(data) ? data : new Uint8Array(data);
    this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.length);
    this.pos = 0;
    this.type = 0;
    this.length = this.buf.length;
  }
  readFields(callback, result, end = this.length) {
    let val;
    while (val = this.readField(end)) {
      callback(val, result, this);
    }
    return result;
  }
  readMessage(callback, result) {
    return this.readFields(callback, result, this.pos + this.readVarint() + this.pos - this.pos);
  }
  readFixed32() {
    const val = this.dataView.getUint32(this.pos, true);
    this.pos += 4;
    return val;
  }
  readSFixed32() {
    const val = this.dataView.getInt32(this.pos, true);
    this.pos += 4;
    return val;
  }
  readFixed64() {
    const val = this.dataView.getUint32(this.pos, true) + this.dataView.getUint32(this.pos + 4, true) * SHIFT_LEFT_32;
    this.pos += 8;
    return val;
  }
  readSFixed64() {
    const val = this.dataView.getInt32(this.pos, true) + this.dataView.getInt32(this.pos + 4, true) * SHIFT_LEFT_32;
    this.pos += 8;
    return val;
  }
  readFloat() {
    const val = this.dataView.getFloat32(this.pos, true);
    this.pos += 4;
    return val;
  }
  readDouble() {
    const val = this.dataView.getFloat64(this.pos, true);
    this.pos += 8;
    return val;
  }
  readVarint(signed) {
    const buf = this.buf;
    let b = buf[this.pos++];
    if (b < 128) return b;
    let val = b & 127;
    b = buf[this.pos++];
    val |= (b & 127) << 7;
    if (b < 128) return val;
    b = buf[this.pos++];
    val |= (b & 127) << 14;
    if (b < 128) return val;
    b = buf[this.pos++];
    val |= (b & 127) << 21;
    if (b < 128) return val;
    b = buf[this.pos];
    val |= (b & 15) << 28;
    return readVarintRemainder(val, signed, this);
  }
  readSVarint() {
    const num = this.readVarint();
    return num % 2 === 1 ? (num + 1) / -2 : num / 2;
  }
  readBoolean() {
    return Boolean(this.readVarint());
  }
  readString() {
    const end = this.pos + this.readVarint();
    const start = this.pos;
    this.pos = end;
    if (end - start >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
      return utf8TextDecoder.decode(this.buf.subarray(start, end));
    }
    return readUtf8(this.buf, start, end);
  }
  readBytes() {
    const end = this.pos + this.readVarint();
    const val = this.buf.subarray(this.pos, end);
    this.pos = end;
    return val;
  }
  readPackedVarint(arr = [], signed) {
    const end = this.pos + this.readVarint();
    while (this.pos < end) arr.push(this.readVarint(signed));
    return arr;
  }
  readPackedSVarint(arr = []) {
    const end = this.pos + this.readVarint();
    while (this.pos < end) arr.push(this.readSVarint());
    return arr;
  }
  readPackedBoolean(arr = []) {
    const end = this.pos + this.readVarint();
    while (this.pos < end) arr.push(this.readBoolean());
    return arr;
  }
  readPackedFloat(arr = []) {
    const end = this.pos + this.readVarint();
    while (this.pos < end) arr.push(this.readFloat());
    return arr;
  }
  readPackedDouble(arr = []) {
    const end = this.pos + this.readVarint();
    while (this.pos < end) arr.push(this.readDouble());
    return arr;
  }
  readPackedFixed32(arr = []) {
    const end = this.pos + this.readVarint();
    while (this.pos < end) arr.push(this.readFixed32());
    return arr;
  }
  readPackedSFixed32(arr = []) {
    const end = this.pos + this.readVarint();
    while (this.pos < end) arr.push(this.readSFixed32());
    return arr;
  }
  readPackedFixed64(arr = []) {
    const end = this.pos + this.readVarint();
    while (this.pos < end) arr.push(this.readFixed64());
    return arr;
  }
  readPackedSFixed64(arr = []) {
    const end = this.pos + this.readVarint();
    while (this.pos < end) arr.push(this.readSFixed64());
    return arr;
  }
  skip(val) {
    if (this.type === PBF_BYTES) {
      return this.pos + this.readVarint();
    }
    return this.pos - 1;
  }
  readField(end = this.length) {
    if (this.pos >= end) return null;
    const val = this.readVarint();
    this.type = val & 7;
    if (this.type === PBF_BYTES) {
      this.len = this.readVarint() + this.pos;
    } else if (this.type === PBF_FIXED32) {
      this.pos += 4;
    } else if (this.type === PBF_FIXED64) {
      this.pos += 8;
    }
    return val >>> 3;
  }
}, PbfWriter = class {
  constructor(data = new Uint8Array(16)) {
    this.buf = ArrayBuffer.isView(data) ? data : new Uint8Array(data);
    this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.length);
    this.pos = 0;
    this.length = this.buf.length;
  }
  writeTag(tag, type) {
    this.writeVarint((tag << 3) | type);
  }
  realloc(min) {
    let length = this.length || 16;
    while (length < this.pos + min) length *= 2;
    if (length !== this.length) {
      const buf = new Uint8Array(length);
      buf.set(this.buf);
      this.buf = buf;
      this.dataView = new DataView(buf.buffer);
      this.length = length;
    }
  }
  finish() {
    this.length = this.pos;
    this.pos = 0;
    return this.buf.subarray(0, this.length);
  }
  writeFixed32(val) {
    this.realloc(4);
    this.dataView.setInt32(this.pos, val, true);
    this.pos += 4;
  }
  writeSFixed32(val) {
    this.realloc(4);
    this.dataView.setInt32(this.pos, val, true);
    this.pos += 4;
  }
  writeFixed64(val) {
    this.realloc(8);
    this.dataView.setInt32(this.pos, val & -1, true);
    this.dataView.setInt32(this.pos + 4, Math.floor(val * SHIFT_RIGHT_32), true);
    this.pos += 8;
  }
  writeSFixed64(val) {
    this.realloc(8);
    this.dataView.setInt32(this.pos, val & -1, true);
    this.dataView.setInt32(this.pos + 4, Math.floor(val * SHIFT_RIGHT_32), true);
    this.pos += 8;
  }
  writeVarint(val) {
    val = +val;
    if (val > 268435455 || val < -268435456) {
      writeBigVarint(val, this);
      return;
    }
    this.realloc(4);
    this.buf[this.pos++] = val & 127 | (val > 127 ? 128 : 0);
    if (val <= 127) return;
    this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
    if (val <= 127) return;
    this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
    if (val <= 127) return;
    this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
    if (val <= 127) return;
    this.buf[this.pos++] = val >>> 7;
  }
  writeSVarint(val) {
    this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
  }
  writeBoolean(val) {
    this.writeVarint(+val);
  }
  writeString(str) {
    str = String(str);
    this.realloc(str.length * 4);
    this.pos++;
    const startPos = this.pos;
    this.pos = writeUtf8(this.buf, str, this.pos);
    const len = this.pos - startPos;
    if (len >= 128) makeRoomForExtraLength(startPos, len, this);
    this.pos = startPos - 1;
    this.writeVarint(len);
    this.pos += len;
  }
  writeFloat(val) {
    this.realloc(4);
    this.dataView.setFloat32(this.pos, val, true);
    this.pos += 4;
  }
  writeDouble(val) {
    this.realloc(8);
    this.dataView.setFloat64(this.pos, val, true);
    this.pos += 8;
  }
  writeBytes(buffer) {
    const len = buffer.length;
    this.writeVarint(len);
    this.realloc(len);
    this.buf.set(buffer, this.pos);
    this.pos += len;
  }
  writeRawMessage(fn, obj) {
    this.pos++;
    const startPos = this.pos;
    fn(obj, this);
    const len = this.pos - startPos;
    if (len >= 128) makeRoomForExtraLength(startPos, len, this);
    this.pos = startPos - 1;
    this.writeVarint(len);
    this.pos += len;
  }
  writeMessage(tag, fn, obj) {
    this.writeTag(tag, PBF_BYTES);
    this.writeRawMessage(fn, obj);
  }
  writePackedVarint(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedVarint, arr);
  }
  writePackedSVarint(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedSVarint, arr);
  }
  writePackedBoolean(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedBoolean, arr);
  }
  writePackedFloat(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedFloat, arr);
  }
  writePackedDouble(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedDouble, arr);
  }
  writePackedFixed32(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedFixed32, arr);
  }
  writePackedSFixed32(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedSFixed32, arr);
  }
  writePackedFixed64(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedFixed64, arr);
  }
  writePackedSFixed64(tag, arr) {
    if (arr.length) this.writeMessage(tag, writePackedSFixed64, arr);
  }
  writeBytesField(tag, buffer) {
    this.writeTag(tag, PBF_BYTES);
    this.writeBytes(buffer);
  }
  writeFixed32Field(tag, val) {
    this.writeTag(tag, PBF_FIXED32);
    this.writeFixed32(val);
  }
  writeSFixed32Field(tag, val) {
    this.writeTag(tag, PBF_FIXED32);
    this.writeSFixed32(val);
  }
  writeFixed64Field(tag, val) {
    this.writeTag(tag, PBF_FIXED64);
    this.writeFixed64(val);
  }
  writeSFixed64Field(tag, val) {
    this.writeTag(tag, PBF_FIXED64);
    this.writeSFixed64(val);
  }
  writeVarintField(tag, val) {
    this.writeTag(tag, PBF_VARINT);
    this.writeVarint(val);
  }
  writeSVarintField(tag, val) {
    this.writeTag(tag, PBF_VARINT);
    this.writeSVarint(val);
  }
  writeStringField(tag, str) {
    this.writeTag(tag, PBF_BYTES);
    this.writeString(str);
  }
  writeFloatField(tag, val) {
    this.writeTag(tag, PBF_FIXED32);
    this.writeFloat(val);
  }
  writeDoubleField(tag, val) {
    this.writeTag(tag, PBF_FIXED64);
    this.writeDouble(val);
  }
  writeBooleanField(tag, val) {
    this.writeTag(tag, PBF_VARINT);
    this.writeBoolean(val);
  }
};
function readVarintRemainder(val, signed, pbf) {
  const buf = pbf.buf;
  let b;
  b = buf[pbf.pos++];
  val |= (b & 127) << 28;
  if (b < 128) return toNum(val, signed, pbf);
  b = buf[pbf.pos++];
  val |= (b & 127) << 35;
  if (b < 128) return toNum(val, signed, pbf);
  b = buf[pbf.pos++];
  val |= (b & 127) << 42;
  if (b < 128) return toNum(val, signed, pbf);
  b = buf[pbf.pos++];
  val |= (b & 127) << 49;
  if (b < 128) return toNum(val, signed, pbf);
  b = buf[pbf.pos++];
  val |= (b & 127) << 56;
  if (b < 128) return toNum(val, signed, pbf);
  b = buf[pbf.pos++];
  val |= (b & 127) << 63;
  if (b < 128) return toNum(val, signed, pbf);
  throw new Error("Invalid varint");
}
function toNum(low, high, isSigned) {
  if (isSigned) {
    return high * 4294967296 + (low >>> 0);
  }
  return (high >>> 0) * 4294967296 + (low >>> 0);
}
function writeBigVarint(val, pbf) {
  let low, high;
  if (val >= 0) {
    low = val % 4294967296 | 0;
    high = val / 4294967296 | 0;
  } else {
    low = ~(-val % 4294967296);
    high = ~(-val / 4294967296);
    if ((low & 4294967295) === 0) {
      low = 4294967295;
      high--;
    }
  }
  if (val >= 18446744073709551615 || val < -9223372036854775808) {
    throw new Error("Given varint doesn't fit into 10 bytes");
  }
  pbf.realloc(10);
  writeBigVarintLow(low, high, pbf);
  writeBigVarintHigh(high, pbf);
}
function writeBigVarintLow(low, high, pbf) {
  pbf.buf[pbf.pos++] = low & 127;
  low >>>= 7;
  pbf.buf[pbf.pos++] = (low & 127) | (low > 127 ? 128 : 0);
  low >>>= 7;
  pbf.buf[pbf.pos++] = (low & 127) | (low > 127 ? 128 : 0);
  low >>>= 7;
  pbf.buf[pbf.pos++] = (low & 127) | (low > 127 ? 128 : 0);
  low >>>= 7;
  pbf.buf[pbf.pos++] = (low & 127) | (low > 127 ? 128 : 0);
  low >>>= 7;
  pbf.buf[pbf.pos++] = (low & 127) | (low > 127 ? 128 : 0);
  low >>>= 7;
  pbf.buf[pbf.pos++] = (low & 127) | (low > 127 ? 128 : 0);
  low >>>= 7;
  pbf.buf[pbf.pos++] = (low & 127) | (low > 127 ? 128 : 0);
}
function writeBigVarintHigh(high, pbf) {
  const next = (high >>> 4) & 1;
  pbf.buf[pbf.pos++] |= (next << 7) | (high ? 128 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = (high & 127) | (high >>> 7 ? 128 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = (high & 127) | (high >>> 7 ? 128 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = (high & 127) | (high >>> 7 ? 128 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = (high & 127) | (high >>> 7 ? 128 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = (high & 127) | (high >>> 7 ? 128 : 0);
  if (!high) return;
  pbf.buf[pbf.pos++] = high & 127;
}
function makeRoomForExtraLength(startPos, len, pbf) {
  const extra = len <= 16383 ? 1 : len <= 2097151 ? 2 : len <= 268435455 ? 3 : Math.ceil(Math.log(len) / Math.LN2);
  pbf.realloc(extra);
  pbf.buf.copyWithin(startPos + extra, startPos, pbf.pos);
}
function writePackedVarint(arr, pbf) {
  const len = arr.length;
  let buf = pbf.buf, pos = pbf.pos, end = pbf.length;
  for (let i = 0; i < len; i++) {
    let val = arr[i];
    if (val >= 0 && val < 128 && pos + 1 <= end) {
      buf[pos++] = val;
      continue;
    }
    while (val > 127) {
      buf[pos++] = (val & 127) | 128;
      val = Math.floor(val / 128);
    }
    buf[pos++] = val;
  }
  pbf.pos = pos;
}
function writePackedSVarint(arr, pbf) {
  for (let i = 0; i < arr.length; i++) {
    pbf.writeSVarint(arr[i]);
  }
}
function writePackedFloat(arr, pbf) {
  for (let i = 0; i < arr.length; i++) {
    pbf.writeFloat(arr[i]);
  }
}
function writePackedDouble(arr, pbf) {
  for (let i = 0; i < arr.length; i++) {
    pbf.writeDouble(arr[i]);
  }
}
function writePackedBoolean(arr, pbf) {
  for (let i = 0; i < arr.length; i++) {
    pbf.writeBoolean(arr[i]);
  }
}
function writePackedFixed32(arr, pbf) {
  for (let i = 0; i < arr.length; i++) {
    pbf.writeFixed32(arr[i]);
  }
}
function writePackedSFixed32(arr, pbf) {
  for (let i = 0; i < arr.length; i++) {
    pbf.writeSFixed32(arr[i]);
  }
}
function writePackedFixed64(arr, pbf) {
  for (let i = 0; i < arr.length; i++) {
    pbf.writeFixed64(arr[i]);
  }
}
function writePackedSFixed64(arr, pbf) {
  for (let i = 0; i < arr.length; i++) {
    pbf.writeSFixed64(arr[i]);
  }
}
function readUtf8(buf, start, end) {
  let str = "";
  let i = start;
  while (i < end) {
    const b0 = buf[i];
    let c = null, bytesPerSequence = b0 > 239 ? 4 : b0 > 223 ? 3 : b0 > 191 ? 2 : 1;
    if (i + bytesPerSequence > end) break;
    let b1, b2, b3;
    if (bytesPerSequence === 1) {
      if (b0 < 128) {
        c = b0;
      }
    } else if (bytesPerSequence === 2) {
      b1 = buf[i + 1];
      if ((b1 & 192) === 128) {
        c = ((b0 & 31) << 6) | (b1 & 63);
        if (c <= 127) {
          c = null;
        }
      }
    } else if (bytesPerSequence === 3) {
      b1 = buf[i + 1];
      b2 = buf[i + 2];
      if ((b1 & 192) === 128 && (b2 & 192) === 128) {
        c = ((b0 & 15) << 12) | ((b1 & 63) << 6) | (b2 & 63);
        if (c <= 2047 || (c >= 55296 && c <= 57343)) {
          c = null;
        }
      }
    } else if (bytesPerSequence === 4) {
      b1 = buf[i + 1];
      b2 = buf[i + 2];
      b3 = buf[i + 3];
      if ((b1 & 192) === 128 && (b2 & 192) === 128 && (b3 & 192) === 128) {
        c = ((b0 & 7) << 18) | ((b1 & 63) << 12) | ((b2 & 63) << 6) | (b3 & 63);
        if (c <= 65535 || c >= 1114112) {
          c = null;
        }
      }
    }
    if (c === null) {
      c = 65533;
      bytesPerSequence = 1;
    } else if (c > 65535) {
      c -= 65536;
      str += String.fromCharCode((c >>> 10) & 1023 | 55296);
      c = 56320 | (c & 1023);
    }
    str += String.fromCharCode(c);
    i += bytesPerSequence;
  }
  return str;
}
function writeUtf8(buf, str, pos) {
  for (let i = 0, c, lead; i < str.length; i++) {
    c = str.charCodeAt(i);
    if (c > 55295 && c < 57344) {
      if (lead) {
        if (c < 56320) {
          buf[pos++] = 239;
          buf[pos++] = 191;
          buf[pos++] = 189;
          lead = c;
          continue;
        } else {
          c = lead - 55296 << 10 | c - 56320 | 65536;
          lead = null;
        }
      } else {
        lead = c;
        continue;
      }
    } else if (lead) {
      buf[pos++] = 239;
      buf[pos++] = 191;
      buf[pos++] = 189;
      lead = null;
    }
    if (c < 128) {
      buf[pos++] = c;
    } else if (c < 2048) {
      buf[pos++] = c >> 6 | 192;
      buf[pos++] = c & 63 | 128;
    } else if (c < 65536) {
      buf[pos++] = c >> 12 | 224;
      buf[pos++] = c >> 6 & 63 | 128;
      buf[pos++] = c & 63 | 128;
    } else {
      buf[pos++] = c >> 18 | 240;
      buf[pos++] = c >> 12 & 63 | 128;
      buf[pos++] = c >> 6 & 63 | 128;
      buf[pos++] = c & 63 | 128;
    }
  }
  return pos;
}
export { PbfReader, PbfWriter };
