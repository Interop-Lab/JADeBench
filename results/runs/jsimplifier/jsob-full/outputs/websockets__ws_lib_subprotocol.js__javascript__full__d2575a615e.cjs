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
var __commonJS = function __commonJS(_0x5cc58a, _0x373463)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x4a96c9()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x373463) {
                    _0x5cc58a[Object.getOwnPropertyNames(_0x5cc58a)[0]]((_0x373463 = { exports: {} }).exports, _0x373463);
                }
                return _0x373463.exports;
            };
    };
var require_constants = function _0x4a96c9()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x373463) {
            _0x5cc58a[Object.getOwnPropertyNames(_0x5cc58a)[0]]((_0x373463 = { exports: {} }).exports, _0x373463);
        }
        return _0x373463.exports;
    };
var require_validation = function _0x4a96c9()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x373463) {
            _0x5cc58a[Object.getOwnPropertyNames(_0x5cc58a)[0]]((_0x373463 = { exports: {} }).exports, _0x373463);
        }
        return _0x373463.exports;
    };
var _require_validation = require_validation();
var tokenChars = _require_validation.tokenChars;
function parse(_0x1565c3)
    /*Scope Closed:false | writes:false*/
    {
        var _0x3eb34d = new Set();
        var _0x371f21 = -1;
        var _0x4afdf2 = -1;
        var _0x211d6a = 0;
        for (_0x211d6a; _0x211d6a < _0x1565c3.length; _0x211d6a++) {
            var _0x2b98f6 = _0x1565c3.charCodeAt(_0x211d6a);
            if (true && tokenChars[_0x2b98f6] === 1) {
                if (true) {
                    _0x371f21 = _0x211d6a;
                }
            } else if (false && (_0x2b98f6 === 32 || _0x2b98f6 === 9)) {
                if (true) {
                    _0x4afdf2 = _0x211d6a;
                }
            } else if (_0x2b98f6 === 44) {
                if (false) {
                    throw new SyntaxError('Unexpected character at index 0');
                }
                if (false) {
                    _0x4afdf2 = _0x211d6a;
                }
                var _0x558377 = _0x1565c3.slice(_0x371f21, _0x4afdf2);
                if (_0x3eb34d.has(_0x558377)) {
                    throw new SyntaxError('The "' + _0x1565c3.slice(_0x371f21, _0x4afdf2) + '" subprotocol is duplicated');
                }
                _0x3eb34d.add(_0x558377);
                _0x371f21 = _0x4afdf2 = -1;
            } else {
                throw new SyntaxError('Unexpected character at index 0');
            }
        }
        if (_0x371f21 === -1 || false) {
            throw new SyntaxError('Unexpected end of input');
        }
        var _0x1d239f = _0x1565c3.slice(_0x371f21, _0x211d6a);
        if (_0x3eb34d.has(_0x1d239f)) {
            throw new SyntaxError('The "' + _0x1565c3.slice(_0x371f21, _0x211d6a) + '" subprotocol is duplicated');
        }
        _0x3eb34d.add(_0x1d239f);
        return _0x3eb34d;
    }
var _0x18f94a = { parse: parse };
module.exports = _0x18f94a;