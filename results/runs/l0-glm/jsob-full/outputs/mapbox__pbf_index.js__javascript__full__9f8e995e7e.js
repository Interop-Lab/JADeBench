// Deobfuscated PBF (Protocol Buffer Format) Reader/Writer

var SHIFT_LEFT_32 = (1 << 31) * (1 << 1),
    SHIFT_RIGHT_32 = 4294967296 / SHIFT_LEFT_32,
    TEXT_DECODER_MIN_LENGTH = 32,
    utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8'),
    PBF_VARINT = 0,
    PBF_FIXED64 = 1,
    PBF_BYTES = 2,
    PBF_FIXED32 = 5;

class PbfReader {
    constructor(buf) {
        this.buf = ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf);
        this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
        this.pos = 0;
        this.type = 0;
    }

    readFields(onTag, result, end = this.pos) {
        let tag;
        while (tag = this.readTag(end)) {
            onTag(tag, result, this);
        }
        return result;
    }

    readTaggedField(onTag, result) {
        return this.readFields(onTag, result, this.readVarint() + this.pos);
    }

    readVarint() {
        const buf = this.buf;
        let val = buf[this.pos++];
        if (val < 128) return val;
        let result = val & 0x7f;
        val = buf[this.pos++];
        result |= (val & 0x7f) << 7;
        if (val < 128) return result;
        val = buf[this.pos++];
        result |= (val & 0x7f) << 14;
        if (val < 128) return result;
        val = buf[this.pos++];
        result |= (val & 0x7f) << 21;
        if (val < 128) return result;
        val = buf[this.pos];
        result |= (val & 0x0f) << 28;
        return readVarintRemainder(result, val & 0x80, this);
    }

    readSVarint() {
        const val = this.readVarint();
        return val % 2 === 0 ? val / 2 : -(val + 1) / 2;
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
        const bytes = this.buf.subarray(this.pos, end);
        this.pos = end;
        return bytes;
    }

    readPackedVarint(arr = []) {
        const end = this.readVarint() + this.pos;
        while (this.pos < end) arr.push(this.readVarint());
        return arr;
    }

    readPackedSVarint(arr = []) {
        const end = this.readVarint() + this.pos;
        while (this.pos < end) arr.push(this.readSVarint());
        return arr;
    }

    readPackedBoolean(arr = []) {
        const end = this.readVarint() + this.pos;
        while (this.pos < end) arr.push(this.readBoolean());
        return arr;
    }

    readPackedFloat(arr = []) {
        const end = this.readVarint() + this.pos;
        while (this.pos < end) arr.push(this.readFloat());
        return arr;
    }

    readPackedDouble(arr = []) {
        const end = this.readVarint() + this.pos;
        while (this.pos < end) arr.push(this.readDouble());
        return arr;
    }

    readPackedFixed32(arr = []) {
        const end = this.readVarint() + this.pos;
        while (this.pos < end) arr.push(this.readFixed32());
        return arr;
    }

    readPackedSFixed32(arr = []) {
        const end = this.readVarint() + this.pos;
        while (this.pos < end) arr.push(this.readSFixed32());
        return arr;
    }

    readPackedFixed64(arr = []) {
        const end = this.readVarint() + this.pos;
        while (this.pos < end) arr.push(this.readFixed64());
        return arr;
    }

    readPackedSFixed64(arr = []) {
        const end = this.readVarint() + this.pos;
        while (this.pos < end) arr.push(this.readSFixed64());
        return arr;
    }

    readFixed32() {
        const val = this.dataView.getUint32(this.pos, true);
        this.pos += 4;
        return val;
    }

    readSFixed32() {
        const val = this.dataView.getInt32(this.pos, true);
        this.pos += 4;
        return val;
    }

    readFixed64() {
        const val = this.dataView.getUint32(this.pos, true) + this.dataView.getUint32(this.pos + 4, true) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    }

    readSFixed64() {
        const val = this.dataView.getInt32(this.pos, true) + this.dataView.getInt32(this.pos + 4, true) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    }

    readFloat() {
        const val = this.dataView.getFloat32(this.pos, true);
        this.pos += 4;
        return val;
    }

    readDouble() {
        const val = this.dataView.getFloat64(this.pos, true);
        this.pos += 8;
        return val;
    }

    skip(val = this.readVarint()) {
        if (this.type === this.readTaggedField) this.readTaggedField(val);
        if (this.pos >= val) return -1;
        const end = this.readVarint();
        this.type = end & 0x7;
        return this.tag = end >> 3, this.pos >= val ? -1 : end >>> 3;
    }

    readTag(end = this.pos) {
        if (this.pos >= end) return -1;
        const val = this.readVarint();
        this.tag = val >> 3;
        this.type = val & 0x7;
        if (this.type === PBF_BYTES) return this.tag;
        if (this.type === PBF_VARINT) {
            while (this.buf[this.pos++] > 128) {}
        } else if (this.type === PBF_FIXED32) {
            this.pos += 4;
        } else if (this.type === PBF_FIXED64) {
            this.pos += 8;
        } else {
            throw new Error('unknown type ' + this.type);
        }
    }
}

