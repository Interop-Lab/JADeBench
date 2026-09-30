const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);
const TWO_64 = 1n << 64n;
const utf8Decoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8');
const utf8Encoder = typeof TextEncoder === 'undefined' ? null : new TextEncoder();

class PbfReader {
  constructor(buffer) {
    this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
    this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    this.pos = 0;
    this.type = 0;
    this.length = this.buf.length;
    this._valueStart = -1;
  }

  readFields(readField, result, end = this.length) {
    let field;
    while ((field = this.nextField(end))) readField(field, result, this);
    return result;
  }

  readMessage(readField, result) {
    return this.readFields(readField, result, this.readVarint() + this.pos);
  }

  readFixed32() {
    const value = this.dataView.getUint32(this.pos, true);
    this.pos += 4;
    return value;
  }

  readSFixed32() {
    const value = this.dataView.getInt32(this.pos, true);
    this.pos += 4;
    return value;
  }

  readFixed64() {
    const low = this.dataView.getUint32(this.pos, true);
    const high = this.dataView.getUint32(this.pos + 4, true);
    this.pos += 8;
    return low + high * 0x100000000;
  }

  readSFixed64() {
    const low = this.dataView.getUint32(this.pos, true);
    const high = this.dataView.getInt32(this.pos + 4, true);
    this.pos += 8;
    return low + high * 0x100000000;
  }

  readFloat() {
    const value = this.dataView.getFloat32(this.pos, true);
    this.pos += 4;
    return value;
  }

  readDouble() {
    const value = this.dataView.getFloat64(this.pos, true);
    this.pos += 8;
    return value;
  }

  readVarint(signed = false) {
    let value = 0n;
    let shift = 0n;
    let byte;
    do {
      byte = this.buf[this.pos++];
      value |= BigInt(byte & 0x7f) << shift;
      shift += 7n;
    } while (byte >= 0x80 && shift < 70n);

    if (signed && value > MAX_SAFE_BIGINT) value -= TWO_64;
    return Number(value);
  }

  readSVarint() {
    const value = this.readVarint();
    return value % 2 === 1 ? (value + 1) / -2 : value / 2;
  }

  readBoolean() {
    return Boolean(this.readVarint());
  }

  readString() {
    const end = this.readVarint() + this.pos;
    const bytes = this.buf.subarray(this.pos, end);
    this.pos = end;
    if (utf8Decoder) return utf8Decoder.decode(bytes);
    let encoded = '';
    for (const byte of bytes) encoded += `%${byte.toString(16).padStart(2, '0')}`;
    return decodeURIComponent(encoded);
  }

  readBytes() {
    const end = this.readVarint() + this.pos;
    const value = this.buf.subarray(this.pos, end);
    this.pos = end;
    return value;
  }

