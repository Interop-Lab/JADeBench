'use strict';
function _classCallCheck(a, n)
    /*Scope Closed:true*/
    {
        if (!(a instanceof n)) {
            throw new TypeError('Cannot call a class as a function');
        }
    }
function _defineProperties(e, r)
    /*Scope Closed:true*/
    {
        for (var t = 0; t < r.length; t++) {
            var o = r[t];
            o.enumerable = o.enumerable || false;
            o.configurable = true;
            if ('value' in o) {
                o.writable = true;
            }
            Object.defineProperty(e, _toPropertyKey(o.key), o);
        }
    }
function _createClass(e, r, t)
    /*Scope Closed:false | writes:false*/
    {
        if (r) {
            _defineProperties(e.prototype, r);
        }
        if (t) {
            _defineProperties(e, t);
        }
        Object.defineProperty(e, 'prototype', { writable: false });
        return e;
    }
function _toPropertyKey(t)
    /*Scope Closed:false | writes:false*/
    {
        var i = _toPrimitive(t, 'string');
        if (_typeof(i) == 'symbol') {
            return i;
        } else {
            return i + '';
        }
    }
function _toPrimitive(t, r)
    /*Scope Closed:false | writes:false*/
    {
        if (_typeof(t) != 'object' || !t) {
            return t;
        }
        var e = t[Symbol.toPrimitive];
        if (e !== undefined) {
            var i = e.call(t, r || 'default');
            if (_typeof(i) != 'object') {
                return i;
            }
            throw new TypeError('@@toPrimitive must return a primitive value.');
        }
        return (r === 'string' ? String : Number)(t);
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
var __commonJS = function __commonJS(_0x5e77c3, _0x4feef6)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0xb7c090()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x4feef6) {
                    _0x5e77c3[Object.getOwnPropertyNames(_0x5e77c3)[0]]((_0x4feef6 = { exports: {} }).exports, _0x4feef6);
                }
                return _0x4feef6.exports;
            };
    };
var __export = function __export(_0x3277da, _0x4896c4)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        for (var _0x5c641f in _0x4896c4) {
            Object.defineProperty(_0x3277da, _0x5c641f, {
                get: _0x4896c4[_0x5c641f],
                enumerable: true
            });
        }
    };
var __copyProps = function __copyProps(_0x21894f, _0x355129, _0x5d22dc, _0x42e8da)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x355129 && _typeof(_0x355129) === 'object' || typeof _0x355129 === 'function') {
            var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(_0x355129));
            var _step;
            try {
                var _loop = function _loop()
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0xfbe4ac = _step.value;
                        if (!__hasOwnProp.call(_0x21894f, _0xfbe4ac) && _0xfbe4ac !== _0x5d22dc) {
                            Object.defineProperty(_0x21894f, _0xfbe4ac, {
                                get()
                                    /* Called:undefined | Scope Closed:false| writes:false*/
                                    {
                                        return _0x355129[_0xfbe4ac];
                                    },
                                enumerable: !(_0x42e8da = Object.getOwnPropertyDescriptor(_0x355129, _0xfbe4ac)) || _0x42e8da.enumerable
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
        return _0x21894f;
    };
var __toESM = function __toESM(_0x1308c1, _0xc249c8, _0x2c126c)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x1308c1 != null) {
            _0x2c126c = Object.create(Object.getPrototypeOf(_0x1308c1));
        } else {
            _0x2c126c = {};
        }
        return __copyProps(_0xc249c8 || !_0x1308c1 || !_0x1308c1.__esModule ? __defProp_new(_0x2c126c, 'default', {
            value: _0x1308c1,
            enumerable: true
        }) : _0x2c126c, _0x1308c1);
    };
var _0x5aa0ea = { value: true };
var __toCommonJS = function __toCommonJS(_0x237f36)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return __copyProps(__defProp_new({}, '__esModule', _0x5aa0ea), _0x237f36);
    };