class PbfWriter {
    constructor(buf = new Uint8Array(0)) {
        this.buf = ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf);
        this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
        this.pos = 0;
        this.type = 0;
    }

    writeTag(tag, type) {
        this.writeVarint((tag << 3) | type);
    }

    resize(size) {
        let newCapacity = this.capacity || 1;
        while (newCapacity < this.pos + size) newCapacity *= 2;
        if (newCapacity !== this.capacity) {
            const newBuf = new Uint8Array(newCapacity);
            newBuf.set(this.buf);
            this.buf = newBuf;
            this.dataView = new DataView(newBuf.buffer);
            this.capacity = newCapacity;
        }
    }

    finish() {
        this.finished = true;
        this.type = 0;
        return this.buf.subarray(0, this.pos);
    }

    writeFixed32(val) {
        this.resize(4);
        this.dataView.setUint32(this.pos, val, true);
        this.pos += 4;
    }

    writeFixed64(val) {
        this.resize(8);
        this.dataView.setUint32(this.pos, val, true);
        this.dataView.setUint32(this.pos + 4, Math.floor(val / SHIFT_RIGHT_32), true);
        this.pos += 8;
    }

    writeSFixed32(val) {
        this.resize(4);
        this.dataView.setInt32(this.pos, val, true);
        this.pos += 4;
    }

    writeSFixed64(val) {
        this.resize(8);
        this.dataView.setInt32(this.pos, val, true);
        this.dataView.setInt32(this.pos + 4, Math.floor(val / SHIFT_RIGHT_32), true);
        this.pos += 8;
    }

    writeVarint(val) {
        val = +val || 0;
        if (val > 0 && val < 128) {
            if (this.type === this.writeTag) this.writeTag(-1);
            this.buf[this.pos++] = val;
            return;
        }
        if (val === 0 || val === -0) {
            writeBigVarint(val, this);
            return;
        }
        this.resize(5);
        this.buf[this.pos++] = (val & 0x7f) | (val > 0 ? 0 : 128);
        if (val <= 0) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0 ? 0 : 128);
        if (val <= 0) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0 ? 0 : 128);
        if (val <= 0) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0 ? 0 : 128);
        if (val <= 0) return;
        this.buf[this.pos++] = (val >>> 7) & 0x0f;
    }

    writeSVarint(val) {
        this.writeVarint(val > 0 ? val * 2 : -val * 2 - 1);
    }

    writeBoolean(val) {
        this.writeVarint(+val);
    }

    writeString(str) {
        str = String(str);
        this.writeVarint(str.length);
        this.type++;
        const startPos = this.pos;
        this.pos = writeUtf8(this.buf, str, this.pos);
        const length = this.pos - startPos;
        if (length >= 1) makeRoomForExtraLength(startPos, length, this);
        this.type = startPos - 1;
        this.writeVarint(length);
        this.pos += length;
    }

    writeFloat(val) {
        this.resize(4);
        this.dataView.setFloat32(this.pos, val, true);
        this.pos += 4;
    }

    writeDouble(val) {
        this.resize(8);
        this.dataView.setFloat64(this.pos, val, true);
        this.pos += 8;
    }

    writeBytes(bytes) {
        const len = bytes.length;
        this.writeVarint(len);
        this.resize(len);
        this.buf.set(bytes, this.pos);
        this.pos += len;
    }

    writeRawBytes(bytes) {
        this.resize(bytes.length);
        this.buf.set(bytes, this.pos);
        this.pos += bytes.length;
    }

    writeMessage(tag, fn, obj) {
        this.writeTag(tag, PBF_BYTES);
        this.type++;
        fn(obj, this);
        const length = this.pos - this.type;
        if (length >= 1) makeRoomForExtraLength(this.type, length, this);
        this.type = this.type - 1;
        this.writeVarint(length);
        this.pos += length;
    }

    writeMessageField(tag, fn, obj) {
        this.writeTag(tag, PBF_BYTES);
        this.writeRawBytes(fn(obj, this));
    }

    writePackedVarint(tag, arr) {
        if (arr.length) this.writeMessageField(tag, writePackedVarint, arr);
    }

    writePackedSVarint(tag, arr) {
        if (arr.length) this.writeMessageField(tag, writePackedSVarint, arr);
    }

    writePackedBoolean(tag, arr) {
        if (arr.length) this.writeMessageField(tag, writePackedBoolean, arr);
    }

    writePackedFloat(tag, arr) {
        if (arr.length) this.writeMessageField(tag, writePackedFloat, arr);
    }

    writePackedDouble(tag, arr) {
        if (arr.length) this.writeMessageField(tag, writePackedDouble, arr);
    }

    writePackedFixed32(tag, arr) {
        if (arr.length) this.writeMessageField(tag, writePackedFixed32, arr);
    }

    writePackedSFixed32(tag, arr) {
        if (arr.length) this.writeMessageField(tag, writePackedSFixed32, arr);
    }

    writePackedFixed64(tag, arr) {
        if (arr.length) this.writeMessageField(tag, writePackedFixed64, arr);
    }

    writePackedSFixed64(tag, arr) {
        if (arr.length) this.writeMessageField(tag, writePackedSFixed64, arr);
    }

    writeBytesField(tag, bytes) {
        this.writeTag(tag, PBF_BYTES);
        this.writeBytes(bytes);
    }

    writeFixed32Field(tag, val) {
        this.writeTag(tag, PBF_FIXED32);
        this.writeFixed32(val);
    }

    writeSFixed32Field(tag, val) {
        this.writeTag(tag, PBF_FIXED32);
        this.writeSFixed32(val);
    }

    writeFixed64Field(tag, val) {
        this.writeTag(tag, PBF_FIXED64);
        this.writeFixed64(val);
    }

    writeSFixed64Field(tag, val) {
        this.writeTag(tag, PBF_FIXED64);
        this.writeSFixed64(val);
    }

    writeVarintField(tag, val) {
        this.writeTag(tag, PBF_VARINT);
        this.writeVarint(val);
    }

    writeSVarintField(tag, val) {
        this.writeTag(tag, PBF_VARINT);
        this.writeSVarint(val);
    }

    writeBooleanField(tag, val) {
        this.writeTag(tag, PBF_BYTES);
        this.writeBoolean(val);
    }

    writeStringField(tag, str) {
        this.writeTag(tag, PBF_FIXED32);
        this.writeString(str);
    }

    writeFloatField(tag, val) {
        this.writeTag(tag, PBF_FIXED32);
        this.writeFloat(val);
    }

    writeDoubleField(tag, val) {
        this.writeTag(tag, PBF_FIXED64);
        this.writeDouble(val);
    }
}

