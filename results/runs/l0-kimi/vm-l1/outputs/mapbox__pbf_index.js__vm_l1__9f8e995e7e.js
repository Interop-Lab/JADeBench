const SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
const TEXT_DECODER_MIN_LENGTH = 12;
const utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");
const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;

class PbfReader {
  constructor(buf) {
    this.buf = buf;
    this.pos = 0;
    this.length = buf.length;
  }

  readVarint() {
    const buf = this.buf;
    let b = buf[this.pos++];
    let val = b & 0x7f;
    if (b < 0x80) return val;
    b = buf[this.pos++];
    val |= (b & 0x7f) << 7;
    if (b < 0x80) return val;
    b = buf[this.pos++];
    val |= (b & 0x7f) << 14;
    if (b < 0x80) return val;
    b = buf[this.pos++];
    val |= (b & 0x7f) << 21;
    if (b < 0x80) return val;
    b = buf[this.pos++];
    val = (val | (b & 0x0f) << 28) * 0x100000000 + SHIFT_LEFT_32;
    if (b < 0x80) return val;
    return readVarintRemainder(val, this);
  }

  readSVarint() {
    const num = this.readVarint();
    return num % 2 === 1 ? (num + 1) / -2 : num / 2;
  }

  readBoolean() {
    return this.readVarint() === 1;
  }

  readFloat() {
    const val = new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 4).getFloat32(0, true);
    this.pos += 4;
    return val;
  }

  readDouble() {
    const val = new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 8).getFloat64(0, true);
    this.pos += 8;
    return val;
  }

  readFixed32() {
    const val = new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 4).getUint32(0, true);
    this.pos += 4;
    return val;
  }

  readSFixed32() {
    const val = new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 4).getInt32(0, true);
    this.pos += 4;
    return val;
  }

  readFixed64() {
    const val = new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 8).getUint32(0, true) + SHIFT_LEFT_32 * new DataView(this.buf.buffer, this.buf.byteOffset + this.pos + 4, 4).getUint32(0, true);
    this.pos += 8;
    return val;
  }

  readSFixed64() {
    const val = new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 8).getInt32(0, true) + SHIFT_LEFT_32 * new DataView(this.buf.buffer, this.buf.byteOffset + this.pos + 4, 4).getInt32(0, true);
    this.pos += 8;
    return val;
  }

  readString() {
    return this.readUtf8(this.readVarint());
  }

  readBytes() {
    const end = this.pos + this.readVarint();
    const val = this.buf.subarray(this.pos, end);
    this.pos = end;
    return val;
  }

  readPackedVarint(arr, isSigned) {
    if (this.type !== PBF_BYTES) return arr;
    const end = readPackedEnd(this);
    arr = arr || [];
    while (this.pos < end) arr.push(isSigned ? this.readSVarint() : this.readVarint());
    return arr;
  }

  readPackedFloat(arr) {
    if (this.type !== PBF_BYTES) return arr;
    const end = readPackedEnd(this);
    arr = arr || [];
    while (this.pos < end) arr.push(this.readFloat());
    return arr;
  }

  readPackedDouble(arr) {
    if (this.type !== PBF_BYTES) return arr;
    const end = readPackedEnd(this);
    arr = arr || [];
    while (this.pos < end) arr.push(this.readDouble());
    return arr;
  }

  readPackedFixed32(arr) {
    if (this.type !== PBF_BYTES) return arr;
    const end = readPackedEnd(this);
    arr = arr || [];
    while (this.pos < end) arr.push(this.readFixed32());
    return arr;
  }

  readPackedSFixed32(arr) {
    if (this.type !== PBF_BYTES) return arr;
    const end = readPackedEnd(this);
    arr = arr || [];
    while (this.pos < end) arr.push(this.readSFixed32());
    return arr;
  }

  readPackedFixed64(arr) {
    if (this.type !== PBF_BYTES) return arr;
    const end = readPackedEnd(this);
    arr = arr || [];
    while (this.pos < end) arr.push(this.readFixed64());
    return arr;
  }

  readPackedSFixed64(arr) {
    if (this.type !== PBF_BYTES) return arr;
    const end = readPackedEnd(this);
    arr = arr || [];
    while (this.pos < end) arr.push(this.readSFixed64());
    return arr;
  }

  readPackedBoolean(arr) {
    return this.readPackedVarint(arr);
  }

  skip(val) {
    if ((val & 0x7) === PBF_VARINT) {
      while (this.buf[this.pos++] > 0x7f) {}
    } else if ((val & 0x7) === PBF_BYTES) {
      const len = this.readVarint();
      this.pos += len;
    } else if ((val & 0x7) === PBF_FIXED32) {
      this.pos += 4;
    } else if ((val & 0x7) === PBF_FIXED64) {
      this.pos += 8;
    }
  }

  readFields(fn, end, obj) {
    end = end || this.length;
    while (this.pos < end) {
      const val = this.readVarint();
      const tag = val >> 3;
      this.type = val & 0x7;
      fn(tag, obj, this);
    }
    return obj;
  }

  readMessage(fn, obj) {
    return this.readFields(fn, this.pos + this.readVarint(), obj);
  }

  readUtf8(len) {
    let str = "";
    let i = this.pos;
    const end = this.pos + len;
    const buf = this.buf;
    while (i < end) {
      const b0 = buf[i++];
      if (b0 < 0x80) {
        str += String.fromCharCode(b0);
      } else if (b0 < 0xe0) {
        str += String.fromCharCode((b0 & 0x1f) << 6 | buf[i++] & 0x3f);
      } else if (b0 < 0xf0) {
        str += String.fromCharCode((b0 & 0xf) << 12 | (buf[i++] & 0x3f) << 6 | buf[i++] & 0x3f);
      } else {
        const b1 = buf[i++] & 0x3f;
        const b2 = buf[i++] & 0x3f;
        const b3 = buf[i++] & 0x3f;
        const code = (b0 & 0x7) << 18 | b1 << 12 | b2 << 6 | b3;
        str += String.fromCharCode((code - 0x10000 >> 10) + 0xd800, (code & 0x3ff) + 0xdc00);
      }
    }
    this.pos = end;
    return str;
  }
}

