const SHIFT_LEFT_32 = 0x100000000;
const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
const TEXT_DECODER_MIN_LENGTH = 12;
const utf8TextDecoder =
  typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");

const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;

class PbfReader {
  constructor(buffer) {
    this.buf = ArrayBuffer.isView(buffer)
      ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
      : new Uint8Array(buffer || 0);
    this.pos = 0;
    this.type = 0;
    this.length = this.buf.length;
  }

  readFields(readField, result, end = this.length) {
    while (this.pos < end) {
      const tagAndType = this.readVarint();
      const tag = tagAndType >> 3;
      this.type = tagAndType & 7;
      const fieldStart = this.pos;
      readField(tag, result, this);
      if (this.pos === fieldStart) this.skip(tagAndType);
    }
    return result;
  }

  readMessage(readField, result) {
    return this.readFields(readField, result, this.readVarint() + this.pos);
  }

  readFixed32() {
    const value = new DataView(
      this.buf.buffer,
      this.buf.byteOffset + this.pos,
      4,
    ).getUint32(0, true);
    this.pos += 4;
    return value;
  }

  readSFixed32() {
    const value = new DataView(
      this.buf.buffer,
      this.buf.byteOffset + this.pos,
      4,
    ).getInt32(0, true);
    this.pos += 4;
    return value;
  }

  readFixed64() {
    const low = this.readFixed32();
    const high = this.readFixed32();
    return low + high * SHIFT_LEFT_32;
  }

  readSFixed64() {
    const low = this.readFixed32();
    const high = this.readSFixed32();
    return low + high * SHIFT_LEFT_32;
  }

  readFloat() {
    const value = new DataView(
      this.buf.buffer,
      this.buf.byteOffset + this.pos,
      4,
    ).getFloat32(0, true);
    this.pos += 4;
    return value;
  }

  readDouble() {
    const value = new DataView(
      this.buf.buffer,
      this.buf.byteOffset + this.pos,
      8,
    ).getFloat64(0, true);
    this.pos += 8;
    return value;
  }

  readVarint(isSigned) {
    const buffer = this.buf;
    let byte = buffer[this.pos++];
    let value = byte & 0x7f;
    if (byte < 0x80) return value;
    byte = buffer[this.pos++];
    value |= (byte & 0x7f) << 7;
    if (byte < 0x80) return value;
    byte = buffer[this.pos++];
    value |= (byte & 0x7f) << 14;
    if (byte < 0x80) return value;
    byte = buffer[this.pos++];
    value |= (byte & 0x7f) << 21;
    if (byte < 0x80) return value;
    byte = buffer[this.pos++];
    value += (byte & 0x0f) * 0x10000000;
    return byte < 0x80
      ? toNum(value, (byte & 0x70) >> 4, isSigned)
      : readVarintRemainder(value, byte, isSigned, this);
  }

  readSVarint() {
    const value = this.readVarint();
    return value & 1 ? -(value + 1) / 2 : value / 2;
  }

  readBoolean() {
    return Boolean(this.readVarint());
  }

  readString() {
    const end = this.readVarint() + this.pos;
    const value = readUtf8(this.buf, this.pos, end);
    this.pos = end;
    return value;
  }

  readBytes() {
    const end = this.readVarint() + this.pos;
    const value = this.buf.subarray(this.pos, end);
    this.pos = end;
    return value;
  }

