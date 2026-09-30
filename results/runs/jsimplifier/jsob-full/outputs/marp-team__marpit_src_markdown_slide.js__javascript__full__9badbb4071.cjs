'use strict';
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
var __commonJS = function __commonJS(_0xa6ee53, _0x1f7b7b)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x173ae6()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x1f7b7b) {
                    _0xa6ee53[Object.getOwnPropertyNames(_0xa6ee53)[0]]((_0x1f7b7b = { exports: {} }).exports, _0x1f7b7b);
                }
                return _0x1f7b7b.exports;
            };
    };
var __export = function __export(_0x6bd34e, _0x430b8a)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        for (var _0x597c39 in _0x430b8a) {
            Object.defineProperty(_0x6bd34e, _0x597c39, {
                get: _0x430b8a[_0x597c39],
                enumerable: true
            });
        }
    };
var __copyProps = function __copyProps(_0x223d63, _0x17f815, _0x5b533e, _0x59480c)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x17f815 && _typeof(_0x17f815) === 'object' || typeof _0x17f815 === 'function') {
            var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(_0x17f815));
            var _step;
            try {
                var _loop = function _loop()
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x1dc887 = _step.value;
                        if (!__hasOwnProp.call(_0x223d63, _0x1dc887) && _0x1dc887 !== _0x5b533e) {
                            Object.defineProperty(_0x223d63, _0x1dc887, {
                                get()
                                    /* Called:undefined | Scope Closed:false| writes:false*/
                                    {
                                        return _0x17f815[_0x1dc887];
                                    },
                                enumerable: !(_0x59480c = Object.getOwnPropertyDescriptor(_0x17f815, _0x1dc887)) || _0x59480c.enumerable
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
        return _0x223d63;
    };
var __toESM = function __toESM(_0x30402, _0x19e8af, _0x435f3b)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x30402 != null) {
            _0x435f3b = Object.create(Object.getPrototypeOf(_0x30402));
        } else {
            _0x435f3b = {};
        }
        return __copyProps(_0x19e8af || !_0x30402 || !_0x30402.__esModule ? __defProp_new(_0x435f3b, 'default', {
            value: _0x30402,
            enumerable: true
        }) : _0x435f3b, _0x30402);
    };
var _0x35f409 = { value: true };
var __toCommonJS = function __toCommonJS(_0x2089b7)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return __copyProps(__defProp_new({}, '__esModule', _0x35f409), _0x2089b7);
    };
var require_plugin = function _0x173ae6()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x1f7b7b) {
            _0xa6ee53[Object.getOwnPropertyNames(_0xa6ee53)[0]]((_0x1f7b7b = { exports: {} }).exports, _0x1f7b7b);
        }
        return _0x1f7b7b.exports;
    };
var slide_exports = {};
var _0x48af5f = {
    default()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return slide_default;
        },
    defaultAnchorCallback()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _defaultAnchorCallback;
        },
    slide()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _slide2;
        }
};
__export(slide_exports, _0x48af5f);
module.exports = __copyProps(__defProp_new({}, '__esModule', _0x35f409), _0x2089b7);
function split(_0x2fb5bb, _0xa41f35, _0x38500b = false)
    /*Scope Closed:false | writes:false*/
    {
        var _0x49d23a = [[]];
        var _iterator2 = _createForOfIteratorHelper(_0x2fb5bb);
        var _step2;
        try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var _0x173fde = _step2.value;
                if (_0xa41f35(_0x173fde)) {
                    _0x49d23a.push(_0x38500b ? [_0x173fde] : []);
                } else {
                    _0x49d23a[_0x49d23a.length - 1].push(_0x173fde);
                }
            }
        } catch (err) {
            _iterator2.e(err);
        } finally {
            _iterator2.f();
        }
        return _0x49d23a;
    }
