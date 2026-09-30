const SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
const TEXT_DECODER_MIN_LENGTH = 12;
const utf8TextDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;

const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;

function readVarintRemainder(val, n, bytes) {
  let result = n;
  let shift = 0;
  do {
    let b = bytes[val++];
    result += (b & 0x7f) << shift;
    shift += 7;
  } while (b >= 0x80);
  return result;
}

function toNum(low, high, isSigned) {
  if (isSigned && high >>> 31) {
    return -((low + 1) * SHIFT_RIGHT_32) + high * SHIFT_RIGHT_32;
  }
  return low + high * SHIFT_RIGHT_32;
}

function writeBigVarint(val, buf) {
  let low = val % SHIFT_LEFT_32;
  let high = val / SHIFT_LEFT_32;
  let bytes = writeBigVarintLow(low, buf);
  writeBigVarintHigh(high, buf, bytes);
}

function writeBigVarintLow(val, buf, bytesPos) {
  while (val >= 0x80) {
    buf[bytesPos++] = (val & 0xff) | 0x80;
    val >>>= 7;
  }
  buf[bytesPos++] = val;
  return bytesPos;
}

function writeBigVarintHigh(val, buf, bytesPos) {
  while (val >= 0x80) {
    buf[bytesPos++] = (val & 0xff) | 0x80;
    val >>>= 7;
  }
  buf[bytesPos++] = val;
}

function makeRoomForExtraLength(pos, len, buf) {
  let extraLen = len <= 0x3fff ? 1 : len <= 0x1fffff ? 2 : len <= 0xfffffff ? 3 : Math.floor(len / SHIFT_LEFT_32) > 0 ? 4 : 5;
  if (pos + extraLen > buf.length) {
    let newBuf = new Uint8Array(buf.length * 2 + extraLen);
    newBuf.set(buf);
    buf = newBuf;
  }
  return buf;
}

function writePackedVarint(arr, buf) {
  let bytesPos = buf.length;
  for (let i = 0; i < arr.length; i++) {
    let val = arr[i];
    while (val >= 0x80) {
      buf[bytesPos++] = (val & 0xff) | 0x80;
      val >>>= 7;
    }
    buf[bytesPos++] = val;
  }
  return bytesPos;
}

function writePackedSVarint(arr, buf) {
  let bytesPos = buf.length;
  for (let i = 0; i < arr.length; i++) {
    let val = arr[i] << 1 ^ arr[i] >> 31;
    while (val >= 0x80) {
      buf[bytesPos++] = (val & 0xff) | 0x80;
      val >>>= 7;
    }
    buf[bytesPos++] = val;
  }
  return bytesPos;
}

function writePackedFloat(arr, buf) {
  let view = new DataView(buf.buffer);
  let bytesPos = buf.length;
  for (let i = 0; i < arr.length; i++) {
    view.setFloat32(bytesPos, arr[i], true);
    bytesPos += 4;
  }
  return bytesPos;
}

function writePackedDouble(arr, buf) {
  let view = new DataView(buf.buffer);
  let bytesPos = buf.length;
  for (let i = 0; i < arr.length; i++) {
    view.setFloat64(bytesPos, arr[i], true);
    bytesPos += 8;
  }
  return bytesPos;
}

function writePackedBoolean(arr, buf) {
  let bytesPos = buf.length;
  for (let i = 0; i < arr.length; i++) {
    buf[bytesPos++] = arr[i] ? 1 : 0;
  }
  return bytesPos;
}

function writePackedFixed32(arr, buf) {
  let view = new DataView(buf.buffer);
  let bytesPos = buf.length;
  for (let i = 0; i < arr.length; i++) {
    view.setUint32(bytesPos, arr[i], true);
    bytesPos += 4;
  }
  return bytesPos;
}

function writePackedSFixed32(arr, buf) {
  let view = new DataView(buf.buffer);
  let bytesPos = buf.length;
  for (let i = 0; i < arr.length; i++) {
    view.setInt32(bytesPos, arr[i], true);
    bytesPos += 4;
  }
  return bytesPos;
}

