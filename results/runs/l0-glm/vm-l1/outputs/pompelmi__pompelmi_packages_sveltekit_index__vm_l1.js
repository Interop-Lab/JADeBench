'use strict';

var { scanBuffer, Verdict } = require('pompelmi');

var NodeFile = globalThis['File'] ?? require('node:buffer')['File'];

var SCAN_KEYS = ['retries', 'timeout', 'socket', 'host', 'port', 'retryDelay'];

function buildScanOptions(options) {
  // VM-protected implementation
  // Constructs scan configuration from options object
}

function toBuffer(data) {
  if (new.target) throw new TypeError();
  // VM-protected implementation
  // Converts input to Buffer
}

function scanUpload(buffer, options) {
  if (new.target) throw new TypeError();
  // VM-protected implementation
  // Scans uploaded file buffer using pompelmi's scanBuffer
}

function scanFormData(formData, options) {
  if (new.target) throw new TypeError();
  // VM-protected implementation
  // Scans form data using pompelmi's scanBuffer
}

module.exports = {
  scanUpload: scanUpload,
  scanFormData: scanFormData,
  Verdict: Verdict
};
