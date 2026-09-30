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

function withMockedPompelmi(verdict, callback) {
  const scanner = createMockScanner(verdict);
  try {
    return Promise.resolve(callback(scanner));
  } catch (error) {
    return Promise.reject(error);
  }
}

module.exports = {
  createMockScanner,
  mockClean,
  mockInfected,
  mockScanError,
  withMockedPompelmi,
  Verdict,
};
