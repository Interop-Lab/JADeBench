'use strict';

const { scanBuffer, Verdict } = require('pompelmi');
const { File: BufferFile } = require('node:buffer');

const NodeFile = globalThis.File ?? BufferFile;
const SCAN_KEYS = ['host', 'port', 'socket', 'timeout', 'retries', 'retryDelay'];

function buildScanOptions(options) {
  const scanOptions = {};
  if (!options) return scanOptions;

  for (const key of SCAN_KEYS) {
    if (options[key] !== undefined) scanOptions[key] = options[key];
  }
  return scanOptions;
}

async function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value?.arrayBuffer === 'function') {
    return Buffer.from(await value.arrayBuffer());
  }
  return null;
}

async function scanUpload(upload, options = {}) {
  const buffer = await toBuffer(upload);
  if (!buffer || buffer.length === 0) return undefined;

  const verdict = await scanBuffer(buffer, buildScanOptions(options));

  if (verdict !== Verdict.Malicious) return undefined;

  const filename = typeof upload?.name === 'string' ? upload.name : 'upload';
  if (typeof options.onInfected === 'function') {
    await options.onInfected(filename);
  }

  return new Response(
    JSON.stringify({ error: 'Malware detected', filename }),
    {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

async function scanFormData(formData, options = {}) {
  for (const [, value] of formData.entries()) {
    if (value instanceof NodeFile || typeof value?.arrayBuffer === 'function') {
      const result = await scanUpload(value, options);
      if (result) return result;
    }
  }
  return undefined;
}

module.exports = { scanUpload, scanFormData, Verdict };
