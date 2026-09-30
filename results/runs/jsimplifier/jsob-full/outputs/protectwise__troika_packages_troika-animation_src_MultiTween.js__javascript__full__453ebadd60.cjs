'use strict';
function _callSuper(t, o, e)
    /*Scope Closed:false | writes:false*/
    {
        o = _getPrototypeOf(o);
        return _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
    }
function _possibleConstructorReturn(t, e)
    /*Scope Closed:false | writes:false*/
    {
        if (e && (_typeof(e) == 'object' || typeof e == 'function')) {
            return e;
        }
        if (e !== undefined) {
            throw new TypeError('Derived constructors may only return object or undefined');
        }
        return _assertThisInitialized(t);
    }
function _assertThisInitialized(e)
    /*Scope Closed:true*/
    {
        if (e === undefined) {
            throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
        }
        return e;
    }
function _isNativeReflectConstruct()
    /*Scope Closed:false | writes:false*/
    {
        try {
            var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function ()
                /* Called:undefined | Scope Closed:true*/
                {
                }));
        } catch (t) {
        }
        return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
            return !!t;
        })();
    }
function _getPrototypeOf(t)
    /*Scope Closed:true*/
    {
        if (Object.setPrototypeOf) {
            _getPrototypeOf = Object.getPrototypeOf.bind();
        } else {
            var _getPrototypeOf_new = function _getPrototypeOf(t)
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    return t.__proto__ || Object.getPrototypeOf(t);
                };
        }
        return t.__proto__ || Object.getPrototypeOf(t);
    }
function _inherits(t, e)
    /*Scope Closed:false | writes:false*/
    {
        if (typeof e != 'function' && e !== null) {
            throw new TypeError('Super expression must either be null or a function');
        }
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                writable: true,
                configurable: true
            }
        });
        Object.defineProperty(t, 'prototype', { writable: false });
        if (e) {
            _setPrototypeOf(t, e);
        }
    }
function _setPrototypeOf(t, e)
    /*Scope Closed:true*/
    {
        if (Object.setPrototypeOf) {
            _setPrototypeOf = Object.setPrototypeOf.bind();
        } else {
            var _setPrototypeOf_new = function _setPrototypeOf(t, e)
                /* Called:undefined | Scope Closed:true*/
                {
                    t.__proto__ = e;
                    return t;
                };
        }
        return _setPrototypeOf(t, e);
    }
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
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function __export(_0x3f0d31, _0x33f78b)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        for (var _0x45d99a in _0x33f78b) {
            Object.defineProperty(_0x3f0d31, _0x45d99a, {
                get: _0x33f78b[_0x45d99a],
                enumerable: true
            });
        }
    };
