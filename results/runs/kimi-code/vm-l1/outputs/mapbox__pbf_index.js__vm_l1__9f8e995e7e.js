const TEXT_DECODER_MIN_LENGTH = 12;
const UTF8_DECODER = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8');

class PbfReader {
    constructor(buffer) {
        this.buf = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        this.pos = 0;
        this.type = 0;
        this.length = this.buf.length;
        this._view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    }

    readFields(readField, result, end = this.length) {
        while (this.pos < end) {
            const tagAndType = this.readVarint();
            const fieldStart = this.pos;
            this.type = tagAndType & 7;
            readField(tagAndType >>> 3, result, this);
            if (this.pos === fieldStart) this.skip(tagAndType);
        }
        return result;
    }

    readMessage(readField, result) {
        return this.readFields(readField, result, this.readVarint() + this.pos);
    }

    readFixed32() {
        const value = this._view.getUint32(this.pos, true);
        this.pos += 4;
        return value;
    }

    readSFixed32() {
        const value = this._view.getInt32(this.pos, true);
        this.pos += 4;
        return value;
    }

    readFixed64() {
        const low = this.readFixed32();
        const high = this.readFixed32();
        return high * 0x100000000 + low;
    }

    readSFixed64() {
        const low = this.readFixed32();
        const high = this.readSFixed32();
        return high * 0x100000000 + low;
    }

    readFloat() {
        const value = this._view.getFloat32(this.pos, true);
        this.pos += 4;
        return value;
    }

    readDouble() {
        const value = this._view.getFloat64(this.pos, true);
        this.pos += 8;
        return value;
    }

    readVarint(signed) {
        const start = this.pos;
        let low = 0;
        let byte = this.buf[this.pos++];
        low = byte & 0x7f;
        if (byte < 0x80) return low;

        byte = this.buf[this.pos++];
        low |= (byte & 0x7f) << 7;
        if (byte < 0x80) return low;

        byte = this.buf[this.pos++];
        low |= (byte & 0x7f) << 14;
        if (byte < 0x80) return low;

        byte = this.buf[this.pos++];
        low |= (byte & 0x7f) << 21;
        if (byte < 0x80) return low;

        byte = this.buf[this.pos++];
        low = (low | (byte & 0x0f) << 28) >>> 0;
        if (byte < 0x80) return low;

        return readVarintRemainder(low, byte, signed, this, start);
    }

    readSVarint() {
        const value = this.readVarint();
        return value % 2 ? (value + 1) / -2 : value / 2;
    }

    readBoolean() {
        return Boolean(this.readVarint());
    }

    readString() {
        const length = this.readVarint();
        const end = this.pos + length;
        const value = readUtf8(this.buf, this.pos, end);
        this.pos = end;
        return value;
    }

    readBytes() {
        const length = this.readVarint();
        const end = this.pos + length;
        const value = this.buf.subarray(this.pos, end);
        this.pos = end;
        return value;
    }

    readPackedVarint() { return readPacked(this, this.readVarint); }
    readPackedSVarint() { return readPacked(this, this.readSVarint); }
    readPackedBoolean() { return readPacked(this, this.readBoolean); }
    readPackedFloat() { return readPacked(this, this.readFloat, 4); }
    readPackedDouble() { return readPacked(this, this.readDouble, 8); }
    readPackedFixed32() { return readPacked(this, this.readFixed32, 4); }
    readPackedSFixed32() { return readPacked(this, this.readSFixed32, 4); }
    readPackedFixed64() { return readPacked(this, this.readFixed64, 8); }
    readPackedSFixed64() { return readPacked(this, this.readSFixed64, 8); }

    readPackedEnd() {
        return this.type === 2 ? this.readVarint() + this.pos : this.pos + 1;
    }

    nextField() {
        if (this.pos >= this.length) return false;
        const tagAndType = this.readVarint();
        this.type = tagAndType & 7;
        this.tag = tagAndType >>> 3;
        return true;
    }

    skip(tagAndType) {
        const type = tagAndType & 7;
        if (type === 0) {
            while (this.buf[this.pos++] & 0x80) {}
        } else if (type === 1) {
            this.pos += 8;
        } else if (type === 2) {
            this.pos += this.readVarint();
        } else if (type === 5) {
            this.pos += 4;
        } else {
            throw new Error(`Unimplemented type: ${type}`);
        }
    }
}