function writePackedFixed64(arr, buf) {
  let view = new DataView(buf.buffer);
  let bytesPos = buf.length;
  for (let i = 0; i < arr.length; i++) {
    view.setUint32(bytesPos, arr[i] & 0xffffffff, true);
    view.setUint32(bytesPos + 4, Math.floor(arr[i] / SHIFT_LEFT_32), true);
    bytesPos += 8;
  }
  return bytesPos;
}

function writePackedSFixed64(arr, buf) {
  let view = new DataView(buf.buffer);
  let bytesPos = buf.length;
  for (let i = 0; i < arr.length; i++) {
    view.setUint32(bytesPos, arr[i] & 0xffffffff, true);
    view.setInt32(bytesPos + 4, Math.floor(arr[i] / SHIFT_LEFT_32), true);
    bytesPos += 8;
  }
  return bytesPos;
}

function readUtf8(buf, pos, end) {
  if (utf8TextDecoder && end - pos >= TEXT_DECODER_MIN_LENGTH) {
    return utf8TextDecoder.decode(buf.subarray(pos, end));
  }
  let str = '';
  for (let i = pos; i < end;) {
    let b1 = buf[i++];
    if (b1 < 0x80) {
      str += String.fromCharCode(b1);
    } else if (b1 >= 0xc0) {
      let b2 = buf[i++];
      let b3 = buf[i++];
      let b4 = buf[i++];
      str += String.fromCharCode(
        b1 & 0x07 === 0x07 ? (b1 & 0x07) << 18 | (b2 & 0x3f) << 12 | (b3 & 0x3f) << 6 | (b4 & 0x3f) :
        b1 & 0x0f === 0x0f ? (b1 & 0x0f) << 12 | (b2 & 0x3f) << 6 | (b3 & 0x3f) :
        (b1 & 0x1f) << 6 | (b2 & 0x3f)
      );
    } else {
      str += String.fromCharCode((b1 & 0x1f) << 6 | (buf[i++] & 0x3f));
    }
  }
  return str;
}

function writeUtf8(str, buf) {
  let bytesPos = buf.length;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) {
      buf[bytesPos++] = c;
    } else if (c < 0x800) {
      buf[bytesPos++] = 0xc0 | (c >> 6);
      buf[bytesPos++] = 0x80 | (c & 0x3f);
    } else {
      buf[bytesPos++] = 0xe0 | (c >> 12);
      buf[bytesPos++] = 0x80 | ((c >> 6) & 0x3f);
      buf[bytesPos++] = 0x80 | (c & 0x3f);
    }
  }
  return bytesPos;
}

class PbfReader {
  constructor(buf) {
    this.buf = buf;
    this.pos = 0;
    this.type = 0;
    this.length = buf.length;
  }

  readTag() {
    let val = this.readVarint();
    this.type = val & 0x7;
    this.tag = val >> 3;
    if (this.tag === 0) throw new Error('Invalid tag');
    return this.tag;
  }

  readVarint(isSigned) {
    let val = this.buf[this.pos++];
    if (val < 0x80) return val;
    let result = val & 0x7f;
    let shift = 7;
    do {
      val = this.buf[this.pos++];
      result |= (val & 0x7f) << shift;
      shift += 7;
    } while (val >= 0x80);
    if (isSigned && result >>> 31) {
      return -((result + 1) * SHIFT_RIGHT_32) + result * SHIFT_RIGHT_32;
    }
    return result;
  }

  readSVarint() {
    let val = this.readVarint();
    return val % 2 === 1 ? -(val + 1) / 2 : val / 2;
  }

  readBoolean() {
    return this.readVarint() !== 0;
  }

  readInt32() {
    return this.readVarint();
  }

  readUInt32() {
    return this.readVarint();
  }

  readFixed32() {
    let val = this.buf[this.pos] | this.buf[this.pos + 1] << 8 | this.buf[this.pos + 2] << 16 | this.buf[this.pos + 3] << 24;
    this.pos += 4;
    return val >>> 0;
  }

  readSFixed32() {
    let val = this.buf[this.pos] | this.buf[this.pos + 1] << 8 | this.buf[this.pos + 2] << 16 | this.buf[this.pos + 3] << 24;
    this.pos += 4;
    return val;
  }

