const TWO_TO_32 = 0x100000000;
const MAX_VARINT = 0x10000000000000000;
const REPLACEMENT_CHARACTER = 0xfffd;

const utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8');

function combineVarintParts(low, high, signed) {
  return TWO_TO_32 * (signed ? high : high >>> 0) + (low >>> 0);
}

function readUtf8(buffer, start, end) {
  let result = '';
  let position = start;

  while (position < end) {
    const firstByte = buffer[position];
    let codePoint = null;
    let sequenceLength = firstByte > 0xef ? 4 : firstByte > 0xdf ? 3 : firstByte > 0xbf ? 2 : 1;
    if (position + sequenceLength > end) break;

    let secondByte;
    let thirdByte;
    let fourthByte;

    if (sequenceLength === 1) {
      if (firstByte < 0x80) codePoint = firstByte;
    } else if (sequenceLength === 2) {
      secondByte = buffer[position + 1];
      if ((secondByte & 0xc0) === 0x80) {
        const candidate = (firstByte & 0x1f) << 6 | secondByte & 0x3f;
        if (candidate > 0x7f) codePoint = candidate;
      }
    } else if (sequenceLength === 3) {
      secondByte = buffer[position + 1];
      thirdByte = buffer[position + 2];
      if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80) {
        const candidate = (firstByte & 0x0f) << 12 | (secondByte & 0x3f) << 6 | thirdByte & 0x3f;
        if (candidate > 0x7ff && (candidate < 0xd800 || candidate > 0xdfff)) codePoint = candidate;
      }
    } else {
      secondByte = buffer[position + 1];
      thirdByte = buffer[position + 2];
      fourthByte = buffer[position + 3];
      if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80 && (fourthByte & 0xc0) === 0x80) {
        const candidate = (firstByte & 0x0f) << 18 | (secondByte & 0x3f) << 12 |
          (thirdByte & 0x3f) << 6 | fourthByte & 0x3f;
        if (candidate > 0xffff && candidate < 0x110000) codePoint = candidate;
      }
    }

    if (codePoint === null) {
      codePoint = REPLACEMENT_CHARACTER;
      sequenceLength = 1;
    } else if (codePoint > 0xffff) {
      codePoint -= 0x10000;
      result += String.fromCharCode(codePoint >>> 10 & 0x3ff | 0xd800);
      codePoint = 0xdc00 | codePoint & 0x3ff;
    }

    result += String.fromCharCode(codePoint);
    position += sequenceLength;
  }

  return result;
}

function writeUtf8(buffer, value, position) {
  let pendingHighSurrogate;

  for (let index = 0; index < value.length; index++) {
    let codePoint = value.charCodeAt(index);

    if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
      if (pendingHighSurrogate === undefined) {
        if (codePoint > 0xdbff || index + 1 === value.length) {
          buffer[position++] = 0xef;
          buffer[position++] = 0xbf;
          buffer[position++] = 0xbd;
        } else {
          pendingHighSurrogate = codePoint;
        }
        continue;
      }

      if (codePoint < 0xdc00) {
        buffer[position++] = 0xef;
        buffer[position++] = 0xbf;
        buffer[position++] = 0xbd;
        pendingHighSurrogate = codePoint;
        continue;
      }

      codePoint = (pendingHighSurrogate - 0xd800 << 10 | codePoint - 0xdc00) | 0x10000;
      pendingHighSurrogate = undefined;
    } else if (pendingHighSurrogate !== undefined) {
      buffer[position++] = 0xef;
      buffer[position++] = 0xbf;
      buffer[position++] = 0xbd;
      pendingHighSurrogate = undefined;
    }

    if (codePoint < 0x80) {
      buffer[position++] = codePoint;
    } else {
      if (codePoint < 0x800) {
        buffer[position++] = codePoint >> 6 | 0xc0;
      } else {
        if (codePoint < 0x10000) {
          buffer[position++] = codePoint >> 12 | 0xe0;
        } else {
          buffer[position++] = codePoint >> 18 | 0xf0;
          buffer[position++] = codePoint >> 12 & 0x3f | 0x80;
        }
        buffer[position++] = codePoint >> 6 & 0x3f | 0x80;
      }
      buffer[position++] = codePoint & 0x3f | 0x80;
    }
  }

  return position;
}