class PbfWriter {
  constructor() {
    this.buf = new Uint8Array(256);
    this.pos = 0;
  }

  realloc(min) {
    let length = this.buf.length;
    while (length < this.pos + min) length *= 2;
    if (length !== this.buf.length) {
      const buf = new Uint8Array(length);
      buf.set(this.buf);
      this.buf = buf;
    }
  }

  finish() {
    return this.buf.subarray(0, this.pos);
  }

  writeTag(tag, type) {
    this.writeVarint((tag << 3) | type);
  }

  writeVarint(val) {
    if (val > 0xfffffff || val < 0) {
      writeBigVarint(val, this);
      return;
    }
    this.realloc(4);
    this.buf[this.pos++] = val & 0x7f | (val > 0x7f ? 0x80 : 0);
    if (val <= 0x7f) return;
    this.buf[this.pos++] = (val >>>= 7) & 0x7f | (val > 0x7f ? 0x80 : 0);
    if (val <= 0x7f) return;
    this.buf[this.pos++] = (val >>>= 7) & 0x7f | (val > 0x7f ? 0x80 : 0);
    if (val <= 0x7f) return;
    this.buf[this.pos++] = val >>> 7 & 0x7f;
  }

  writeSVarint(val) {
    this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
  }

  writeBoolean(val) {
    this.writeVarint(Boolean(val));
  }

