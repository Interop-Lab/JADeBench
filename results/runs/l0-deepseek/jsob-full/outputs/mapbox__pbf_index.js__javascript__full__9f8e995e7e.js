const SHIFT_LEFT_32 = 0x100000000;
const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
const TEXT_DECODER_MIN_LENGTH = 12;
const utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8');
const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;

class PbfReader {
  constructor(buffer) {
    this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
    this.view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    this.pos = 0;
    this.end = this.buf.length;
    this.tag = -1;
  }

  readFields(callback, end = this.end) {
    let tag;
    while ((tag = this.readTag(end))) {
      callback(tag, end, this);
    }
    return end;
  }

  readMessage(callback, end) {
    return this.readFields(callback, end + this.readVarint());
  }

  readFixed32() {
    const value = this.view.getUint32(this.pos, true);
    this.pos += 4;
    return value;
  }

  readSFixed32() {
    const value = this.view.getInt32(this.pos, true);
    this.pos += 4;
    return value;
  }

  readFixed64() {
    const value = this.view.getUint32(this.pos, true) + this.view.getUint32(this.pos + 4, true) * SHIFT_LEFT_32;
    this.pos += 8;
    return value;
  }

  readSFixed64() {
    const value = this.view.getInt32(this.pos, true) + this.view.getInt32(this.pos + 4, true) * SHIFT_LEFT_32;
    this.pos += 8;
    return value;
  }

  readFloat() {
    const value = this.view.getFloat32(this.pos, true);
    this.pos += 4;
    return value;
  }

  readDouble() {
    const value = this.view.getFloat64(this.pos, true);
    this.pos += 8;
    return value;
  }

  readVarint(signed) {
    const buf = this.buf;
    let byte = buf[this.pos++];
    let value = byte & 0x7f;
    if (byte < 0x80) return value;
    byte = buf[this.pos++];
    value |= (byte & 0x7f) << 7;
    if (byte < 0x80) return value;
    byte = buf[this.pos++];
    value |= (byte & 0x7f) << 14;
    if (byte < 0x80) return value;
    byte = buf[this.pos++];
    value |= (byte & 0x7f) << 21;
    if (byte < 0x80) return value;
    byte = buf[this.pos++];
    value |= (byte & 0x7f) << 28;
    if (byte < 0x80) return value;
    byte = buf[this.pos++];
    value |= (byte & 0x7f) << 35;
    if (byte < 0x80) return value;
    byte = buf[this.pos++];
    value |= (byte & 0x7f) << 42;
    if (byte < 0x80) return value;
    byte = buf[this.pos++];
    value |= (byte & 0x7f) << 49;
    if (byte < 0x80) return value;
    byte = buf[this.pos++];
    value |= (byte & 0x7f) << 56;
    if (byte < 0x80) return value;
    byte = buf[this.pos++];
    value |= (byte & 0x7f) << 63;
    if (byte < 0x80) return value;
    throw new Error('Invalid varint');
  }

  readSVarint() {
    const value = this.readVarint();
    return value % 2 === 0 ? value / 2 : -(value + 1) / 2;
  }

  readBoolean() {
    return Boolean(this.readVarint());
  }

  readString() {
    const end = this.readVarint() + this.pos;
    const start = this.pos;
    this.pos = end;
    if (end - start >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
      return utf8TextDecoder.decode(this.buf.subarray(start, end));
    }
    return readUtf8(this.buf, start, end);
  }

  readBytes() {
    const end = this.readVarint() + this.pos;
    const value = this.buf.subarray(this.pos, end);
    this.pos = end;
    return value;
  }

  readPackedVarint(arr = [], tag) {
    const end = this.readVarint() + this.pos;
    while (this.pos < end) arr.push(this.readVarint(tag));
    return arr;
  }

  readPackedSVarint(arr = []) {
    const end = this.readVarint() + this.pos;
    while (this.pos < end) arr.push(this.readSVarint());
    return arr;
  }

  readPackedBoolean(arr = []) {
    const end = this.readVarint() + this.pos;
    while (this.pos < end) arr.push(this.readBoolean());
    return arr;
  }