  readFixed64() {
    let low = this.readFixed32();
    let high = this.readFixed32();
    return low + high * SHIFT_RIGHT_32;
  }

  readSFixed64() {
    let low = this.readFixed32();
    let high = this.readSFixed32();
    return low + high * SHIFT_RIGHT_32;
  }

  readFloat() {
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let val = view.getFloat32(this.pos, true);
    this.pos += 4;
    return val;
  }

  readDouble() {
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    let val = view.getFloat64(this.pos, true);
    this.pos += 8;
    return val;
  }

  readString() {
    let end = this.pos + this.readVarint();
    let str = readUtf8(this.buf, this.pos, end);
    this.pos = end;
    return str;
  }

  readBytes() {
    let end = this.readVarint() + this.pos;
    let buf = this.buf.subarray(this.pos, end);
    this.pos = end;
    return buf;
  }

  readPackedVarint() {
    let end = this.readVarint() + this.pos;
    let arr = [];
    while (this.pos < end) arr.push(this.readVarint());
    return arr;
  }

  readPackedSVarint() {
    let end = this.readVarint() + this.pos;
    let arr = [];
    while (this.pos < end) arr.push(this.readSVarint());
    return arr;
  }

  readPackedBoolean() {
    let end = this.readVarint() + this.pos;
    let arr = [];
    while (this.pos < end) arr.push(this.readBoolean());
    return arr;
  }

  readPackedInt32() {
    let end = this.readVarint() + this.pos;
    let arr = [];
    while (this.pos < end) arr.push(this.readVarint());
    return arr;
  }

  readPackedFloat() {
    let end = this.readVarint() + this.pos;
    let arr = [];
    while (this.pos < end) arr.push(this.readFloat());
    return arr;
  }

  readPackedDouble() {
    let end = this.readVarint() + this.pos;
    let arr = [];
    while (this.pos < end) arr.push(this.readDouble());
    return arr;
  }

  readPackedFixed32() {
    let end = this.readVarint() + this.pos;
    let arr = [];
    while (this.pos < end) arr.push(this.readFixed32());
    return arr;
  }

  readPackedSFixed32() {
    let end = this.readVarint() + this.pos;
    let arr = [];
    while (this.pos < end) arr.push(this.readSFixed32());
    return arr;
  }

  readPackedFixed64() {
    let end = this.readVarint() + this.pos;
    let arr = [];
    while (this.pos < end) arr.push(this.readFixed64());
    return arr;
  }

  readPackedSFixed64() {
    let end = this.readVarint() + this.pos;
    let arr = [];
    while (this.pos < end) arr.push(this.readSFixed64());
    return arr;
  }

  skip(val) {
    if (val === undefined) val = this.type;
    if (val === PBF_VARINT) this.readVarint();
    else if (val === PBF_BYTES) this.pos += this.readVarint();
    else if (val === PBF_FIXED32) this.pos += 4;
    else if (val === PBF_FIXED64) this.pos += 8;
    else throw new Error('Unimplemented type: ' + val);
  }

  readFields(onRead, onEnd) {
    let end = this.length;
    while (this.pos < end) {
      let tag = this.readTag();
      onRead(tag, this);
      if (this.pos > end) throw new Error('Read past end of buffer');
    }
    if (onEnd) onEnd();
  }

  readMessage(onRead, onEnd) {
    let end = this.readVarint() + this.pos;
    while (this.pos < end) {
      let tag = this.readTag();
      onRead(tag, this);
      if (this.pos > end) throw new Error('Read past end of message');
    }
    if (onEnd) onEnd();
  }
}

class PbfWriter {
  constructor() {
    this.buf = new Uint8Array(16);
    this.pos = 0;
  }

  realloc(min) {
    let length = this.buf.length;
    while (length < this.pos + min) length *= 2;
    if (length !== this.buf.length) {
      let newBuf = new Uint8Array(length);
      newBuf.set(this.buf);
      this.buf = newBuf;
    }
  }