  writeFloat(val) {
    this.realloc(4);
    new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 4).setFloat32(0, val, true);
    this.pos += 4;
  }

  writeDouble(val) {
    this.realloc(8);
    new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 8).setFloat64(0, val, true);
    this.pos += 8;
  }

  writeFixed32(val) {
    this.realloc(4);
    new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 4).setUint32(0, val, true);
    this.pos += 4;
  }

  writeSFixed32(val) {
    this.realloc(4);
    new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 4).setInt32(0, val, true);
    this.pos += 4;
  }

  writeFixed64(val) {
    this.realloc(8);
    new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 8).setUint32(0, val % SHIFT_LEFT_32 | 0, true);
    new DataView(this.buf.buffer, this.buf.byteOffset + this.pos + 4, 4).setUint32(0, val / SHIFT_LEFT_32 | 0, true);
    this.pos += 8;
  }

  writeSFixed64(val) {
    this.realloc(8);
    new DataView(this.buf.buffer, this.buf.byteOffset + this.pos, 8).setInt32(0, val % SHIFT_LEFT_32 | 0, true);
    new DataView(this.buf.buffer, this.buf.byteOffset + this.pos + 4, 4).setInt32(0, val / SHIFT_LEFT_32 | 0, true);
    this.pos += 8;
  }

  writeBytes(val) {
    const len = val.length;
    this.writeVarint(len);
    this.realloc(len);
    this.buf.set(val, this.pos);
    this.pos += len;
  }

  writeRawMessage(fn, obj) {
    const startPos = this.pos + 4;
    fn(obj, this);
    const endPos = this.pos;
    const len = endPos - startPos;
    this.pos = startPos - 4;
    this.buf[this.pos++] = len & 0xff;
    this.buf[this.pos++] = (len >>> 8) & 0xff;
    this.buf[this.pos++] = (len >>> 16) & 0xff;
    this.buf[this.pos++] = (len >>> 24) & 0xff;
    this.pos = endPos;
  }

  writeMessage(tag, fn, obj) {
    this.writeTag(tag, PBF_BYTES);
    this.writeRawMessage(fn, obj);
  }

  writePackedVarint(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    this.realloc(arr.length * 5);
    for (let i = 0; i < arr.length; i++) this.writeVarint(arr[i]);
  }

  writePackedSVarint(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    this.realloc(arr.length * 5);
    for (let i = 0; i < arr.length; i++) this.writeSVarint(arr[i]);
  }

  writePackedBoolean(tag, arr) {
    this.writePackedVarint(tag, arr);
  }

  writePackedFloat(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    this.realloc(arr.length * 4);
    for (let i = 0; i < arr.length; i++) this.writeFloat(arr[i]);
  }

  writePackedDouble(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    this.realloc(arr.length * 8);
    for (let i = 0; i < arr.length; i++) this.writeDouble(arr[i]);
  }

  writePackedFixed32(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    this.realloc(arr.length * 4);
    for (let i = 0; i < arr.length; i++) this.writeFixed32(arr[i]);
  }

  writePackedSFixed32(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    this.realloc(arr.length * 4);
    for (let i = 0; i < arr.length; i++) this.writeSFixed32(arr[i]);
  }

  writePackedFixed64(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    this.realloc(arr.length * 8);
    for (let i = 0; i < arr.length; i++) this.writeFixed64(arr[i]);
  }

  writePackedSFixed64(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    this.realloc(arr.length * 8);
    for (let i = 0; i < arr.length; i++) this.writeSFixed64(arr[i]);
  }

  writeString(str) {
    const len = writeUtf8(str, this.buf, this.pos);
    this.writeVarint(len);
    this.pos += len;
  }

  writeFloatField(tag, val) {
    this.writeTag(tag, PBF_FIXED32);
    this.writeFloat(val);
  }

  writeDoubleField(tag, val) {
    this.writeTag(tag, PBF_FIXED64);
    this.writeDouble(val);
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

  writeBooleanField(tag, val) {
    this.writeTag(tag, PBF_VARINT);
    this.writeBoolean(val);
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

  writeBytesField(tag, val) {
    this.writeTag(tag, PBF_BYTES);
    this.writeBytes(val);
  }
}

function readVarintRemainder(val, pbf) {
  const buf = pbf.buf;
  let b = buf[pbf.pos++];
  let h = b & 0x7f;
  if (b < 0x80) return toNum(val, h, pbf);
  b = buf[pbf.pos++];
  h |= (b & 0x7f) << 7;
  if (b < 0x80) return toNum(val, h, pbf);
  b = buf[pbf.pos++];
  h |= (b & 0x7f) << 14;
  if (b < 0x80) return toNum(val, h, pbf);
  b = buf[pbf.pos++];
  h |= (b & 0x7f) << 21;
  if (b < 0x80) return toNum(val, h, pbf);
  b = buf[pbf.pos++];
  h |= (b & 0x0f) << 28;
  return toNum(val, h, pbf);
}

function toNum(low, high, pbf) {
  if (high < 0x200000) return (high * 0x100000000 + low) >>> 0;
  const neg = low & 1;
  let num = (low >>> 1 | high << 31) * 2 + neg;
  if (neg) num = -num;
  return num;
}

function writeBigVarint(val, pbf) {
  let low = Math.floor(val * SHIFT_RIGHT_32);
  let high = val & 0xffffffff;
  if (high < 0) {
    low = ~low;
    high = ~high;
    if (++high > 0xffffffff) {
      high = 0;
      low++;
    }
  }
  if (val >= 0x10000000000000000n || val < -0x8000000000000000n) {
    throw new RangeError("Given varint doesn't fit into 10 bytes");
  }
  writeBigVarintLow(low, high, pbf);
  writeBigVarintHigh(low, pbf);
}

function writeBigVarintLow(low, high, pbf) {
  pbf.realloc(10);
  pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
  pbf.buf[pbf.pos++] = (low >>>= 7) & 0x7f | 0x80;
  pbf.buf[pbf.pos++] = (low >>>= 7) & 0x7f | 0x80;
  pbf.buf[pbf.pos++] = (low >>>= 7) & 0x7f | 0x80;
  pbf.buf[pbf.pos++] = (low >>> 7) & 0x7f | (high ? 0x80 : 0);
}

function writeBigVarintHigh(high, pbf) {
  if (!high) return;
  pbf.buf[pbf.pos++] = (high >>>= 7) & 0x7f | 0x80;
  pbf.buf[pbf.pos++] = (high >>>= 7) & 0x7f | 0x80;
  pbf.buf[pbf.pos++] = (high >>>= 7) & 0x7f | 0x80;
  pbf.buf[pbf.pos++] = (high >>> 7) & 0x7f;
}

function makeRoomForExtraLength(startPos, len, pbf) {
  let extraLen = len < 0x80 ? 1 : len < 0x4000 ? 2 : len < 0x200000 ? 3 : len < 0x10000000 ? 4 : 5;
  pbf.realloc(extraLen);
  for (let i = pbf.pos - 1; i >= startPos; i--) {
    pbf.buf[i + extraLen] = pbf.buf[i];
  }
}

function writePackedVarint(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);
}

