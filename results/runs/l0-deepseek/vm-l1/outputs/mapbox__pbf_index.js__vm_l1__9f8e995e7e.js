const SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
const TEXT_DECODER_MIN_LENGTH = 12;
const utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8');
const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;

class PbfReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    this.pos = 0;
  }

  readByte() {
    return this.buffer[this.pos++];
  }

  readUint16() {
    const value = this.view.getUint16(this.pos, true);
    this.pos += 2;
    return value;
  }

  readUint32() {
    const value = this.view.getUint32(this.pos, true);
    this.pos += 4;
    return value;
  }

  readInt32() {
    const value = this.view.getInt32(this.pos, true);
    this.pos += 4;
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

  readVarint() {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = this.readByte();
      result |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte >= 0x80);
    return result >>> 0;
  }

  readSVarint() {
    const value = this.readVarint();
    return (value >>> 1) ^ -(value & 1);
  }

  readBoolean() {
    return this.readVarint() !== 0;
  }

  readString() {
    const length = this.readVarint();
    const start = this.pos;
    this.pos += length;
    if (utf8TextDecoder && length >= TEXT_DECODER_MIN_LENGTH) {
      return utf8TextDecoder.decode(this.buffer.subarray(start, this.pos));
    }
    let result = '';
    let i = start;
    const end = this.pos;
    while (i < end) {
      const byte = this.buffer[i++];
      if (byte < 0x80) {
        result += String.fromCharCode(byte);
      } else if (byte < 0xe0) {
        result += String.fromCharCode(((byte & 0x1f) << 6) | (this.buffer[i++] & 0x3f));
      } else if (byte < 0xf0) {
        result += String.fromCharCode(
          ((byte & 0x0f) << 12) |
            ((this.buffer[i++] & 0x3f) << 6) |
            (this.buffer[i++] & 0x3f)
        );
      } else {
        let code =
          ((byte & 0x07) << 18) |
          ((this.buffer[i++] & 0x3f) << 12) |
          ((this.buffer[i++] & 0x3f) << 6) |
          (this.buffer[i++] & 0x3f);
        code -= 0x10000;
        result += String.fromCharCode((code >> 10) + 0xd800, (code & 0x3ff) + 0xdc00);
      }
    }
    return result;
  }

  readBytes() {
    const length = this.readVarint();
    const start = this.pos;
    this.pos += length;
    return this.buffer.subarray(start, this.pos);
  }

  readPackedVarint() {
    const length = this.readVarint();
    const end = this.pos + length;
    const result = [];
    while (this.pos < end) {
      result.push(this.readVarint());
    }
    return result;
  }

  readPackedSVarint() {
    const length = this.readVarint();
    const end = this.pos + length;
    const result = [];
    while (this.pos < end) {
      result.push(this.readSVarint());
    }
    return result;
  }

  readPackedBoolean() {
    const length = this.readVarint();
    const end = this.pos + length;
    const result = [];
    while (this.pos < end) {
      result.push(this.readBoolean());
    }
    return result;
  }

  readPackedFloat() {
    const length = this.readVarint();
    const end = this.pos + length;
    const result = [];
    while (this.pos < end) {
      result.push(this.readFloat());
    }
    return result;
  }

  readPackedDouble() {
    const length = this.readVarint();
    const end = this.pos + length;
    const result = [];
    while (this.pos < end) {
      result.push(this.readDouble());
    }
    return result;
  }

  readPackedFixed32() {
    const length = this.readVarint();
    const end = this.pos + length;
    const result = [];
    while (this.pos < end) {
      result.push(this.readUint32());
    }
    return result;
  }

  readPackedSFixed32() {
    const length = this.readVarint();
    const end = this.pos + length;
    const result = [];
    while (this.pos < end) {
      result.push(this.readInt32());
    }
    return result;
  }

  readPackedFixed64() {
    const length = this.readVarint();
    const end = this.pos + length;
    const result = [];
    while (this.pos < end) {
      result.push(this.readDouble());
    }
    return result;
  }

  readPackedSFixed64() {
    const length = this.readVarint();
    const end = this.pos + length;
    const result = [];
    while (this.pos < end) {
      result.push(this.readDouble());
    }
    return result;
  }

  skip(type) {
    switch (type) {
      case PBF_VARINT:
        this.readVarint();
        break;
      case PBF_FIXED64:
        this.pos += 8;
        break;
      case PBF_BYTES:
        this.pos += this.readVarint();
        break;
      case PBF_FIXED32:
        this.pos += 4;
        break;
      default:
        throw new Error('Unknown field type ' + type);
    }
  }

  readFields(callback) {
    while (this.pos < this.buffer.length) {
      const tag = this.readVarint();
      const fieldNumber = tag >>> 3;
      const wireType = tag & 0x7;
      callback(fieldNumber, wireType, this);
    }
  }
}

