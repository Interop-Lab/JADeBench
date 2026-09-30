'use strict';

const { Verdict } = require('pompelmi');

function createMockScanner() {
    return {
        scan: async function(filePath) {
            return { verdict: Verdict.CLEAN, path: filePath };
        }
    };
}

function mockClean() {
    return { verdict: Verdict.CLEAN };
}

function mockInfected(path) {
    return { verdict: Verdict.INFECTED, path: path };
}

function mockScanError() {
    throw new Error('Scan failed');
}

function withMockedPompelmi(scanner, callback) {
    const originalScanner = globalThis.pompelmi?.Scanner;
    globalThis.pompelmi = { Scanner: scanner };
    try {
        return callback();
    } finally {
        if (originalScanner) {
            globalThis.pompelmi.Scanner = originalScanner;
        } else {
            delete globalThis.pompelmi;
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
