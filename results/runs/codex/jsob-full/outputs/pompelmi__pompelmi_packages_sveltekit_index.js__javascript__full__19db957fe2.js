'use strict';

const { scanBuffer, Verdict } = require('pompelmi');
const NodeFile = globalThis.File ?? require('node:buffer').File;

const SCAN_KEYS = ['host', 'port', 'socket', 'timeout', 'retries', 'retryDelay'];

function buildScanOptions(options) {
  const scanOptions = {};
  for (const key of SCAN_KEYS) {
    if (options[key] !== undefined) scanOptions[key] = options[key];
  }
  return scanOptions;
}

async function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (value && typeof value.arrayBuffer === 'function') {
    return Buffer.from(await value.arrayBuffer());
  }
  return null;
}

async function scanUpload(upload, options) {
  if (!upload) return Verdict.Clean;

  const scanOptions = buildScanOptions(options || {});
  const buffer = await toBuffer(upload);
  if (!buffer || buffer.length === 0) return Verdict.Clean;

  const verdict = await scanBuffer(buffer, scanOptions);
  if (verdict === Verdict.Malicious) {
    const filename = upload && typeof upload.name === 'string' ? upload.name : 'upload';
    const onInfected = options && options.onInfected;
    if (typeof onInfected === 'function') return onInfected({ filename });

    const responseBody = { error: 'Malware detected', filename };
    const headers = { 'Content-Type': 'application/json' };
    throw new Response(JSON.stringify(responseBody), { status: 406, headers });
  }
  return verdict;
}

async function scanFormData(formData, options) {
  if (!formData || typeof formData.entries !== 'function') return;

  for (const [, value] of formData.entries()) {
    if (value instanceof NodeFile || value && typeof value.arrayBuffer === 'function') {
      await scanUpload(value, options);
    }
  }
}

module.exports = { scanUpload, scanFormData, Verdict };