  readPackedVarint() {
    if (this.type !== PBF_BYTES) return [this.readVarint()];
    const values = [];
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readVarint());
    return values;
  }

  readPackedSVarint() {
    if (this.type !== PBF_BYTES) return [this.readSVarint()];
    const values = [];
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readSVarint());
    return values;
  }

  readPackedBoolean() {
    if (this.type !== PBF_BYTES) return [this.readBoolean()];
    const values = [];
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readBoolean());
    return values;
  }

  readPackedFloat() {
    if (this.type !== PBF_BYTES) return [this.readFloat()];
    const values = [];
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readFloat());
    return values;
  }

  readPackedDouble() {
    if (this.type !== PBF_BYTES) return [this.readDouble()];
    const values = [];
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readDouble());
    return values;
  }

  readPackedFixed32() {
    if (this.type !== PBF_BYTES) return [this.readFixed32()];
    const values = [];
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readFixed32());
    return values;
  }

  readPackedSFixed32() {
    if (this.type !== PBF_BYTES) return [this.readSFixed32()];
    const values = [];
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readSFixed32());
    return values;
  }

  readPackedFixed64() {
    if (this.type !== PBF_BYTES) return [this.readFixed64()];
    const values = [];
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readFixed64());
    return values;
  }

  readPackedSFixed64() {
    if (this.type !== PBF_BYTES) return [this.readSFixed64()];
    const values = [];
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readSFixed64());
    return values;
  }

  readPackedEnd() {
    return this.type === PBF_BYTES ? this.readVarint() + this.pos : this.pos + 1;
  }

  nextField() {
    if (this.pos >= this.length) return false;
    const tagAndType = this.readVarint();
    this.type = tagAndType & 7;
    return tagAndType >> 3;
  }

  skip(tagAndType) {
    const type = tagAndType & 7;
    if (type === PBF_VARINT) {
      while (this.buf[this.pos++] > 0x7f) {}
    } else if (type === PBF_BYTES) {
      this.pos = this.readVarint() + this.pos;
    } else if (type === PBF_FIXED32) {
      this.pos += 4;
    } else if (type === PBF_FIXED64) {
      this.pos += 8;
    } else {
      throw new Error(`Unimplemented type: ${type}`);
    }
  }
}

class PbfWriter {
  constructor() {
    this.buf = new Uint8Array(16);
    this.pos = 0;
  }

  writeTag(tag, type) {
    this.writeVarint((tag << 3) | type);
  }

  realloc(minimumBytes) {
    let length = this.buf.length || 16;
    while (length < this.pos + minimumBytes) length *= 2;
    if (length !== this.buf.length) {
      const buffer = new Uint8Array(length);
      buffer.set(this.buf);
      this.buf = buffer;
    }
  }

  finish() {
    this.length = this.pos;
    this.pos = 0;
    return this.buf.subarray(0, this.length);
  }

  writeFixed32(value) {
    this.realloc(4);
    new DataView(this.buf.buffer).setUint32(this.pos, value, true);
    this.pos += 4;
  }

  writeSFixed32(value) {
    this.realloc(4);
    new DataView(this.buf.buffer).setInt32(this.pos, value, true);
    this.pos += 4;
  }

  writeFixed64(value) {
    this.writeFixed32(value & -1);
    this.writeFixed32(Math.floor(value * SHIFT_RIGHT_32));
  }

  writeSFixed64(value) {
    this.writeFixed32(value & -1);
    this.writeSFixed32(Math.floor(value * SHIFT_RIGHT_32));
  }

  writeVarint(value) {
    value = +value || 0;
    if (value > 0xfffffff || value < 0) {
      writeBigVarint(value, this);
      return;
    }
    this.realloc(4);
    this.buf[this.pos++] = value & 0x7f | (value > 0x7f ? 0x80 : 0);
    if (value <= 0x7f) return;
    this.buf[this.pos++] = (value >>> 7) & 0x7f | (value > 0x3fff ? 0x80 : 0);
    if (value <= 0x3fff) return;
    this.buf[this.pos++] = (value >>> 14) & 0x7f | (value > 0x1fffff ? 0x80 : 0);
    if (value <= 0x1fffff) return;
    this.buf[this.pos++] = value >>> 21 & 0x7f;
  }

  writeSVarint(value) {
    this.writeVarint(value < 0 ? -value * 2 - 1 : value * 2);
  }

  writeBoolean(value) {
    this.writeVarint(Boolean(value));
  }

  writeString(value) {
    value = String(value);
    this.realloc(value.length * 4);
    this.pos++;
    const start = this.pos;
    this.pos = writeUtf8(this.buf, value, this.pos);
    const length = this.pos - start;
    if (length >= 0x80) makeRoomForExtraLength(this, start, length);
    this.pos = start - 1;
    this.writeVarint(length);
    this.pos += length;
  }

  writeFloat(value) {
    this.realloc(4);
    new DataView(this.buf.buffer).setFloat32(this.pos, value, true);
    this.pos += 4;
  }

  writeDouble(value) {
    this.realloc(8);
    new DataView(this.buf.buffer).setFloat64(this.pos, value, true);
    this.pos += 8;
  }

  writeBytes(value) {
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    this.writeVarint(bytes.length);
    this.realloc(bytes.length);
    this.buf.set(bytes, this.pos);
    this.pos += bytes.length;
  }

