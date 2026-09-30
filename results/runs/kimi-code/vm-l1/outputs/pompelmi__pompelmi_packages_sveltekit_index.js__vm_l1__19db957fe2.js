'use strict';

const { File: BufferFile } = require('node:buffer');
const { scanBuffer, Verdict } = require('pompelmi');

const File = globalThis.File ?? BufferFile;
const SCAN_OPTION_KEYS = [
  'host',
  'port',
  'socket',
  'timeout',
  'retries',
  'retryDelay',
];

function buildScanOptions(source) {
  return Object.fromEntries(
    SCAN_OPTION_KEYS
      .filter((key) => source[key] !== undefined)
      .map((key) => [key, source[key]]),
  );
}

async function toBuffer(value) {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }

  if (typeof value.arrayBuffer === 'function') {
    return Buffer.from(await value.arrayBuffer());
  }

  return Buffer.from(value);
}

async function scanUpload(upload, options = {}) {
  if (!upload) {
    return Verdict.Clean;
  }

  const buffer = await toBuffer(upload);
  if (buffer.length === 0) {
    return Verdict.Clean;
  }

  const verdict = await scanBuffer(buffer, buildScanOptions(options));
  if (verdict !== Verdict.Malicious) {
    return verdict;
  }

  const filename = typeof upload.name === 'string' ? upload.name : 'upload';
  if (typeof options.onInfected === 'function') {
    return options.onInfected(filename);
  }

  return new Response(
    JSON.stringify({
      error: 'Malware detected',
      filename,
    }),
    {
      status: 422,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

async function scanFormData(formData, options = {}) {
  if (typeof formData?.entries !== 'function') {
    return false;
  }

  for (const [, value] of formData.entries()) {
    if (!(value instanceof File)) {
      continue;
    }

    const result = await scanUpload(value, options);
    if (result !== Verdict.Clean) {
      return result;
    }
  }

  return true;
}

module.exports = {
  scanUpload,
  scanFormData,
  Verdict,
};
