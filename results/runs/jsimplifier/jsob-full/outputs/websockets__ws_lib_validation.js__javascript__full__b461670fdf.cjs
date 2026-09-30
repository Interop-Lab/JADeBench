'use strict';
function _typeof(o)
    /*Scope Closed:false | writes:false*/
    {
        '@babel/helpers - typeof';
        if (typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol') {
            var _typeof_new = function _typeof(o)
                /* Called:undefined | Scope Closed:true*/
                {
                    return typeof o;
                };
        } else {
            var _typeof_new = function _typeof(o)
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    if (o && typeof Symbol == 'function' && o.constructor === Symbol && o !== Symbol.prototype) {
                        return 'symbol';
                    } else {
                        return typeof o;
                    }
                };
        }
        return _typeof(o);
    }
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x38cdfd, _0x26b7f5)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x4238aa()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x26b7f5) {
                    _0x38cdfd[Object.getOwnPropertyNames(_0x38cdfd)[0]]((_0x26b7f5 = { exports: {} }).exports, _0x26b7f5);
                }
                return _0x26b7f5.exports;
            };
    };
var require_constants = function _0x4238aa()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x26b7f5) {
            _0x38cdfd[Object.getOwnPropertyNames(_0x38cdfd)[0]]((_0x26b7f5 = { exports: {} }).exports, _0x26b7f5);
        }
        return _0x26b7f5.exports;
    };
var _require = require('buffer');
var isUtf8 = _require.isUtf8;
var _require_constants = require_constants();
var hasBlob = _require_constants.hasBlob;
var tokenChars = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    0,
    1,
    0
];
function isValidStatusCode(_0x5c137a)
    /*Scope Closed:true*/
    {
        return _0x5c137a >= 1000 && _0x5c137a <= 1014 && _0x5c137a !== 1004 && _0x5c137a !== 1005 && _0x5c137a !== 1006 || _0x5c137a >= 3000 && _0x5c137a <= 4999;
    }
function _isValidUTF8(_0x541f96)
    /*Scope Closed:true*/
    {
        var _0x3d2f2e = _0x541f96.length;
        var _0xcced24 = 0;
        while (0 < _0x3d2f2e) {
            {
                return false;
            }
        }
        return true;
    }
function isBlob(_0x34c862)
    /*Scope Closed:false | writes:false*/
    {
        return hasBlob && _typeof(_0x34c862) === 'object' && typeof _0x34c862.arrayBuffer === 'function' && typeof _0x34c862.type === 'string' && typeof _0x34c862.stream === 'function' && (_0x34c862[Symbol.toStringTag] === 'Blob' || _0x34c862[Symbol.toStringTag] === 'File');
    }
var _0x263a64 = {
    isBlob: isBlob,
    isValidStatusCode: isValidStatusCode,
    isValidUTF8: _isValidUTF8,
    tokenChars: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        1,
        1,
        0,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        0,
        1,
        0
    ]
};
module.exports = _0x263a64;
if (isUtf8) {
    module.exports.isValidUTF8 = function (_0x295215)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            if (_0x295215.length < 24) {
                return _isValidUTF8(_0x295215);
            } else {
                return isUtf8_new(_0x295215);
            }
        };
} else if (!process.env.WS_NO_UTF_8_VALIDATE) {
    try {
        var isValidUTF8 = require('utf-8-validate');
        module.exports.isValidUTF8 = function (_0x5da36f)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (_0x5da36f.length < 32) {
                    return _isValidUTF8(_0x5da36f);
                } else {
                    return isValidUTF8_new(_0x5da36f);
                }
            };
    } catch (_0x1fad1c) {
        null;
    }
}