const SHIFT_LEFT_32 = 0x100000000;
const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;

const textDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf8');
const textEncoder = typeof TextEncoder === 'undefined' ? null : new TextEncoder();

class PbfReader {
    constructor(buffer) {
        this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
        this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
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

    nextField() {
        if (this.pos >= this.length) return false;
        const tagAndType = this.readVarint();
        this.type = tagAndType & 7;
        return tagAndType >> 3;
    }

    readMessage(readField, result) {
        const messageLength = this.readVarint();
        return this.readFields(readField, result, this.pos + messageLength);
    }

    readFixed32() { const value = this.dataView.getUint32(this.pos, true); this.pos += 4; return value; }
    readSFixed32() { const value = this.dataView.getInt32(this.pos, true); this.pos += 4; return value; }
    readFixed64() { const low = this.dataView.getUint32(this.pos, true); const high = this.dataView.getUint32(this.pos + 4, true); this.pos += 8; return low + high * SHIFT_LEFT_32; }
    readSFixed64() { const low = this.dataView.getUint32(this.pos, true); const high = this.dataView.getInt32(this.pos + 4, true); this.pos += 8; return low + high * SHIFT_LEFT_32; }
    readFloat() { const value = this.dataView.getFloat32(this.pos, true); this.pos += 4; return value; }
    readDouble() { const value = this.dataView.getFloat64(this.pos, true); this.pos += 8; return value; }

    readVarint(signed = false) {
        let value = 0n;
        let shift = 0n;
        for (let byteIndex = 0; byteIndex < 10; byteIndex++) {
            const byte = this.buf[this.pos++];
            value |= BigInt(byte & 0x7f) << shift;
            if (byte < 0x80) return Number(signed ? BigInt.asIntN(64, value) : value);
            shift += 7n;
        }
        throw new Error('Expected varint not more than 10 bytes');
    }

    readSVarint() { const value = this.readVarint(); return value % 2 === 1 ? (value + 1) / -2 : value / 2; }
    readBoolean() { return Boolean(this.readVarint()); }

    readString() {
        const byteLength = this.readVarint();
        const end = this.pos + byteLength;
        const bytes = this.buf.subarray(this.pos, end);
        this.pos = end;
        return decodeUtf8(bytes);
    }

    readBytes() {
        const byteLength = this.readVarint();
        const end = this.pos + byteLength;
        const bytes = this.buf.subarray(this.pos, end);
        this.pos = end;
        return bytes;
    }

    readPackedVarint(target = []) { return readPacked(this, target, this.readVarint); }
    readPackedSVarint(target = []) { return readPacked(this, target, this.readSVarint); }
    readPackedBoolean(target = []) { return readPacked(this, target, this.readBoolean); }
    readPackedFloat(target = []) { return readPacked(this, target, this.readFloat); }
    readPackedDouble(target = []) { return readPacked(this, target, this.readDouble); }
    readPackedFixed32(target = []) { return readPacked(this, target, this.readFixed32); }
    readPackedSFixed32(target = []) { return readPacked(this, target, this.readSFixed32); }
    readPackedFixed64(target = []) { return readPacked(this, target, this.readFixed64); }
    readPackedSFixed64(target = []) { return readPacked(this, target, this.readSFixed64); }

    readPackedEnd() {
        if (this.type !== PBF_BYTES) return this.pos + 1;
        const byteLength = this.readVarint();
        return this.pos + byteLength;
    }

    skip(tagAndType) {
        const type = tagAndType & 7;
        if (type === PBF_VARINT) while (this.buf[this.pos++] > 0x7f) {}
        else if (type === PBF_BYTES) this.pos += this.readVarint();
        else if (type === PBF_FIXED32) this.pos += 4;
        else if (type === PBF_FIXED64) this.pos += 8;
        else throw new Error(`Unimplemented type: ${type}`);
    }
}

class PbfWriter {
    constructor(buffer = new Uint8Array(16)) {
        this.buf = ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer);
        this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
        this.pos = 0;
        this.length = this.buf.length;
    }

    writeTag(tag, type) { this.writeVarint((tag << 3) | type); }

    realloc(minimumBytes) {
        let capacity = this.length || 16;
        while (capacity < this.pos + minimumBytes) capacity *= 2;
        if (capacity === this.length) return;
        const next = new Uint8Array(capacity);
        next.set(this.buf);
        this.buf = next;
        this.dataView = new DataView(next.buffer);
        this.length = capacity;
    }

    finish() {
        this.length = this.pos;
        this.pos = 0;
        return this.buf.subarray(0, this.length);
    }

    writeFixed32(value) { this.realloc(4); this.dataView.setUint32(this.pos, value, true); this.pos += 4; }
    writeSFixed32(value) { this.realloc(4); this.dataView.setInt32(this.pos, value, true); this.pos += 4; }
    writeFixed64(value) { this.realloc(8); this.dataView.setUint32(this.pos, value >>> 0, true); this.dataView.setUint32(this.pos + 4, Math.floor(value / SHIFT_LEFT_32), true); this.pos += 8; }
    writeSFixed64(value) { this.realloc(8); this.dataView.setUint32(this.pos, value >>> 0, true); this.dataView.setInt32(this.pos + 4, Math.floor(value / SHIFT_LEFT_32), true); this.pos += 8; }

