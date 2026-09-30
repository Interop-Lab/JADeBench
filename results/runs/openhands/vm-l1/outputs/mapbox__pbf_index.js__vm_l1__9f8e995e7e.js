const SHIFT_LEFT_32 = 0x100000000;
const MAX_UINT64 = 0x10000000000000000;
const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;

const utf8TextDecoder =
  typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");

class PbfReader {
  constructor(buffer) {
    this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer || 0);
    this.dataView = new DataView(
      this.buf.buffer,
      this.buf.byteOffset,
      this.buf.byteLength,
    );
    this.pos = 0;
    this.type = 0;
    this._valueStart = -1;
    this.length = this.buf.length;
  }

  readFields(readField, result, end = this.length) {
    while (this.pos < end) {
      const fieldHeader = this.readVarint();
      const tag = fieldHeader >> 3;
      this.type = fieldHeader & 7;
      this._valueStart = this.pos;
      readField(tag, result, this);
      if (this.pos === this._valueStart) this.skip(fieldHeader);
    }
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
    return high * SHIFT_LEFT_32 + low;
  }

  readSFixed64() {
    const low = this.dataView.getUint32(this.pos, true);
    const high = this.dataView.getInt32(this.pos + 4, true);
    this.pos += 8;
    return high * SHIFT_LEFT_32 + low;
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

  readVarint(isSigned) {
    let low = 0;
    let high = 0;

    for (let index = 0; index < 10; index++) {
      const byte = this.buf[this.pos++];
      const payload = byte & 0x7f;

      if (index < 4) {
        low |= payload << (index * 7);
      } else if (index === 4) {
        low |= (payload & 0x0f) << 28;
        high = payload >>> 4;
      } else if (index < 9) {
        high |= payload << (index * 7 - 32);
      } else {
        high |= (payload & 1) << 31;
      }

      if (byte < 0x80) {
        return (isSigned ? high | 0 : high >>> 0) * SHIFT_LEFT_32 + (low >>> 0);
      }
    }

    throw new Error("Expected varint not more than 10 bytes");
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
    return readPacked(this, "readVarint");
  }

  readPackedSVarint() {
    return readPacked(this, "readSVarint");
  }

  readPackedBoolean() {
    return readPacked(this, "readBoolean");
  }

  readPackedFloat() {
    return readPacked(this, "readFloat");
  }

  readPackedDouble() {
    return readPacked(this, "readDouble");
  }

  readPackedFixed32() {
    return readPacked(this, "readFixed32");
  }

  readPackedSFixed32() {
    return readPacked(this, "readSFixed32");
  }

  readPackedFixed64() {
    return readPacked(this, "readFixed64");
  }

  readPackedSFixed64() {
    return readPacked(this, "readSFixed64");
  }

  readPackedEnd() {
    return this.type === PBF_BYTES ? this.readVarint() + this.pos : this.pos + 1;
  }

  nextField() {
    if (this.pos >= this.length) return false;
    const fieldHeader = this.readVarint();
    const tag = fieldHeader >> 3;
    this.type = fieldHeader & 7;
    this._valueStart = this.pos;
    return tag;
  }

  skip(fieldHeader) {
    const type = fieldHeader & 7;

    if (type === PBF_VARINT) {
      while (this.buf[this.pos++] > 0x7f) {}
    } else if (type === PBF_BYTES) {
      this.pos = this.readVarint() + this.pos;
    } else if (type === PBF_FIXED32) {
      this.pos += 4;
    } else if (type === PBF_FIXED64) {
      this.pos += 8;
    } else {
      throw new Error("Unimplemented type: " + type);
    }
  }
}

class PbfWriter {
  constructor() {
    this.buf = new Uint8Array(16);
    this.dataView = new DataView(this.buf.buffer);
    this.pos = 0;
    this.length = 16;
  }

  writeTag(tag, type) {
    this.writeVarint((tag << 3) | type);
  }

  realloc(minimumBytes) {
    let length = this.length || 16;
    while (length < this.pos + minimumBytes) length *= 2;

    if (length !== this.length) {
      const buffer = new Uint8Array(length);
      buffer.set(this.buf);
      this.buf = buffer;
      this.length = length;
      this.dataView = new DataView(buffer.buffer);
    }
  }

