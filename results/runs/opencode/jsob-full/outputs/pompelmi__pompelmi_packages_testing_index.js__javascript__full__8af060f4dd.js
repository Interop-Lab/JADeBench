'use strict';

const { Verdict } = require('pompelmi');

/**
 * Create a scanner whose scan methods always return the supplied verdict.
 *
 * @param {*} verdict One of the public Verdict values.
 * @returns {{Verdict: *, scan: Function, scanBuffer: Function, scanStream: Function, scanS3: Function, _verdict: *}}
 */
function createMockScanner(verdict) {
  if (
    verdict !== Verdict.Clean &&
    verdict !== Verdict.Infected &&
    verdict !== Verdict.ScanError
  ) {
    throw new TypeError(
      'Invalid verdict supplied. Expected Verdict.Clean, Verdict.Infected, or Verdict.ScanError.',
    );
  }

  return {
    Verdict,
    scan: () => Promise.resolve(verdict),
    scanBuffer: () => Promise.resolve(verdict),
    scanStream: () => Promise.resolve(verdict),
    scanS3: () => Promise.resolve(verdict),
    _verdict: verdict,
  };
}

function mockClean() {
  return createMockScanner(Verdict.Clean);
}

function mockInfected(signature) {
  const scanner = createMockScanner(Verdict.Infected);
  scanner.signature = signature || 'Eicar-Test-Signature';
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
