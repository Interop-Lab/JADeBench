'use strict';

const { Verdict } = require('pompelmi');

function createMockScanner(scan) {
  if (typeof scan !== 'function') {
    throw new TypeError('scan must be a function');
  }

  return {
    scan(...args) {
      return scan(...args);
    }
  };
}

function mockClean() {
  return createMockScanner(async () => ({
    verdict: Verdict.CLEAN
  }));
}

function mockInfected(infection) {
  return createMockScanner(async () => ({
    verdict: Verdict.INFECTED,
    infections: [infection]
  }));
}

function mockScanError() {
  return createMockScanner(async () => {
    throw new Error('Mock scan error');
  });
}

async function withMockedPompelmi(mock, callback) {
  const modulePath = require.resolve('pompelmi');
  const cachedModule = require.cache[modulePath];
  const originalExports = cachedModule && cachedModule.exports;

  if (cachedModule) {
    cachedModule.exports = mock;
  } else {
    require.cache[modulePath] = {
      id: modulePath,
      filename: modulePath,
      loaded: true,
      exports: mock,
      children: [],
      paths: []
    };
  }

  try {
    return await callback();
  } finally {
    if (cachedModule) {
      cachedModule.exports = originalExports;
    } else {
      delete require.cache[modulePath];
    }
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
