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
var __export = function __export(_0x52eaa5, _0x1abd67)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        for (var _0x38f05b in _0x1abd67) {
            Object.defineProperty(_0x52eaa5, _0x38f05b, {
                get: _0x1abd67[_0x38f05b],
                enumerable: true
            });
        }
    };
var __copyProps = function __copyProps(_0x28a4cf, _0x559f1e, _0x2681b6, _0x2944ee)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x559f1e && _typeof(_0x559f1e) === 'object' || typeof _0x559f1e === 'function') {
            var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(_0x559f1e));
            var _step;
            try {
                var _loop = function _loop()
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x5d1039 = _step.value;
                        if (!__hasOwnProp.call(_0x28a4cf, _0x5d1039) && _0x5d1039 !== _0x2681b6) {
                            Object.defineProperty(_0x28a4cf, _0x5d1039, {
                                get()
                                    /* Called:undefined | Scope Closed:false| writes:false*/
                                    {
                                        return _0x559f1e[_0x5d1039];
                                    },
                                enumerable: !(_0x2944ee = Object.getOwnPropertyDescriptor(_0x559f1e, _0x5d1039)) || _0x2944ee.enumerable
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
        return _0x28a4cf;
    };
var _0x5ee127 = { value: true };
var __toCommonJS = function __toCommonJS(_0x47992b)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return __copyProps(__defProp_new({}, '__esModule', _0x5ee127), _0x47992b);
    };
var Tween_exports = {};
var _0x6ba64a = {
    default()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return Tween_default;
        }
};
__export(Tween_exports, _0x6ba64a);
module.exports = __copyProps(__defProp_new({}, '__esModule', _0x5ee127), _0x47992b);
var Easings_exports = {};
var _0x3ba462 = {
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
__export(Easings_exports, _0x3ba462);
var pow = Math.pow;
var PI = Math.PI;
var sqrt = Math.sqrt;
var HALF_PI = PI / 2;
var TWO_PI = PI * 2;
function makeInOut(_0xf4ad31, _0x3716a6)
    /*Scope Closed:true*/
    {
        return function (_0xcdaacb)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (_0xcdaacb < 0.5) {
                    return _0xf4ad31(_0xcdaacb * 2) * 0.5;
                } else {
                    return _0x3716a6(_0xcdaacb * 2 - 1) * 0.5 + 0.5;
                }
            };
    }
function makeExpIn(_0xdeb0ac)
    /*Scope Closed:true*/
    {
        return function (_0x471692)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return pow_new(_0x471692, _0xdeb0ac);
            };
    }
function makeExpOut(_0x283b30)
    /*Scope Closed:true*/
    {
        return function (_0x142017)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return 1 - pow_new(1 - _0x142017, _0x283b30);
            };
    }
function makeExpInOut(_0xef85a3)
    /*Scope Closed:true*/
    {
        return function (_0x88b855)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (_0x88b855 < 0.5) {
                    return pow_new(_0x88b855 * 2, _0xef85a3) * 0.5;
                } else {
                    return (1 - pow_new(1 - (_0x88b855 * 2 - 1), _0xef85a3)) * 0.5 + 0.5;
                }
            };
    }
var _linear = function _linear(_0xf51735)
    /* Called:undefined | Scope Closed:true*/
    {
        return _0xf51735;
    };
var _easeInQuad = function (_0x471692)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return pow_new(_0x471692, _0xdeb0ac);
    };
var _easeOutQuad = function (_0x142017)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - pow_new(1 - _0x142017, _0x283b30);
    };
var _easeInOutQuad = function (_0x88b855)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x88b855 < 0.5) {
            return pow_new(_0x88b855 * 2, _0xef85a3) * 0.5;
        } else {
            return (1 - pow_new(1 - (_0x88b855 * 2 - 1), _0xef85a3)) * 0.5 + 0.5;
        }
    };
var _easeInCubic = function (_0x471692)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return pow_new(_0x471692, _0xdeb0ac);
    };
var _easeOutCubic = function (_0x142017)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - pow_new(1 - _0x142017, _0x283b30);
    };
var _easeInOutCubic = function (_0x88b855)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x88b855 < 0.5) {
            return pow_new(_0x88b855 * 2, _0xef85a3) * 0.5;
        } else {
            return (1 - pow_new(1 - (_0x88b855 * 2 - 1), _0xef85a3)) * 0.5 + 0.5;
        }
    };
var _easeInQuart = function (_0x471692)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return pow_new(_0x471692, _0xdeb0ac);
    };
var _easeOutQuart = function (_0x142017)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - pow_new(1 - _0x142017, _0x283b30);
    };
var _easeInOutQuart = function (_0x88b855)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x88b855 < 0.5) {
            return pow_new(_0x88b855 * 2, _0xef85a3) * 0.5;
        } else {
            return (1 - pow_new(1 - (_0x88b855 * 2 - 1), _0xef85a3)) * 0.5 + 0.5;
        }
    };
var _easeInQuint = function (_0x471692)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return pow_new(_0x471692, _0xdeb0ac);
    };
