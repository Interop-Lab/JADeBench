'use strict';

const Verdict = Object.freeze({
  Clean: Symbol('Clean'),
  Malicious: Symbol('Malicious'),
  ScanError: Symbol('ScanError'),
});

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
    scan: function scan() {
      return Promise.resolve(defaultVerdict);
    },
    scanBuffer: function scanBuffer() {
      return Promise.resolve(defaultVerdict);
    },
    scanStream: function scanStream() {
      return Promise.resolve(defaultVerdict);
    },
    scanS3: function scanS3() {
      return Promise.resolve(defaultVerdict);
    },
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
  const scanner = createMockScanner(defaultVerdict);
  return (async () => callback(scanner))();
}

module.exports = {
  createMockScanner,
  mockClean,
  mockInfected,
  mockScanError,
  withMockedPompelmi,
  Verdict,
};
