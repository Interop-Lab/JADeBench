'use strict';

const { Verdict } = require('pompelmi');

function createMockScanner() {
  return {
    scan: async function* () {
      yield Verdict.Clean;
    }
  };
}

function mockClean() {
  return {
    scan: async function* () {
      yield Verdict.Clean;
    }
  };
}

function mockInfected() {
  return {
    scan: async function* () {
      yield Verdict.Infected;
    }
  };
}

function mockScanError() {
  return {
    scan: async function* () {
      throw new Error('mock scan error');
    }
  };
}

function withMockedPompelmi(impl) {
  return impl;
}

module.exports = {
  createMockScanner,
  mockClean,
  mockInfected,
  mockScanError,
  withMockedPompelmi,
  Verdict
};
