'use strict';

const { scanBuffer, Verdict } = require('pompelmi');

const NodeFile = globalThis.File ?? require('node:buffer').File;

const SCAN_KEYS = [
  'host',
  'port',
  'socket',
  'timeout',
  'retries',
  'retryDelay',
];

function buildScanOptions(options = {}) {
  return Object.fromEntries(
    SCAN_KEYS
      .filter(key => options[key] !== undefined)
      .map(key => [key, options[key]]),
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
    return;
  }

  const buffer = await toBuffer(upload);
  if (buffer.length === 0) {
    return;
  }

  const verdict = await scanBuffer(buffer, buildScanOptions(options));
  if (verdict !== Verdict.Malicious) {
    return;
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
  if (typeof formData.entries !== 'function') {
    return;
  }

  for (const [, value] of formData.entries()) {
    if (
      value instanceof NodeFile ||
      typeof value.arrayBuffer === 'function'
    ) {
      const infectedResponse = await scanUpload(value, options);
      if (infectedResponse) {
        return infectedResponse;
      }
    }
  }
}

module.exports = {
  scanUpload,
  scanFormData,
  Verdict,
};