  readPackedFloat(arr = []) {
    const end = this.readVarint() + this.pos;
    while (this.pos < end) arr.push(this.readFloat());
    return arr;
  }

  readPackedDouble(arr = []) {
    const end = this.readVarint() + this.pos;
    while (this.pos < end) arr.push(this.readDouble());
    return arr;
  }

  readPackedFixed32(arr = []) {
    const end = this.readVarint() + this.pos;
    while (this.pos < end) arr.push(this.readFixed32());
    return arr;
  }

  readPackedSFixed32(arr = []) {
    const end = this.readVarint() + this.pos;
    while (this.pos < end) arr.push(this.readSFixed32());
    return arr;
  }

  readPackedFixed64(arr = []) {
    const end = this.readVarint() + this.pos;
    while (this.pos < end) arr.push(this.readFixed64());
    return arr;
  }

  readPackedSFixed64(arr = []) {
    const end = this.readVarint() + this.pos;
    while (this.pos < end) arr.push(this.readSFixed64());
    return arr;
  }

  skip() {
    const tag = this.readTag();
    if (tag === PBF_BYTES) {
      return this.readVarint() + this.pos;
    }
    return this.skipValue(tag);
  }

  readTag(end = this.end) {
    if (this.pos >= end) return 0;
    const tag = this.readVarint();
    this.tag = tag;
    return tag;
  }

  skipValue(tag) {
    const wireType = tag & 7;
    if (wireType === PBF_VARINT) {
      while (this.buf[this.pos++] > 0x7f) {}
    } else if (wireType === PBF_BYTES) {
      this.pos = this.readVarint() + this.pos;
    } else if (wireType === PBF_FIXED32) {
      this.pos += 4;
    } else if (wireType === PBF_FIXED64) {
      this.pos += 8;
    } else {
      throw new Error('Unsupported wire type ' + wireType);
    }
  }
}

class PbfWriter {
  constructor(buffer = new Uint8Array(16)) {
    this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
    this.view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    this.pos = 0;
    this.length = this.buf.length;
  }

  writeTag(tag, wireType) {
    this.writeVarint((tag << 3) | wireType);
  }

  realloc(min) {
    let length = this.length || 16;
    while (length < this.pos + min) length *= 2;
    if (length !== this.length) {
      const buf = new Uint8Array(length);
      buf.set(this.buf);
      this.buf = buf;
      this.view = new DataView(buf.buffer);
      this.length = length;
    }
  }

  finish() {
    this.length = this.pos;
    this.pos = 0;
    return this.buf.subarray(0, this.length);
  }

  writeFixed32Field(tag, value) {
    this.writeTag(tag, PBF_FIXED32);
    this.view.setUint32(this.pos, value, true);
    this.pos += 4;
  }

  writeSFixed32Field(tag, value) {
    this.writeTag(tag, PBF_FIXED32);
    this.view.setInt32(this.pos, value, true);
    this.pos += 4;
  }

  writeFixed64Field(tag, value) {
    this.writeTag(tag, PBF_FIXED64);
    this.view.setUint32(this.pos, value & 0xffffffff, true);
    this.view.setUint32(this.pos + 4, Math.floor(value * SHIFT_RIGHT_32), true);
    this.pos += 8;
  }

  writeSFixed64Field(tag, value) {
    this.writeTag(tag, PBF_FIXED64);
    this.view.setInt32(this.pos, value & 0xffffffff, true);
    this.view.setInt32(this.pos + 4, Math.floor(value * SHIFT_RIGHT_32), true);
    this.pos += 8;
  }

  writeVarintField(tag, value) {
    this.writeTag(tag, PBF_VARINT);
    this.writeVarint(value);
  }

  writeSVarintField(tag, value) {
    this.writeTag(tag, PBF_VARINT);
    this.writeSVarint(value);
  }

  writeBytesField(tag, buffer) {
    this.writeTag(tag, PBF_BYTES);
    this.writeVarint(buffer.length);
    this.buf.set(buffer, this.pos);
    this.pos += buffer.length;
  }