var __copyProps = function __copyProps(_0xae1cdd, _0x61e8f8, _0x4b960a, _0x3d4c14)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x61e8f8 && _typeof(_0x61e8f8) === 'object' || typeof _0x61e8f8 === 'function') {
            var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(_0x61e8f8));
            var _step;
            try {
                var _loop = function _loop()
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x5b1020 = _step.value;
                        if (!__hasOwnProp.call(_0xae1cdd, _0x5b1020) && _0x5b1020 !== _0x4b960a) {
                            Object.defineProperty(_0xae1cdd, _0x5b1020, {
                                get()
                                    /* Called:undefined | Scope Closed:false| writes:false*/
                                    {
                                        return _0x61e8f8[_0x5b1020];
                                    },
                                enumerable: !(_0x3d4c14 = Object.getOwnPropertyDescriptor(_0x61e8f8, _0x5b1020)) || _0x3d4c14.enumerable
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
        return _0xae1cdd;
    };
var _0x2f54af = { value: true };
var __toCommonJS = function __toCommonJS(_0x5a17ca)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return __copyProps(__defProp_new({}, '__esModule', _0x2f54af), _0x5a17ca);
    };
var MultiTween_exports = {};
var _0x595b22 = {
    default()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return MultiTween_default;
        }
};
__export(MultiTween_exports, _0x595b22);
module.exports = __copyProps(__defProp_new({}, '__esModule', _0x2f54af), _0x5a17ca);
var Easings_exports = {};
var _0x2a6c06 = {
    easeInBack()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInBack;
        },
    easeInBounce()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInBounce;
        },
    easeInCirc()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInCirc;
        },
    easeInCubic()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInCubic;
        },
    easeInElastic()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInElastic;
        },
    easeInExpo()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInExpo;
        },
    easeInOutBack()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInOutBack;
        },
    easeInOutBounce()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInOutBounce;
        },
    easeInOutCirc()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInOutCirc;
        },
    easeInOutCubic()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInOutCubic;
        },
    easeInOutElastic()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInOutElastic;
        },
    easeInOutExpo()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInOutExpo;
        },
    easeInOutQuad()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInOutQuad;
        },
    easeInOutQuart()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInOutQuart;
        },
    easeInOutQuint()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInOutQuint;
        },
    easeInOutSine()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInOutSine;
        },
    easeInQuad()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInQuad;
        },
    easeInQuart()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInQuart;
        },
    easeInQuint()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInQuint;
        },
    easeInSine()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeInSine;
        },
    easeOutBack()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeOutBack;
        },
    easeOutBounce()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeOutBounce;
        },
    easeOutCirc()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeOutCirc;
        },
    easeOutCubic()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeOutCubic;
        },
    easeOutElastic()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeOutElastic;
        },
    easeOutExpo()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeOutExpo;
        },
    easeOutQuad()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeOutQuad;
        },
    easeOutQuart()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeOutQuart;
        },
    easeOutQuint()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeOutQuint;
        },
    easeOutSine()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _easeOutSine;
        },
    linear()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _linear;
        }
};
__export(Easings_exports, _0x2a6c06);
var pow = Math.pow;
var PI = Math.PI;
var sqrt = Math.sqrt;
var HALF_PI = PI / 2;
var TWO_PI = PI * 2;
function makeInOut(_0x53f4c3, _0x50ab49)
    /*Scope Closed:true*/
    {
        return function (_0x361d18)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (_0x361d18 < 0.5) {
                    return _0x53f4c3(_0x361d18 * 2) * 0.5;
                } else {
                    return _0x50ab49(_0x361d18 * 2 - 1) * 0.5 + 0.5;
                }
            };
    }
function makeExpIn(_0x6eb245)
    /*Scope Closed:true*/
    {
        return function (_0x41aa0c)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return pow_new(_0x41aa0c, _0x6eb245);
            };
    }
function makeExpOut(_0x6e956e)
    /*Scope Closed:true*/
    {
        return function (_0xd724b8)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return 1 - pow_new(1 - _0xd724b8, _0x6e956e);
            };
    }
function makeExpInOut(_0x595f0b)
    /*Scope Closed:true*/
    {
        return function (_0x20e71e)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (_0x20e71e < 0.5) {
                    return pow_new(_0x20e71e * 2, _0x595f0b) * 0.5;
                } else {
                    return (1 - pow_new(1 - (_0x20e71e * 2 - 1), _0x595f0b)) * 0.5 + 0.5;
                }
            };
    }
var _linear = function _linear(_0x21d3e6)
    /* Called:undefined | Scope Closed:true*/
    {
        return _0x21d3e6;
    };
var _easeInQuad = function (_0x41aa0c)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return pow_new(_0x41aa0c, _0x6eb245);
    };
var _easeOutQuad = function (_0xd724b8)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - pow_new(1 - _0xd724b8, _0x6e956e);
    };
var _easeInOutQuad = function (_0x20e71e)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x20e71e < 0.5) {
            return pow_new(_0x20e71e * 2, _0x595f0b) * 0.5;
        } else {
            return (1 - pow_new(1 - (_0x20e71e * 2 - 1), _0x595f0b)) * 0.5 + 0.5;
        }
    };
var _easeInCubic = function (_0x41aa0c)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return pow_new(_0x41aa0c, _0x6eb245);
    };
var _easeOutCubic = function (_0xd724b8)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - pow_new(1 - _0xd724b8, _0x6e956e);
    };
var _easeInOutCubic = function (_0x20e71e)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x20e71e < 0.5) {
            return pow_new(_0x20e71e * 2, _0x595f0b) * 0.5;
        } else {
            return (1 - pow_new(1 - (_0x20e71e * 2 - 1), _0x595f0b)) * 0.5 + 0.5;
        }
    };
var _easeInQuart = function (_0x41aa0c)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return pow_new(_0x41aa0c, _0x6eb245);
    };
var _easeOutQuart = function (_0xd724b8)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - pow_new(1 - _0xd724b8, _0x6e956e);
    };
var _easeInOutQuart = function (_0x20e71e)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x20e71e < 0.5) {
            return pow_new(_0x20e71e * 2, _0x595f0b) * 0.5;
        } else {
            return (1 - pow_new(1 - (_0x20e71e * 2 - 1), _0x595f0b)) * 0.5 + 0.5;
        }
    };
