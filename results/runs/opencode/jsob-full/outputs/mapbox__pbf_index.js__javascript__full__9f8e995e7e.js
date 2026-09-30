const VARINT = 0;
const FIXED64 = 1;
const BYTES = 2;
const FIXED32 = 5;
const TWO_32 = 0x100000000;
const textDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");

class PbfReader {
  constructor(buffer) {
    this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
    this.pos = 0;
    this.type = 0;
    this.length = this.buf.length;
    this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
  }

  readFields(readField, result, end = this.length) {
    while (this.pos < end) {
      const tag = this.readVarint();
      const field = tag >> 3;
      this.type = tag & 7;
      const start = this.pos;
      readField(field, result, this);
      if (this.pos === start) this.skip(tag);
    }
    return result;
  }

  readMessage(readField, result) {
    const length = this.readVarint();
    return this.readFields(readField, result, this.pos + length);
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
    const low = this.readFixed32();
    const high = this.readFixed32();
    return high * TWO_32 + low;
  }

  readSFixed64() {
    const low = this.readFixed32();
    const high = this.readSFixed32();
    return high * TWO_32 + low;
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
      if (this.pos >= this.length || shift > 63n) throw new Error("Expected varint not more than 10 bytes");
      byte = this.buf[this.pos++];
      value |= BigInt(byte & 0x7f) << shift;
      shift += 7n;
    } while (byte & 0x80);

    if (signed && value & (1n << 63n)) value -= 1n << 64n;
    return Number(value);
  }

  readVarint64() {
    return this.readVarint(true);
  }

  readSVarint() {
    const value = BigInt(this.readVarint());
    return Number((value >> 1n) ^ -(value & 1n));
  }

  readBoolean() {
    return Boolean(this.readVarint());
  }

  readString() {
    const length = this.readVarint();
    const end = this.pos + length;
    const bytes = this.buf.subarray(this.pos, end);
    this.pos = end;
    if (textDecoder && bytes.length >= 12) return textDecoder.decode(bytes);

    let encoded = "";
    for (const byte of bytes) encoded += `%${byte.toString(16).padStart(2, "0")}`;
    try {
      return decodeURIComponent(encoded);
    } catch {
      let result = "";
      for (const byte of bytes) result += String.fromCharCode(byte);
      return result;
    }
  }

  readBytes() {
    const length = this.readVarint();
    const end = this.pos + length;
    const value = this.buf.subarray(this.pos, end);
    this.pos = end;
    return value;
  }

  readPackedVarint(output = [], signed = false) {
    return this._readPacked(output, () => this.readVarint(signed));
  }

  readPackedSVarint(output = []) {
    return this._readPacked(output, () => this.readSVarint());
  }

  readPackedBoolean(output = []) {
    return this._readPacked(output, () => this.readBoolean());
  }

  readPackedFloat(output = []) {
    return this._readPacked(output, () => this.readFloat());
  }

  readPackedDouble(output = []) {
    return this._readPacked(output, () => this.readDouble());
  }

  readPackedFixed32(output = []) {
    return this._readPacked(output, () => this.readFixed32());
  }

  readPackedSFixed32(output = []) {
    return this._readPacked(output, () => this.readSFixed32());
  }

  readPackedFixed64(output = []) {
    return this._readPacked(output, () => this.readFixed64());
  }

  readPackedSFixed64(output = []) {
    return this._readPacked(output, () => this.readSFixed64());
  }

  _readPacked(output, readValue) {
    if (this.type !== BYTES) {
      output.push(readValue());
      return output;
    }
    const length = this.readVarint();
    const end = this.pos + length;
    while (this.pos < end) output.push(readValue());
    return output;
  }

  skip(tag) {
    const type = tag & 7;
    if (type === VARINT) {
      while (this.buf[this.pos++] & 0x80) {}
    } else if (type === FIXED64) {
      this.pos += 8;
    } else if (type === BYTES) {
      this.pos += this.readVarint();
    } else if (type === FIXED32) {
      this.pos += 4;
    } else {
      throw new Error(`Unimplemented type: ${type}`);
    }
  }
}

class PbfWriter {
  constructor(buffer = new Uint8Array(16)) {
    this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
    this.pos = 0;
    this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
  }

  finish() {
    this.buf = this.buf.subarray(0, this.pos);
    this.pos = 0;
    return this.buf;
  }

  realloc(minimum = 0) {
    let length = this.buf.length || 16;
    while (length < this.pos + minimum) length *= 2;
    if (length !== this.buf.length) {
      const next = new Uint8Array(length);
      next.set(this.buf);
      this.buf = next;
      this.dataView = new DataView(next.buffer);
    }
  }

