const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;

const SHIFT_LEFT_32 = 0x100000000;
const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
const TEXT_DECODER_MIN_LENGTH = 12;

const utf8TextDecoder =
    typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");

function toUint8Array(value) {
    if (value instanceof Uint8Array) return value;
    if (ArrayBuffer.isView(value)) {
        return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    }
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    return new Uint8Array(value || 0);
}

function readUtf8(buffer, start, end) {
    const length = end - start;

    if (utf8TextDecoder && length >= TEXT_DECODER_MIN_LENGTH) {
        return utf8TextDecoder.decode(buffer.subarray(start, end));
    }

    let result = "";

    while (start < end) {
        const first = buffer[start++];

        if (first < 0x80) {
            result += String.fromCharCode(first);
        } else if (first < 0xe0) {
            result += String.fromCharCode(
                ((first & 0x1f) << 6) |
                (buffer[start++] & 0x3f)
            );
        } else if (first < 0xf0) {
            result += String.fromCharCode(
                ((first & 0x0f) << 12) |
                ((buffer[start++] & 0x3f) << 6) |
                (buffer[start++] & 0x3f)
            );
        } else {
            let codePoint =
                ((first & 0x07) << 18) |
                ((buffer[start++] & 0x3f) << 12) |
                ((buffer[start++] & 0x3f) << 6) |
                (buffer[start++] & 0x3f);

            codePoint -= 0x10000;
            result += String.fromCharCode(
                (codePoint >> 10) + 0xd800,
                (codePoint & 0x3ff) + 0xdc00
            );
        }
    }

    return result;
}

function utf8Length(value) {
    let length = 0;

    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);

        if (code < 0x80) {
            length++;
        } else if (code < 0x800) {
            length += 2;
        } else if (
            code >= 0xd800 &&
            code <= 0xdbff &&
            i + 1 < value.length &&
            value.charCodeAt(i + 1) >= 0xdc00 &&
            value.charCodeAt(i + 1) <= 0xdfff
        ) {
            length += 4;
            i++;
        } else {
            length += 3;
        }
    }

    return length;
}

function writeUtf8(buffer, value, offset) {
    for (let i = 0; i < value.length; i++) {
        let code = value.charCodeAt(i);

        if (code < 0x80) {
            buffer[offset++] = code;
        } else if (code < 0x800) {
            buffer[offset++] = 0xc0 | (code >> 6);
            buffer[offset++] = 0x80 | (code & 0x3f);
        } else if (
            code >= 0xd800 &&
            code <= 0xdbff &&
            i + 1 < value.length
        ) {
            const low = value.charCodeAt(i + 1);

            if (low >= 0xdc00 && low <= 0xdfff) {
                code =
                    0x10000 +
                    ((code - 0xd800) << 10) +
                    (low - 0xdc00);
                i++;

                buffer[offset++] = 0xf0 | (code >> 18);
                buffer[offset++] = 0x80 | ((code >> 12) & 0x3f);
                buffer[offset++] = 0x80 | ((code >> 6) & 0x3f);
                buffer[offset++] = 0x80 | (code & 0x3f);
            } else {
                buffer[offset++] = 0xe0 | (code >> 12);
                buffer[offset++] = 0x80 | ((code >> 6) & 0x3f);
                buffer[offset++] = 0x80 | (code & 0x3f);
            }
        } else {
            buffer[offset++] = 0xe0 | (code >> 12);
            buffer[offset++] = 0x80 | ((code >> 6) & 0x3f);
            buffer[offset++] = 0x80 | (code & 0x3f);
        }
    }

    return offset;
}

function toUnsignedBigInt(value) {
    let result;

    if (typeof value === "bigint") {
        result = value;
    } else {
        if (!Number.isFinite(value)) {
            throw new Error("Given varint doesn't fit into 10 bytes");
        }
        result = BigInt(Math.trunc(value));
    }

    return BigInt.asUintN(64, result);
}

function toNum(low, high, isSigned) {
    let value = (BigInt(high >>> 0) << 32n) | BigInt(low >>> 0);
    if (isSigned) value = BigInt.asIntN(64, value);
    return Number(value);
}

function readVarintRemainder(low, isSigned, reader) {
    let value = BigInt(low >>> 0);
    let shift = 28n;

    for (let i = 0; i < 6; i++) {
        if (reader.pos >= reader.length) {
            throw new Error("Expected varint not more than 10 bytes");
        }

        const byte = reader.buf[reader.pos++];
        value |= BigInt(byte & 0x7f) << shift;

        if (byte < 0x80) {
            if (isSigned) value = BigInt.asIntN(64, value);
            return Number(value);
        }

        shift += 7n;
    }

    throw new Error("Expected varint not more than 10 bytes");
}

