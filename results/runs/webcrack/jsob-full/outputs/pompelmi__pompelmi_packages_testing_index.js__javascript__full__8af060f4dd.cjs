"use strict";
var {
  Verdict
} = require("pompelmi");
function createMockScanner(_0xe1e16f) {
  if (_0xe1e16f !== Verdict.Clean && _0xe1e16f !== Verdict.Malicious && _0xe1e16f !== Verdict.ScanError) {
    throw new TypeError("defaultVerdict must be one of Verdict.Clean, Verdict.Malicious, or Verdict.ScanError");
  }
  return {
    Verdict: Verdict,
    scan: () => Promise.resolve(_0xe1e16f),
    scanBuffer: () => Promise.resolve(_0xe1e16f),
    scanStream: () => Promise.resolve(_0xe1e16f),
    scanS3: () => Promise.resolve(_0xe1e16f),
    _verdict: _0xe1e16f
  };
}
function mockClean() {
  return createMockScanner(Verdict.Clean);
}
function mockInfected(_0x75978a) {
  const _0x4fbd95 = createMockScanner(Verdict.Malicious);
  _0x4fbd95.virusName = _0x75978a || "Win.Malware.Test";
  return _0x4fbd95;
}
function mockScanError() {
  return createMockScanner(Verdict.ScanError);
}
function withMockedPompelmi(_0x1ee481, _0x9f1fb3) {
  const _0x2f68c9 = createMockScanner(_0x1ee481);
  try {
    return Promise.resolve(_0x9f1fb3(_0x2f68c9));
  } catch (_0x3b1c66) {
    return Promise.reject(_0x3b1c66);
  }
}
const _0x42c2bc = {
  createMockScanner: createMockScanner,
  mockClean: mockClean,
  mockInfected: mockInfected,
  mockScanError: mockScanError,
  withMockedPompelmi: withMockedPompelmi,
  Verdict: Verdict
};
module.exports = _0x42c2bc;