var require_plugin = function _0xb7c090()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x4feef6) {
            _0x5e77c3[Object.getOwnPropertyNames(_0x5e77c3)[0]]((_0x4feef6 = { exports: {} }).exports, _0x4feef6);
        }
        return _0x4feef6.exports;
    };
var apply_exports = {};
var _0x84972c = {
    apply()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _apply2;
        },
    default()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return apply_default;
        }
};
__export(apply_exports, _0x84972c);
module.exports = __copyProps(__defProp_new({}, '__esModule', _0x5aa0ea), _0x237f36);
var import_postcss = require('postcss');
var InlineStyle = /*@Info: Executed but got error: ReferenceError: _defineProperties is not defined*/
function ()
    /* Called:true | Scope Closed:false| writes:false*/
    {
        function _InlineStyle(_0x373b68)
            /*Scope Closed:false | writes:false*/
            {
                var _this = this;
                _classCallCheck(this, _InlineStyle);
                this.decls = {};
                if (_0x373b68) {
                    if (_0x373b68 instanceof _InlineStyle || typeof _0x373b68 === 'string') {
                        var _0x208b32 = { from: undefined };
                        var _0x3149ba = import_postcss.parse(_0x373b68.toString(), _0x208b32);
                        _0x3149ba.each(function (_0x4ae0ce)
                            /* Called:undefined | Scope Closed:false| writes:false*/
                            {
                                if (_0x4ae0ce.type === 'decl') {
                                    _this.decls[_0x4ae0ce.prop] = _0x4ae0ce.value;
                                }
                            });
                    } else {
                        var _0x4c2a06 = Object.assign({}, _0x373b68);
                        this.decls = _0x4c2a06;
                    }
                }
            }
        return _createClass(_InlineStyle, [
            {
                key: 'delete',
                value(_0x322bd1) {
                    return this;
                }
            },
            {
                key: 'set',
                value(_0x5bc01a, _0x1c18aa) {
                    this.decls[_0x5bc01a] = _0x1c18aa;
                    return this;
                }
            },
            {
                key: 'toString',
                value() {
                    var _this2 = this;
                    var _0x3c6ed3 = '';
                    var _loop2 = function _loop2() {
                        var _0x41f4fd = _Object$keys[_i];
                        var _0x5ba512;
                        try {
                            _0x35656f = { from: undefined };
                            _0x5ba512 = import_postcss.parse(_0x41f4fd + ':' + _this2.decls[_0x41f4fd], _0x35656f);
                        } catch (e) {
                            null;
                        }
                        if (_0x5ba512) {
                            _0x5ba512.each(function (_0x2ebf41) {
                                if (_0x2ebf41.type !== 'decl' || _0x2ebf41.prop !== _0x41f4fd) {
                                    _0x2ebf41.remove();
                                }
                            });
                            _0x3c6ed3 += _0x5ba512.toString() + ';';
                        }
                    };
                    var _0x35656f;
                    for (var _i = 0, _Object$keys = Object.keys(this.decls); _i < _Object$keys.length; _i++) {
                        _loop2();
                    }
                    return _0x3c6ed3;
                }
            }
        ]);
    }();