var _easeOutQuint = function (_0x142017)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - pow_new(1 - _0x142017, _0x283b30);
    };
var _easeInOutQuint = function (_0x88b855)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x88b855 < 0.5) {
            return pow_new(_0x88b855 * 2, _0xef85a3) * 0.5;
        } else {
            return (1 - pow_new(1 - (_0x88b855 * 2 - 1), _0xef85a3)) * 0.5 + 0.5;
        }
    };
var _easeInSine = function _easeInSine(_0x377c3e)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - Math.cos(_0x377c3e * HALF_PI);
    };
var _easeOutSine = function _easeOutSine(_0x1d82b7)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return Math.sin(_0x1d82b7 * HALF_PI);
    };
var _easeInOutSine = function _easeInOutSine(_0x4d958d)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return (Math.cos(PI * _0x4d958d) - 1) * -0.5;
    };
var _easeInExpo = function _easeInExpo(_0x93ab42)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x93ab42 === 0) {
            return 0;
        } else {
            return pow_new(2, (_0x93ab42 - 1) * 10);
        }
    };
var _easeOutExpo = function _easeOutExpo(_0x2262a3)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x2262a3 === 1) {
            return 1;
        } else {
            return 1 - pow_new(2, _0x2262a3 * -10);
        }
    };
var _easeInOutExpo = function _easeInOutExpo(_0x541a41)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x541a41 === 0 || _0x541a41 === 1) {
            return _0x541a41;
        } else if (_0x541a41 < 0.5) {
            return pow_new(2, (_0x541a41 * 2 - 1) * 10) * 0.5;
        } else {
            return (1 - pow_new(2, (_0x541a41 * 2 - 1) * -10)) * 0.5 + 0.5;
        }
    };
var _easeInCirc = function _easeInCirc(_0x5a9297)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - sqrt_new(1 - _0x5a9297 * _0x5a9297);
    };
var _easeOutCirc = function _easeOutCirc(_0x382e16)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return sqrt_new(1 - pow_new(_0x382e16 - 1, 2));
    };
var _easeInOutCirc = function (_0xcdaacb)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0xcdaacb < 0.5) {
            return _0xf4ad31(_0xcdaacb * 2) * 0.5;
        } else {
            return _0x3716a6(_0xcdaacb * 2 - 1) * 0.5 + 0.5;
        }
    };
var _easeInElastic = function _easeInElastic(_0x20e8bf)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x20e8bf === 0 || _0x20e8bf === 1) {
            return _0x20e8bf;
        } else {
            return 1 - _easeOutElastic(1 - _0x20e8bf);
        }
    };
var _easeOutElastic = function _easeOutElastic(_0x14b1d6)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x14b1d6 === 0 || _0x14b1d6 === 1) {
            return _0x14b1d6;
        } else {
            return Math.pow(2, _0x14b1d6 * -10) * Math.sin((_0x14b1d6 - 0.075) * TWO_PI / 0.3) + 1;
        }
    };
var _easeInOutElastic = function (_0xcdaacb)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0xcdaacb < 0.5) {
            return _0xf4ad31(_0xcdaacb * 2) * 0.5;
        } else {
            return _0x3716a6(_0xcdaacb * 2 - 1) * 0.5 + 0.5;
        }
    };
var _easeInBack = function _easeInBack(_0x54dcc5)
    /* Called:undefined | Scope Closed:true*/
    {
        return _0x54dcc5 * _0x54dcc5 * (_0x54dcc5 * 2.70158 - 1.70158);
    };
var _easeOutBack = function _easeOutBack(_0x5732b0)
    /* Called:undefined | Scope Closed:true*/
    {
        return (_0x5732b0 = _0x5732b0 - 1) * _0x5732b0 * (_0x5732b0 * 2.70158 + 1.70158) + 1;
    };
var _easeInOutBack = function _easeInOutBack(_0x348e34)
    /* Called:undefined | Scope Closed:true*/
    {
        var _0x41baba = 2.5949095;
        if ((_0x348e34 = _0x348e34 * 2) < 1) {
            return _0x348e34 * _0x348e34 * (3.5949095 * _0x348e34 - 2.5949095) * 0.5;
        } else {
            return ((_0x348e34 = _0x348e34 - 2) * _0x348e34 * (3.5949095 * _0x348e34 + 2.5949095) + 2) * 0.5;
        }
    };
var _easeInBounce = function _easeInBounce(_0x356de9)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return 1 - _easeOutBounce(1 - _0x356de9);
    };
var _easeOutBounce = function _easeOutBounce(_0x48b8e2)
    /* Called:undefined | Scope Closed:true*/
    {
        if (_0x48b8e2 < 0.36363636363636365) {
            return _0x48b8e2 * 7.5625 * _0x48b8e2;
        } else if (_0x48b8e2 < 0.7272727272727273) {
            return (_0x48b8e2 = _0x48b8e2 - 0.5454545454545454) * 7.5625 * _0x48b8e2 + 0.75;
        } else if (_0x48b8e2 < 0.9090909090909091) {
            return (_0x48b8e2 = _0x48b8e2 - 0.8181818181818182) * 7.5625 * _0x48b8e2 + 0.9375;
        } else {
            return (_0x48b8e2 = _0x48b8e2 - 0.9545454545454546) * 7.5625 * _0x48b8e2 + 0.984375;
        }
    };