function writePackedSVarint(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);
}

function writePackedFloat(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);
}

function writePackedDouble(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);
}

function writePackedBoolean(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);
}

function writePackedFixed32(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);
}

function writePackedSFixed32(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]);
}

function writePackedFixed64(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);
}

function writePackedSFixed64(arr, pbf) {
  for (let i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]);
}

function readUtf8(buf, pos, end) {
  return new PbfReader(buf).readUtf8(end - pos);
}

function writeUtf8(str, buf, pos) {
  let i = 0;
  let c;
  while (i < str.length) {
    c = str.charCodeAt(i);
    if (c < 0x80) {
      buf[pos++] = c;
    } else if (c < 0x800) {
      buf[pos++] = 0xc0 | (c >> 6);
      buf[pos++] = 0x80 | (c & 0x3f);
    } else if (c < 0xd800 || c >= 0xe000) {
      buf[pos++] = 0xe0 | (c >> 12);
      buf[pos++] = 0x80 | ((c >> 6) & 0x3f);
      buf[pos++] = 0x80 | (c & 0x3f);
    } else {
      c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(++i) & 0x3ff));
      buf[pos++] = 0xf0 | (c >> 18);
      buf[pos++] = 0x80 | ((c >> 12) & 0x3f);
      buf[pos++] = 0x80 | ((c >> 6) & 0x3f);
      buf[pos++] = 0x80 | (c & 0x3f);
    }
    i++;
  }
  return i;
}

function readPackedEnd(pbf) {
  return pbf.pos + pbf.readVarint();
}

export { PbfReader, PbfWriter };