  writeStringField(tag, str) {
    str = String(str);
    this.writeVarint(str.length);
    this.pos++;
    const start = this.pos;
    this.pos = writeUtf8(this.buf, str, this.pos);
    const length = this.pos - start;
    if (length >= 0x80) makeRoomForExtraLength(start, length, this);
    this.pos = start - 1;
    this.writeVarint(length);
    this.pos += length;
  }

  writeFloatField(tag, value) {
    this.writeTag(tag, PBF_FIXED32);
    this.view.setFloat32(this.pos, value, true);
    this.pos += 4;
  }

  writeDoubleField(tag, value) {
    this.writeTag(tag, PBF_FIXED64);
    this.view.setFloat64(this.pos, value, true);
    this.pos += 8;
  }

  writeBooleanField(tag, value) {
    this.writeVarintField(tag, value);
  }

  writePackedVarint(tag, arr) {
    const length = arr.length;
    let pos = this.pos;
    let start = this.pos;
    let end = this.pos;
    for (let i = 0; i < length; i++) {
      let value = arr[i];
      if (value < 0 || pos + 10 > end) {
        this.pos = start;
        this.writeVarintField(tag, value);
        pos = this.pos;
        start = this.pos;
        end = this.pos;
        continue;
      }
      while (value > 0x7f) {
        this.buf[pos++] = (value & 0x7f) | 0x80;
        value = Math.floor(value / 0x80);
      }
      this.buf[pos++] = value;
    }
    this.pos = pos;
  }

  writePackedSVarint(tag, arr) {
    for (let i = 0; i < arr.length; i++) this.writeSVarint(arr[i]);
  }

  writePackedFloat(tag, arr) {
    for (let i = 0; i < arr.length; i++) this.writeFloat(arr[i]);
  }

  writePackedDouble(tag, arr) {
    for (let i = 0; i < arr.length; i++) this.writeDouble(arr[i]);
  }

  writePackedBoolean(tag, arr) {
    for (let i = 0; i < arr.length; i++) this.writeBoolean(arr[i]);
  }

  writePackedFixed32(tag, arr) {
    for (let i = 0; i < arr.length; i++) this.writeFixed32(arr[i]);
  }

  writePackedSFixed32(tag, arr) {
    for (let i = 0; i < arr.length; i++) this.writeSFixed32(arr[i]);
  }

  writePackedFixed64(tag, arr) {
    for (let i = 0; i < arr.length; i++) this.writeFixed64(arr[i]);
  }

  writePackedSFixed64(tag, arr) {
    for (let i = 0; i < arr.length; i++) this.writeSFixed64(arr[i]);
  }

  writeVarint(value) {
    value = +value || 0;
    if (value >= 0 && value <= 0x7f) {
      this.buf[this.pos++] = value;
      return;
    }
    if (value >= 0x100000000 || value < -0x100000000) {
      writeBigVarint(value, this);
      return;
    }
    this.buf[this.pos++] = (value & 0x7f) | 0x80;
    value >>>= 7;
    if (value <= 0x7f) {
      this.buf[this.pos++] = value;
      return;
    }
    this.buf[this.pos++] = (value & 0x7f) | 0x80;
    value >>>= 7;
    if (value <= 0x7f) {
      this.buf[this.pos++] = value;
      return;
    }
    this.buf[this.pos++] = (value & 0x7f) | 0x80;
    value >>>= 7;
    if (value <= 0x7f) {
      this.buf[this.pos++] = value;
      return;
    }
    this.buf[this.pos++] = (value & 0x7f) | 0x80;
    value >>>= 7;
    if (value <= 0x7f) {
      this.buf[this.pos++] = value;
      return;
    }
    this.buf[this.pos++] = (value & 0x7f) | 0x80;
    value >>>= 7;
    this.buf[this.pos++] = value;
  }

  writeSVarint(value) {
    this.writeVarint(value < 0 ? -value * 2 - 1 : value * 2);
  }

  writeBoolean(value) {
    this.writeVarint(Boolean(value));
  }

  writeFloat(value) {
    this.view.setFloat32(this.pos, value, true);
    this.pos += 4;
  }

  writeDouble(value) {
    this.view.setFloat64(this.pos, value, true);
    this.pos += 8;
  }

  writeFixed32(value) {
    this.view.setUint32(this.pos, value, true);
    this.pos += 4;
  }