var _easeInOutBounce = function (_0xcdaacb)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0xcdaacb < 0.5) {
            return _0xf4ad31(_0xcdaacb * 2) * 0.5;
        } else {
            return _0x3716a6(_0xcdaacb * 2 - 1) * 0.5 + 0.5;
        }
    };
var Interpolators_exports = {};
var _0xe4c098 = {
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
__export(Interpolators_exports, _0xe4c098);
function _number(_0x334ec1, _0x566492, _0x1248d2)
    /*Scope Closed:true*/
    {
        return _0x334ec1 + (_0x566492 - _0x334ec1) * _0x1248d2;
    }
function _color(_0x83309e, _0x43d63d, _0x5e8ec8)
    /*Scope Closed:false | writes:false*/
    {
        _0x83309e = colorValueToNumber(_0x83309e);
        _0x43d63d = colorValueToNumber(_0x43d63d);
        return rgbToNumber(_number(_0x83309e >> 16 & 255, _0x43d63d >> 16 & 255, _0x5e8ec8), _number(_0x83309e >> 8 & 255, _0x43d63d >> 8 & 255, _0x5e8ec8), _number(_0x83309e & 255, _0x43d63d & 255, _0x5e8ec8));
    }
var colorValueToNumber = /*@Info: Executed but got error: Error: Line 1: Unexpected token (*/
function ()
    /* Called:true | Scope Closed:true*/
    {
        var _0xd555a3;
        var _0x24bdeb;
        var _0x47a47e = Object.create(null);
        var _0xdf23f8 = 0;
        var _0x54cb8d = 2048;
        return function (_0x2c7de5)
            /* Called:undefined | Scope Closed:true*/
            {
                {
                    return 0;
                }
            };
    }();
function rgbToNumber(_0x307b26, _0x3e239f, _0x145513)
    /*Scope Closed:true*/
    {
        return _0x307b26 << 16 ^ _0x3e239f << 8 ^ _0x145513;
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
                value(_0x50d3bf) {
                }
            },
            {
                key: 'gotoEnd',
                value() {
                }
            },
            {
                key: 'isDoneAtElapsedTime',
                value(_0x5e0380) {
                }
            }
        ]);
    }();
var linear2 = function linear2(_0x514463)
    /* Called:undefined | Scope Closed:true*/
    {
        return _0x514463;
    };
var maxSafeInteger = 9007199254740991;
var Tween = function (_AbstractTween)
    /* Called:true | Scope Closed:false| writes:false*/
    {
        function Tween(_0x3d8995, _0x212ec8, _0xe5c244)
            /*Scope Closed:false | writes:true*/
            {
                var _this;
                var _0x145335 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 750;
                var _0x16b8c3 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
                var _0x67cfa3 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : linear2;
                var _0x34aa05 = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 1;
                var _0x58a232 = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 'forward';
                var _0x15a1a1 = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 'number';
                _classCallCheck(this, Tween);
                _this = _callSuper(this, Tween);
                _this.callback = _0x3d8995;
                _this.fromValue = _0x212ec8;
                _this.toValue = _0xe5c244;
                _this.duration = _0x145335;
                _this.delay = _0x16b8c3;
                if (typeof (arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : linear2) === 'string') {
                    _this.easing = Easings_exports[_0x67cfa3] || linear2;
                } else {
                    _this.easing = _0x67cfa3;
                }
                _this.iterations = _0x34aa05;
                _this.direction = _0x58a232;
                if (typeof (arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 'number') === 'function') {
                    _this.interpolate = _0x15a1a1;
                } else {
                    _this.interpolate = Interpolators_exports[_0x15a1a1] || _number;
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
                value(_0x5d1416) {
                    var _0x5d0938 = this.duration;
                    var _0xe25e58 = this.delay;
                    if (_0x5d1416 >= _0xe25e58) {
                        _0x5d1416 = Math.min(_0x5d1416, this.totalElapsed) - _0xe25e58;
                        var _0x34afb7 = _0x5d1416 % _0x5d0938 / _0x5d0938;
                        if (_0x34afb7 === 0 && _0x5d1416 !== 0) {
                            _0x34afb7 = 1;
                        }
                        _0x34afb7 = this.easing(_0x34afb7);
                        if (this.direction === 'reverse' || this.direction === 'alternate' && Math.ceil(_0x5d1416 / _0x5d0938) % 2 === 0) {
                            _0x34afb7 = 1 - _0x34afb7;
                        }
                        this.callback(this.interpolate(this.fromValue, this.toValue, _0x34afb7));
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
                value(_0x33e658) {
                    return _0x33e658 > this.totalElapsed;
                }
            }
        ]);
    }(AbstractTween);
var Tween_default = Tween;