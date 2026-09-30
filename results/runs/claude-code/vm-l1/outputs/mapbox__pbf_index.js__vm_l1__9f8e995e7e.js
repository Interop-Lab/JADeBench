const VARINT = 0;
const FIXED64 = 1;
const BYTES = 2;
const FIXED32 = 5;
const TWO_TO_32 = 0x100000000;

const utf8Decoder =
  typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");

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
      const value = this.readVarint();
      const tag = value >> 3;
      const start = this.pos;
      this.type = value & 7;
      readField(tag, result, this);
      if (this.pos === start) this.skip(value);
    }
    return result;
  }

  readMessage(readField, result) {
    return this.readFields(readField, result, this.readVarint() + this.pos);
  }

  readFixed32() {
    const value = readUint32(this.buf, this.pos);
    this.pos += 4;
    return value;
  }

  readSFixed32() {
    return this.readFixed32() | 0;
  }

  readFixed64() {
    const low = this.readFixed32();
    const high = this.readFixed32();
    return high * TWO_TO_32 + low;
  }

  readSFixed64() {
    const low = this.readFixed32();
    const high = this.readSFixed32();
    return high * TWO_TO_32 + low;
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

  readVarint(signed = false) {
    let value = 0n;
    let shift = 0n;

    for (let byteIndex = 0; byteIndex < 10; byteIndex++) {
      const byte = this.buf[this.pos++];
      value |= BigInt(byte & 0x7f) << shift;
      if (byte < 0x80) {
        if (signed && value >= 0x8000000000000000n) value -= 0x10000000000000000n;
        return Number(value);
      }
      shift += 7n;
    }

    throw new Error("Expected a valid varint");
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
    return this.readPacked(this.readVarint);
  }

  readPackedSVarint() {
    return this.readPacked(this.readSVarint);
  }

  readPackedBoolean() {
    return this.readPacked(this.readBoolean);
  }

  readPackedFloat() {
    return this.readPacked(this.readFloat);
  }

  readPackedDouble() {
    return this.readPacked(this.readDouble);
  }

  readPackedFixed32() {
    return this.readPacked(this.readFixed32);
  }

  readPackedSFixed32() {
    return this.readPacked(this.readSFixed32);
  }

  readPackedFixed64() {
    return this.readPacked(this.readFixed64);
  }

  readPackedSFixed64() {
    return this.readPacked(this.readSFixed64);
  }

  readPacked(readValue) {
    const end = this.readPackedEnd();
    const values = [];
    while (this.pos < end) values.push(readValue.call(this));
    return values;
  }

  readPackedEnd() {
    return this.type === BYTES ? this.readVarint() + this.pos : this.pos + 1;
  }

  nextField() {
    const value = this.readVarint();
    this.type = value & 7;
    return value >> 3;
  }

  skip(value) {
    const type = value & 7;

    if (type === VARINT) {
      while (this.buf[this.pos++] > 0x7f) {}
    } else if (type === BYTES) {
      this.pos = this.readVarint() + this.pos;
    } else if (type === FIXED32) {
      this.pos += 4;
    } else if (type === FIXED64) {
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
    this.length = 16;
  }

  writeTag(tag, type) {
    this.writeVarint((tag << 3) | type);
  }

  realloc(minimumBytes) {
    if (this.pos + minimumBytes <= this.length) return;

    let length = this.length;
    while (length < this.pos + minimumBytes) length *= 2;
    const buffer = new Uint8Array(length);
    buffer.set(this.buf);
    this.buf = buffer;
    this.length = length;
  }

  finish() {
    this.length = this.pos;
    this.pos = 0;
    return this.buf.subarray(0, this.length);
  }

  writeFixed32(value) {
    this.realloc(4);
    writeUint32(this.buf, this.pos, value);
    this.pos += 4;
  }

  writeSFixed32(value) {
    this.writeFixed32(value);
  }

  writeFixed64(value) {
    this.writeFixed32(value);
    this.writeFixed32(Math.floor(value / TWO_TO_32));
  }

  writeSFixed64(value) {
    this.writeFixed64(value);
  }

  writeVarint(value) {
    let integer = BigInt(Math.trunc(value));
    if (integer < 0) integer = BigInt.asUintN(64, integer);

    this.realloc(10);
    while (integer > 0x7fn) {
      this.buf[this.pos++] = Number(integer & 0x7fn) | 0x80;
      integer >>= 7n;
    }
    this.buf[this.pos++] = Number(integer);
  }

  writeSVarint(value) {
    this.writeVarint(value < 0 ? -value * 2 - 1 : value * 2);
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
    new DataView(this.buf.buffer).setFloat32(this.pos, value, true);
    this.pos += 4;
  }

  writeDouble(value) {
    this.realloc(8);
    new DataView(this.buf.buffer).setFloat64(this.pos, value, true);
    this.pos += 8;
  }

  writeBytes(buffer) {
    const bytes = ArrayBuffer.isView(buffer)
      ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
      : new Uint8Array(buffer);
    this.writeVarint(bytes.length);
    this.realloc(bytes.length);
    this.buf.set(bytes, this.pos);
    this.pos += bytes.length;
  }

  writeRawMessage(writeMessage, message) {
    const lengthPosition = this.pos;
    this.pos++;
    writeMessage(message, this);

    const messageLength = this.pos - lengthPosition - 1;
    if (messageLength >= 0x80) {
      const extraBytes = varintLength(messageLength) - 1;
      this.realloc(extraBytes);
      this.buf.copyWithin(
        lengthPosition + 1 + extraBytes,
        lengthPosition + 1,
        this.pos,
      );
      this.pos += extraBytes;
    }

    const end = this.pos;
    this.pos = lengthPosition;
    this.writeVarint(messageLength);
    this.pos = end;
  }

  writeMessage(tag, writeMessage, message) {
    this.writeTag(tag, BYTES);
    this.writeRawMessage(writeMessage, message);
  }

  writePackedVarint(tag, values) {
    this.writePacked(tag, values, this.writeVarint);
  }

  writePackedSVarint(tag, values) {
    this.writePacked(tag, values, this.writeSVarint);
  }

  writePackedBoolean(tag, values) {
    this.writePacked(tag, values, this.writeBoolean);
  }

  writePackedFloat(tag, values) {
    this.writePacked(tag, values, this.writeFloat);
  }

  writePackedDouble(tag, values) {
    this.writePacked(tag, values, this.writeDouble);
  }

  writePackedFixed32(tag, values) {
    this.writePacked(tag, values, this.writeFixed32);
  }

  writePackedSFixed32(tag, values) {
    this.writePacked(tag, values, this.writeSFixed32);
  }

  writePackedFixed64(tag, values) {
    this.writePacked(tag, values, this.writeFixed64);
  }

  writePackedSFixed64(tag, values) {
    this.writePacked(tag, values, this.writeSFixed64);
  }

  writePacked(tag, values, writeValue) {
    if (!values.length) return;
    this.writeTag(tag, BYTES);
    this.writeRawMessage((items, writer) => {
      for (const value of items) writeValue.call(writer, value);
    }, values);
  }

  writeBytesField(tag, value) {
    this.writeTag(tag, BYTES);
    this.writeBytes(value);
  }

  writeFixed32Field(tag, value) {
    this.writeTag(tag, FIXED32);
    this.writeFixed32(value);
  }

  writeSFixed32Field(tag, value) {
    this.writeTag(tag, FIXED32);
    this.writeSFixed32(value);
  }

  writeFixed64Field(tag, value) {
    this.writeTag(tag, FIXED64);
    this.writeFixed64(value);
  }

  writeSFixed64Field(tag, value) {
    this.writeTag(tag, FIXED64);
    this.writeSFixed64(value);
  }

  writeVarintField(tag, value) {
    this.writeTag(tag, VARINT);
    this.writeVarint(value);
  }

  writeSVarintField(tag, value) {
    this.writeTag(tag, VARINT);
    this.writeSVarint(value);
  }

  writeStringField(tag, value) {
    this.writeTag(tag, BYTES);
    this.writeString(value);
  }

  writeFloatField(tag, value) {
    this.writeTag(tag, FIXED32);
    this.writeFloat(value);
  }

  writeDoubleField(tag, value) {
    this.writeTag(tag, FIXED64);
    this.writeDouble(value);
  }

  writeBooleanField(tag, value) {
    this.writeVarintField(tag, Boolean(value));
  }
}

function readUint32(buffer, position) {
  return (
    buffer[position] |
    (buffer[position + 1] << 8) |
    (buffer[position + 2] << 16) |
    (buffer[position + 3] << 24)
  ) >>> 0;
}

function writeUint32(buffer, position, value) {
  buffer[position] = value;
  buffer[position + 1] = value >>> 8;
  buffer[position + 2] = value >>> 16;
  buffer[position + 3] = value >>> 24;
}

function varintLength(value) {
  let length = 1;
  while (value >= 0x80) {
    value = Math.floor(value / 0x80);
    length++;
  }
  return length;
}

function readUtf8(buffer, start, end) {
  const bytes = buffer.subarray(start, end);
  if (utf8Decoder) return utf8Decoder.decode(bytes);

  let encoded = "";
  for (const byte of bytes) encoded += `%${byte.toString(16).padStart(2, "0")}`;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return String.fromCharCode(...bytes);
  }
}

function encodeUtf8(value) {
  const bytes = [];
  for (let index = 0; index < value.length; index++) {
    let codePoint = value.charCodeAt(index);

    if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
      const low = value.charCodeAt(index + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        codePoint = ((codePoint - 0xd800) << 10) + low - 0xdc00 + 0x10000;
        index++;
      } else {
        codePoint = 0xfffd;
      }
    } else if (codePoint >= 0xdc00 && codePoint <= 0xdfff) {
      codePoint = 0xfffd;
    }

    if (codePoint < 0x80) {
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint < 0x10000) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }
  return Uint8Array.from(bytes);
}

export { PbfReader, PbfWriter };