var _easeInQuint = function (_0x41aa0c)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return pow_new(_0x41aa0c, _0x6eb245);
    };
var _easeOutQuint = function (_0xd724b8)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - pow_new(1 - _0xd724b8, _0x6e956e);
    };
var _easeInOutQuint = function (_0x20e71e)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x20e71e < 0.5) {
            return pow_new(_0x20e71e * 2, _0x595f0b) * 0.5;
        } else {
            return (1 - pow_new(1 - (_0x20e71e * 2 - 1), _0x595f0b)) * 0.5 + 0.5;
        }
    };
var _easeInSine = function _easeInSine(_0x26117b)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - Math.cos(_0x26117b * HALF_PI);
    };
var _easeOutSine = function _easeOutSine(_0x13d3fa)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return Math.sin(_0x13d3fa * HALF_PI);
    };
var _easeInOutSine = function _easeInOutSine(_0xa5b8aa)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return (Math.cos(PI * _0xa5b8aa) - 1) * -0.5;
    };
var _easeInExpo = function _easeInExpo(_0x45f8fb)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x45f8fb === 0) {
            return 0;
        } else {
            return pow_new(2, (_0x45f8fb - 1) * 10);
        }
    };
var _easeOutExpo = function _easeOutExpo(_0x561a5f)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x561a5f === 1) {
            return 1;
        } else {
            return 1 - pow_new(2, _0x561a5f * -10);
        }
    };
var _easeInOutExpo = function _easeInOutExpo(_0x1cdb8b)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x1cdb8b === 0 || _0x1cdb8b === 1) {
            return _0x1cdb8b;
        } else if (_0x1cdb8b < 0.5) {
            return pow_new(2, (_0x1cdb8b * 2 - 1) * 10) * 0.5;
        } else {
            return (1 - pow_new(2, (_0x1cdb8b * 2 - 1) * -10)) * 0.5 + 0.5;
        }
    };
var _easeInCirc = function _easeInCirc(_0x8f58a0)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - sqrt_new(1 - _0x8f58a0 * _0x8f58a0);
    };
var _easeOutCirc = function _easeOutCirc(_0xacf67d)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return sqrt_new(1 - pow_new(_0xacf67d - 1, 2));
    };
var _easeInOutCirc = function (_0x361d18)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x361d18 < 0.5) {
            return _0x53f4c3(_0x361d18 * 2) * 0.5;
        } else {
            return _0x50ab49(_0x361d18 * 2 - 1) * 0.5 + 0.5;
        }
    };
var _easeInElastic = function _easeInElastic(_0x7b231c)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x7b231c === 0 || _0x7b231c === 1) {
            return _0x7b231c;
        } else {
            return 1 - _easeOutElastic(1 - _0x7b231c);
        }
    };
var _easeOutElastic = function _easeOutElastic(_0xc42b00)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0xc42b00 === 0 || _0xc42b00 === 1) {
            return _0xc42b00;
        } else {
            return Math.pow(2, _0xc42b00 * -10) * Math.sin((_0xc42b00 - 0.075) * TWO_PI / 0.3) + 1;
        }
    };
var _easeInOutElastic = function (_0x361d18)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x361d18 < 0.5) {
            return _0x53f4c3(_0x361d18 * 2) * 0.5;
        } else {
            return _0x50ab49(_0x361d18 * 2 - 1) * 0.5 + 0.5;
        }
    };
var _easeInBack = function _easeInBack(_0x3a02e4)
    /* Called:undefined | Scope Closed:true*/
    {
        return _0x3a02e4 * _0x3a02e4 * (_0x3a02e4 * 2.70158 - 1.70158);
    };
var _easeOutBack = function _easeOutBack(_0x3bb999)
    /* Called:undefined | Scope Closed:true*/
    {
        return (_0x3bb999 = _0x3bb999 - 1) * _0x3bb999 * (_0x3bb999 * 2.70158 + 1.70158) + 1;
    };
var _easeInOutBack = function _easeInOutBack(_0xbb9f5b)
    /* Called:undefined | Scope Closed:true*/
    {
        var _0xfeede9 = 2.5949095;
        if ((_0xbb9f5b = _0xbb9f5b * 2) < 1) {
            return _0xbb9f5b * _0xbb9f5b * (3.5949095 * _0xbb9f5b - 2.5949095) * 0.5;
        } else {
            return ((_0xbb9f5b = _0xbb9f5b - 2) * _0xbb9f5b * (3.5949095 * _0xbb9f5b + 2.5949095) + 2) * 0.5;
        }
    };