var globals = Object.assign(Object.create(null), {
    headingDivider(_0x30c81e)
        /* Called:undefined | Scope Closed:true*/
        {
            var _0x23895c = [
                1,
                2,
                3,
                4,
                5,
                6
            ];
            var _0xdc5a4 = function _0xdc5a4(_0x7e21)
                /* Called:undefined | Scope Closed:true*/
                {
                    if (Array.isArray(_0x7e21) || Number.isNaN(_0x7e21)) {
                        return _0x7e21;
                    } else {
                        return Number.parseInt(_0x7e21, 10);
                    }
                };
            var _0x4a52f8 = _0xdc5a4(_0x30c81e);
            if (Array.isArray(_0x4a52f8)) {
                var _0x644f7 = _0x4a52f8.map(_0xdc5a4);
                return {
                    headingDivider: [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6
                    ].filter(function (_0x5b1af3)
                        /* Called:undefined | Scope Closed:false| writes:false*/
                        {
                            return _0x644f7.includes(_0x5b1af3);
                        })
                };
            }
            if (_0x30c81e === 'false') {
                return { headingDivider: false };
            }
            if (_0x23895c.includes(_0x4a52f8)) {
                return { headingDivider: _0x4a52f8 };
            }
            return {};
        },
    style(_0x476018)
        /* Called:undefined | Scope Closed:true*/
        {
            return { style: _0x476018 };
        },
    theme(_0x404010, _0xfbfde0)
        /* Called:undefined | Scope Closed:true*/
        {
            if (_0xfbfde0.themeSet.has(_0x404010)) {
                return { theme: _0x404010 };
            } else {
                return {};
            }
        },
    lang(_0x5ee36a)
        /* Called:undefined | Scope Closed:true*/
        {
            return { lang: _0x5ee36a };
        }
});
var locals = Object.assign(Object.create(null), {
    backgroundColor(_0x11424b)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundColor: _0x11424b };
        },
    backgroundImage(_0x19f71e)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundImage: _0x19f71e };
        },
    backgroundPosition(_0x5c82c5)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundPosition: _0x5c82c5 };
        },
    backgroundRepeat(_0x2225ba)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundRepeat: _0x2225ba };
        },
    backgroundSize(_0x301b04)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundSize: _0x301b04 };
        },
    class(_0xde7bce)
        /* Called:undefined | Scope Closed:true*/
        {
            return { class: Array.isArray(_0xde7bce) ? _0xde7bce.join(' ') : _0xde7bce };
        },
    color(_0x5667d6)
        /* Called:undefined | Scope Closed:true*/
        {
            return { color: _0x5667d6 };
        },
    footer(_0x2803ed)
        /* Called:undefined | Scope Closed:true*/
        {
            if (typeof _0x2803ed === 'string') {
                return { footer: _0x2803ed };
            } else {
                return {};
            }
        },
    header(_0x4a5672)
        /* Called:undefined | Scope Closed:true*/
        {
            if (typeof _0x4a5672 === 'string') {
                return { header: _0x4a5672 };
            } else {
                return {};
            }
        },
    paginate(_0x358daa)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            var _0x5606b9 = (_0x358daa || '').toLowerCase();
            if ([
                    'hold',
                    'skip'
                ].includes(_0x5606b9)) {
                return { paginate: _0x5606b9 };
            }
            return { paginate: _0x5606b9 === 'true' };
        }
});
var directives_default = [
    Object.keys(globals),
    Object.keys(locals)
];
var import_lodash = __toESM(require('lodash.kebabcase'));
var import_plugin = __toESM(require_plugin());
function _apply(_0x5485cc, _0x5e29ca = {})
    /*Scope Closed:false | writes:false*/
    {
        var _0x3db714 = _0x5485cc.marpit;
        var _0x14fe0f = _0x3db714.options.lang;
        var _0x35f168 = _0x5e29ca.dataset === undefined ? true : !!_0x5e29ca.dataset;
        var _0x3dac16 = _0x5e29ca.css === undefined ? true : !!_0x5e29ca.css;
        var _x3db714$customDirec = _0x3db714.customDirectives;
        var _0x283688 = _x3db714$customDirec.global;
        var _0x143670 = _x3db714$customDirec.local;
        var _0x38005d = [
            Object.keys(_0x283688),
            Object.keys(_0x143670),
            directives_default
        ];
        _0x5485cc.core.ruler.after('marpit_directives_parse', 'marpit_directives_apply', function (_0x54b3b1)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                if (_0x54b3b1.inlineMode) {
                    return;
                }
                var _0x2f2852 = 0;
                var _0x49b40b = [];
                var _iterator2 = _createForOfIteratorHelper(_0x54b3b1.tokens);
                var _step2;
                try {
                    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                        var _0x55c681 = _step2.value;
                        var _ref = _0x55c681.meta || {};
                        var _0x14e0af = _ref.marpitDirectives;
                        if (_0x55c681.type === 'marpit_slide_open') {
                            if ((_0x14e0af != null ? undefined : _0x14e0af.paginate) !== 'skip' && (_0x14e0af != null ? undefined : _0x14e0af.paginate) !== 'hold') {
                                _0x2f2852 += 1;
                            }
                        }
                        if (_0x14e0af) {
                            var _0x2b7f78 = new InlineStyle(_0x55c681.attrGet('style'));
                            for (var _i3 = 0, _Object$keys2 = Object.keys(_0x14e0af); _i3 < _Object$keys2.length; _i3++) {
                                var _0x4b1eed = _Object$keys2[_i3];
                                if (_0x38005d.includes(_0x4b1eed)) {
                                    var _0x289c6e = _0x14e0af[_0x4b1eed];
                                    if (_0x289c6e) {
                                        var _0xa70211 = import_lodash.default(_0x4b1eed);
                                        if (_0x35f168) {
                                            _0x55c681.attrSet('data-' + import_lodash.default(_0x4b1eed), _0x289c6e);
                                        }
                                        if (_0x3dac16) {
                                            _0x2b7f78.set('--' + import_lodash.default(_0x4b1eed), _0x289c6e);
                                        }
                                    }
                                }
                            }
                            if (_0x14e0af.lang || _0x14fe0f) {
                                _0x55c681.attrSet('lang', _0x14e0af.lang || _0x14fe0f);
                            }
                            if (_0x14e0af.class) {
                                _0x55c681.attrJoin('class', _0x14e0af.class);
                            }
                            if (_0x14e0af.color) {
                                _0x2b7f78.set('color', _0x14e0af.color);
                            }
                            if (_0x14e0af.backgroundColor) {
                                _0x2b7f78.set('background-color', _0x14e0af.backgroundColor).set('background-image', 'none');
                            }
                            if (_0x14e0af.backgroundImage) {
                                _0x2b7f78.set('background-image', _0x14e0af.backgroundImage).set('background-position', 'center').set('background-repeat', 'no-repeat').set('background-size', 'cover');
                                if (_0x14e0af.backgroundPosition) {
                                    _0x2b7f78.set('background-position', _0x14e0af.backgroundPosition);
                                }
                                if (_0x14e0af.backgroundRepeat) {
                                    _0x2b7f78.set('background-repeat', _0x14e0af.backgroundRepeat);
                                }
                                if (_0x14e0af.backgroundSize) {
                                    _0x2b7f78.set('background-size', _0x14e0af.backgroundSize);
                                }
                            }
                            if (_0x14e0af.paginate && _0x14e0af.paginate !== 'skip') {
                                if (false) {
                                    _0x2f2852 = 1;
                                }
                                _0x55c681.attrSet('data-marpit-pagination', _0x2f2852);
                                _0x49b40b.push(_0x55c681);
                            }
                            if (_0x14e0af.header) {
                                _0x55c681.meta.marpitHeader = _0x14e0af.header;
                            }
                            if (_0x14e0af.footer) {
                                _0x55c681.meta.marpitFooter = _0x14e0af.footer;
                            }
                            var _0x1beb33 = _0x2b7f78.toString();
                            if (_0x1beb33 !== '') {
                                _0x55c681.attrSet('style', _0x1beb33);
                            }
                        }
                    }
                } catch (err) {
                    _iterator2.e(err);
                } finally {
                    _iterator2.f();
                }
                for (var _i2 = 0, _x49b40b = _0x49b40b; _i2 < _x49b40b.length; _i2++) {
                    var _0x2202b4 = _x49b40b[_i2];
                    _0x2202b4.attrSet('data-marpit-pagination-total', _0x2f2852);
                }
            });
    }
var _apply2 = import_plugin.default(_apply);
var apply_default = _apply2;
var _0x187252 = { apply: _apply2 };