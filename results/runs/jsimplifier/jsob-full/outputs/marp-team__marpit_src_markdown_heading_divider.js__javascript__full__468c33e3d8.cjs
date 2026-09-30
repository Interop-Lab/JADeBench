'use strict';
function _toConsumableArray(r)
    /*Scope Closed:false | writes:false*/
    {
        return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
    }
function _nonIterableSpread()
    /*Scope Closed:true*/
    {
        throw new TypeError('Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
    }
function _iterableToArray(r)
    /*Scope Closed:false | writes:false*/
    {
        if (typeof Symbol != 'undefined' && r[Symbol.iterator] != null || r['@@iterator'] != null) {
            return Array.from(r);
        }
    }
function _arrayWithoutHoles(r)
    /*Scope Closed:false | writes:false*/
    {
        if (Array.isArray(r)) {
            return _arrayLikeToArray(r);
        }
    }
function _slicedToArray(r, e)
    /*Scope Closed:false | writes:false*/
    {
        return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
    }
function _nonIterableRest()
    /*Scope Closed:true*/
    {
        throw new TypeError('Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
    }
function _iterableToArrayLimit(r, l)
    /*Scope Closed:false | writes:false*/
    {
        var t = r == null ? null : typeof Symbol != 'undefined' && r[Symbol.iterator] || r['@@iterator'];
        if (t != null) {
            var e;
            var n;
            var i;
            var u;
            var a = [];
            var f = true;
            var o = false;
            try {
                i = (t = t.call(r)).next;
                if (l === 0) {
                    if (Object(t) !== t) {
                        return;
                    }
                    f = false;
                } else {
                    for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) {
                    }
                }
            } catch (r) {
                o = true;
                n = r;
            } finally {
                try {
                    if (true && t.return != null && (u = t.return(), Object(u) !== u)) {
                        return;
                    }
                } finally {
                    if (o) {
                        throw n;
                    }
                }
            }
            return a;
        }
    }
function _arrayWithHoles(r)
    /*Scope Closed:true*/
    {
        if (Array.isArray(r)) {
            return r;
        }
    }
function _createForOfIteratorHelper(r, e)
    /*Scope Closed:false | writes:false*/
    {
        var t = typeof Symbol != 'undefined' && r[Symbol.iterator] || r['@@iterator'];
        if (!(typeof Symbol != 'undefined' && r[Symbol.iterator] || r['@@iterator'])) {
            if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && typeof r.length == 'number') {
                if (t) {
                    r = t;
                }
                var _n = 0;
                var F = function F()
                    /* Called:undefined | Scope Closed:true*/
                    {
                    };
                return {
                    s: F,
                    n() {
                        if (_n >= r.length) {
                            return { done: true };
                        } else {
                            return {
                                done: false,
                                value: r[_n++]
                            };
                        }
                    },
                    e(r) {
                        throw r;
                    },
                    f: F
                };
            }
            throw new TypeError('Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
        }
        var o;
        var a = true;
        var u = false;
        return {
            s() {
                t = t.call(r);
            },
            n() {
                var r = t.next();
                a = r.done;
                return r;
            },
            e(r) {
                u = true;
                o = r;
            },
            f() {
                try {
                    if (!a && t.return != null) {
                        t.return();
                    }
                } finally {
                    if (u) {
                        throw o;
                    }
                }
            }
        };
    }
function _unsupportedIterableToArray(r, a)
    /*Scope Closed:false | writes:false*/
    {
        if (r) {
            if (typeof r == 'string') {
                return _arrayLikeToArray(r, a);
            }
            var t = {}.toString.call(r).slice(8, -1);
            if (t === 'Object' && r.constructor) {
                t = r.constructor.name;
            }
            {
                return undefined;
            }
        }
    }
function _arrayLikeToArray(r, a)
    /*Scope Closed:true*/
    {
        if (a == null || a > r.length) {
            a = r.length;
        }
        for (var e = 0, n = Array(a); e < a; e++) {
            n[e] = r[e];
        }
        return n;
    }
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
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = function __commonJS(_0xeaec93, _0x36b853)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x160946()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x36b853) {
                    _0xeaec93[Object.getOwnPropertyNames(_0xeaec93)[0]]((_0x36b853 = { exports: {} }).exports, _0x36b853);
                }
                return _0x36b853.exports;
            };
    };
var __export = function __export(_0x5e79d7, _0x474391)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        for (var _0x4a9e6c in _0x474391) {
            Object.defineProperty(_0x5e79d7, _0x4a9e6c, {
                get: _0x474391[_0x4a9e6c],
                enumerable: true
            });
        }
    };
var __copyProps = function __copyProps(_0x489836, _0x35d452, _0xd1fd7d, _0x1305c9)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x35d452 && _typeof(_0x35d452) === 'object' || typeof _0x35d452 === 'function') {
            var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(_0x35d452));
            var _step;
            try {
                var _loop = function _loop()
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x2480cd = _step.value;
                        if (!__hasOwnProp.call(_0x489836, _0x2480cd) && _0x2480cd !== _0xd1fd7d) {
                            Object.defineProperty(_0x489836, _0x2480cd, {
                                get()
                                    /* Called:undefined | Scope Closed:false| writes:false*/
                                    {
                                        return _0x35d452[_0x2480cd];
                                    },
                                enumerable: !(_0x1305c9 = Object.getOwnPropertyDescriptor(_0x35d452, _0x2480cd)) || _0x1305c9.enumerable
                            });
                        }
                    };
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    _loop();
                }
            } catch (err) {
                _iterator.e(err);
            } finally {
                _iterator.f();
            }
        }
        return _0x489836;
    };
