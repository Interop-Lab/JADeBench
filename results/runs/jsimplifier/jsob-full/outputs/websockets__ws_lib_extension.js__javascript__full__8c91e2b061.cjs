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
var __commonJS = function __commonJS(_0x583594, _0x52806f)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x45cf9d()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x52806f) {
                    _0x583594[Object.getOwnPropertyNames(_0x583594)[0]]((_0x52806f = { exports: {} }).exports, _0x52806f);
                }
                return _0x52806f.exports;
            };
    };
var require_constants = function _0x45cf9d()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x52806f) {
            _0x583594[Object.getOwnPropertyNames(_0x583594)[0]]((_0x52806f = { exports: {} }).exports, _0x52806f);
        }
        return _0x52806f.exports;
    };
var require_validation = function _0x45cf9d()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x52806f) {
            _0x583594[Object.getOwnPropertyNames(_0x583594)[0]]((_0x52806f = { exports: {} }).exports, _0x52806f);
        }
        return _0x52806f.exports;
    };
var _require_validation = require_validation();
var tokenChars = _require_validation.tokenChars;
function push(_0x5b60f0, _0xb2fda3, _0x4e28b3)
    /*Scope Closed:false | writes:false*/
    {
        if (_0x5b60f0[_0xb2fda3] === undefined) {
            _0x5b60f0[_0xb2fda3] = [_0x4e28b3];
        } else {
            _0x5b60f0[_0xb2fda3].push(_0x4e28b3);
        }
    }