  writeSFixed32(value) {
    this.view.setInt32(this.pos, value, true);
    this.pos += 4;
  }

  writeFixed64(value) {
    this.view.setUint32(this.pos, value & 0xffffffff, true);
    this.view.setUint32(this.pos + 4, Math.floor(value * SHIFT_RIGHT_32), true);
    this.pos += 8;
  }

  writeSFixed64(value) {
    this.view.setInt32(this.pos, value & 0xffffffff, true);
    this.view.setInt32(this.pos + 4, Math.floor(value * SHIFT_RIGHT_32), true);
    this.pos += 8;
  }

  writeBytes(buffer) {
    this.writeVarint(buffer.length);
    this.buf.set(buffer, this.pos);
    this.pos += buffer.length;
  }

  writeString(str) {
    str = String(str);
    this.writeVarint(str.length);
    this.pos++;
    const start = this.pos;
    this.pos = writeUtf8(this.buf, str, this.pos);
    const length = this.pos - start;
    if (length >= 0x80) makeRoomForExtraLength(start, length, this);
    this.pos = start - 1;
    this.writeVarint(length);
    this.pos += length;
  }

  writeMessage(tag, fn) {
    this.pos++;
    const start = this.pos;
    fn(tag, this);
    const length = this.pos - start;
    if (length >= 0x80) makeRoomForExtraLength(start, length, this);
    this.pos = start - 1;
    this.writeVarint(length);
    this.pos += length;
  }

  writePackedVarintField(tag, arr) {
    this.writeTag(tag, PBF_BYTES);
    this.writePackedVarint(arr);
  }

  writePackedSVarintField(tag, arr) {
    this.writeTag(tag, PBF_BYTES);
    this.writePackedSVarint(arr);
  }

  writePackedBooleanField(tag, arr) {
    this.writeTag(tag, PBF_BYTES);
    this.writePackedBoolean(arr);
  }

  writePackedFloatField(tag, arr) {
    this.writeTag(tag, PBF_BYTES);
    this.writePackedFloat(arr);
  }

  writePackedDoubleField(tag, arr) {
    this.writeTag(tag, PBF_BYTES);
    this.writePackedDouble(arr);
  }

  writePackedFixed32Field(tag, arr) {
    this.writeTag(tag, PBF_BYTES);
    this.writePackedFixed32(arr);
  }

  writePackedSFixed32Field(tag, arr) {
    this.writeTag(tag, PBF_BYTES);
    this.writePackedSFixed32(arr);
  }

  writePackedFixed64Field(tag, arr) {
    this.writeTag(tag, PBF_BYTES);
    this.writePackedFixed64(arr);
  }

  writePackedSFixed64Field(tag, arr) {
    this.writeTag(tag, PBF_BYTES);
    this.writePackedSFixed64(arr);
  }
}

function readVarintRemainder(value, signed, reader) {
  const buf = reader.buf;
  let byte;
  let result;
  byte = buf[reader.pos++];
  result = (byte & 0x7f) << 7;
  if (byte < 0x80) return toNum(value, result, signed);
  byte = buf[reader.pos++];
  result |= (byte & 0x7f) << 14;
  if (byte < 0x80) return toNum(value, result, signed);
  byte = buf[reader.pos++];
  result |= (byte & 0x7f) << 21;
  if (byte < 0x80) return toNum(value, result, signed);
  byte = buf[reader.pos++];
  result |= (byte & 0x7f) << 28;
  if (byte < 0x80) return toNum(value, result, signed);
  byte = buf[reader.pos++];
  result |= (byte & 0x7f) << 35;
  if (byte < 0x80) return toNum(value, result, signed);
  byte = buf[reader.pos++];
  result |= (byte & 0x7f) << 42;
  if (byte < 0x80) return toNum(value, result, signed);
  byte = buf[reader.pos++];
  result |= (byte & 0x7f) << 49;
  if (byte < 0x80) return toNum(value, result, signed);
  byte = buf[reader.pos++];
  result |= (byte & 0x7f) << 56;
  if (byte < 0x80) return toNum(value, result, signed);
  byte = buf[reader.pos++];
  result |= (byte & 0x7f) << 63;
  if (byte < 0x80) return toNum(value, result, signed);
  throw new Error('Invalid varint');
}