class PbfWriter {
    constructor(buffer) {
        this.buf = buffer || new Uint8Array(16);
        this.pos = 0;
        this._view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    }

    writeTag(tag, type) {
        this.writeVarint((tag << 3) | type);
    }

    realloc(minimumBytes) {
        const required = this.pos + minimumBytes;
        if (required <= this.buf.length) return;
        let length = this.buf.length || 16;
        while (length < required) length *= 2;
        const buffer = new Uint8Array(length);
        buffer.set(this.buf.subarray(0, this.pos));
        this.buf = buffer;
        this._view = new DataView(buffer.buffer);
    }

    finish() {
        this.length = this.pos;
        this.pos = 0;
        return this.buf.subarray(0, this.length);
    }

    writeFixed32(value) {
        this.realloc(4);
        this._view.setUint32(this.pos, value, true);
        this.pos += 4;
    }

    writeSFixed32(value) {
        this.realloc(4);
        this._view.setInt32(this.pos, value, true);
        this.pos += 4;
    }

    writeFixed64(value) {
        this.writeFixed32(value >>> 0);
        this.writeFixed32(Math.floor(value / 0x100000000));
    }

    writeSFixed64(value) {
        this.writeFixed32(value >>> 0);
        this.writeSFixed32(Math.floor(value / 0x100000000));
    }

    writeVarint(value) {
        let number = BigInt(Math.trunc(value));
        if (number < 0) number = BigInt.asUintN(64, number);
        this.realloc(10);
        while (number > 0x7fn) {
            this.buf[this.pos++] = Number(number & 0x7fn) | 0x80;
            number >>= 7n;
        }
        this.buf[this.pos++] = Number(number);
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
        this._view.setFloat32(this.pos, value, true);
        this.pos += 4;
    }

    writeDouble(value) {
        this.realloc(8);
        this._view.setFloat64(this.pos, value, true);
        this.pos += 8;
    }

    writeBytes(buffer) {
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
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
        if (length >= 0x80) {
            const lengthBytes = varintLength(length);
            this.realloc(lengthBytes - 1);
            this.buf.copyWithin(start + lengthBytes - 1, start, this.pos);
            this.pos += lengthBytes - 1;
            let cursor = start - 1;
            let remaining = length;
            while (remaining > 0x7f) {
                this.buf[cursor++] = (remaining & 0x7f) | 0x80;
                remaining >>>= 7;
            }
            this.buf[cursor] = remaining;
        } else {
            this.buf[start - 1] = length;
        }
    }

    writeMessage(tag, writeMessage, value) {
        this.writeTag(tag, 2);
        this.writeRawMessage(writeMessage, value);
    }

    writePackedVarint(tag, values) { writePacked(this, tag, values, this.writeVarint); }
    writePackedSVarint(tag, values) { writePacked(this, tag, values, this.writeSVarint); }
    writePackedBoolean(tag, values) { writePacked(this, tag, values, this.writeBoolean); }
    writePackedFloat(tag, values) { writePacked(this, tag, values, this.writeFloat); }
    writePackedDouble(tag, values) { writePacked(this, tag, values, this.writeDouble); }
    writePackedFixed32(tag, values) { writePacked(this, tag, values, this.writeFixed32); }
    writePackedSFixed32(tag, values) { writePacked(this, tag, values, this.writeSFixed32); }
    writePackedFixed64(tag, values) { writePacked(this, tag, values, this.writeFixed64); }
    writePackedSFixed64(tag, values) { writePacked(this, tag, values, this.writeSFixed64); }

    writeBytesField(tag, value) { this.writeTag(tag, 2); this.writeBytes(value); }
    writeFixed32Field(tag, value) { this.writeTag(tag, 5); this.writeFixed32(value); }
    writeSFixed32Field(tag, value) { this.writeTag(tag, 5); this.writeSFixed32(value); }
    writeFixed64Field(tag, value) { this.writeTag(tag, 1); this.writeFixed64(value); }
    writeSFixed64Field(tag, value) { this.writeTag(tag, 1); this.writeSFixed64(value); }
    writeVarintField(tag, value) { this.writeTag(tag, 0); this.writeVarint(value); }
    writeSVarintField(tag, value) { this.writeTag(tag, 0); this.writeSVarint(value); }
    writeStringField(tag, value) { this.writeTag(tag, 2); this.writeString(value); }
    writeFloatField(tag, value) { this.writeTag(tag, 5); this.writeFloat(value); }
    writeDoubleField(tag, value) { this.writeTag(tag, 1); this.writeDouble(value); }
    writeBooleanField(tag, value) { this.writeVarintField(tag, Boolean(value)); }
}

