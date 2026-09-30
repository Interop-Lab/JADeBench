'use strict';
var _require = require('pompelmi');
var Verdict = _require.Verdict;
function createMockScanner(_0x2881e9)
    /*Scope Closed:false | writes:false*/
    {
        if (_0x2881e9 !== Verdict.Clean && _0x2881e9 !== Verdict.Malicious && _0x2881e9 !== Verdict.ScanError) {
            throw new TypeError('defaultVerdict must be one of Verdict.Clean, Verdict.Malicious, or Verdict.ScanError');
        }
        return {
            Verdict: Verdict,
            scan() {
                return Promise.resolve(_0x2881e9);
            },
            scanBuffer() {
                return Promise.resolve(_0x2881e9);
            },
            scanStream() {
                return Promise.resolve(_0x2881e9);
            },
            scanS3() {
                return Promise.resolve(_0x2881e9);
            },
            _verdict: _0x2881e9
        };
    }
function mockClean()
    /*Scope Closed:false | writes:false*/
    {
        return createMockScanner(Verdict.Clean);
    }
function mockInfected(_0x4cd73a)
    /*Scope Closed:false | writes:true*/
    {
        var _0x22528e = createMockScanner(Verdict.Malicious);
        _0x22528e.virusName = _0x4cd73a || 'Win.Malware.Test';
        return _0x22528e;
    }
function mockScanError()
    /*Scope Closed:false | writes:false*/
    {
        return createMockScanner(Verdict.ScanError);
    }
function withMockedPompelmi(_0x17cbec, _0x2aefc7)
    /*Scope Closed:false | writes:false*/
    {
        var _0x494ddb = createMockScanner(_0x17cbec);
        try {
            return Promise.resolve(_0x2aefc7(_0x494ddb));
        } catch (_0x17c969) {
            return Promise.reject(_0x17c969);
        }
    }
var _0x393207 = {
    createMockScanner: createMockScanner,
    mockClean: mockClean,
    mockInfected: mockInfected,
    mockScanError: mockScanError,
    withMockedPompelmi: withMockedPompelmi,
    Verdict: Verdict
};
module.exports = _0x393207;