function makeRoomForExtraLength(start, contentLength, writer) {
  const extraBytes = contentLength <= 0x3fff ? 1 :
    contentLength <= 0x1fffff ? 2 :
      contentLength <= 0xfffffff ? 3 : Math.floor(Math.log(contentLength) / (7 * Math.LN2));

  writer.realloc(extraBytes);
  writer.buf.copyWithin(start + extraBytes, start, writer.pos);
}

function readPackedValues(reader, values, readValue) {
  const end = reader.readPackedEnd();
  while (reader.pos < end) values.push(readValue());
  return values;
}

function writeFixed64Value(writer, value) {
  writer.realloc(8);
  writer.dataView.setInt32(writer.pos, value & -1, true);
  writer.dataView.setInt32(writer.pos + 4, Math.floor(value / TWO_TO_32), true);
  writer.pos += 8;
}

function writePacked(values, writer, method) {
  for (let index = 0; index < values.length; index++) writer[method](values[index]);
}

function writePackedVarints(values, writer) {
  let buffer = writer.buf;
  let position = writer.pos;
  let capacity = writer.length;

  for (let index = 0; index < values.length; index++) {
    let value = values[index];
    if (value < 0 || position + 10 > capacity) {
      writer.pos = position;
      writer.writeVarint(value);
      buffer = writer.buf;
      position = writer.pos;
      capacity = writer.length;
    } else {
      while (value > 0x7f) {
        buffer[position++] = value % 0x80 | 0x80;
        value = Math.floor(value / 0x80);
      }
      buffer[position++] = value;
    }
  }

  writer.pos = position;
}

function writePackedSVarints(values, writer) {
  writePacked(values, writer, 'writeSVarint');
}

function writePackedBooleans(values, writer) {
  writePacked(values, writer, 'writeBoolean');
}

function writePackedFloats(values, writer) {
  writePacked(values, writer, 'writeFloat');
}

function writePackedDoubles(values, writer) {
  writePacked(values, writer, 'writeDouble');
}

function writePackedFixed32s(values, writer) {
  writePacked(values, writer, 'writeFixed32');
}

function writePackedSFixed32s(values, writer) {
  writePacked(values, writer, 'writeSFixed32');
}

function writePackedFixed64s(values, writer) {
  writePacked(values, writer, 'writeFixed64');
}

function writePackedSFixed64s(values, writer) {
  writePacked(values, writer, 'writeSFixed64');
}

class PbfReader {
  constructor(input) {
    this.buf = ArrayBuffer.isView(input) ? input : new Uint8Array(input);
    this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    this.pos = 0;
    this.type = 0;
    this._valueStart = -1;
    this.length = this.buf.length;
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
    const value = this.dataView.getUint32(this.pos, true) +
      TWO_TO_32 * this.dataView.getUint32(this.pos + 4, true);
    this.pos += 8;
    return value;
  }

