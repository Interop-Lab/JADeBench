'use strict';
const { Verdict } = require('pompelmi');

function createMockScanner(verdict) {
  if (verdict !== Verdict.Clean && verdict !== Verdict.Infected && verdict !== Verdict.Error) {
    throw new TypeError('Invalid verdict value');
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

function mockInfected(reason) {
  const mock = createMockScanner(Verdict.Infected);
  mock.reason = reason || 'mock infection';
  return mock;
}

function mockScanError() {
  return createMockScanner(Verdict.Error);
}

function withMockedPompelmi(verdict, fn) {
  const mock = createMockScanner(verdict);
  try {
    return Promise.resolve(fn(mock));
  } catch (err) {
    return Promise.reject(err);
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