  finish() {
    this.length = this.pos;
    this.pos = 0;
    return this.buf.subarray(0, this.length);
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
    this.dataView.setUint32(this.pos, value, true);
    this.dataView.setUint32(this.pos + 4, Math.floor(value / SHIFT_LEFT_32), true);
    this.pos += 8;
  }

  writeSFixed64(value) {
    this.realloc(8);
    this.dataView.setUint32(this.pos, value, true);
    this.dataView.setInt32(this.pos + 4, Math.floor(value / SHIFT_LEFT_32), true);
    this.pos += 8;
  }

  writeVarint(input) {
    const value = +input || 0;
    this.realloc(10);

    if (value >= 0 && value < 0x80) {
      this.buf[this.pos++] = value;
    } else if (value >= 0 && value < 0x4000) {
      this.buf[this.pos++] = (value & 0x7f) | 0x80;
      this.buf[this.pos++] = value >>> 7;
    } else if (value >= 0 && value < 0x200000) {
      this.buf[this.pos++] = (value & 0x7f) | 0x80;
      this.buf[this.pos++] = ((value >>> 7) & 0x7f) | 0x80;
      this.buf[this.pos++] = value >>> 14;
    } else if (value >= 0 && value < 0x10000000) {
      this.buf[this.pos++] = (value & 0x7f) | 0x80;
      this.buf[this.pos++] = ((value >>> 7) & 0x7f) | 0x80;
      this.buf[this.pos++] = ((value >>> 14) & 0x7f) | 0x80;
      this.buf[this.pos++] = value >>> 21;
    } else {
      writeBigVarint(value, this);
    }
  }

  writeSVarint(value) {
    this.writeVarint(value < 0 ? -value * 2 - 1 : value * 2);
  }

  writeBoolean(value) {
    this.writeVarint(+value);
  }