function toNum(low, high, signed) {
  return signed ? high * SHIFT_LEFT_32 + low : high * SHIFT_LEFT_32 + low;
}

function writeBigVarint(value, writer) {
  let low;
  let high;
  if (value >= 0) {
    low = value % SHIFT_LEFT_32;
    high = Math.floor(value / SHIFT_LEFT_32);
  } else {
    low = ~(-value % SHIFT_LEFT_32);
    high = ~Math.floor(-value / SHIFT_LEFT_32);
    if (low > 0xffffffff) {
      low = (low + 1) & 0xffffffff;
    } else {
      low = 0;
      high = (high + 1) & 0xffffffff;
    }
  }
  if (value >= 0x10000000000000000 || value < -0x10000000000000000) {
    throw new Error('Value out of range');
  }
  writer.writeVarint(0);
  writeBigVarintLow(low, high, writer);
  writeBigVarintHigh(high, writer);
}

function writeBigVarintLow(low, high, writer) {
  writer.buf[writer.pos++] = low & 0x7f;
  low >>>= 7;
  writer.buf[writer.pos++] = low & 0x7f;
  low >>>= 7;
  writer.buf[writer.pos++] = low & 0x7f;
  low >>>= 7;
  writer.buf[writer.pos++] = low & 0x7f;
  low >>>= 7;
  writer.buf[writer.pos++] = low & 0x7f;
  low >>>= 7;
  writer.buf[writer.pos++] = low & 0x7f;
  low >>>= 7;
  writer.buf[writer.pos++] = low & 0x7f;
  low >>>= 7;
  writer.buf[writer.pos++] = low & 0x7f;
  low >>>= 7;
  writer.buf[writer.pos++] = low & 0x7f;
  low >>>= 7;
  writer.buf[writer.pos++] = low & 0x7f;
}

function writeBigVarintHigh(high, writer) {
  const value = (high << 1) | (high >>> 31);
  writer.buf[writer.pos++] |= value & 0x7f;
  if (!high) return;
  writer.buf[writer.pos++] = (high & 0x7f) | (high >>>= 7 ? 0x80 : 0);
  if (!high) return;
  writer.buf[writer.pos++] = (high & 0x7f) | (high >>>= 7 ? 0x80 : 0);
  if (!high) return;
  writer.buf[writer.pos++] = (high & 0x7f) | (high >>>= 7 ? 0x80 : 0);
  if (!high) return;
  writer.buf[writer.pos++] = (high & 0x7f) | (high >>>= 7 ? 0x80 : 0);
  if (!high) return;
  writer.buf[writer.pos++] = high & 0x7f;
}

function makeRoomForExtraLength(start, length, writer) {
  const extra = length <= 0x7f ? 1 : length <= 0x3fff ? 2 : length <= 0x1fffff ? 3 : Math.floor(Math.log(length) / Math.LN10);
  writer.realloc(extra);
  writer.buf.copyWithin(start + extra, start, writer.pos);
}

function writePackedVarint(arr, writer) {
  const length = arr.length;
  let pos = writer.pos;
  let start = writer.pos;
  let end = writer.pos;
  for (let i = 0; i < length; i++) {
    let value = arr[i];
    if (value < 0 || pos + 10 > end) {
      writer.pos = start;
      writer.writeVarint(value);
      pos = writer.pos;
      start = writer.pos;
      end = writer.pos;
      continue;
    }
    while (value > 0x7f) {
      writer.buf[pos++] = (value & 0x7f) | 0x80;
      value = Math.floor(value / 0x80);
    }
    writer.buf[pos++] = value;
  }
  writer.pos = pos;
}

function writePackedSVarint(arr, writer) {
  for (let i = 0; i < arr.length; i++) writer.writeSVarint(arr[i]);
}

function writePackedFloat(arr, writer) {
  for (let i = 0; i < arr.length; i++) writer.writeFloat(arr[i]);
}

function writePackedDouble(arr, writer) {
  for (let i = 0; i < arr.length; i++) writer.writeDouble(arr[i]);
}