  finish() {
    return this.buf.subarray(0, this.pos);
  }

  writeTag(tag, type) {
    this.realloc(1);
    let val = (tag << 3 | type) >>> 0;
    while (val >= 0x80) {
      this.buf[this.pos++] = (val & 0xff) | 0x80;
      val >>>= 7;
    }
    this.buf[this.pos++] = val;
  }

  writeVarint(val) {
    this.realloc(5);
    while (val >= 0x80) {
      this.buf[this.pos++] = (val & 0xff) | 0x80;
      val >>>= 7;
    }
    this.buf[this.pos++] = val;
  }

  writeSVarint(val) {
    this.writeVarint(val << 1 ^ val >> 31);
  }

  writeBoolean(val) {
    this.writeVarint(val ? 1 : 0);
  }

  writeString(str) {
    let startPos = this.pos;
    this.realloc(str.length * 3);
    let bytesPos = writeUtf8(str, this.buf);
    let len = bytesPos - startPos;
    let extraLen = len <= 0x3fff ? 1 : len <= 0x1fffff ? 2 : len <= 0xfffffff ? 3 : Math.floor(len / SHIFT_LEFT_32) > 0 ? 4 : 5;
    if (startPos + extraLen + len > this.buf.length) {
      let newBuf = new Uint8Array(this.buf.length * 2 + extraLen + len);
      newBuf.set(this.buf);
      this.buf = newBuf;
    }
    this.pos = startPos;
    this.writeVarint(len);
    this.pos = writeUtf8(str, this.buf);
  }

  writeFloat(val) {
    this.realloc(4);
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    view.setFloat32(this.pos, val, true);
    this.pos += 4;
  }

  writeDouble(val) {
    this.realloc(8);
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    view.setFloat64(this.pos, val, true);
    this.pos += 8;
  }

  writeFixed32(val) {
    this.realloc(4);
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    view.setUint32(this.pos, val, true);
    this.pos += 4;
  }

  writeSFixed32(val) {
    this.realloc(4);
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    view.setInt32(this.pos, val, true);
    this.pos += 4;
  }

  writeFixed64(val) {
    this.realloc(8);
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    view.setUint32(this.pos, val & 0xffffffff, true);
    view.setUint32(this.pos + 4, Math.floor(val / SHIFT_LEFT_32), true);
    this.pos += 8;
  }

  writeSFixed64(val) {
    this.realloc(8);
    let view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    view.setUint32(this.pos, val & 0xffffffff, true);
    view.setInt32(this.pos + 4, Math.floor(val / SHIFT_LEFT_32), true);
    this.pos += 8;
  }

  writeBytes(buf) {
    let len = buf.length;
    this.writeVarint(len);
    this.realloc(len);
    this.buf.set(buf, this.pos);
    this.pos += len;
  }

  writeRawMessage(fn) {
    let startPos = this.pos;
    this.pos += 1;
    fn(this);
    let len = this.pos - startPos - 1;
    let extraLen = len <= 0x3fff ? 1 : len <= 0x1fffff ? 2 : len <= 0xfffffff ? 3 : Math.floor(len / SHIFT_LEFT_32) > 0 ? 4 : 5;
    if (extraLen > 1) {
      let newBuf = new Uint8Array(this.buf.length + extraLen - 1);
      newBuf.set(this.buf.subarray(0, startPos));
      newBuf.set(this.buf.subarray(startPos + 1), startPos + extraLen);
      this.buf = newBuf;
      this.pos = startPos + extraLen + len;
    }
    let bytesPos = startPos;
    while (len >= 0x80) {
      this.buf[bytesPos++] = (len & 0xff) | 0x80;
      len >>>= 7;
    }
    this.buf[bytesPos++] = len;
  }

  writeMessage(tag, fn) {
    this.writeTag(tag, PBF_BYTES);
    this.writeRawMessage(fn);
  }

  writeVarintField(tag, val) {
    this.writeTag(tag, PBF_VARINT);
    this.writeVarint(val);
  }

  writeSVarintField(tag, val) {
    this.writeTag(tag, PBF_VARINT);
    this.writeSVarint(val);
  }