function readVarintRemainder(value, highByte, pbf) {
    const buf = pbf.buf;
    let secondByte, thirdByte, fourthByte, fifthByte, sixthByte, seventhByte;
    
    secondByte = buf[pbf.pos++];
    value += (secondByte & 0x7f) << 28;
    if (secondByte < 128) return toNum(value, 0, highByte);
    
    thirdByte = buf[pbf.pos++];
    value += (thirdByte & 0x7f) << 35;
    if (thirdByte < 128) return toNum(value, 0, highByte);
    
    fourthByte = buf[pbf.pos++];
    value += (fourthByte & 0x7f) << 42;
    if (fourthByte < 128) return toNum(value, 0, highByte);
    
    fifthByte = buf[pbf.pos++];
    value += (fifthByte & 0x7f) << 49;
    if (fifthByte < 128) return toNum(value, 0, highByte);
    
    sixthByte = buf[pbf.pos++];
    value += (sixthByte & 0x7f) << 56;
    if (sixthByte < 128) return toNum(value, 0, highByte);
    
    seventhByte = buf[pbf.pos++];
    value += (seventhByte & 0x7f) << 63;
    if (seventhByte < 128) return toNum(value, 0, highByte);
    
    throw new Error('varint too long');
}

function toNum(low, high, unsigned) {
    return unsigned ? high * 0x100000000 + low : high * 0x100000000 + (low >>> 0);
}