  readPackedVarint(values = [], signed) {
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readVarint(signed));
    return values;
  }

  readPackedSVarint(values = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readSVarint());
    return values;
  }

  readPackedBoolean(values = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readBoolean());
    return values;
  }

  readPackedFloat(values = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readFloat());
    return values;
  }

  readPackedDouble(values = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readDouble());
    return values;
  }

  readPackedFixed32(values = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readFixed32());
    return values;
  }

  readPackedSFixed32(values = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readSFixed32());
    return values;
  }

  readPackedFixed64(values = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readFixed64());
    return values;
  }

  readPackedSFixed64(values = []) {
    const end = this.readPackedEnd();
    while (this.pos < end) values.push(this.readSFixed64());
    return values;
  }

  readPackedEnd() {
    return this.type === PBF_BYTES ? this.readVarint() + this.pos : this.pos + 1;
  }

  nextField(end = this.length) {
    if (this.pos === this._valueStart) this.skip(this.type);
    if (this.pos >= end) return 0;
    const tag = this.readVarint();
    this.type = tag & 7;
    this._valueStart = this.pos;
    return tag >>> 3;
  }

  skip(tag) {
    const type = tag & 7;
    if (type === PBF_VARINT) {
      while (this.buf[this.pos++] > 0x7f) {}
    } else if (type === PBF_BYTES) {
      const length = this.readVarint();
      this.pos += length;
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
  constructor(buffer = new Uint8Array(16)) {
    this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
    this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    this.pos = 0;
    this.length = this.buf.length;
  }

  writeTag(field, type) {
    this.writeVarint((field << 3) | type);
  }

  realloc(minimum) {
    const required = this.pos + minimum;
    if (required <= this.length) return;
    let length = this.length || 16;
    while (length < required) length *= 2;
    const buffer = new Uint8Array(length);
    buffer.set(this.buf);
    this.buf = buffer;
    this.length = length;
    this.dataView = new DataView(buffer.buffer);
  }

  finish() {
    this.length = this.pos;
    this.pos = 0;
    return this.buf.subarray(0, this.length);
  }

  writeVarint(value) {
    let integer = BigInt(Math.trunc(value));
    if (integer < 0) integer += TWO_64;
    this.realloc(10);
    do {
      let byte = Number(integer & 0x7fn);
      integer >>= 7n;
      if (integer) byte |= 0x80;
      this.buf[this.pos++] = byte;
    } while (integer);
  }

  writeSVarint(value) {
    this.writeVarint(value < 0 ? -value * 2 - 1 : value * 2);
  }

  writeBoolean(value) {
    this.writeVarint(Boolean(value));
  }

  writeString(value) {
    const bytes = utf8Encoder ? utf8Encoder.encode(value) : encodeUtf8(value);
    this.writeVarint(bytes.length);
    this.realloc(bytes.length);
    this.buf.set(bytes, this.pos);
    this.pos += bytes.length;
  }

  writeFloat(value) {
    this.realloc(4);
    this.dataView.setFloat32(this.pos, value, true);
    this.pos += 4;
  }

  writeDouble(value) {
    this.realloc(8);
    this.dataView.setFloat64(this.pos, value, true);
    this.pos += 8;
  }

  writeFixed32(value) {
    this.realloc(4);
    this.dataView.setUint32(this.pos, value, true);
    this.pos += 4;
  }

  writeSFixed32(value) {
    this.realloc(4);
    this.dataView.setInt32(this.pos, value, true);
    this.pos += 4;
  }

  writeFixed64(value) {
    this.realloc(8);
    this.dataView.setUint32(this.pos, value & -1, true);
    this.dataView.setUint32(this.pos + 4, Math.floor(value / 0x100000000), true);
    this.pos += 8;
  }

  writeSFixed64(value) {
    this.realloc(8);
    this.dataView.setUint32(this.pos, value & -1, true);
    this.dataView.setInt32(this.pos + 4, Math.floor(value / 0x100000000), true);
    this.pos += 8;
  }

  writeBytes(value) {
    this.writeVarint(value.length);
    this.realloc(value.length);
    this.buf.set(value, this.pos);
    this.pos += value.length;
  }

  writeRawMessage(writeMessage, value) {
    this.pos++;
    const messageStart = this.pos;
    writeMessage(value, this);
    const messageLength = this.pos - messageStart;
    if (messageLength >= 128) makeRoomForExtraLength(messageStart, messageLength, this);
    this.pos = messageStart - 1;
    this.writeVarint(messageLength);
    this.pos += messageLength;
  }

  writeMessage(field, writeMessage, value) {
    this.writeTag(field, PBF_BYTES);
    this.writeRawMessage(writeMessage, value);
  }

  writePackedVarint(field, values) { writePackedValues(this, field, values, 'writeVarint'); }
  writePackedSVarint(field, values) { writePackedValues(this, field, values, 'writeSVarint'); }
  writePackedBoolean(field, values) { writePackedValues(this, field, values, 'writeBoolean'); }
  writePackedFloat(field, values) { writePackedValues(this, field, values, 'writeFloat'); }
  writePackedDouble(field, values) { writePackedValues(this, field, values, 'writeDouble'); }
  writePackedFixed32(field, values) { writePackedValues(this, field, values, 'writeFixed32'); }
  writePackedSFixed32(field, values) { writePackedValues(this, field, values, 'writeSFixed32'); }
  writePackedFixed64(field, values) { writePackedValues(this, field, values, 'writeFixed64'); }
  writePackedSFixed64(field, values) { writePackedValues(this, field, values, 'writeSFixed64'); }

  writeBytesField(field, value) { writeField(this, field, PBF_BYTES, 'writeBytes', value); }
  writeVarintField(field, value) { writeField(this, field, PBF_VARINT, 'writeVarint', value); }
  writeSVarintField(field, value) { writeField(this, field, PBF_VARINT, 'writeSVarint', value); }
  writeStringField(field, value) { writeField(this, field, PBF_BYTES, 'writeString', value); }
  writeFloatField(field, value) { writeField(this, field, PBF_FIXED32, 'writeFloat', value); }
  writeDoubleField(field, value) { writeField(this, field, PBF_FIXED64, 'writeDouble', value); }
  writeBooleanField(field, value) { this.writeVarintField(field, value); }
  writeFixed32Field(field, value) { writeField(this, field, PBF_FIXED32, 'writeFixed32', value); }
  writeSFixed32Field(field, value) { writeField(this, field, PBF_FIXED32, 'writeSFixed32', value); }
  writeFixed64Field(field, value) { writeField(this, field, PBF_FIXED64, 'writeFixed64', value); }
  writeSFixed64Field(field, value) { writeField(this, field, PBF_FIXED64, 'writeSFixed64', value); }
}

function writePackedValues(writer, field, values, method) {
  if (!values.length) return;
  writer.writeMessage(field, (items, nestedWriter) => {
    for (const value of items) nestedWriter[method](value);
  }, values);
}

function writeField(writer, field, type, method, value) {
  writer.writeTag(field, type);
  writer[method](value);
}

function makeRoomForExtraLength(messageStart, messageLength, writer) {
  const extraLength = messageLength <= 0x3fff ? 1
    : messageLength <= 0x1fffff ? 2
      : messageLength <= 0xfffffff ? 3
        : Math.floor(Math.log(messageLength) / (Math.LN2 * 7));
  writer.realloc(extraLength);
  writer.buf.copyWithin(messageStart + extraLength, messageStart, writer.pos);
}

function encodeUtf8(value) {
  const encoded = unescape(encodeURIComponent(value));
  const bytes = new Uint8Array(encoded.length);
  for (let index = 0; index < encoded.length; index++) bytes[index] = encoded.charCodeAt(index);
  return bytes;
}

export { PbfReader, PbfWriter };