class PbfReader {
    constructor(buffer) {
        this.buf = toUint8Array(buffer);
        this.pos = 0;
        this.type = 0;
        this.length = this.buf.length;
    }

    readFields(readField, result, end = this.length) {
        while (this.pos < end) {
            const value = this.readVarint();
            const tag = value >> 3;
            this.type = value & 7;

            const start = this.pos;
            readField(tag, result, this);

            if (this.pos === start) this.skip(value);
        }

        return result;
    }

    readMessage(readField, result) {
        return this.readFields(
            readField,
            result,
            this.readVarint() + this.pos
        );
    }

    readFixed32() {
        const value = new DataView(
            this.buf.buffer,
            this.buf.byteOffset + this.pos,
            4
        ).getUint32(0, true);

        this.pos += 4;
        return value;
    }

    readSFixed32() {
        const value = new DataView(
            this.buf.buffer,
            this.buf.byteOffset + this.pos,
            4
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
            4
        ).getFloat32(0, true);

        this.pos += 4;
        return value;
    }

    readDouble() {
        const value = new DataView(
            this.buf.buffer,
            this.buf.byteOffset + this.pos,
            8
        ).getFloat64(0, true);

        this.pos += 8;
        return value;
    }

    readVarint(isSigned = false) {
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
        value = (value | ((byte & 0x0f) << 28)) >>> 0;
        if (byte < 0x80) return value;

        return readVarintRemainder(value, isSigned, this);
    }

    readSVarint() {
        const value = this.readVarint();
        return value % 2 === 1 ? -(value + 1) / 2 : value / 2;
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

    readPackedVarint(result = [], isSigned = false) {
        const end = this.readPackedEnd();
        while (this.pos < end) result.push(this.readVarint(isSigned));
        return result;
    }

    readPackedSVarint(result = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) result.push(this.readSVarint());
        return result;
    }