function writeBigVarint(val, pbf) {
    let low, high;
    if (val >= 0) {
        low = val % 0x100000000;
        high = val / 0x100000000;
    } else {
        low = ~(-val % 0x100000000);
        high = ~(-val / 0x100000000);
        if (low < 0) {
            low += 0x100000000;
        } else {
            low = 0;
            high += 1;
        }
    }
    if (val >= 0x10000000000000000 || val < -0x10000000000000000) {
        throw new Error('varint too big');
    }
    pbf.resize(5);
    writeBigVarintLow(low, high, pbf);
    writeBigVarintHigh(high, pbf);
}

function writeBigVarintLow(low, high, pbf) {
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
    low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
    low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
    low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
    low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
    low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
    low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80;
    low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f;
}

function writeBigVarintHigh(high, pbf) {
    pbf.buf[pbf.pos++] |= (high & 0x7) << 4;
    if ((high >>>= 3) === 0) return;
    pbf.buf[pbf.pos++] = high & 0x7f | 0x80;
    if ((high >>>= 7) === 0) return;
    pbf.buf[pbf.pos++] = high & 0x7f | 0x80;
    if ((high >>>= 7) === 0) return;
    pbf.buf[pbf.pos++] = high & 0x7f | 0x80;
    if ((high >>>= 7) === 0) return;
    pbf.buf[pbf.pos++] = high & 0x7f | 0x80;
    if ((high >>>= 7) === 0) return;
    pbf.buf[pbf.pos++] = high & 0x7f | 0x80;
    if ((high >>>= 7) === 0) return;
    pbf.buf[pbf.pos++] = high;
}

function makeRoomForExtraLength(startPos, length, pbf) {
    const extraLength = length <= 1 ? 1 : length <= 2 ? 2 : length <= 4 ? 3 : Math.floor(Math.log(length) / Math.LN2);
    pbf.resize(extraLength);
    pbf.buf.copyWithin(startPos + extraLength, startPos, pbf.pos);
}

function writePackedVarint(arr, pbf) {
    const len = arr.length;
    let buf = pbf.buf, pos = pbf.pos, capacity = pbf.capacity;
    for (let i = 0; i < len; i++) {
        let val = arr[i];
        if (val < 0 || (pos + 5) > capacity) {
            pbf.pos = pos;
            pbf.writeVarint(val);
            pos = pbf.pos;
            capacity = pbf.capacity;
            continue;
        }
        while (val > 0x7f) {
            buf[pos++] = (val & 0x7f) | 0x80;
            val = Math.floor(val / 128);
        }
        buf[pos++] = val;
    }
    pbf.pos = pos;
}