function writePackedBoolean(arr, writer) {
  for (let i = 0; i < arr.length; i++) writer.writeBoolean(arr[i]);
}

function writePackedFixed32(arr, writer) {
  for (let i = 0; i < arr.length; i++) writer.writeFixed32(arr[i]);
}

function writePackedSFixed32(arr, writer) {
  for (let i = 0; i < arr.length; i++) writer.writeSFixed32(arr[i]);
}

function writePackedFixed64(arr, writer) {
  for (let i = 0; i < arr.length; i++) writer.writeFixed64(arr[i]);
}

function writePackedSFixed64(arr, writer) {
  for (let i = 0; i < arr.length; i++) writer.writeSFixed64(arr[i]);
}

function readUtf8(buf, start, end) {
  let str = '';
  let pos = start;
  while (pos < end) {
    const byte = buf[pos];
    let code = null;
    let length = byte < 0x80 ? 1 : byte < 0xc0 ? 2 : byte < 0xe0 ? 3 : 4;
    if (pos + length > end) break;
    let b1, b2, b3;
    if (length === 1) {
      code = byte;
    } else if (length === 2) {
      b1 = buf[pos + 1];
      if ((b1 & 0xc0) === 0x80) {
        code = ((byte & 0x1f) << 6) | (b1 & 0x3f);
        if (code < 0x80) code = null;
      }
    } else if (length === 3) {
      b1 = buf[pos + 1];
      b2 = buf[pos + 2];
      if ((b1 & 0xc0) === 0x80 && (b2 & 0xc0) === 0x80) {
        code = ((byte & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f);
        if (code < 0x800 || (code >= 0xd800 && code <= 0xdfff)) code = null;
      }
    } else if (length === 4) {
      b1 = buf[pos + 1];
      b2 = buf[pos + 2];
      b3 = buf[pos + 3];
      if ((b1 & 0xc0) === 0x80 && (b2 & 0xc0) === 0x80 && (b3 & 0xc0) === 0x80) {
        code = ((byte & 0x07) << 18) | ((b1 & 0x3f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
        if (code < 0x10000 || code > 0x10ffff) code = null;
      }
    }
    if (code === null) {
      code = 0xfffd;
      length = 1;
    } else if (code > 0xffff) {
      code -= 0x10000;
      str += String.fromCharCode((code >> 10) + 0xd800, (code & 0x3ff) + 0xdc00);
      pos += length;
      continue;
    }
    str += String.fromCharCode(code);
    pos += length;
  }
  return str;
}

function writeUtf8(buf, str, pos) {
  for (let i = 0, code, lead; i < str.length; i++) {
    code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      if (lead) {
        if (code < 0xdc00) {
          buf[pos++] = 0xef;
          buf[pos++] = 0xbf;
          buf[pos++] = 0xbd;
          lead = code;
          continue;
        }
        code = ((lead - 0xd800) << 10) + (code - 0xdc00) + 0x10000;
        lead = null;
      } else {
        if (code > 0xdbff || i + 1 === str.length) {
          buf[pos++] = 0xef;
          buf[pos++] = 0xbf;
          buf[pos++] = 0xbd;
        } else {
          lead = code;
        }
        continue;
      }
    } else if (lead) {
      buf[pos++] = 0xef;
      buf[pos++] = 0xbf;
      buf[pos++] = 0xbd;
      lead = null;
    }
    if (code < 0x80) {
      buf[pos++] = code;
    } else if (code < 0x800) {
      buf[pos++] = (code >> 6) | 0xc0;
      buf[pos++] = (code & 0x3f) | 0x80;
    } else if (code < 0x10000) {
      buf[pos++] = (code >> 12) | 0xe0;
      buf[pos++] = ((code >> 6) & 0x3f) | 0x80;
      buf[pos++] = (code & 0x3f) | 0x80;
    } else {
      buf[pos++] = (code >> 18) | 0xf0;
      buf[pos++] = ((code >> 12) & 0x3f) | 0x80;
      buf[pos++] = ((code >> 6) & 0x3f) | 0x80;
      buf[pos++] = (code & 0x3f) | 0x80;
    }
  }
  return pos;
}

export { PbfReader, PbfWriter };
