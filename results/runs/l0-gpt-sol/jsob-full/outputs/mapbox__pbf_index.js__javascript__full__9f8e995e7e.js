const SHIFT_LEFT_32 = 2 ** 32;
const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
const TEXT_DECODER_MIN_LENGTH = 200;
const utf8TextDecoder =
    typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");

const PBF_VARINT = 0;
const PBF_FIXED64 = 1;
const PBF_BYTES = 2;
const PBF_FIXED32 = 5;

class PbfReader {
    constructor(buffer) {
        this.buf = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        this.pos = 0;
        this.type = 0;
        this.length = this.buf.length
