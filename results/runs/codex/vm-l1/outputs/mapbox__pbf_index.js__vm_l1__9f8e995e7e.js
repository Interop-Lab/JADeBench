const SHIFT_LEFT_32 = 0x100000000;
const TEXT_DECODER_MIN_LENGTH = 12;

const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;

const utf8TextDecoder = typeof TextDecoder === 'undefined'
  ? null
  : new TextDecoder('utf-8');

function dataView(bytes) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

class PbfReader {
  constructor(buffer) {
    this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer || 0);
    this.pos = 0;
    this.type = 0;
    this.length = this.buf.length;
  }

  readFields(readField, result, end = this.length) {
    while (this.pos < end) {
      const tagAndType = this.readVarint();
      const tag = tagAndType >> 3;
      const fieldStart = this.pos;

      this.type = tagAndType & 7;
      readField(tag, result, this);

      if (this.pos === fieldStart) this.skip(tagAndType);
    }

    return result;
  }

  readMessage(readField, result) {
    return this.readFields(readField, result, this.readVarint() + this.pos);
  }

  readFixed32() {
    const value = dataView(this.buf).getUint32(this.pos, true);
    this.pos += 4;
    return value;
  }

  readSFixed32() {
    const value = dataView(this.buf).getInt32(this.pos, true);
    this.pos += 4;
    return value;
  }

  readFixed64() {
    const view = dataView(this.buf);
    const value = view.getUint32(this.pos, true) +
      view.getUint32(this.pos + 4, true) * SHIFT_LEFT_32;
    this.pos += 8;
    return value;
  }

  readSFixed64() {
    const view = dataView(this.buf);
    const value = view.getUint32(this.pos, true) +
      view.getInt32(this.pos + 4, true) * SHIFT_LEFT_32;
    this.pos += 8;
    return value;
  }

  readFloat() {
    const value = dataView(this.buf).getFloat32(this.pos, true);
    this.pos += 4;
    return value;
  }

  readDouble() {
    const value = dataView(this.buf).getFloat64(this.pos, true);
    this.pos += 8;
    return value;
  }

  readVarint(isSigned = false) {
    let value = 0n;
    let shift = 0n;

    while (this.pos < this.length) {
      const byte = this.buf[this.pos++];
      value |= BigInt(byte & 0x7f) << shift;

      if (byte < 0x80) {
        if (isSigned && shift >= 63n && (value & (1n << 63n))) {
          value = BigInt.asIntN(64, value);
        }
        return Number(value);
      }

      shift += 7n;
      if (shift >= 70n) throw new Error('Expected varint not more than 10 bytes');
    }

    throw new Error('Expected varint not more than 10 bytes');
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
    return readPackedValues(this, () => this.readVarint());
  }

  readPackedSVarint() {
    return readPackedValues(this, () => this.readSVarint());
  }

  readPackedBoolean() {
    return readPackedValues(this, () => this.readBoolean());
  }

  readPackedFloat() {
    return readPackedValues(this, () => this.readFloat());
  }

  readPackedDouble() {
    return readPackedValues(this, () => this.readDouble());
  }

  readPackedFixed32() {
    return readPackedValues(this, () => this.readFixed32());
  }

  readPackedSFixed32() {
    return readPackedValues(this, () => this.readSFixed32());
  }

  readPackedFixed64() {
    return readPackedValues(this, () => this.readFixed64());
  }

  readPackedSFixed64() {
    return readPackedValues(this, () => this.readSFixed64());
  }

  readPackedEnd() {
    return this.type === PBF_BYTES ? this.readVarint() + this.pos : this.pos + 1;
  }

  nextField() {
    if (this.pos >= this.length) return false;

    const tagAndType = this.readVarint();
    this.type = tagAndType & 7;
    this.tag = tagAndType >> 3;
    return true;
  }

  skip(tagAndType) {
    const type = tagAndType & 7;

    if (type === PBF_VARINT) {
      while (this.buf[this.pos++] > 0x7f) {
      }
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
    dataView(this.buf).setUint32(this.pos, value, true);
    this.pos += 4;
  }

  writeSFixed32(value) {
    this.realloc(4);
    dataView(this.buf).setInt32(this.pos, value, true);
    this.pos += 4;
  }

  writeFixed64(value) {
    write64BitParts(this, value, false);
  }

  writeSFixed64(value) {
    write64BitParts(this, value, true);
  }

  writeVarint(value) {
    value = Number(value);
    if (!Number.isFinite(value) ||
        value > Number.MAX_SAFE_INTEGER ||
        value < Number.MIN_SAFE_INTEGER) {
      throw new Error(`Given varint doesn't fit into 10 bytes`);
    }

    let remaining = BigInt(Math.trunc(value));
    if (remaining < 0n) remaining = BigInt.asUintN(64, remaining);

    this.realloc(10);
    while (remaining > 0x7fn) {
      this.buf[this.pos++] = Number(remaining & 0x7fn) | 0x80;
      remaining >>= 7n;
    }
    this.buf[this.pos++] = Number(remaining);
  }

  writeSVarint(value) {
    this.writeVarint(value < 0 ? -value * 2 - 1 : value * 2);
  }

  writeBoolean(value) {
    this.writeVarint(Boolean(value));
  }

  writeString(value) {
    const maximumLength = value.length * 4;
    this.realloc(maximumLength + 10);

    const lengthPosition = this.pos;
    this.pos += 10;
    const stringPosition = this.pos;
    this.pos = writeUtf8(this.buf, value, this.pos);
    const byteLength = this.pos - stringPosition;

    this.buf.copyWithin(lengthPosition + varintLength(byteLength), stringPosition, this.pos);
    this.pos = lengthPosition;
    this.writeVarint(byteLength);
    this.pos += byteLength;
  }

  writeFloat(value) {
    this.realloc(4);
    dataView(this.buf).setFloat32(this.pos, value, true);
    this.pos += 4;
  }

  writeDouble(value) {
    this.realloc(8);
    dataView(this.buf).setFloat64(this.pos, value, true);
    this.pos += 8;
  }

  writeBytes(buffer) {
    const bytes = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
    this.writeVarint(bytes.length);
    this.realloc(bytes.length);
    this.buf.set(bytes, this.pos);
    this.pos += bytes.length;
  }

  writeRawMessage(writeMessage, message) {
    this.pos++;
    const start = this.pos;
    writeMessage(message, this);
    const length = this.pos - start;

    if (length >= 0x80) makeRoomForExtraLength(this, start, length);
    this.pos = start - 1;
    this.writeVarint(length);
    this.pos += length;
  }

  writeMessage(tag, writeMessage, message) {
    this.writeTag(tag, PBF_BYTES);
    this.writeRawMessage(writeMessage, message);
  }

  writePackedVarint(tag, values) {
    writePacked(this, tag, values, writePackedVarint);
  }

  writePackedSVarint(tag, values) {
    writePacked(this, tag, values, writePackedSVarint);
  }

  writePackedBoolean(tag, values) {
    writePacked(this, tag, values, writePackedBoolean);
  }

  writePackedFloat(tag, values) {
    writePacked(this, tag, values, writePackedFloat);
  }

  writePackedDouble(tag, values) {
    writePacked(this, tag, values, writePackedDouble);
  }

  writePackedFixed32(tag, values) {
    writePacked(this, tag, values, writePackedFixed32);
  }

  writePackedSFixed32(tag, values) {
    writePacked(this, tag, values, writePackedSFixed32);
  }

  writePackedFixed64(tag, values) {
    writePacked(this, tag, values, writePackedFixed64);
  }

  writePackedSFixed64(tag, values) {
    writePacked(this, tag, values, writePackedSFixed64);
  }

  writeBytesField(tag, value) {
    this.writeTag(tag, PBF_BYTES);
    this.writeBytes(value);
  }

  writeFixed32Field(tag, value) {
    this.writeTag(tag, PBF_FIXED32);
    this.writeFixed32(value);
  }

  writeSFixed32Field(tag, value) {
    this.writeTag(tag, PBF_FIXED32);
    this.writeSFixed32(value);
  }

  writeFixed64Field(tag, value) {
    this.writeTag(tag, PBF_FIXED64);
    this.writeFixed64(value);
  }

  writeSFixed64Field(tag, value) {
    this.writeTag(tag, PBF_FIXED64);
    this.writeSFixed64(value);
  }

  writeVarintField(tag, value) {
    this.writeTag(tag, PBF_VARINT);
    this.writeVarint(value);
  }

  writeSVarintField(tag, value) {
    this.writeTag(tag, PBF_VARINT);
    this.writeSVarint(value);
  }

  writeStringField(tag, value) {
    this.writeTag(tag, PBF_BYTES);
    this.writeString(value);
  }

  writeFloatField(tag, value) {
    this.writeTag(tag, PBF_FIXED32);
    this.writeFloat(value);
  }

  writeDoubleField(tag, value) {
    this.writeTag(tag, PBF_FIXED64);
    this.writeDouble(value);
  }

  writeBooleanField(tag, value) {
    this.writeVarintField(tag, Boolean(value));
  }
}

