'use strict';

const { Verdict } = require('./Verdict');

function createMockScanner(verdict) {
  if (
    verdict !== Verdict.Clean &&
    verdict !== Verdict.Virus &&
    verdict !== Verdict.Error
  ) {
    throw new TypeError('Invalid verdict provided to createMockScanner');
  }

  return {
    Verdict,
    scan: () => Promise.resolve(verdict),
    scanBuffer: () => Promise.resolve(verdict),
    scanStream: () => Promise.resolve(verdict),
    scanS3: () => Promise.resolve(verdict),
    _verdict: verdict
  };
}

function mockClean() {
  return createMockScanner(Verdict.Clean);
}

function mockInfected(virusName) {
  const scanner = createMockScanner(Verdict.Virus);
  scanner._virusName = virusName || 'Eicar-Signature';
  return scanner;
}

function mockScanError() {
  return createMockScanner(Verdict.Error);
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
  Verdict
};