var split_default = split;
function wrapTokens(_0x5d238e, _0x1fba1d, _0x3ce21b, _0x1fd04b = [])
    /*Scope Closed:false | writes:true*/
    {
        var _0x12ef16 = _0x3ce21b.tag;
        var _iterator3 = _createForOfIteratorHelper(_0x1fd04b);
        var _step3;
        try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var _0x3e6593 = _step3.value;
                _0x3e6593.level += 1;
            }
        } catch (err) {
            _iterator3.e(err);
        } finally {
            _iterator3.f();
        }
        var _0x463af9 = new _0x5d238e(_0x1fba1d + '_open', _0x12ef16, 1);
        var _0x483854 = new _0x5d238e(_0x1fba1d + '_close', _0x12ef16, -1);
        var _0x4c1771 = Object.assign({}, _0x3ce21b.open || {});
        Object.assign(_0x463af9, _0x4c1771);
        var _0x1fa798 = Object.assign({}, _0x3ce21b.close || {});
        Object.assign(_0x483854, _0x1fa798);
        for (var _i = 0, _Object$keys = Object.keys(_0x3ce21b); _i < _Object$keys.length; _i++) {
            var _0x1312b9 = _Object$keys[_i];
            if (![
                    'open',
                    'close',
                    'tag'
                ].includes(_0x1312b9) && _0x3ce21b[_0x1312b9] != null) {
                _0x463af9.attrSet(_0x1312b9, _0x3ce21b[_0x1312b9]);
            }
        }
        return [].concat(_0x463af9, _0x1fd04b, _0x483854);
    }
var wrap_tokens_default = wrapTokens;
var import_plugin = __toESM(require_plugin());
var _defaultAnchorCallback = function _defaultAnchorCallback(_0x136d86)
    /* Called:undefined | Scope Closed:true*/
    {
        return '' + (_0x136d86 + 1);
    };
function _slide(_0x13404c, _0x1a5644 = {})
    /*Scope Closed:false | writes:false*/
    {
        var _0x2ab952 = _0x1a5644.anchor === undefined ? true : _0x1a5644.anchor;
        var _0x38d274 = function ()
            /* Called:true | Scope Closed:false| writes:false*/
            {
                if (typeof (_0x1a5644.anchor === undefined ? true : _0x1a5644.anchor) === 'function') {
                    return _0x2ab952;
                }
                if (_0x2ab952) {
                    return _defaultAnchorCallback;
                }
                return function () {
                    return undefined;
                };
            }();
        _0x13404c.core.ruler.push('marpit_slide', function (_0x29a08a)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                if (_0x29a08a.inlineMode) {
                    return;
                }
                var _0x1f66d4 = split(_0x29a08a.tokens, function (_0x2e0a8f)
                    /* Called:undefined | Scope Closed:true*/
                    {
                        return _0x2e0a8f.type === 'hr' && _0x2e0a8f.level === 0;
                    }, true);
                var _0x14beb6 = _0x1f66d4.length;
                _0x29a08a.tokens = _0x1f66d4.reduce(function (_0xf046cb, _0x5f5141, _0x46be9e)
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x2b74af = _0x5f5141[0] && _0x5f5141[0].type === 'hr' ? _0x5f5141[0] : undefined;
                        var _0x579e7a = _0x2b74af || _0x5f5141.find(function (_0x260fcc)
                            /* Called:undefined | Scope Closed:true*/
                            {
                                return _0x260fcc.map;
                            });
                        return [].concat(_0xf046cb, wrapTokens(_0x29a08a.Token, 'marpit_slide', Object.assign({}, _0x1a5644.attributes || {}, {
                            tag: 'section',
                            id: _0x38d274_new(_0x46be9e),
                            open: {
                                block: true,
                                meta: {
                                    marpitSlide: _0x46be9e,
                                    marpitSlideTotal: _0x14beb6,
                                    marpitSlideElement: 1
                                },
                                map: _0x579e7a ? _0x579e7a.map : [
                                    0,
                                    1
                                ]
                            },
                            close: {
                                block: true,
                                meta: {
                                    marpitSlide: _0x46be9e,
                                    marpitSlideTotal: _0x14beb6,
                                    marpitSlideElement: -1
                                }
                            }
                        }), _0x5f5141.slice(_0x2b74af ? 1 : 0)));
                    }, []);
            });
    }
var _slide2 = import_plugin.default(_slide);
var slide_default = _slide2;
var _0x241a7a = {
    defaultAnchorCallback: _defaultAnchorCallback,
    slide: _slide2
};