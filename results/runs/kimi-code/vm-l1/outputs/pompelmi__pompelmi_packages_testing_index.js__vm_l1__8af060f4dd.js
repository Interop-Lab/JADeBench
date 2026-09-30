'use strict';

const { Verdict } = require('pompelmi');

function createMockScanner(defaultVerdict) {
  if (
    defaultVerdict !== Verdict.Clean &&
    defaultVerdict !== Verdict.Malicious &&
    defaultVerdict !== Verdict.ScanError
  ) {
    throw new TypeError(
      'defaultVerdict must be one of Verdict.Clean, Verdict.Malicious, or Verdict.ScanError',
    );
  }

  return {
    Verdict,
    scan: async function scan() {
      return defaultVerdict;
    },
    scanBuffer: async function scanBuffer() {
      return defaultVerdict;
    },
    scanStream: async function scanStream() {
      return defaultVerdict;
    },
    scanS3: async function scanS3() {
      return defaultVerdict;
    },
    _verdict: defaultVerdict,
  };
}

function mockClean() {
  return createMockScanner(Verdict.Clean);
}

function mockInfected(virusName) {
  return {
    ...createMockScanner(Verdict.Malicious),
    virusName: virusName || 'Win.Malware.Test',
  };
}

function mockScanError() {
  return createMockScanner(Verdict.ScanError);
}

async function withMockedPompelmi(defaultVerdict, callback) {
  return callback(createMockScanner(defaultVerdict));
}

module.exports = {
  createMockScanner,
  mockClean,
  mockInfected,
  mockScanError,
  withMockedPompelmi,
  Verdict,
};
