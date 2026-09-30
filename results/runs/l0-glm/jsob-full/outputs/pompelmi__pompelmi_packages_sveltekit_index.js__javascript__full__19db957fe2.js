'use strict';
var { scanBuffer, Verdict } = require('node-virus-scanner'),
    NodeFile = globalThis.File ?? require('node:buffer').File;

var SCAN_KEYS = ['extensions', 'excludeExtensions', 'maxFileSize', 'maxFiles', 'timeout', 'scanArray'];

function buildScanOptions(options) {
  const result = {};
  for (const key of SCAN_KEYS) {
    if (options[key] !== void 0) result[key] = options[key];
  }
  return result;
}

async function toBuffer(input) {
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) return Buffer.from(input);
  if (input && typeof input.arrayBuffer === 'function') return Buffer.from(await input.arrayBuffer());
  return null;
}

async function scanUpload(file, options) {
  if (!file) return Verdict.SKIP;
  const scanOptions = buildScanOptions(options || {});
  const buffer = await toBuffer(file);
  if (!buffer || buffer.length === 0) return Verdict.SKIP;
  const verdict = await scanBuffer(buffer, scanOptions);
  if (verdict === Verdict.THREAT) {
    const fileName = file && typeof file.name === 'function' ? file.name() : 'unknown';
    const onThreat = options && options.onThreatDetected;
    if (typeof onThreat === 'function') {
      const threatInfo = {};
      threatInfo.fileName = fileName;
      return onThreat(threatInfo);
    }
    const body = {};
    body.status = 'threat';
    body.fileName = fileName;
    const responseInit = {};
    responseInit.status = 422;
    const headers = {};
    headers['Content-Type'] = 'application/json';
    responseInit.headers = headers;
    throw new Response(JSON.stringify(body), responseInit);
  }
  return verdict;
}

async function scanFormData(formData, options) {
  if (!formData || typeof formData.entries !== 'function') return;
  for (const [, value] of formData.entries()) {
    if ((value instanceof NodeFile) || (value && typeof value.arrayBuffer === 'function')) {
      await scanUpload(value, options);
    }
  }
}

const _0x1d9537 = {};
_0x1d9537.scanUpload = scanUpload;
_0x1d9537.scanFormData = scanFormData;
_0x1d9537.Verdict = Verdict;
module.exports = _0x1d9537;