  writeBooleanField(tag, val) {
    this.writeTag(tag, PBF_VARINT);
    this.writeBoolean(val);
  }

  writeInt32Field(tag, val) {
    this.writeTag(tag, PBF_VARINT);
    this.writeVarint(val);
  }

  writeStringField(tag, str) {
    this.writeTag(tag, PBF_BYTES);
    this.writeString(str);
  }

  writeBytesField(tag, buf) {
    this.writeTag(tag, PBF_BYTES);
    this.writeBytes(buf);
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

  writeFloatField(tag, val) {
    this.writeTag(tag, PBF_FIXED32);
    this.writeFloat(val);
  }

  writeDoubleField(tag, val) {
    this.writeTag(tag, PBF_FIXED64);
    this.writeDouble(val);
  }

  writePackedVarint(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    let len = writePackedVarint(arr, this.buf);
    let extraLen = len <= 0x3fff ? 1 : len <= 0x1fffff ? 2 : len <= 0xfffffff ? 3 : Math.floor(len / SHIFT_LEFT_32) > 0 ? 4 : 5;
    this.realloc(extraLen);
    let startPos = this.pos;
    this.pos += extraLen;
    writePackedVarint(arr, this.buf);
    let bytesPos = startPos;
    while (len >= 0x80) {
      this.buf[bytesPos++] = (len & 0xff) | 0x80;
      len >>>= 7;
    }
    this.buf[bytesPos++] = len;
  }

  writePackedSVarint(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    let len = writePackedSVarint(arr, this.buf);
    let extraLen = len <= 0x3fff ? 1 : len <= 0x1fffff ? 2 : len <= 0xfffffff ? 3 : Math.floor(len / SHIFT_LEFT_32) > 0 ? 4 : 5;
    this.realloc(extraLen);
    let startPos = this.pos;
    this.pos += extraLen;
    writePackedSVarint(arr, this.buf);
    let bytesPos = startPos;
    while (len >= 0x80) {
      this.buf[bytesPos++] = (len & 0xff) | 0x80;
      len >>>= 7;
    }
    this.buf[bytesPos++] = len;
  }

  writePackedBoolean(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    let len = writePackedBoolean(arr, this.buf);
    let extraLen = len <= 0x3fff ? 1 : len <= 0x1fffff ? 2 : len <= 0xfffffff ? 3 : Math.floor(len / SHIFT_LEFT_32) > 0 ? 4 : 5;
    this.realloc(extraLen);
    let startPos = this.pos;
    this.pos += extraLen;
    writePackedBoolean(arr, this.buf);
    let bytesPos = startPos;
    while (len >= 0x80) {
      this.buf[bytesPos++] = (len & 0xff) | 0x80;
      len >>>= 7;
    }
    this.buf[bytesPos++] = len;
  }

  writePackedFloat(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    let len = arr.length * 4;
    this.writeVarint(len);
    this.realloc(len);
    writePackedFloat(arr, this.buf);
    this.pos += len;
  }

  writePackedDouble(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    let len = arr.length * 8;
    this.writeVarint(len);
    this.realloc(len);
    writePackedDouble(arr, this.buf);
    this.pos += len;
  }

  writePackedFixed32(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    let len = arr.length * 4;
    this.writeVarint(len);
    this.realloc(len);
    writePackedFixed32(arr, this.buf);
    this.pos += len;
  }

  writePackedSFixed32(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    let len = arr.length * 4;
    this.writeVarint(len);
    this.realloc(len);
    writePackedSFixed32(arr, this.buf);
    this.pos += len;
  }

  writePackedFixed64(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    let len = arr.length * 8;
    this.writeVarint(len);
    this.realloc(len);
    writePackedFixed64(arr, this.buf);
    this.pos += len;
  }

  writePackedSFixed64(tag, arr) {
    if (!arr.length) return;
    this.writeTag(tag, PBF_BYTES);
    let len = arr.length * 8;
    this.writeVarint(len);
    this.realloc(len);
    writePackedSFixed64(arr, this.buf);
    this.pos += len;
  }
}

export { PbfReader, PbfWriter };
