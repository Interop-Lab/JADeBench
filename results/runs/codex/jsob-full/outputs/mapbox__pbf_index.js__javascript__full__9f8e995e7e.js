const SHIFT_LEFT_32 = 0x100000000;
const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
const TEXT_DECODER_MIN_LENGTH = 12;

const utf8TextDecoder =
    typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8');

const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;

class PbfReader {
    constructor(buffer) {
        this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
        this.dataView = new DataView(
            this.buf.buffer,
            this.buf.byteOffset,
            this.buf.byteLength
        );
        this.pos = 0;
        this.type = 0;
        this.length = this.buf.length;
        this._valueStart = -1;
    }

    readFields(readField, result, end = this.length) {
        let field;
        while ((field = this.nextField(end))) {
            readField(field, result, this);
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
        const value =
            this.dataView.getUint32(this.pos, true) +
            this.dataView.getUint32(this.pos + 4, true) * SHIFT_LEFT_32;
        this.pos += 8;
        return value;
    }

    readSFixed64() {
        const value =
            this.dataView.getUint32(this.pos, true) +
            this.dataView.getInt32(this.pos + 4, true) * SHIFT_LEFT_32;
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

    readVarint(isSigned) {
        const buffer = this.buf;
        let byte = buffer[this.pos++];
        if (byte < 0x80) return byte;

        let value = byte & 0x7f;
        byte = buffer[this.pos++];
        value |= (byte & 0x7f) << 7;
        if (byte < 0x80) return value;

        byte = buffer[this.pos++];
        value |= (byte & 0x7f) << 14;
        if (byte < 0x80) return value;

        byte = buffer[this.pos++];
        value |= (byte & 0x7f) << 21;
        if (byte < 0x80) return value;

        byte = buffer[this.pos];
        value |= (byte & 0x0f) << 28;
        return readVarintRemainder(value, isSigned, this);
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

        if (end - start >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
            return utf8TextDecoder.decode(this.buf.subarray(start, end));
        }
        return readUtf8(this.buf, start, end);
    }

    readBytes() {
        const end = this.readVarint() + this.pos;
        const value = this.buf.subarray(this.pos, end);
        this.pos = end;
        return value;
    }

    readPackedVarint(values = [], isSigned) {
        const end = this.readPackedEnd();
        while (this.pos < end) values.push(this.readVarint(isSigned));
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

        const value = this.readVarint();
        this.type = value & 0x7;
        this._valueStart = this.pos;
        return value >>> 3;
    }

    skip(value) {
        const type = value & 0x7;
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
    constructor(buffer = new Uint8Array(16)) {
        this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
        this.dataView = new DataView(
            this.buf.buffer,
            this.buf.byteOffset,
            this.buf.byteLength
        );
        this.pos = 0;
        this.length = this.buf.length;
    }

    writeTag(tag, type) {
        this.writeVarint((tag << 3) | type);
    }

    realloc(minimum) {
        let length = this.length || 16;
        while (length < this.pos + minimum) length *= 2;
        if (length !== this.length) {
            const buffer = new Uint8Array(length);
            buffer.set(this.buf);
            this.buf = buffer;
            this.dataView = new DataView(buffer.buffer);
            this.length = length;
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
        this.realloc(8);
        this.dataView.setInt32(this.pos, value & -1, true);
        this.dataView.setInt32(this.pos + 4, Math.floor(value * SHIFT_RIGHT_32), true);
        this.pos += 8;
    }

    writeSFixed64(value) {
        this.realloc(8);
        this.dataView.setInt32(this.pos, value & -1, true);
        this.dataView.setInt32(this.pos + 4, Math.floor(value * SHIFT_RIGHT_32), true);
        this.pos += 8;
    }

    writeVarint(value) {
        value = +value || 0;
        if (value >= 0 && value < 0x80) {
            if (this.pos >= this.length) this.realloc(1);
            this.buf[this.pos++] = value;
            return;
        }

        if (value >= 0x10000000000000000 || value < -0x10000000000000000) {
            throw new Error("Given varint doesn't fit into 10 bytes");
        }

        this.realloc(10);
        let remaining = BigInt(Math.trunc(value));
        if (remaining < 0) remaining = BigInt.asUintN(64, remaining);

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
        this.writeVarint(+value);
    }

    writeString(value) {
        value = String(value);
        this.realloc(value.length * 4);
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

    writeMessage(tag, writeMessage, value) {
        this.writeTag(tag, PBF_BYTES);
        this.writeRawMessage(writeMessage, value);
    }

    writePackedVarint(tag, values) {
        if (values.length) this.writeMessage(tag, writePackedVarint, values);
    }

    writePackedSVarint(tag, values) {
        if (values.length) this.writeMessage(tag, writePackedSVarint, values);
    }

    writePackedBoolean(tag, values) {
        if (values.length) this.writeMessage(tag, writePackedBoolean, values);
    }

    writePackedFloat(tag, values) {
        if (values.length) this.writeMessage(tag, writePackedFloat, values);
    }

    writePackedDouble(tag, values) {
        if (values.length) this.writeMessage(tag, writePackedDouble, values);
    }

    writePackedFixed32(tag, values) {
        if (values.length) this.writeMessage(tag, writePackedFixed32, values);
    }

    writePackedSFixed32(tag, values) {
        if (values.length) this.writeMessage(tag, writePackedSFixed32, values);
    }

    writePackedFixed64(tag, values) {
        if (values.length) this.writeMessage(tag, writePackedFixed64, values);
    }

    writePackedSFixed64(tag, values) {
        if (values.length) this.writeMessage(tag, writePackedSFixed64, values);
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
        this.writeVarint((tag << 3) | PBF_VARINT);
        this.writeBoolean(value);
    }
}

function readVarintRemainder(low, isSigned, reader) {
    const buffer = reader.buf;
    let high;
    let byte = buffer[reader.pos++];

    high = (byte & 0x70) >> 4;
    if (byte < 0x80) return combineVarint(low, high, isSigned);

    byte = buffer[reader.pos++];
    high |= (byte & 0x7f) << 3;
    if (byte < 0x80) return combineVarint(low, high, isSigned);

    byte = buffer[reader.pos++];
    high |= (byte & 0x7f) << 10;
    if (byte < 0x80) return combineVarint(low, high, isSigned);

    byte = buffer[reader.pos++];
    high |= (byte & 0x7f) << 17;
    if (byte < 0x80) return combineVarint(low, high, isSigned);

    byte = buffer[reader.pos++];
    high |= (byte & 0x7f) << 24;
    if (byte < 0x80) return combineVarint(low, high, isSigned);

    byte = buffer[reader.pos++];
    high |= (byte & 0x01) << 31;
    if (byte < 0x80) return combineVarint(low, high, isSigned);

    throw new Error('Expected varint not more than 10 bytes');
}

function combineVarint(low, high, isSigned) {
    return isSigned
        ? high * SHIFT_LEFT_32 + (low >>> 0)
        : (high >>> 0) * SHIFT_LEFT_32 + (low >>> 0);
}

function makeRoomForExtraLength(start, length, writer) {
    const extraBytes =
        length <= 0x3fff
            ? 1
            : length <= 0x1fffff
              ? 2
              : length <= 0xfffffff
                ? 3
                : Math.floor(Math.log(length) / (Math.LN2 * 7));

    writer.realloc(extraBytes);
    writer.buf.copyWithin(start + extraBytes, start, writer.pos);
}

function writePackedVarint(values, writer) {
    for (const value of values) writer.writeVarint(value);
}

function writePackedSVarint(values, writer) {
    for (const value of values) writer.writeSVarint(value);
}

function writePackedFloat(values, writer) {
    for (const value of values) writer.writeFloat(value);
}

function writePackedDouble(values, writer) {
    for (const value of values) writer.writeDouble(value);
}

function writePackedBoolean(values, writer) {
    for (const value of values) writer.writeBoolean(value);
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
    let result = '';
    let index = start;

    while (index < end) {
        const first = buffer[index++];
        let codePoint = null;
        let sequenceLength =
            first > 0xef ? 4 : first > 0xdf ? 3 : first > 0xbf ? 2 : 1;

        if (index + sequenceLength - 1 > end) break;

        if (sequenceLength === 1) {
            if (first < 0x80) codePoint = first;
        } else if (sequenceLength === 2) {
            const second = buffer[index];
            if ((second & 0xc0) === 0x80) {
                codePoint = ((first & 0x1f) << 6) | (second & 0x3f);
                if (codePoint <= 0x7f) codePoint = null;
            }
        } else if (sequenceLength === 3) {
            const second = buffer[index];
            const third = buffer[index + 1];
            if ((second & 0xc0) === 0x80 && (third & 0xc0) === 0x80) {
                codePoint =
                    ((first & 0x0f) << 12) |
                    ((second & 0x3f) << 6) |
                    (third & 0x3f);
                if (
                    codePoint <= 0x7ff ||
                    (codePoint >= 0xd800 && codePoint <= 0xdfff)
                ) {
                    codePoint = null;
                }
            }
        } else {
            const second = buffer[index];
            const third = buffer[index + 1];
            const fourth = buffer[index + 2];
            if (
                (second & 0xc0) === 0x80 &&
                (third & 0xc0) === 0x80 &&
                (fourth & 0xc0) === 0x80
            ) {
                codePoint =
                    ((first & 0x07) << 18) |
                    ((second & 0x3f) << 12) |
                    ((third & 0x3f) << 6) |
                    (fourth & 0x3f);
                if (codePoint <= 0xffff || codePoint > 0x10ffff) {
                    codePoint = null;
                }
            }
        }

        if (codePoint === null) {
            codePoint = 0xfffd;
            sequenceLength = 1;
        } else if (codePoint > 0xffff) {
            codePoint -= 0x10000;
            result += String.fromCharCode(
                0xd800 | ((codePoint >>> 10) & 0x3ff)
            );
            codePoint = 0xdc00 | (codePoint & 0x3ff);
        }

        result += String.fromCharCode(codePoint);
        index += sequenceLength - 1;
    }

    return result;
}

function writeUtf8(buffer, value, position) {
    let pendingHighSurrogate = null;

    for (let index = 0; index < value.length; index++) {
        let codePoint = value.charCodeAt(index);

        if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
            if (pendingHighSurrogate !== null) {
                if (codePoint >= 0xdc00) {
                    codePoint =
                        ((pendingHighSurrogate - 0xd800) << 10) +
                        (codePoint - 0xdc00) +
                        0x10000;
                    pendingHighSurrogate = null;
                } else {
                    buffer[position++] = 0xef;
                    buffer[position++] = 0xbf;
                    buffer[position++] = 0xbd;
                    pendingHighSurrogate = codePoint;
                    continue;
                }
            } else if (codePoint > 0xdbff || index + 1 === value.length) {
                buffer[position++] = 0xef;
                buffer[position++] = 0xbf;
                buffer[position++] = 0xbd;
                continue;
            } else {
                pendingHighSurrogate = codePoint;
                continue;
            }
        } else if (pendingHighSurrogate !== null) {
            buffer[position++] = 0xef;
            buffer[position++] = 0xbf;
            buffer[position++] = 0xbd;
            pendingHighSurrogate = null;
        }

        if (codePoint < 0x80) {
            buffer[position++] = codePoint;
        } else if (codePoint < 0x800) {
            buffer[position++] = (codePoint >> 6) | 0xc0;
            buffer[position++] = (codePoint & 0x3f) | 0x80;
        } else if (codePoint < 0x10000) {
            buffer[position++] = (codePoint >> 12) | 0xe0;
            buffer[position++] = ((codePoint >> 6) & 0x3f) | 0x80;
            buffer[position++] = (codePoint & 0x3f) | 0x80;
        } else {
            buffer[position++] = (codePoint >> 18) | 0xf0;
            buffer[position++] = ((codePoint >> 12) & 0x3f) | 0x80;
            buffer[position++] = ((codePoint >> 6) & 0x3f) | 0x80;
            buffer[position++] = (codePoint & 0x3f) | 0x80;
        }
    }

    return position;
}

export { PbfReader, PbfWriter };
