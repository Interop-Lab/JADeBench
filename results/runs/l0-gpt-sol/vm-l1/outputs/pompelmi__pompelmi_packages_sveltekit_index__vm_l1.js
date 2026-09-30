'use strict';

const { scanBuffer, Verdict } = require('pompelmi');

const NodeFile = globalThis.File ?? require('node:buffer').File;

const SCAN_KEYS = [
  'file',
  'files',
  'socket',
  'path',
  'buffer',
  'stream'
];

function buildScanOptions(options) {
  if (options == null || typeof options !== 'object') {
    return {};
  }

  return {
    ...options
  };
}

async function toBuffer(value) {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  }

  if (value instanceof ArrayBuffer) {
    return Buffer.from(value);
  }

  if (value instanceof NodeFile || (
    value &&
    typeof value.arrayBuffer === 'function'
  )) {
    return Buffer.from(await value.arrayBuffer());
  }

  if (typeof value === 'string') {
    return Buffer.from(value);
  }

  throw new TypeError('Unsupported upload value');
}

async function scanUpload(upload, options) {
  return scanBuffer(
    await toBuffer(upload),
    buildScanOptions(options)
  );
}

async function scanFormData(formData, options) {
  if (formData == null || typeof formData.entries !== 'function') {
    throw new TypeError('Expected a FormData-like object');
  }

  const scanOptions = buildScanOptions(options);
  const results = [];

  for (const [name, value] of formData.entries()) {
    if (
      value instanceof NodeFile ||
      Buffer.isBuffer(value) ||
      value instanceof Uint8Array ||
      value instanceof ArrayBuffer ||
      (value && typeof value.arrayBuffer === 'function')
    ) {
      results.push({
        name,
        result: await scanUpload(value, scanOptions)
      });
    }
  }

  return results;
}

globalThis.NodeFile = NodeFile;
globalThis.SCAN_KEYS = SCAN_KEYS;
globalThis.buildScanOptions = buildScanOptions;
globalThis.toBuffer = toBuffer;
globalThis.scanUpload = scanUpload;
globalThis.scanFormData = scanFormData;
globalThis.Verdict = Verdict;
globalThis.scanBuffer = scanBuffer;

module.exports = {
  scanUpload,
  scanFormData,
  Verdict
};