  writeString(value) {
    const bytes = encodeUtf8(String(value));
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

  writeBytes(bytes) {
    this.writeVarint(bytes.length);
    this.realloc(bytes.length);
    this.buf.set(bytes, this.pos);
    this.pos += bytes.length;
  }

  writeRawMessage(writeMessage, value) {
    this.realloc(1);
    const lengthPosition = this.pos++;
    const messageStart = this.pos;
    writeMessage(value, this);
    const messageLength = this.pos - messageStart;

    if (messageLength < 0x80) {
      this.buf[lengthPosition] = messageLength;
      return;
    }

    let prefixLength = 1;
    for (let length = messageLength; length >= 0x80; length /= 0x80) {
      prefixLength++;
    }
    const extraBytes = prefixLength - 1;
    const messageEnd = this.pos;
    this.realloc(extraBytes);
    this.buf.copyWithin(messageStart + extraBytes, messageStart, messageEnd);
    this.pos = lengthPosition;
    this.writeVarint(messageLength);
    this.pos = messageEnd + extraBytes;
  }

  writeMessage(tag, writeMessage, value) {
    this.writeTag(tag, PBF_BYTES);
    this.writeRawMessage(writeMessage, value);
  }

  writePackedVarint(tag, values) {
    writePacked(this, tag, values, "writeVarint");
  }

  writePackedSVarint(tag, values) {
    writePacked(this, tag, values, "writeSVarint");
  }

  writePackedBoolean(tag, values) {
    writePacked(this, tag, values, "writeBoolean");
  }

  writePackedFloat(tag, values) {
    writePacked(this, tag, values, "writeFloat");
  }

  writePackedDouble(tag, values) {
    writePacked(this, tag, values, "writeDouble");
  }

  writePackedFixed32(tag, values) {
    writePacked(this, tag, values, "writeFixed32");
  }

  writePackedSFixed32(tag, values) {
    writePacked(this, tag, values, "writeSFixed32");
  }

  writePackedFixed64(tag, values) {
    writePacked(this, tag, values, "writeFixed64");
  }

  writePackedSFixed64(tag, values) {
    writePacked(this, tag, values, "writeSFixed64");
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
    this.writeVarintField(tag, +value);
  }
}

function writeBigVarint(value, writer) {
  if (!Number.isFinite(value) || value >= MAX_UINT64 || value < -MAX_UINT64) {
    throw new Error("Given varint doesn't fit into 10 bytes");
  }

  let low;
  let high;
  if (value >= 0) {
    low = value % SHIFT_LEFT_32;
    high = value / SHIFT_LEFT_32;
  } else {
    low = ~(-value % SHIFT_LEFT_32);
    high = ~(-value / SHIFT_LEFT_32);
    if (low === -1) {
      low = 0;
      high = (high + 1) | 0;
    } else {
      low = (low + 1) | 0;
    }
  }

  writer.buf[writer.pos++] = (low & 0x7f) | 0x80;
  writer.buf[writer.pos++] = ((low >>> 7) & 0x7f) | 0x80;
  writer.buf[writer.pos++] = ((low >>> 14) & 0x7f) | 0x80;
  writer.buf[writer.pos++] = ((low >>> 21) & 0x7f) | 0x80;

  let remainingHigh = high >>> 0;
  let nextByte = (low >>> 28) | ((remainingHigh & 0x07) << 4);
  remainingHigh >>>= 3;
  while (remainingHigh) {
    writer.buf[writer.pos++] = nextByte | 0x80;
    nextByte = remainingHigh & 0x7f;
    remainingHigh >>>= 7;
  }
  writer.buf[writer.pos++] = nextByte;
}


function readPacked(reader, method) {
  const end = reader.readPackedEnd();
  const values = [];
  while (reader.pos < end) values.push(reader[method]());
  return values;
}

function writePacked(writer, tag, values, method) {
  if (!values.length) return;
  writer.writeMessage(
    tag,
    (items, messageWriter) => {
      for (const item of items) messageWriter[method](item);
    },
    values,
  );
}


function readUtf8(buffer, start, end) {
  if (utf8TextDecoder && end - start >= 12) {
    return utf8TextDecoder.decode(buffer.subarray(start, end));
  }

  let output = "";
  while (start < end) {
    const first = buffer[start];
    let sequenceLength =
      first > 0xef ? 4 : first > 0xdf ? 3 : first > 0xbf ? 2 : 1;
    if (start + sequenceLength > end) break;

    let codePoint = null;
    if (sequenceLength === 1) {
      if (first < 0x80) codePoint = first;
    } else if (sequenceLength === 2) {
      const second = buffer[start + 1];
      if ((second & 0xc0) === 0x80) {
        const candidate = ((first & 0x1f) << 6) | (second & 0x3f);
        if (candidate > 0x7f) codePoint = candidate;
      }
    } else if (sequenceLength === 3) {
      const second = buffer[start + 1];
      const third = buffer[start + 2];
      if ((second & 0xc0) === 0x80 && (third & 0xc0) === 0x80) {
        const candidate =
          ((first & 0x0f) << 12) |
          ((second & 0x3f) << 6) |
          (third & 0x3f);
        if (candidate > 0x7ff && (candidate < 0xd800 || candidate > 0xdfff)) {
          codePoint = candidate;
        }
      }
    } else {
      const second = buffer[start + 1];
      const third = buffer[start + 2];
      const fourth = buffer[start + 3];
      if (
        (second & 0xc0) === 0x80 &&
        (third & 0xc0) === 0x80 &&
        (fourth & 0xc0) === 0x80
      ) {
        const candidate =
          ((first & 0x07) << 18) |
          ((second & 0x3f) << 12) |
          ((third & 0x3f) << 6) |
          (fourth & 0x3f);
        if (first < 0xf5 && candidate > 0xffff && candidate < 0x110000) {
          codePoint = candidate;
        }
      }
    }

    if (codePoint === null) {
      output += "\ufffd";
      sequenceLength = 1;
    } else if (codePoint < 0x10000) {
      output += String.fromCharCode(codePoint);
    } else {
      codePoint -= 0x10000;
      output += String.fromCharCode(
        0xd800 | (codePoint >> 10),
        0xdc00 | (codePoint & 0x3ff),
      );
    }
    start += sequenceLength;
  }
  return output;
}

function encodeUtf8(value) {
  const bytes = [];
  for (let index = 0; index < value.length; index++) {
    let codePoint = value.charCodeAt(index);

    if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
      const low = value.charCodeAt(index + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (low - 0xdc00);
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
