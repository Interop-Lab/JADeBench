'use strict';

const { Verdict } = require('pompelmi');

function createMockScanner(defaultVerdict) {
  if (![Verdict.Clean, Verdict.Malicious, Verdict.ScanError].includes(defaultVerdict)) {
    throw new TypeError(
      'defaultVerdict must be one of Verdict.Clean, Verdict.Malicious, or Verdict.ScanError',
    );
  }

  return {
    Verdict,
    scan: () => Promise.resolve(defaultVerdict),
    scanBuffer: () => Promise.resolve(defaultVerdict),
    scanStream: () => Promise.resolve(defaultVerdict),
    scanS3: () => Promise.resolve(defaultVerdict),
    _verdict: defaultVerdict,
  };
}

function mockClean() {
  return createMockScanner(Verdict.Clean);
}

function mockInfected(virusName) {
  const scanner = createMockScanner(Verdict.Malicious);
  scanner.virusName = virusName || 'Win.Malware.Test';
  return scanner;
}

function mockScanError() {
  return createMockScanner(Verdict.ScanError);
}

function withMockedPompelmi(defaultVerdict, callback) {
  return Promise.resolve(createMockScanner(defaultVerdict)).then(callback);
}

module.exports = {
  createMockScanner,
  mockClean,
  mockInfected,
  mockScanError,
  withMockedPompelmi,
  Verdict,
};