  readSFixed64() {
    const value = this.dataView.getUint32(this.pos, true) +
      TWO_TO_32 * this.dataView.getInt32(this.pos + 4, true);
    this.pos += 8;
    return value;
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

  readVarint(signed) {
    const buffer = this.buf;
    let low = 0;
    let high = 0;

    for (let index = 0; index < 10; index++) {
      const byte = buffer[this.pos++];

      if (index < 4) {
        low |= (byte & 0x7f) << index * 7;
      } else if (index === 4) {
        low |= (byte & 0x0f) << 28;
        high = (byte & 0x70) >> 4;
      } else if (index < 9) {
        high |= (byte & 0x7f) << (index - 5) * 7 + 3;
      } else {
        high |= (byte & 1) << 31;
      }

      if (byte < 0x80) return index < 4 ? low : combineVarintParts(low, high, signed);
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
    const start = this.pos;
    this.pos = end;
    return end - start >= 12 && utf8TextDecoder ?
      utf8TextDecoder.decode(this.buf.subarray(start, end)) :
      readUtf8(this.buf, start, end);
  }

  readBytes() {
    const end = this.readVarint() + this.pos;
    const value = this.buf.subarray(this.pos, end);
    this.pos = end;
    return value;
  }

  readPackedVarint(values = [], signed) {
    return readPackedValues(this, values, () => this.readVarint(signed));
  }

  readPackedSVarint(values = []) {
    return readPackedValues(this, values, () => this.readSVarint());
  }

  readPackedBoolean(values = []) {
    return readPackedValues(this, values, () => this.readBoolean());
  }

  readPackedFloat(values = []) {
    return readPackedValues(this, values, () => this.readFloat());
  }

  readPackedDouble(values = []) {
    return readPackedValues(this, values, () => this.readDouble());
  }

  readPackedFixed32(values = []) {
    return readPackedValues(this, values, () => this.readFixed32());
  }

  readPackedSFixed32(values = []) {
    return readPackedValues(this, values, () => this.readSFixed32());
  }

  readPackedFixed64(values = []) {
    return readPackedValues(this, values, () => this.readFixed64());
  }

  readPackedSFixed64(values = []) {
    return readPackedValues(this, values, () => this.readSFixed64());
  }

  readPackedEnd() {
    return this.type === 2 ? this.readVarint() + this.pos : this.pos + 1;
  }

  nextField(end = this.length) {
    if (this.pos === this._valueStart) this.skip(this.type);
    if (this.pos >= end) return 0;

    const tag = this.readVarint();
    this.type = tag & 7;
    this._valueStart = this.pos;
    return tag >>> 3;
  }

  skip(type) {
    const wireType = type & 7;
    if (wireType === 0) {
      while (this.buf[this.pos++] > 0x7f) {}
    } else if (wireType === 2) {
      this.pos = this.readVarint() + this.pos;
    } else if (wireType === 5) {
      this.pos += 4;
    } else if (wireType === 1) {
      this.pos += 8;
    } else {
      throw new Error(`Unimplemented type: ${wireType}`);
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
    this.writeVarint(field << 3 | type);
  }

  realloc(minimumBytes) {
    let capacity = this.length || 16;
    while (capacity < this.pos + minimumBytes) capacity *= 2;

    if (capacity !== this.length) {
      const buffer = new Uint8Array(capacity);
      buffer.set(this.buf);
      this.buf = buffer;
      this.dataView = new DataView(buffer.buffer);
      this.length = capacity;
    }
  }

  finish() {
    this.length = this.pos;
    this.pos = 0;
    return this.buf.subarray(0, this.length);
  }

  writeFixed32(value) {
    this.realloc(4);
    this.dataView.setInt32(this.pos, value, true);
    this.pos += 4;
  }

  writeSFixed32(value) {
    this.realloc(4);
    this.dataView.setInt32(this.pos, value, true);
    this.pos += 4;
  }

  writeFixed64(value) {
    writeFixed64Value(this, value);
  }

  writeSFixed64(value) {
    writeFixed64Value(this, value);
  }

  writeVarint(value) {
    value = +value || 0;
    if (value >= 0 && value < 0x80) {
      if (this.pos >= this.length) this.realloc(1);
      this.buf[this.pos++] = value;
      return;
    }

    if (value >= 0 && value <= 0xfffffff) {
      this.realloc(4);
      while (value > 0x7f) {
        this.buf[this.pos++] = value & 0x7f | 0x80;
        value >>>= 7;
      }
      this.buf[this.pos++] = value;
      return;
    }

    let low;
    let high;
    if (value >= 0) {
      low = value % TWO_TO_32 | 0;
      high = value / TWO_TO_32 | 0;
    } else {
      low = ~(-value % TWO_TO_32);
      high = ~(-value / TWO_TO_32);
      if ((low ^ -1) !== 0) {
        low = low + 1 | 0;
      } else {
        low = 0;
        high = high + 1 | 0;
      }
    }

    if (value >= MAX_VARINT || value < -MAX_VARINT) {
      throw new Error("Given varint doesn't fit into 10 bytes");
    }

    this.realloc(10);
    for (let index = 0; index < 4; index++) {
      this.buf[this.pos++] = low & 0x7f | 0x80;
      low >>>= 7;
    }
    this.buf[this.pos] = low & 0x7f;

    this.buf[this.pos++] |= (high & 7) << 4 | ((high >>>= 3) ? 0x80 : 0);
    while (high) {
      this.buf[this.pos++] = high & 0x7f | ((high >>>= 7) ? 0x80 : 0);
    }
  }

  writeSVarint(value) {
    this.writeVarint(value < 0 ? -value * 2 - 1 : value * 2);
  }

  writeBoolean(value) {
    this.writeVarint(+value);
  }

  writeString(value) {
    value = String(value);
    this.realloc(4 * value.length);
    this.pos++;
    const start = this.pos;
    this.pos = writeUtf8(this.buf, value, this.pos);
    const length = this.pos - start;
    if (length >= 0x80) makeRoomForExtraLength(start, length, this);
    this.pos = start - 1;
    this.writeVarint(length);
    this.pos += length;
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
    const length = value.length;
    this.writeVarint(length);
    this.realloc(length);
    this.buf.set(value, this.pos);
    this.pos += length;
  }

  writeRawMessage(writeMessage, value) {
    this.pos++;
    const start = this.pos;
    writeMessage(value, this);
    const length = this.pos - start;
    if (length >= 0x80) makeRoomForExtraLength(start, length, this);
    this.pos = start - 1;
    this.writeVarint(length);
    this.pos += length;
  }

  writeMessage(field, writeMessage, value) {
    this.writeTag(field, 2);
    this.writeRawMessage(writeMessage, value);
  }

  writePackedVarint(field, values) {
    if (values.length) this.writeMessage(field, writePackedVarints, values);
  }

  writePackedSVarint(field, values) {
    if (values.length) this.writeMessage(field, writePackedSVarints, values);
  }

  writePackedBoolean(field, values) {
    if (values.length) this.writeMessage(field, writePackedBooleans, values);
  }

  writePackedFloat(field, values) {
    if (values.length) this.writeMessage(field, writePackedFloats, values);
  }

  writePackedDouble(field, values) {
    if (values.length) this.writeMessage(field, writePackedDoubles, values);
  }

  writePackedFixed32(field, values) {
    if (values.length) this.writeMessage(field, writePackedFixed32s, values);
  }

  writePackedSFixed32(field, values) {
    if (values.length) this.writeMessage(field, writePackedSFixed32s, values);
  }

  writePackedFixed64(field, values) {
    if (values.length) this.writeMessage(field, writePackedFixed64s, values);
  }

  writePackedSFixed64(field, values) {
    if (values.length) this.writeMessage(field, writePackedSFixed64s, values);
  }

  writeBytesField(field, value) {
    this.writeTag(field, 2);
    this.writeBytes(value);
  }

  writeFixed32Field(field, value) {
    this.writeTag(field, 5);
    this.writeFixed32(value);
  }

  writeSFixed32Field(field, value) {
    this.writeTag(field, 5);
    this.writeSFixed32(value);
  }

  writeFixed64Field(field, value) {
    this.writeTag(field, 1);
    this.writeFixed64(value);
  }

  writeSFixed64Field(field, value) {
    this.writeTag(field, 1);
    this.writeSFixed64(value);
  }

  writeVarintField(field, value) {
    this.writeTag(field, 0);
    this.writeVarint(value);
  }

  writeSVarintField(field, value) {
    this.writeTag(field, 0);
    this.writeSVarint(value);
  }

  writeStringField(field, value) {
    this.writeTag(field, 2);
    this.writeString(value);
  }

  writeFloatField(field, value) {
    this.writeTag(field, 5);
    this.writeFloat(value);
  }

  writeDoubleField(field, value) {
    this.writeTag(field, 1);
    this.writeDouble(value);
  }

  writeBooleanField(field, value) {
    this.writeVarintField(field, +value);
  }
}

export { PbfReader, PbfWriter };