class PbfWriter {
  constructor() {
    this.buffer = new Uint8Array(64);
    this.pos = 0;
  }

  ensureCapacity(extra) {
    if (this.pos + extra > this.buffer.length) {
      const newLength = Math.max(this.buffer.length * 2, this.pos + extra);
      const newBuffer = new Uint8Array(newLength);
      newBuffer.set(this.buffer);
      this.buffer = newBuffer;
    }
  }

  writeByte(value) {
    this.ensureCapacity(1);
    this.buffer[this.pos++] = value;
  }

  writeVarint(value) {
    value = value >>> 0;
    while (value >= 0x80) {
      this.writeByte((value & 0x7f) | 0x80);
      value >>>= 7;
    }
    this.writeByte(value);
  }

  writeSVarint(value) {
    this.writeVarint((value << 1) ^ (value >> 31));
  }

  writeBoolean(value) {
    this.writeVarint(value ? 1 : 0);
  }

  writeString(value) {
    const bytes = new TextEncoder().encode(value);
    this.writeVarint(bytes.length);
    this.ensureCapacity(bytes.length);
    this.buffer.set(bytes, this.pos);
    this.pos += bytes.length;
  }

  writeBytes(value) {
    this.writeVarint(value.length);
    this.ensureCapacity(value.length);
    this.buffer.set(value, this.pos);
    this.pos += value.length;
  }

  writeFloat(value) {
    this.ensureCapacity(4);
    new DataView(this.buffer.buffer).setFloat32(this.pos, value, true);
    this.pos += 4;
  }

  writeDouble(value) {
    this.ensureCapacity(8);
    new DataView(this.buffer.buffer).setFloat64(this.pos, value, true);
    this.pos += 8;
  }

  writeFixed32(value) {
    this.ensureCapacity(4);
    new DataView(this.buffer.buffer).setUint32(this.pos, value, true);
    this.pos += 4;
  }

  writeSFixed32(value) {
    this.ensureCapacity(4);
    new DataView(this.buffer.buffer).setInt32(this.pos, value, true);
    this.pos += 4;
  }

  writeFixed64(value) {
    this.writeDouble(value);
  }

  writeSFixed64(value) {
    this.writeDouble(value);
  }

  writeTag(fieldNumber, wireType) {
    this.writeVarint((fieldNumber << 3) | wireType);
  }

  writeVarintField(fieldNumber, value) {
    this.writeTag(fieldNumber, PBF_VARINT);
    this.writeVarint(value);
  }

  writeSVarintField(fieldNumber, value) {
    this.writeTag(fieldNumber, PBF_VARINT);
    this.writeSVarint(value);
  }

  writeBooleanField(fieldNumber, value) {
    this.writeTag(fieldNumber, PBF_VARINT);
    this.writeBoolean(value);
  }

  writeStringField(fieldNumber, value) {
    this.writeTag(fieldNumber, PBF_BYTES);
    this.writeString(value);
  }

  writeBytesField(fieldNumber, value) {
    this.writeTag(fieldNumber, PBF_BYTES);
    this.writeBytes(value);
  }