function readPackedValues(reader, readValue) {
  const end = reader.readPackedEnd();
  const values = [];
  while (reader.pos < end) values.push(readValue());
  return values;
}

function write64BitParts(writer, value, signed) {
  writer.realloc(8);
  const view = dataView(writer.buf);
  const integer = BigInt(Math.trunc(value));
  const low = Number(BigInt.asUintN(32, integer));
  const highBits = integer >> 32n;
  view.setUint32(writer.pos, low, true);
  if (signed) view.setInt32(writer.pos + 4, Number(BigInt.asIntN(32, highBits)), true);
  else view.setUint32(writer.pos + 4, Number(BigInt.asUintN(32, highBits)), true);
  writer.pos += 8;
}

function writePacked(writer, tag, values, writeValues) {
  if (!values.length) return;
  writer.writeTag(tag, PBF_BYTES);
  writer.writeRawMessage(writeValues, values);
}

function makeRoomForExtraLength(writer, start, length) {
  const extraBytes = varintLength(length) - 1;
  writer.realloc(extraBytes);
  writer.buf.copyWithin(start + extraBytes, start, writer.pos);
}

function varintLength(value) {
  let length = 1;
  while (value >= 0x80) {
    value = Math.floor(value / 0x80);
    length++;
  }
  return length;
}