function writePackedSVarint(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);
}

function writePackedFloat(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);
}

function writePackedDouble(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);
}

function writePackedBoolean(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);
}

function writePackedFixed32(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);
}

function writePackedSFixed32(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]);
}

function writePackedFixed64(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);
}

function writePackedSFixed64(arr, pbf) {
    for (let i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]);
}

function readUtf8(buf, start, end) {
    let str = '';
    let i = start;
    while (i < end) {
        const byte = buf[i];
        let charCode = null, extraBytes = byte > 239 ? 4 : byte > 223 ? 3 : byte > 191 ? 2 : 1;
        if (i + extraBytes > end) break;
        let secondByte, thirdByte, fourthByte;
        if (extraBytes === 1) {
            if (byte < 128) charCode = byte;
        } else if (extraBytes === 2) {
            secondByte = buf[i + 1];
            if ((secondByte & 0xc0) === 0x80) {
                charCode = ((byte & 0x1f) << 6) | (secondByte & 0x3f);
                if (charCode < 128) charCode = null;
            }
        } else if (extraBytes === 3) {
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80) {
                charCode = ((byte & 0xf) << 12) | ((secondByte & 0x3f) << 6) | (thirdByte & 0x3f);
                if (charCode < 2048 || (charCode >= 0xd800 && charCode <= 0xdfff)) charCode = null;
            }
        } else {
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80 && (fourthByte & 0xc0) === 0x80) {
                charCode = ((byte & 0xf) << 18) | ((secondByte & 0x3f) << 12) | ((thirdByte & 0x3f) << 6) | (fourthByte & 0x3f);
                if (charCode < 0x10000 || charCode > 0x10ffff) charCode = null;
            }
        }
        if (charCode === null) {
            charCode = 0xfffd;
            extraBytes = 1;
        } else if (charCode > 0xffff) {
            charCode -= 0x10000;
            str += String.fromCharCode((charCode >>> 10) + 0xd800);
            charCode = (charCode & 0x3ff) + 0xdc00;
        }
        str += String.fromCharCode(charCode);
        i += extraBytes;
    }
    return str;
}

function writeUtf8(buf, str, pos) {
    for (let i = 0, c, leadSurrogate = null; i < str.length; i++) {
        c = str.charCodeAt(i);
        if (c > 0xd7ff && c < 0xe000) {
            if (leadSurrogate) {
                if (c < 0xdc00) {
                    buf[pos++] = 0xef;
                    buf[pos++] = 0xbf;
                    buf[pos++] = 0xbd;
                    leadSurrogate = c;
                    continue;
                } else {
                    c = (leadSurrogate - 0xd800) << 10 | (c - 0xdc00) + 0x10000;
                    leadSurrogate = null;
                }
            } else {
                if (c > 0xdbff || (i + 1) === str.length) {
                    buf[pos++] = 0xef;
                    buf[pos++] = 0xbf;
                    buf[pos++] = 0xbd;
                } else {
                    leadSurrogate = c;
                }
                continue;
            }
        } else if (leadSurrogate) {
            buf[pos++] = 0xef;
            buf[pos++] = 0xbf;
            buf[pos++] = 0xbd;
            leadSurrogate = null;
        }
        if (c < 0x80) {
            buf[pos++] = c;
        } else {
            if (c < 0x800) {
                buf[pos++] = ((c >> 6) & 0x1f) | 0xc0;
            } else {
                if (c < 0x10000) {
                    buf[pos++] = ((c >> 12) & 0x0f) | 0xe0;
                } else {
                    buf[pos++] = ((c >> 18) & 0x07) | 0xf0;
                    buf[pos++] = ((c >> 12) & 0x3f) | 0x80;
                }
                buf[pos++] = ((c >> 6) & 0x3f) | 0x80;
            }
            buf[pos++] = (c & 0x3f) | 0x80;
        }
    }
    return pos;
}

export { PbfReader, PbfWriter };