var _easeInBounce = function _easeInBounce(_0x12e3ba)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - _easeOutBounce(1 - _0x12e3ba);
    };
var _easeOutBounce = function _easeOutBounce(_0x17d9bd)
    /* Called:undefined | Scope Closed:true*/
    {
        if (_0x17d9bd < 0.36363636363636365) {
            return _0x17d9bd * 7.5625 * _0x17d9bd;
        } else if (_0x17d9bd < 0.7272727272727273) {
            return (_0x17d9bd = _0x17d9bd - 0.5454545454545454) * 7.5625 * _0x17d9bd + 0.75;
        } else if (_0x17d9bd < 0.9090909090909091) {
            return (_0x17d9bd = _0x17d9bd - 0.8181818181818182) * 7.5625 * _0x17d9bd + 0.9375;
        } else {
            return (_0x17d9bd = _0x17d9bd - 0.9545454545454546) * 7.5625 * _0x17d9bd + 0.984375;
        }
    };
var _easeInOutBounce = function (_0x361d18)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x361d18 < 0.5) {
            return _0x53f4c3(_0x361d18 * 2) * 0.5;
        } else {
            return _0x50ab49(_0x361d18 * 2 - 1) * 0.5 + 0.5;
        }
    };
var Interpolators_exports = {};
var _0x5965f6 = {
    color()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _color;
        },
    number()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _number;
        }
};
__export(Interpolators_exports, _0x5965f6);
function _number(_0x587a62, _0x38ca12, _0x826d71)
    /*Scope Closed:true*/
    {
        return _0x587a62 + (_0x38ca12 - _0x587a62) * _0x826d71;
    }
function _color(_0x373fc9, _0x1664a3, _0x2087e6)
    /*Scope Closed:false | writes:false*/
    {
        _0x373fc9 = colorValueToNumber(_0x373fc9);
        _0x1664a3 = colorValueToNumber(_0x1664a3);
        return rgbToNumber(_number(_0x373fc9 >> 16 & 255, _0x1664a3 >> 16 & 255, _0x2087e6), _number(_0x373fc9 >> 8 & 255, _0x1664a3 >> 8 & 255, _0x2087e6), _number(_0x373fc9 & 255, _0x1664a3 & 255, _0x2087e6));
    }
var colorValueToNumber = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _0x5dca20;
        var _0x28339e;
        var _0x3bfbf = Object.create(null);
        var _0x5c3158 = 0;
        var _0x51c373 = 2048;
        return function (_0x26a618)
            /* Called:undefined | Scope Closed:true*/
            {
                {
                    return 0;
                }
            };
    }();
function rgbToNumber(_0x5e3535, _0x4ea748, _0x303756)
    /*Scope Closed:true*/
    {
        return _0x5e3535 << 16 ^ _0x4ea748 << 8 ^ _0x303756;
    }
var AbstractTween = /*@Info: Executed but got error: ReferenceError: _defineProperties is not defined*/
function ()
    /* Called:true | Scope Closed:false| writes:false*/
    {
        function AbstractTween()
            /*Scope Closed:false | writes:false*/
            {
                _classCallCheck(this, AbstractTween);
            }
        return _createClass(AbstractTween, [
            {
                key: 'gotoElapsedTime',
                value(_0x5f1863) {
                }
            },
            {
                key: 'gotoEnd',
                value() {
                }
            },
            {
                key: 'isDoneAtElapsedTime',
                value(_0x8f4305) {
                }
            }
        ]);
    }();
var linear2 = function linear2(_0x13edbc)
    /* Called:undefined | Scope Closed:true*/
    {
        return _0x13edbc;
    };
