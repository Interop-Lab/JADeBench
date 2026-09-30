'use strict';
var {scanBuffer, Verdict} = require('clamscan');
var NodeFile = globalThis.File ?? require('node:buffer')['File'];

var SCAN_KEYS = ['timeout', 'scanRecursively', 'clamdscan', 'preference', 'debugMode', 'scanArchives'];

function buildScanOptions(options) {
    const result = {};
    for (const key of SCAN_KEYS) {
        if (options[key] !== void 0) {
            result[key] = options[key];
        }
    }
    return result;
}

async function toBuffer(input) {
    if (Buffer.isBuffer(input)) {
        return input;
    }
    if (input instanceof Uint8Array) {
        return Buffer.from(input);
    }
    if (input && typeof input.arrayBuffer === 'function') {
        return Buffer.from(await input.arrayBuffer());
    }
    return null;
}

async function scanUpload(file, options) {
    if (!file) {
        return Verdict.CLEAN;
    }
    const scanOptions = buildScanOptions(options || {});
    const buffer = await toBuffer(file);
    if (!buffer || buffer.length === 0) {
        return Verdict.CLEAN;
    }
    const result = await scanBuffer(buffer, scanOptions);
    if (result === Verdict.INFECTED) {
        const filename = file && typeof file.name === 'string' ? file.name : 'unknown';
        const onInfected = options && options.onInfected;
        if (typeof onInfected === 'function') {
            const detail = {};
            detail['filename'] = filename;
            return onInfected(detail);
        }
        const body = {};
        body['message'] = 'Malicious file detected';
        body['filename'] = filename;
        const headers = {};
        headers['Content-Type'] = 'application/json';
        const init = {};
        init['status'] = 422;
        init['headers'] = headers;
        throw new Response(JSON.stringify(body), init);
    }
    return result;
}

async function scanFormData(formData, options) {
    if (!formData || typeof formData.entries !== 'function') {
        return;
    }
    for (const [, value] of formData.entries()) {
        if (value instanceof NodeFile || (value && typeof value.arrayBuffer === 'function')) {
            await scanUpload(value, options);
        }
    }
}

const exports = {};
exports['scanUpload'] = scanUpload;
exports['scanFormData'] = scanFormData;
exports['Verdict'] = Verdict;
module['exports'] = exports;