function readPacked(reader, readValue, itemSize = 1) {
    const values = [];
    const length = reader.type === 2 ? reader.readVarint() : itemSize;
    const end = reader.pos + length;
    while (reader.pos < end) values.push(readValue.call(reader));
    return values;
}

function writePacked(writer, tag, values, writeValue) {
    if (!values.length) return;
    writer.writeTag(tag, 2);
    writer.writeRawMessage((items, target) => {
        for (const value of items) writeValue.call(target, value);
    }, values);
}

function readVarintRemainder(low, fifthByte, signed, reader, start) {
    let high = (fifthByte & 0x70) >> 4;
    let shift = 3;
    let byte;

    do {
        if (reader.pos >= reader.length || reader.pos - start >= 10) {
            throw new Error('Expected varint not more than 10 bytes');
        }
        byte = reader.buf[reader.pos++];
        high |= (byte & 0x7f) << shift;
        shift += 7;
    } while (byte >= 0x80);

    return toNum(low, high, signed);
}

function toNum(low, high, signed) {
    if (signed) return high * 0x100000000 + (low >>> 0);
    return (high >>> 0) * 0x100000000 + (low >>> 0);
}

function varintLength(value) {
    let length = 1;
    while (value > 0x7f) {
        value >>>= 7;
        length++;
    }
    return length;
}

function readUtf8(buffer, start, end) {
    if (UTF8_DECODER && end - start >= TEXT_DECODER_MIN_LENGTH) {
        return UTF8_DECODER.decode(buffer.subarray(start, end));
    }

    let result = '';
    while (start < end) {
        const first = buffer[start++];
        if (first < 0x80) {
            result += String.fromCharCode(first);
        } else if (first < 0xe0) {
            result += String.fromCharCode((first & 0x1f) << 6 | buffer[start++] & 0x3f);
        } else if (first < 0xf0) {
            result += String.fromCharCode(
                (first & 0x0f) << 12 |
                (buffer[start++] & 0x3f) << 6 |
                buffer[start++] & 0x3f
            );
        } else {
            let codePoint = (first & 0x07) << 18 |
                (buffer[start++] & 0x3f) << 12 |
                (buffer[start++] & 0x3f) << 6 |
                buffer[start++] & 0x3f;
            codePoint -= 0x10000;
            result += String.fromCharCode(
                (codePoint >> 10) + 0xd800,
                (codePoint & 0x3ff) + 0xdc00
            );
        }
    }
    return result;
}

function encodeUtf8(value) {
    const bytes = [];
    for (let i = 0; i < value.length; i++) {
        let codePoint = value.charCodeAt(i);
        if (codePoint > 0xd7ff && codePoint < 0xe000) {
            if (codePoint < 0xdc00 && i + 1 < value.length) {
                const next = value.charCodeAt(i + 1);
                if (next >= 0xdc00 && next <= 0xdfff) {
                    codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (next - 0xdc00);
                    i++;
                }
            }
            if (codePoint >= 0xd800 && codePoint <= 0xdfff) codePoint = 0xfffd;
        }

        if (codePoint < 0x80) bytes.push(codePoint);
        else if (codePoint < 0x800) bytes.push(0xc0 | codePoint >> 6, 0x80 | codePoint & 0x3f);
        else if (codePoint < 0x10000) bytes.push(
            0xe0 | codePoint >> 12,
            0x80 | codePoint >> 6 & 0x3f,
            0x80 | codePoint & 0x3f
        );
        else bytes.push(
            0xf0 | codePoint >> 18,
            0x80 | codePoint >> 12 & 0x3f,
            0x80 | codePoint >> 6 & 0x3f,
            0x80 | codePoint & 0x3f
        );
    }
    return Uint8Array.from(bytes);
}

export { PbfReader, PbfWriter };