var maxSafeInteger = 9007199254740991;
var Tween = function (_AbstractTween)
    /* Called:true | Scope Closed:false| writes:false*/
    {
        function Tween(_0x27ec49, _0x15be4d, _0x4a319e)
            /*Scope Closed:false | writes:true*/
            {
                var _this;
                var _0xc4cbd2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 750;
                var _0x6a8029 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
                var _0x1e575c = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : linear2;
                var _0x452b28 = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 1;
                var _0x497c9e = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 'forward';
                var _0x48ab70 = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 'number';
                _classCallCheck(this, Tween);
                _this = _callSuper(this, Tween);
                _this.callback = _0x27ec49;
                _this.fromValue = _0x15be4d;
                _this.toValue = _0x4a319e;
                _this.duration = _0xc4cbd2;
                _this.delay = _0x6a8029;
                if (typeof (arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : linear2) === 'string') {
                    _this.easing = Easings_exports[_0x1e575c] || linear2;
                } else {
                    _this.easing = _0x1e575c;
                }
                _this.iterations = _0x452b28;
                _this.direction = _0x497c9e;
                if (typeof (arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 'number') === 'function') {
                    _this.interpolate = _0x48ab70;
                } else {
                    _this.interpolate = Interpolators_exports[_0x48ab70] || _number;
                }
                if (_this.iterations < 9007199254740991) {
                    _this.totalElapsed = _this.delay + _this.duration * _this.iterations;
                } else {
                    _this.totalElapsed = maxSafeInteger;
                }
                return _this;
            }
        _inherits(Tween, _AbstractTween);
        return _createClass(Tween, [
            {
                key: 'gotoElapsedTime',
                value(_0x37e708) {
                    var _0x5e6472 = this.duration;
                    var _0x1c8c85 = this.delay;
                    if (_0x37e708 >= _0x1c8c85) {
                        _0x37e708 = Math.min(_0x37e708, this.totalElapsed) - _0x1c8c85;
                        var _0x2bbe18 = _0x37e708 % _0x5e6472 / _0x5e6472;
                        if (_0x2bbe18 === 0 && _0x37e708 !== 0) {
                            _0x2bbe18 = 1;
                        }
                        _0x2bbe18 = this.easing(_0x2bbe18);
                        if (this.direction === 'reverse' || this.direction === 'alternate' && Math.ceil(_0x37e708 / _0x5e6472) % 2 === 0) {
                            _0x2bbe18 = 1 - _0x2bbe18;
                        }
                        this.callback(this.interpolate(this.fromValue, this.toValue, _0x2bbe18));
                    }
                }
            },
            {
                key: 'gotoEnd',
                value() {
                    this.gotoElapsedTime(this.totalElapsed);
                }
            },
            {
                key: 'isDoneAtElapsedTime',
                value(_0x35443d) {
                    return _0x35443d > this.totalElapsed;
                }
            }
        ]);
    }(AbstractTween);
var Tween_default = Tween;
var MultiTween = function (_Tween_default)
    /* Called:true | Scope Closed:false| writes:false*/
    {
        function MultiTween(_0x390d62, _0x3b1949, _0x393dff, _0x9f62a9, _0x166dea, _0x1c225d)
            /*Scope Closed:false | writes:true*/
            {
                var _this2;
                _classCallCheck(this, MultiTween);
                if (typeof _0x3b1949 !== 'number') {
                    _0x3b1949 = _0x390d62.reduce(function (_0x550ef5, _0x40d56f)
                        /* Called:undefined | Scope Closed:true*/
                        {
                            return Math.max(_0x550ef5, _0x40d56f.totalElapsed);
                        }, 0);
                }
                if (_0x3b1949 === Infinity) {
                    _0x3b1949 = Number.MAX_VALUE;
                }
                _this2 = _callSuper(this, MultiTween, [
                    null,
                    0,
                    _0x3b1949,
                    _0x3b1949,
                    _0x393dff,
                    _0x9f62a9,
                    _0x166dea,
                    _0x1c225d
                ]);
                if (_0x390d62.length === 1) {
                    _this2.callback = _0x390d62[0].gotoElapsedTime.bind(_0x390d62[0]);
                } else {
                    _0x390d62.sort(endTimeComparator);
                    _this2.callback = _this2._syncTweens;
                }
                _this2.tweens = _0x390d62;
                return _this2;
            }
        _inherits(MultiTween, _Tween_default);
        return _createClass(MultiTween, [{
                key: '_syncTweens',
                value(_0x5a8044) {
                    for (var _0x15416d = 0, _0x29b19d = this.tweens.length; _0x15416d < _0x29b19d; _0x15416d++) {
                        this.tweens[_0x15416d].gotoElapsedTime(_0x5a8044);
                    }
                }
            }]);
    }(Tween_default);
function endTimeComparator(_0x2522de, _0x5ae6a7)
    /*Scope Closed:true*/
    {
        return _0x2522de.totalElapsed - _0x5ae6a7.totalElapsed;
    }
var MultiTween_default = MultiTween;