  writeTag(tag, type) {
    this.writeVarint((tag << 3) | type);
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
    const integer = BigInt(Math.trunc(value));
    this.writeFixed32(Number(integer & 0xffffffffn));
    this.writeFixed32(Number((integer >> 32n) & 0xffffffffn));
  }

  writeSFixed64(value) {
    this.writeFixed64(value);
  }

  writeVarint(value) {
    let integer = BigInt(Math.trunc(value));
    if (integer < 0) integer = BigInt.asUintN(64, integer);
    this._writeUnsignedVarint(integer);
  }

  writeSVarint(value) {
    const integer = BigInt(Math.trunc(value));
    this._writeUnsignedVarint((integer << 1n) ^ (integer >> 63n));
  }

  writeBoolean(value) {
    this.writeVarint(Boolean(value));
  }

  writeString(value) {
    const bytes = encodeUtf8(value);
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

  writeBytes(value) {
    this.writeVarint(value.length);
    this.realloc(value.length);
    this.buf.set(value, this.pos);
    this.pos += value.length;
  }

  writeRawMessage(writeMessage, value) {
    const lengthPosition = this.pos;
    this.writeVarint(0);
    const messagePosition = this.pos;
    writeMessage(value, this);
    const length = this.pos - messagePosition;
    const encodedLength = varintLength(length);

    if (encodedLength > 1) {
      this.realloc(encodedLength - 1);
      this.buf.copyWithin(messagePosition + encodedLength - 1, messagePosition, this.pos);
      this.pos += encodedLength - 1;
    }
    this.pos = lengthPosition;
    this.writeVarint(length);
    this.pos = messagePosition + length + encodedLength - 1;
  }

  writeMessage(tag, writeMessage, value) {
    this.writeTag(tag, BYTES);
    this.writeRawMessage(writeMessage, value);
  }

  writePackedVarint(tag, values) {
    this._writePacked(tag, values, this.writeVarint);
  }

  writePackedSVarint(tag, values) {
    this._writePacked(tag, values, this.writeSVarint);
  }

  writePackedBoolean(tag, values) {
    this._writePacked(tag, values, this.writeBoolean);
  }

  writePackedFloat(tag, values) {
    this._writePacked(tag, values, this.writeFloat);
  }

  writePackedDouble(tag, values) {
    this._writePacked(tag, values, this.writeDouble);
  }

  writePackedFixed32(tag, values) {
    this._writePacked(tag, values, this.writeFixed32);
  }

  writePackedSFixed32(tag, values) {
    this._writePacked(tag, values, this.writeSFixed32);
  }

  writePackedFixed64(tag, values) {
    this._writePacked(tag, values, this.writeFixed64);
  }

  writePackedSFixed64(tag, values) {
    this._writePacked(tag, values, this.writeSFixed64);
  }

  _writePacked(tag, values, writeValue) {
    if (!values.length) return;
    this.writeTag(tag, BYTES);
    this.writeRawMessage((items, writer) => {
      for (const item of items) writeValue.call(writer, item);
    }, values);
  }

  _writeUnsignedVarint(integer) {
    this.realloc(10);
    while (integer > 0x7fn) {
      this.buf[this.pos++] = Number(integer & 0x7fn) | 0x80;
      integer >>= 7n;
    }
    this.buf[this.pos++] = Number(integer);
  }
}

const writerFieldMethods = {
  Varint: [VARINT, "writeVarint"],
  SVarint: [VARINT, "writeSVarint"],
  Boolean: [VARINT, "writeBoolean"],
  String: [BYTES, "writeString"],
  Float: [FIXED32, "writeFloat"],
  Double: [FIXED64, "writeDouble"],
  Bytes: [BYTES, "writeBytes"],
  Fixed32: [FIXED32, "writeFixed32"],
  SFixed32: [FIXED32, "writeSFixed32"],
  Fixed64: [FIXED64, "writeFixed64"],
  SFixed64: [FIXED64, "writeSFixed64"],
};

for (const [name, [wireType, method]] of Object.entries(writerFieldMethods)) {
  PbfWriter.prototype[`write${name}Field`] = function writeField(tag, value) {
    this.writeTag(tag, wireType);
    this[method](value);
  };
}

function varintLength(value) {
  if (value < 0x80) return 1;
  if (value < 0x4000) return 2;
  if (value < 0x200000) return 3;
  if (value < 0x10000000) return 4;
  return Math.ceil(Math.log2(value + 1) / 7);
}

function encodeUtf8(value) {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(value);
  const encoded = unescape(encodeURIComponent(value));
  const bytes = new Uint8Array(encoded.length);
  for (let index = 0; index < encoded.length; index++) bytes[index] = encoded.charCodeAt(index);
  return bytes;
}

export { PbfReader, PbfWriter };