function writePackedVarint(values, writer) {
  for (const value of values) writer.writeVarint(value);
}

function writePackedSVarint(values, writer) {
  for (const value of values) writer.writeSVarint(value);
}

function writePackedBoolean(values, writer) {
  for (const value of values) writer.writeBoolean(value);
}

function writePackedFloat(values, writer) {
  for (const value of values) writer.writeFloat(value);
}

function writePackedDouble(values, writer) {
  for (const value of values) writer.writeDouble(value);
}

function writePackedFixed32(values, writer) {
  for (const value of values) writer.writeFixed32(value);
}

function writePackedSFixed32(values, writer) {
  for (const value of values) writer.writeSFixed32(value);
}

function writePackedFixed64(values, writer) {
  for (const value of values) writer.writeFixed64(value);
}

function writePackedSFixed64(values, writer) {
  for (const value of values) writer.writeSFixed64(value);
}

function readUtf8(buffer, start, end) {
  if (utf8TextDecoder && end - start >= TEXT_DECODER_MIN_LENGTH) {
    return utf8TextDecoder.decode(buffer.subarray(start, end));
  }

  let result = '';
  let index = start;
  while (index < end) {
    const first = buffer[index++];
    if (first < 0x80) {
      result += String.fromCharCode(first);
    } else if (first < 0xe0) {
      const second = buffer[index++];
      result += String.fromCharCode(((first & 0x1f) << 6) | (second & 0x3f));
    } else if (first < 0xf0) {
      const second = buffer[index++];
      const third = buffer[index++];
      result += String.fromCharCode(
        ((first & 0x0f) << 12) | ((second & 0x3f) << 6) | (third & 0x3f)
      );
    } else {
      const second = buffer[index++];
      const third = buffer[index++];
      const fourth = buffer[index++];
      let codePoint = ((first & 7) << 18) |
        ((second & 0x3f) << 12) |
        ((third & 0x3f) << 6) |
        (fourth & 0x3f);
      codePoint -= 0x10000;
      result += String.fromCharCode(
        0xd800 + (codePoint >> 10),
        0xdc00 + (codePoint & 0x3ff)
      );
    }
  }

  return result;
}

function writeUtf8(buffer, value, position) {
  for (let index = 0; index < value.length; index++) {
    let codePoint = value.charCodeAt(index);

    if (codePoint < 0x80) {
      buffer[position++] = codePoint;
    } else if (codePoint < 0x800) {
      buffer[position++] = 0xc0 | (codePoint >> 6);
      buffer[position++] = 0x80 | (codePoint & 0x3f);
    } else if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
      const trailing = value.charCodeAt(++index);
      codePoint = 0x10000 + ((codePoint & 0x3ff) << 10) + (trailing & 0x3ff);
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
