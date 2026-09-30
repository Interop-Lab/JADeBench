'use strict';

const { Verdict } = require('pompelmi');

/**
 * Build the small scanner interface used by pompelmi consumers in tests.
 * Every scan method is asynchronous and resolves to the configured verdict.
 */
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

  const scan = async (..._arguments) => defaultVerdict;

  return {
    Verdict,
    scan,
    scanBuffer: scan,
    scanStream: scan,
    scanS3: scan,
    _verdict: defaultVerdict,
  };
}

function mockClean() {
  return createMockScanner(Verdict.Clean);
}

function mockInfected(virusName = 'Win.Malware.Test') {
  return {
    ...createMockScanner(Verdict.Malicious),
    virusName,
  };
}

function mockScanError() {
  return createMockScanner(Verdict.ScanError);
}

/** Run a callback with a scanner configured for the requested verdict. */
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