    readPackedBoolean(result = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) result.push(this.readBoolean());
        return result;
    }

    readPackedFloat(result = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) result.push(this.readFloat());
        return result;
    }

    readPackedDouble(result = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) result.push(this.readDouble());
        return result;
    }

    readPackedFixed32(result = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) result.push(this.readFixed32());
        return result;
    }

    readPackedSFixed32(result = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) result.push(this.readSFixed32());
        return result;
    }

    readPackedFixed64(result = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) result.push(this.readFixed64());
        return result;
    }

    readPackedSFixed64(result = []) {
        const end = this.readPackedEnd();
        while (this.pos < end) result.push(this.readSFixed64());
        return result;
    }

    readPackedEnd() {
        return this.type === PBF_BYTES
            ? this.readVarint() + this.pos
            : this.pos + 1;
    }

    skip(value) {
        const type = value & 7;

        if (type === PBF_VARINT) {
            while (this.pos < this.length && this.buf[this.pos++] > 0x7f) {
                // Continue through the varint.
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

function writeBigVarint(value, writer) {
    let remaining = toUnsignedBigInt(value);

    while (remaining > 0x7fn) {
        writer.realloc(1);
        writer.buf[writer.pos++] =
            Number(remaining & 0x7fn) | 0x80;
        remaining >>= 7n;
    }

    writer.realloc(1);
    writer.buf[writer.pos++] = Number(remaining);
}

function writeBigVarintLow(low, high, writer) {
    const value =
        (BigInt(high >>> 0) << 32n) |
        BigInt(low >>> 0);
    writeBigVarint(value, writer);
}

function writeBigVarintHigh(high, writer) {
    writeBigVarint(BigInt(high >>> 0) << 32n, writer);
}

function makeRoomForExtraLength(start, length, writer) {
    const extra = length < 0x80
        ? 0
        : length < 0x4000
            ? 1
            : length < 0x200000
                ? 2
                : length < 0x10000000
                    ? 3
                    : 4;

    if (!extra) return start;

    writer.realloc(extra);

    for (let i = writer.pos - 1; i >= start; i--) {
        writer.buf[i + extra] = writer.buf[i];
    }

    writer.pos += extra;
    return start + extra;
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

class PbfWriter {
    constructor() {
        this.buf = new Uint8Array(16);
        this.pos = 0;
    }

    writeTag(tag, type) {
        this.writeVarint((tag << 3) | type);
    }

    realloc(minimum) {
        let length = this.buf.length || 16;

        while (length < this.pos + minimum) length *= 2;

        if (length !== this.buf.length) {
            const buffer = new Uint8Array(length);
            buffer.set(this.buf);
            this.buf = buffer;
        }
    }

    finish() {
        this.buf = this.buf.subarray(0, this.pos);
        return this.buf;
    }

    writeFixed32(value) {
        this.realloc(4);
        new DataView(
            this.buf.buffer,
            this.buf.byteOffset + this.pos,
            4
        ).setUint32(0, value, true);
        this.pos += 4;
    }

    writeSFixed32(value) {
        this.realloc(4);
        new DataView(
            this.buf.buffer,
            this.buf.byteOffset + this.pos,
            4
        ).setInt32(0, value, true);
        this.pos += 4;
    }

    writeFixed64(value) {
        const numeric = typeof value === "bigint" ? value : BigInt(Math.trunc(value));
        const unsigned = BigInt.asUintN(64, numeric);

        this.writeFixed32(Number(unsigned & 0xffffffffn));
        this.writeFixed32(Number((unsigned >> 32n) & 0xffffffffn));
    }

    writeSFixed64(value) {
        const numeric = typeof value === "bigint" ? value : BigInt(Math.trunc(value));
        const unsigned = BigInt.asUintN(64, numeric);

        this.writeFixed32(Number(unsigned & 0xffffffffn));
        this.writeSFixed32(Number(BigInt.asIntN(32, unsigned >> 32n)));
    }

    writeVarint(value) {
        if (
            typeof value === "number" &&
            value >= 0 &&
            value <= 0x0fffffff &&
            Number.isInteger(value)
        ) {
            while (value > 0x7f) {
                this.realloc(1);
                this.buf[this.pos++] = (value & 0x7f) | 0x80;
                value >>>= 7;
            }

            this.realloc(1);
            this.buf[this.pos++] = value;
            return;
        }

        writeBigVarint(value, this);
    }

    writeSVarint(value) {
        if (typeof value === "bigint") {
            this.writeVarint(
                value < 0n
                    ? (-value * 2n) - 1n
                    : value * 2n
            );
        } else {
            this.writeVarint(
                value < 0
                    ? -value * 2 - 1
                    : value * 2
            );
        }
    }

    writeBoolean(value) {
        this.writeVarint(Boolean(value));
    }

    writeString(value) {
        value = String(value);

        const length = utf8Length(value);
        this.writeVarint(length);
        this.realloc(length);
        this.pos = writeUtf8(this.buf, value, this.pos);
    }

    writeFloat(value) {
        this.realloc(4);
        new DataView(
            this.buf.buffer,
            this.buf.byteOffset + this.pos,
            4
        ).setFloat32(0, value, true);
        this.pos += 4;
    }

    writeDouble(value) {
        this.realloc(8);
        new DataView(
            this.buf.buffer,
            this.buf.byteOffset + this.pos,
            8
        ).setFloat64(0, value, true);
        this.pos += 8;
    }

    writeBytes(value) {
        const bytes = toUint8Array(value);
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

        const length = this.pos - messageStart;
        const shiftedStart = makeRoomForExtraLength(
            messageStart,
            length,
            this
        );

        this.pos = lengthPosition;
        this.writeVarint(length);
        this.pos = shiftedStart + length;
    }

    writeMessage(tag, writeMessage, value) {
        this.writeTag(tag, PBF_BYTES);
        this.writeRawMessage(writeMessage, value);
    }

    writePackedVarint(tag, values) {
        if (values.length) {
            this.writeTag(tag, PBF_BYTES);
            this.writeRawMessage(writePackedVarint, values);
        }
    }

    writePackedSVarint(tag, values) {
        if (values.length) {
            this.writeTag(tag, PBF_BYTES);
            this.writeRawMessage(writePackedSVarint, values);
        }
    }

    writePackedBoolean(tag, values) {
        if (values.length) {
            this.writeTag(tag, PBF_BYTES);
            this.writeRawMessage(writePackedBoolean, values);
        }
    }

    writePackedFloat(tag, values) {
        if (values.length) {
            this.writeTag(tag, PBF_BYTES);
            this.writeRawMessage(writePackedFloat, values);
        }
    }

    writePackedDouble(tag, values) {
        if (values.length) {
            this.writeTag(tag, PBF_BYTES);
            this.writeRawMessage(writePackedDouble, values);
        }
    }

    writePackedFixed32(tag, values) {
        if (values.length) {
            this.writeTag(tag, PBF_BYTES);
            this.writeRawMessage(writePackedFixed32, values);
        }
    }

    writePackedSFixed32(tag, values) {
        if (values.length) {
            this.writeTag(tag, PBF_BYTES);
            this.writeRawMessage(writePackedSFixed32, values);
        }
    }

    writePackedFixed64(tag, values) {
        if (values.length) {
            this.writeTag(tag, PBF_BYTES);
            this.writeRawMessage(writePackedFixed64, values);
        }
    }

    writePackedSFixed64(tag, values) {
        if (values.length) {
            this.writeTag(tag, PBF_BYTES);
            this.writeRawMessage(writePackedSFixed64, values);
        }
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

export { PbfReader, PbfWriter };