var __toESM = function __toESM(_0x1f0289, _0x4e0182, _0x216a92)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x1f0289 != null) {
            _0x216a92 = Object.create(Object.getPrototypeOf(_0x1f0289));
        } else {
            _0x216a92 = {};
        }
        return __copyProps(_0x4e0182 || !_0x1f0289 || !_0x1f0289.__esModule ? __defProp_new(_0x216a92, 'default', {
            value: _0x1f0289,
            enumerable: true
        }) : _0x216a92, _0x1f0289);
    };
var _0x5031f1 = { value: true };
var __toCommonJS = function __toCommonJS(_0x43cb4f)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return __copyProps(__defProp_new({}, '__esModule', _0x5031f1), _0x43cb4f);
    };
var require_plugin = function _0x160946()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x36b853) {
            _0xeaec93[Object.getOwnPropertyNames(_0xeaec93)[0]]((_0x36b853 = { exports: {} }).exports, _0x36b853);
        }
        return _0x36b853.exports;
    };
var heading_divider_exports = {};
var _0x37757e = {
    default()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return heading_divider_default;
        },
    headingDivider()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _headingDivider2;
        }
};
__export(heading_divider_exports, _0x37757e);
module.exports = __copyProps(__defProp_new({}, '__esModule', _0x5031f1), _0x43cb4f);
function split(_0x1873dd, _0x1a6ee7, _0x1505e6 = false)
    /*Scope Closed:false | writes:false*/
    {
        var _0x5e989d = [[]];
        var _iterator2 = _createForOfIteratorHelper(_0x1873dd);
        var _step2;
        try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var _0x390e28 = _step2.value;
                if (_0x1a6ee7(_0x390e28)) {
                    _0x5e989d.push(_0x1505e6 ? [_0x390e28] : []);
                } else {
                    _0x5e989d[_0x5e989d.length - 1].push(_0x390e28);
                }
            }
        } catch (err) {
            _iterator2.e(err);
        } finally {
            _iterator2.f();
        }
        return _0x5e989d;
    }
var split_default = split;
var import_plugin = __toESM(require_plugin());
function _headingDivider(_0xa75573)
    /*Scope Closed:true*/
    {
        var _0x50a3fa = _0xa75573.marpit;
        _0xa75573.core.ruler.before('marpit_slide', 'marpit_heading_divider', function (_0x6c0a39)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                var _0x259659 = _0x50a3fa.options.headingDivider;
                if (_0x50a3fa.lastGlobalDirectives && Object.prototype.hasOwnProperty.call(_0x50a3fa.lastGlobalDirectives, 'headingDivider')) {
                    _0x259659 = _0x50a3fa.lastGlobalDirectives.headingDivider;
                }
                if (_0x6c0a39.inlineMode || _0x259659 === false) {
                    return;
                }
                if (Number.isInteger(_0x259659) && _0x259659 >= 1 && _0x259659 <= 6) {
                    _0x259659 = [Array(_0x259659).keys()].map(function (_0x3440a4)
                        /* Called:undefined | Scope Closed:true*/
                        {
                            return _0x3440a4 + 1;
                        });
                }
                if (!Array.isArray(_0x259659)) {
                    return;
                }
                var _0x4f4bb5 = _0x259659.map(function (_0x40c47f)
                    /* Called:undefined | Scope Closed:true*/
                    {
                        return 'h' + _0x40c47f;
                    });
                var _0x315263 = function _0x315263(_0x3d471d)
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        return _0x3d471d.type === 'heading_open' && _0x4f4bb5.includes(_0x3d471d.tag);
                    };
                var _0x40cb49 = [];
                var _iterator3 = _createForOfIteratorHelper(split(_0x6c0a39.tokens, _0x315263, true));
                var _step3;
                try {
                    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                        var _0xa5d9c7 = _step3.value;
                        var _xa5d9c = _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
                        var _0x51a46b = _xa5d9c[0];
                        if (_0x51a46b && (_0x3d471d.type === 'heading_open' && _0x4f4bb5.includes(_0x3d471d.tag)) && _0x40cb49.some(function (_0xae68d)
                                /* Called:undefined | Scope Closed:true*/
                                {
                                    return !_0xae68d.hidden;
                                })) {
                            var _0x105273 = new _0x6c0a39.Token('hr', '', 0);
                            _0x105273.hidden = true;
                            _0x105273.map = _0x51a46b.map;
                            _0x40cb49.push(_0x105273);
                        }
                        _0x40cb49.push.apply(_0x40cb49, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
                    }
                } catch (err) {
                    _iterator3.e(err);
                } finally {
                    _iterator3.f();
                }
                _0x6c0a39.tokens = [];
            });
    }
var _headingDivider2 = import_plugin.default(_headingDivider);
var heading_divider_default = _headingDivider2;
var _0x1e9cf7 = { headingDivider: _headingDivider2 };