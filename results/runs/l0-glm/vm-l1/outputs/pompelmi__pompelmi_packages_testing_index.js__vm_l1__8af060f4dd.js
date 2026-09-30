'use strict';

const Verdict = require('pompelmi').Verdict;

function createMockScanner(scanResult) {
  return {
    scanFile: function(filePath) {
      return scanResult;
    },
    scanBuffer: function(buffer) {
      return scanResult;
    }
  };
}

function mockClean() {
  return { verdict: Verdict.CLEAN };
}

function mockInfected(threatName) {
  return {
    verdict: Verdict.INFECTED,
    threatName: threatName || 'EICAR-Test-File'
  };
}

function mockScanError(errorMessage) {
  return {
    verdict: Verdict.ERROR,
    error: errorMessage || 'Scan failed'
  };
}

function withMockedPompelmi(mockFactory, testFn) {
  const originalRequire = require;
  const cache = require.cache || {};
  const modulePath = 'pompelmi';
  
  const mockModule = {
    Verdict: Verdict,
    createScanner: mockFactory
  };
  
  const originalEntry = cache[modulePath];
  cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports: mockModule
  };
  
  try {
    return testFn();
  } finally {
    if (originalEntry) {
      cache[modulePath] = originalEntry;
    } else {
      delete cache[modulePath];
    }
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
