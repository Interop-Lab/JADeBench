'use strict';

const NodeFile = globalThis.File ?? require('node:buffer').File;

const SCAN_KEYS = ['host', 'port', 'socket', 'outer', 'retries', 'retryDelay'];

const { scanBuffer, Verdict } = require('pompelmi');

function buildScanOptions(options) {
  const result = {};
  for (const key of SCAN_KEYS) {
    if (options && options[key] !== undefined) {
      result[key] = options[key];
    }
  }
  return result;
}

function toBuffer(input) {
  if (input === undefined || input === null) {
    return Buffer.alloc(0);
  }
  if (Buffer.isBuffer(input)) {
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return Buffer.from(input);
  }
  if (ArrayBuffer.isView(input)) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  }
  if (typeof input === 'string') {
    return Buffer.from(input);
  }
  if (input instanceof NodeFile || (typeof Blob !== 'undefined' && input instanceof Blob)) {
    return input.arrayBuffer().then(toBuffer);
  }
  if (input && typeof input.arrayBuffer === 'function') {
    return input.arrayBuffer().then(toBuffer);
  }
  if (input && typeof input[Symbol.iterator] === 'function') {
    return Buffer.from(input);
  }
  throw new TypeError('Unsupported input type');
}

async function scanUpload(file, options) {
  const buffer = await toBuffer(file);
  return scanBuffer(buffer, buildScanOptions(options));
}

async function scanFormData(formData, options) {
  const files = [];
  if (formData && typeof formData[Symbol.iterator] === 'function') {
    for (const [key, value] of formData) {
      if (value && typeof value === 'object') {
        files.push({ key, value });
      }
    }
  }
  const results = [];
  for (const { key, value } of files) {
    const buffer = await toBuffer(value);
    const verdict = await scanBuffer(buffer, buildScanOptions(options));
    results.push({ key, verdict });
  }
  return results;
}

module.exports = {
  scanUpload,
  scanFormData,
  Verdict,
};
