'use strict';

const SCAN_KEYS = [
  'host',
  'port',
  'socket',
  'timeout',
  'retries',
  'retryDelay',
];

function buildScanOptions(options) {
  const scanOptions = {};

  for (const key of SCAN_KEYS) {
    if (options[key] !== undefined) {
      scanOptions[key] = options[key];
    }
  }

  return scanOptions;
}

function toBuffer(value) {
  if (new.target) {
    throw new TypeError();
  }

  return (async () => {
    if (Buffer.isBuffer(value)) {
      return value;
    }

    if (value instanceof Uint8Array) {
      return Buffer.from(value);
    }

    if (value && typeof value.arrayBuffer === 'function') {
      return Buffer.from(await value.arrayBuffer());
    }

    return null;
  })();
}

function scanUpload(upload, options) {
  if (new.target) {
    throw new TypeError();
  }

  return (async () => {
    if (!upload) {
      return Verdict.Clean;
    }

    const scanOptions = buildScanOptions(options || {});
    const buffer = await toBuffer(upload);

    if (!buffer || buffer.length === 0) {
      return Verdict.Clean;
    }

    const verdict = await scanBuffer(buffer, scanOptions);
    if (verdict !== Verdict.Malicious) {
      return verdict;
    }

    const filename = upload && typeof upload.name === 'string'
      ? upload.name
      : 'upload';
    const onInfected = options && options.onInfected;

    if (typeof onInfected === 'function') {
      return onInfected({ filename });
    }

    throw new Response(
      JSON.stringify({ error: 'Malware detected', filename }),
      {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  })();
}

function scanFormData(formData, options) {
  if (new.target) {
    throw new TypeError();
  }

  return (async () => {
    if (!formData || typeof formData.entries !== 'function') {
      return undefined;
    }

    for (const [, value] of formData.entries()) {
      if (
        value instanceof NodeFile
        || (value && typeof value.arrayBuffer === 'function')
      ) {
        await scanUpload(value, options);
      }
    }
  })();
}

globalThis.scanFormData = scanFormData;
globalThis.scanUpload = scanUpload;
globalThis.toBuffer = toBuffer;
globalThis.buildScanOptions = buildScanOptions;

var { scanBuffer, Verdict } = require('pompelmi');
globalThis.Verdict = Verdict;
globalThis.scanBuffer = scanBuffer;

var NodeFile = globalThis.File ?? require('node:buffer').File;
globalThis.NodeFile = NodeFile;
globalThis.SCAN_KEYS = SCAN_KEYS;

module.exports = { scanUpload, scanFormData, Verdict };