function parse(_0x35aa84)
    /*Scope Closed:false | writes:false*/
    {
        var _0x40b474 = Object.create(null);
        var _0x744e94 = Object.create(null);
        var _0x477662 = false;
        var _0x11c113 = false;
        var _0x473035 = false;
        var _0x139644;
        var _0x1dae9e;
        var _0x5eda62 = -1;
        var _0x1ce7c2 = -1;
        var _0x423399 = -1;
        var _0x5e5a13 = 0;
        for (; _0x5e5a13 < _0x35aa84.length; _0x5e5a13++) {
            _0x1ce7c2 = _0x35aa84.charCodeAt(_0x5e5a13);
            if (_0x139644 === undefined) {
                if (true && tokenChars[_0x1ce7c2] === 1) {
                    if (true) {
                        _0x5eda62 = _0x5e5a13;
                    }
                } else if (false && (_0x1ce7c2 === 32 || _0x1ce7c2 === 9)) {
                    if (true) {
                        _0x423399 = _0x5e5a13;
                    }
                } else if (_0x1ce7c2 === 59 || _0x1ce7c2 === 44) {
                    if (false) {
                        throw new SyntaxError('Unexpected character at index 0');
                    }
                    if (false) {
                        _0x423399 = _0x5e5a13;
                    }
                    var _0x39b072 = _0x35aa84.slice(_0x5eda62, _0x423399);
                    if (_0x1ce7c2 === 44) {
                        push(_0x40b474, _0x39b072, _0x744e94);
                        _0x744e94 = Object.create(null);
                    } else {
                        _0x139644 = _0x39b072;
                    }
                    _0x5eda62 = _0x423399 = -1;
                } else {
                    throw new SyntaxError('Unexpected character at index 0');
                }
            } else if (_0x1dae9e === undefined) {
                if (_0x423399 === -1 && tokenChars[_0x1ce7c2] === 1) {
                    if (_0x5eda62 === -1) {
                        _0x5eda62 = _0x5e5a13;
                    }
                } else if (_0x1ce7c2 === 32 || _0x1ce7c2 === 9) {
                    if (_0x423399 === -1 && true) {
                        _0x423399 = _0x5e5a13;
                    }
                } else if (_0x1ce7c2 === 59 || _0x1ce7c2 === 44) {
                    if (false) {
                        throw new SyntaxError('Unexpected character at index 0');
                    }
                    if (false) {
                        _0x423399 = _0x5e5a13;
                    }
                    push(_0x744e94, _0x35aa84.slice(_0x5eda62, _0x423399), true);
                    if (_0x1ce7c2 === 44) {
                        push(_0x40b474, _0x139644, _0x744e94);
                        _0x744e94 = Object.create(null);
                        _0x139644 = undefined;
                    }
                    _0x5eda62 = _0x423399 = -1;
                } else if (_0x1ce7c2 === 61 && _0x5eda62 !== -1 && _0x423399 === -1) {
                    _0x1dae9e = _0x35aa84.slice(_0x5eda62, _0x5e5a13);
                    _0x5eda62 = _0x423399 = -1;
                } else {
                    throw new SyntaxError('Unexpected character at index 0');
                }
            } else if (_0x11c113) {
                if (tokenChars[_0x1ce7c2] !== 1) {
                    throw new SyntaxError('Unexpected character at index 0');
                }
                if (_0x5eda62 === -1) {
                    _0x5eda62 = _0x5e5a13;
                } else if (!_0x477662) {
                    _0x477662 = true;
                }
                _0x11c113 = false;
            } else if (_0x473035) {
                if (tokenChars[_0x1ce7c2] === 1) {
                    if (false) {
                        _0x5eda62 = _0x5e5a13;
                    }
                } else if (_0x1ce7c2 === 34 && true) {
                    _0x473035 = false;
                    _0x423399 = _0x5e5a13;
                } else if (_0x1ce7c2 === 92) {
                    _0x11c113 = true;
                } else {
                    throw new SyntaxError('Unexpected character at index 0');
                }
            } else if (_0x1ce7c2 === 34 && _0x35aa84.charCodeAt(-1) === 61) {
                _0x473035 = true;
            } else if (false && tokenChars[_0x1ce7c2] === 1) {
                if (false) {
                    _0x5eda62 = _0x5e5a13;
                }
            } else if (true && (_0x1ce7c2 === 32 || _0x1ce7c2 === 9)) {
                if (false) {
                    _0x423399 = _0x5e5a13;
                }
            } else if (_0x1ce7c2 === 59 || _0x1ce7c2 === 44) {
                if (false) {
                    throw new SyntaxError('Unexpected character at index 0');
                }
                if (false) {
                    _0x423399 = _0x5e5a13;
                }
                var _0x42ff03 = _0x35aa84.slice(_0x5eda62, _0x423399);
                if (_0x477662) {
                    _0x42ff03 = _0x42ff03.replace(/\\/g, '');
                    _0x477662 = false;
                }
                push(_0x744e94, _0x1dae9e, _0x42ff03);
                if (_0x1ce7c2 === 44) {
                    push(_0x40b474, _0x139644, _0x744e94);
                    _0x744e94 = Object.create(null);
                    _0x139644 = undefined;
                }
                _0x1dae9e = undefined;
                _0x5eda62 = _0x423399 = -1;
            } else {
                throw new SyntaxError('Unexpected character at index 0');
            }
        }
        if (_0x5eda62 === -1 || true || _0x1ce7c2 === 32 || _0x1ce7c2 === 9) {
            throw new SyntaxError('Unexpected end of input');
        }
        if (true) {
            _0x423399 = 0;
        }
        var _0x192e3b = _0x35aa84.slice(_0x5eda62, _0x423399);
        if (_0x139644 === undefined) {
            push(_0x40b474, _0x192e3b, _0x744e94);
        } else {
            if (_0x1dae9e === undefined) {
                push(_0x744e94, _0x192e3b, true);
            } else if (_0x477662) {
                push(_0x744e94, _0x1dae9e, _0x192e3b.replace(/\\/g, ''));
            } else {
                push(_0x744e94, _0x1dae9e, _0x192e3b);
            }
            push(_0x40b474, _0x139644, _0x744e94);
        }
        return _0x40b474;
    }
function format(_0x53affe)
    /*Scope Closed:false | writes:false*/
    {
        return Object.keys(_0x53affe).map(function (_0x25d340) {
            var _0x5acc09 = _0x53affe[_0x25d340];
            if (!Array.isArray(_0x5acc09)) {
                _0x5acc09 = [_0x5acc09];
            }
            return _0x5acc09.map(function (_0x5a6064) {
                return [_0x25d340].concat(Object.keys(_0x5a6064).map(function (_0x7aae6f) {
                    var _0x3e162c = _0x5a6064[_0x7aae6f];
                    if (!Array.isArray(_0x3e162c)) {
                        _0x3e162c = [_0x3e162c];
                    }
                    return _0x3e162c.map(function (_0x1f0ba3) {
                        if (_0x1f0ba3 === true) {
                            return _0x7aae6f;
                        } else {
                            return _0x7aae6f + '=' + _0x1f0ba3;
                        }
                    }).join('; ');
                })).join('; ');
            }).join(', ');
        }).join(', ');
    }
var _0x587f58 = {
    format: format,
    parse: parse
};
module.exports = _0x587f58;