  writeRawMessage(writeMessage, value) {
    this.pos++;
    const start = this.pos;
    writeMessage(value, this);
    const length = this.pos - start;
    if (length >= 0x80) makeRoomForExtraLength(this, start, length);
    this.pos = start - 1;
    this.writeVarint(length);
    this.pos += length;
  }

  writeMessage(tag, writeMessage, value) {
    this.writeTag(tag, PBF_BYTES);
    this.writeRawMessage(writeMessage, value);
  }

  writePackedVarint(tag, values) { writePackedVarint(tag, values, this); }
  writePackedSVarint(tag, values) { writePackedSVarint(tag, values, this); }
  writePackedBoolean(tag, values) { writePackedBoolean(tag, values, this); }
  writePackedFloat(tag, values) { writePackedFloat(tag, values, this); }
  writePackedDouble(tag, values) { writePackedDouble(tag, values, this); }
  writePackedFixed32(tag, values) { writePackedFixed32(tag, values, this); }
  writePackedSFixed32(tag, values) { writePackedSFixed32(tag, values, this); }
  writePackedFixed64(tag, values) { writePackedFixed64(tag, values, this); }
  writePackedSFixed64(tag, values) { writePackedSFixed64(tag, values, this); }

  writeBytesField(tag, value) { this.writeTag(tag, PBF_BYTES); this.writeBytes(value); }
  writeFixed32Field(tag, value) { this.writeTag(tag, PBF_FIXED32); this.writeFixed32(value); }
  writeSFixed32Field(tag, value) { this.writeTag(tag, PBF_FIXED32); this.writeSFixed32(value); }
  writeFixed64Field(tag, value) { this.writeTag(tag, PBF_FIXED64); this.writeFixed64(value); }
  writeSFixed64Field(tag, value) { this.writeTag(tag, PBF_FIXED64); this.writeSFixed64(value); }
  writeVarintField(tag, value) { this.writeTag(tag, PBF_VARINT); this.writeVarint(value); }
  writeSVarintField(tag, value) { this.writeTag(tag, PBF_VARINT); this.writeSVarint(value); }
  writeStringField(tag, value) { this.writeTag(tag, PBF_BYTES); this.writeString(value); }
  writeFloatField(tag, value) { this.writeTag(tag, PBF_FIXED32); this.writeFloat(value); }
  writeDoubleField(tag, value) { this.writeTag(tag, PBF_FIXED64); this.writeDouble(value); }
  writeBooleanField(tag, value) { this.writeVarintField(tag, Boolean(value)); }
}

function readVarintRemainder(low, fifthByte, isSigned, reader) {
  const buffer = reader.buf;
  let high = (fifthByte & 0x70) >> 4;
  let byte = buffer[reader.pos++];
  high |= (byte & 0x7f) << 3;
  if (byte < 0x80) return toNum(low, high, isSigned);
  byte = buffer[reader.pos++];
  high |= (byte & 0x7f) << 10;
  if (byte < 0x80) return toNum(low, high, isSigned);
  byte = buffer[reader.pos++];
  high |= (byte & 0x7f) << 17;
  if (byte < 0x80) return toNum(low, high, isSigned);
  byte = buffer[reader.pos++];
  high |= (byte & 0x7f) << 24;
  if (byte < 0x80) return toNum(low, high, isSigned);
  byte = buffer[reader.pos++];
  high |= (byte & 0x01) << 31;
  if (byte < 0x80) return toNum(low, high, isSigned);
  throw new Error("Expected varint not more than 10 bytes");
}

function toNum(low, high, isSigned) {
  return (low >>> 0) + (isSigned ? high | 0 : high >>> 0) * SHIFT_LEFT_32;
}

function writeBigVarint(value, writer) {
  let low;
  let high;
  if (value >= 0) {
    low = value % SHIFT_LEFT_32 | 0;
    high = value / SHIFT_LEFT_32 | 0;
  } else {
    low = ~(-value % SHIFT_LEFT_32);
    high = ~(-value / SHIFT_LEFT_32);
    if (low !== -1) low = low + 1 | 0;
    else {
      low = 0;
      high = high + 1 | 0;
    }
  }
  writer.realloc(10);
  writeBigVarintLow(low, high, writer);
  writeBigVarintHigh(high, writer);
}

