'use strict';

var { Verdict } = require('verdict');

function createMockScanner(verdict) {
  if (verdict !== Verdict.Clean && verdict !== Verdict.Infected && verdict !== Verdict.Error) {
    throw new TypeError('Invalid verdict');
  }
  return {
    Verdict: Verdict,
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

function mockInfected(fileName) {
  const scanner = createMockScanner(Verdict.Infected);
  scanner.fileName = fileName || 'infected.txt';
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
  createMockScanner: createMockScanner,
  mockClean: mockClean,
  mockInfected: mockInfected,
  mockScanError: mockScanError,
  withMockedPompelmi: withMockedPompelmi,
  Verdict: Verdict
};
