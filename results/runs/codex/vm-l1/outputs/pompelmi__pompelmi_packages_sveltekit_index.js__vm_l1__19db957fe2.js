'use strict';

const { scanBuffer, Verdict } = require('pompelmi');

const NodeFile = globalThis.File ?? require('node:buffer').File;
const SCAN_KEYS = ['host', 'port', 'socket', 'timeout', 'retries', 'retryDelay'];

function buildScanOptions(options) {
  const scanOptions = {};

  for (const key of SCAN_KEYS) {
    if (options[key] !== undefined) {
      scanOptions[key] = options[key];
    }
  }

  return scanOptions;
}

async function toBuffer(upload) {
  if (Buffer.isBuffer(upload)) {
    return upload;
  }

  if (upload instanceof Uint8Array) {
    return Buffer.from(upload);
  }

  if (typeof upload?.arrayBuffer === 'function') {
    return Buffer.from(await upload.arrayBuffer());
  }

  return null;
}

async function scanUpload(upload, options) {
  const buffer = await toBuffer(upload);

  if (!buffer?.length) {
    return Verdict.Clean;
  }

  const verdict = await scanBuffer(buffer, buildScanOptions(options || {}));

  if (verdict === Verdict.Malicious) {
    throw new Response(
      JSON.stringify({
        error: 'Malware detected',
        filename: typeof upload.name === 'string' ? upload.name : 'upload',
      }),
      {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return verdict;
}

async function scanFormData(formData, options) {
  for (const [, upload] of formData.entries()) {
    if (upload instanceof NodeFile) {
      await scanUpload(upload, options);
    }
  }
}

module.exports = { scanUpload, scanFormData, Verdict };