function writeBigVarintLow(low, high, writer) {
  for (let index = 0; index < 4; index++) {
    writer.buf[writer.pos++] = low & 0x7f | 0x80;
    low >>>= 7;
  }
  writer.buf[writer.pos++] =
    (low & 0x0f) | ((high & 7) << 4) | (high > 7 || high < 0 ? 0x80 : 0);
}

function writeBigVarintHigh(high, writer) {
  high >>>= 3;
  if (!high) return;
  while (high > 0x7f) {
    writer.buf[writer.pos++] = high & 0x7f | 0x80;
    high >>>= 7;
  }
  writer.buf[writer.pos++] = high;
}

function makeRoomForExtraLength(writer, start, length) {
  const extraBytes = length < 0x4000 ? 1 : length < 0x200000 ? 2 : length < 0x10000000 ? 3 : 4;
  writer.realloc(extraBytes);
  for (let index = writer.pos - 1; index >= start; index--) {
    writer.buf[index + extraBytes] = writer.buf[index];
  }
}

function writePacked(tag, values, writer, writeValue) {
  if (!values.length) return;
  writer.writeTag(tag, PBF_BYTES);
  writer.writeRawMessage((items, output) => {
    for (const value of items) writeValue.call(output, value);
  }, values);
}

function writePackedVarint(tag, values, writer) { writePacked(tag, values, writer, writer.writeVarint); }
function writePackedSVarint(tag, values, writer) { writePacked(tag, values, writer, writer.writeSVarint); }
function writePackedBoolean(tag, values, writer) { writePacked(tag, values, writer, writer.writeBoolean); }
function writePackedFloat(tag, values, writer) { writePacked(tag, values, writer, writer.writeFloat); }
function writePackedDouble(tag, values, writer) { writePacked(tag, values, writer, writer.writeDouble); }
function writePackedFixed32(tag, values, writer) { writePacked(tag, values, writer, writer.writeFixed32); }
function writePackedSFixed32(tag, values, writer) { writePacked(tag, values, writer, writer.writeSFixed32); }
function writePackedFixed64(tag, values, writer) { writePacked(tag, values, writer, writer.writeFixed64); }
function writePackedSFixed64(tag, values, writer) { writePacked(tag, values, writer, writer.writeSFixed64); }

function readUtf8(buffer, start, end) {
  if (utf8TextDecoder && end - start >= TEXT_DECODER_MIN_LENGTH) {
    return utf8TextDecoder.decode(buffer.subarray(start, end));
  }
  let result = "";
  let index = start;
  while (index < end) {
    const first = buffer[index++];
    if (first < 0x80) result += String.fromCharCode(first);
    else if (first < 0xe0) {
      result += String.fromCharCode(((first & 0x1f) << 6) | (buffer[index++] & 0x3f));
    } else if (first < 0xf0) {
      result += String.fromCharCode(((first & 0x0f) << 12) | ((buffer[index++] & 0x3f) << 6) | (buffer[index++] & 0x3f));
    } else {
      let codePoint = ((first & 7) << 18) | ((buffer[index++] & 0x3f) << 12) | ((buffer[index++] & 0x3f) << 6) | (buffer[index++] & 0x3f);
      codePoint -= 0x10000;
      result += String.fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff));
    }
  }
  return result;
}

function writeUtf8(buffer, value, position) {
  for (let index = 0; index < value.length; index++) {
    let codePoint = value.charCodeAt(index);
    if (codePoint < 0x80) buffer[position++] = codePoint;
    else if (codePoint < 0x800) {
      buffer[position++] = 0xc0 | (codePoint >> 6);
      buffer[position++] = 0x80 | (codePoint & 0x3f);
    } else if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
      codePoint = 0x10000 + ((codePoint & 0x3ff) << 10) + (value.charCodeAt(++index) & 0x3ff);
      buffer[position++] = 0xf0 | (codePoint >> 18);
      buffer[position++] = 0x80 | ((codePoint >> 12) & 0x3f);
      buffer[position++] = 0x80 | ((codePoint >> 6) & 0x3f);
      buffer[position++] = 0x80 | (codePoint & 0x3f);
    } else {
      buffer[position++] = 0xe0 | (codePoint >> 12);
      buffer[position++] = 0x80 | ((codePoint >> 6) & 0x3f);
      buffer[position++] = 0x80 | (codePoint & 0x3f);
    }
  }
  return position;
}

export { PbfReader, PbfWriter };