  writeFloatField(fieldNumber, value) {
    this.writeTag(fieldNumber, PBF_FIXED32);
    this.writeFloat(value);
  }

  writeDoubleField(fieldNumber, value) {
    this.writeTag(fieldNumber, PBF_FIXED64);
    this.writeDouble(value);
  }

  writeFixed32Field(fieldNumber, value) {
    this.writeTag(fieldNumber, PBF_FIXED32);
    this.writeFixed32(value);
  }

  writeSFixed32Field(fieldNumber, value) {
    this.writeTag(fieldNumber, PBF_FIXED32);
    this.writeSFixed32(value);
  }

  writeFixed64Field(fieldNumber, value) {
    this.writeTag(fieldNumber, PBF_FIXED64);
    this.writeFixed64(value);
  }

  writeSFixed64Field(fieldNumber, value) {
    this.writeTag(fieldNumber, PBF_FIXED64);
    this.writeSFixed64(value);
  }

  writePackedVarint(fieldNumber, values) {
    this.writeTag(fieldNumber, PBF_BYTES);
    const start = this.pos;
    this.writeVarint(0);
    for (const value of values) {
      this.writeVarint(value);
    }
    const length = this.pos - start - 1;
    this.buffer[start] = length;
  }

  writePackedSVarint(fieldNumber, values) {
    this.writeTag(fieldNumber, PBF_BYTES);
    const start = this.pos;
    this.writeVarint(0);
    for (const value of values) {
      this.writeSVarint(value);
    }
    const length = this.pos - start - 1;
    this.buffer[start] = length;
  }

  writePackedBoolean(fieldNumber, values) {
    this.writeTag(fieldNumber, PBF_BYTES);
    const start = this.pos;
    this.writeVarint(0);
    for (const value of values) {
      this.writeBoolean(value);
    }
    const length = this.pos - start - 1;
    this.buffer[start] = length;
  }

  writePackedFloat(fieldNumber, values) {
    this.writeTag(fieldNumber, PBF_BYTES);
    const start = this.pos;
    this.writeVarint(0);
    for (const value of values) {
      this.writeFloat(value);
    }
    const length = this.pos - start - 1;
    this.buffer[start] = length;
  }

  writePackedDouble(fieldNumber, values) {
    this.writeTag(fieldNumber, PBF_BYTES);
    const start = this.pos;
    this.writeVarint(0);
    for (const value of values) {
      this.writeDouble(value);
    }
    const length = this.pos - start - 1;
    this.buffer[start] = length;
  }

  writePackedFixed32(fieldNumber, values) {
    this.writeTag(fieldNumber, PBF_BYTES);
    const start = this.pos;
    this.writeVarint(0);
    for (const value of values) {
      this.writeFixed32(value);
    }
    const length = this.pos - start - 1;
    this.buffer[start] = length;
  }

  writePackedSFixed32(fieldNumber, values) {
    this.writeTag(fieldNumber, PBF_BYTES);
    const start = this.pos;
    this.writeVarint(0);
    for (const value of values) {
      this.writeSFixed32(value);
    }
    const length = this.pos - start - 1;
    this.buffer[start] = length;
  }

  writePackedFixed64(fieldNumber, values) {
    this.writeTag(fieldNumber, PBF_BYTES);
    const start = this.pos;
    this.writeVarint(0);
    for (const value of values) {
      this.writeFixed64(value);
    }
    const length = this.pos - start - 1;
    this.buffer[start] = length;
  }

  writePackedSFixed64(fieldNumber, values) {
    this.writeTag(fieldNumber, PBF_BYTES);
    const start = this.pos;
    this.writeVarint(0);
    for (const value of values) {
      this.writeSFixed64(value);
    }
    const length = this.pos - start - 1;
    this.buffer[start] = length;
  }

  finish() {
    return this.buffer.subarray(0, this.pos);
  }
}

export { PbfReader, PbfWriter };