    writeVarint(value) {
        let remaining = BigInt.asUintN(64, BigInt(Math.trunc(value)));
        this.realloc(10);
        while (remaining > 0x7fn) {
            this.buf[this.pos++] = Number(remaining & 0x7fn) | 0x80;
            remaining >>= 7n;
        }
        this.buf[this.pos++] = Number(remaining);
    }

    writeSVarint(value) { this.writeVarint(value < 0 ? -value * 2 - 1 : value * 2); }
    writeBoolean(value) { this.writeVarint(Boolean(value)); }

    writeString(value) {
        const bytes = encodeUtf8(value);
        this.writeVarint(bytes.length);
        this.realloc(bytes.length);
        this.buf.set(bytes, this.pos);
        this.pos += bytes.length;
    }

    writeFloat(value) { this.realloc(4); this.dataView.setFloat32(this.pos, value, true); this.pos += 4; }
    writeDouble(value) { this.realloc(8); this.dataView.setFloat64(this.pos, value, true); this.pos += 8; }

    writeBytes(bytes) {
        this.writeVarint(bytes.length);
        this.realloc(bytes.length);
        this.buf.set(bytes, this.pos);
        this.pos += bytes.length;
    }

    writeRawMessage(writeMessage, value) {
        this.pos++;
        const bodyStart = this.pos;
        writeMessage(value, this);
        const bodyLength = this.pos - bodyStart;
        const lengthBytes = encodeVarint(bodyLength);
        const extraBytes = lengthBytes.length - 1;
        if (extraBytes > 0) {
            this.realloc(extraBytes);
            this.buf.copyWithin(bodyStart + extraBytes, bodyStart, bodyStart + bodyLength);
            this.pos += extraBytes;
        }
        this.buf.set(lengthBytes, bodyStart - 1);
    }

    writeMessage(tag, writeMessage, value) { this.writeTag(tag, PBF_BYTES); this.writeRawMessage(writeMessage, value); }
    writePackedVarint(tag, values) { writePacked(this, tag, values, this.writeVarint); }
    writePackedSVarint(tag, values) { writePacked(this, tag, values, this.writeSVarint); }
    writePackedBoolean(tag, values) { writePacked(this, tag, values, this.writeBoolean); }
    writePackedFloat(tag, values) { writePacked(this, tag, values, this.writeFloat); }
    writePackedDouble(tag, values) { writePacked(this, tag, values, this.writeDouble); }
    writePackedFixed32(tag, values) { writePacked(this, tag, values, this.writeFixed32); }
    writePackedSFixed32(tag, values) { writePacked(this, tag, values, this.writeSFixed32); }
    writePackedFixed64(tag, values) { writePacked(this, tag, values, this.writeFixed64); }
    writePackedSFixed64(tag, values) { writePacked(this, tag, values, this.writeSFixed64); }

    writeBytesField(tag, value) { this.writeTag(tag, PBF_BYTES); this.writeBytes(value); }
    writeFixed32Field(tag, value) { this.writeTag(tag, PBF_FIXED32); this.writeFixed32(value); }
    writeSFixed32Field(tag, value) { this.writeTag(tag, PBF_FIXED32); this.writeSFixed32(value); }
    writeFixed64Field(tag, value) { this.writeTag(tag, PBF_FIXED64); this.writeFixed64(value); }
    writeSFixed64Field(tag, value) { this.writeTag(tag, PBF_FIXED64); this.writeSFixed64(value); }
    writeVarintField(tag, value) { this.writeTag(tag, PBF_VARINT); this.writeVarint(value); }
    writeSVarintField(tag, value) { this.writeTag(tag, PBF_VARINT); this.writeSVarint(value); }
    writeStringField(tag, value) { this.writeTag(tag, PBF_BYTES); this.writeString(value); }
    writeFloatField(tag, value) { this.writeTag(tag, PBF_FIXED32); this.writeFloat(value); }
    writeDoubleField(tag, value) { this.writeTag(tag, PBF_FIXED64); this.writeDouble(value); }
    writeBooleanField(tag, value) { this.writeVarintField(tag, value); }
}

function readPacked(reader, target, readValue) {
    const end = reader.readPackedEnd();
    while (reader.pos < end) target.push(readValue.call(reader));
    return target;
}

function writePacked(writer, tag, values, writeValue) {
    if (!values.length) return;
    writer.writeMessage(tag, (items, messageWriter) => {
        for (const value of items) writeValue.call(messageWriter, value);
    }, values);
}

function encodeVarint(value) {
    const bytes = [];
    let remaining = value;
    do {
        let byte = remaining & 0x7f;
        remaining = Math.floor(remaining / 128);
        if (remaining) byte |= 0x80;
        bytes.push(byte);
    } while (remaining);
    return bytes;
}

function decodeUtf8(bytes) {
    if (textDecoder) return textDecoder.decode(bytes);
    let encoded = '';
    for (const byte of bytes) encoded += `%${byte.toString(16).padStart(2, '0')}`;
    try { return decodeURIComponent(encoded); }
    catch { return String.fromCharCode(...bytes); }
}

function encodeUtf8(value) {
    if (textEncoder) return textEncoder.encode(value);
    const encoded = unescape(encodeURIComponent(value));
    const bytes = new Uint8Array(encoded.length);
    for (let i = 0; i < encoded.length; i++) bytes[i] = encoded.charCodeAt(i);
    return bytes;
}

export { PbfReader, PbfWriter };
