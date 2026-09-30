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
var __export = function __export(_0x1f1038, _0x3420a1)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        for (var _0x1ebf15 in _0x3420a1) {
            Object.defineProperty(_0x1f1038, _0x1ebf15, {
                get: _0x3420a1[_0x1ebf15],
                enumerable: true
            });
        }
    };
var __copyProps = function __copyProps(_0x21c600, _0x25c754, _0x4de0c5, _0x4d320c)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x25c754 && _typeof(_0x25c754) === 'object' || typeof _0x25c754 === 'function') {
            var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(_0x25c754));
            var _step;
            try {
                var _loop = function _loop()
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x1e496d = _step.value;
                        if (!__hasOwnProp.call(_0x21c600, _0x1e496d) && _0x1e496d !== _0x4de0c5) {
                            Object.defineProperty(_0x21c600, _0x1e496d, {
                                get()
                                    /* Called:undefined | Scope Closed:false| writes:false*/
                                    {
                                        return _0x25c754[_0x1e496d];
                                    },
                                enumerable: !(_0x4d320c = Object.getOwnPropertyDescriptor(_0x25c754, _0x1e496d)) || _0x4d320c.enumerable
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
        return _0x21c600;
    };
var _0x2062f1 = { value: true };
var __toCommonJS = function __toCommonJS(_0x2986fe)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return __copyProps(__defProp_new({}, '__esModule', _0x2062f1), _0x2986fe);
    };
var SpringTween_exports = {};
var _0x35b639 = {
    default()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return SpringTween_default;
        }
};
__export(SpringTween_exports, _0x35b639);
module.exports = __copyProps(__defProp_new({}, '__esModule', _0x2062f1), _0x2986fe);
var SpringPresets_default = {
    default: {
        mass: 1,
        tension: 170,
        friction: 26
    },
    gentle: {
        mass: 1,
        tension: 120,
        friction: 14
    },
    wobbly: {
        mass: 1,
        tension: 180,
        friction: 12
    },
    stiff: {
        mass: 1,
        tension: 210,
        friction: 20
    },
    slow: {
        mass: 1,
        tension: 280,
        friction: 60
    },
    molasses: {
        mass: 1,
        tension: 280,
        friction: 120
    }
};
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
                value(_0x7f4968) {
                }
            },
            {
                key: 'gotoEnd',
                value() {
                }
            },
            {
                key: 'isDoneAtElapsedTime',
                value(_0x2cf285) {
                }
            }
        ]);
    }();
var tensionFactor = 0.000001;
var frictionFactor = 0.001;
var DEFAULTS = {
    mass: 1,
    tension: 170,
    friction: 26
};
var SpringTween = function (_AbstractTween)
    /* Called:true | Scope Closed:false| writes:false*/
    {
        function SpringTween(_0x47957a, _0x443d6a, _0x328ed3, _0x4278de)
            /*Scope Closed:false | writes:true*/
            {
                var _this;
                var _0x44d888 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
                var _0x85d7f5 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
                _classCallCheck(this, SpringTween);
                _this = _callSuper(this, SpringTween);
                _this.isSpring = true;
                _this.callback = _0x47957a;
                _this.currentValue = _0x443d6a;
                _this.toValue = _0x328ed3;
                _this.velocity = _0x44d888;
                _this.delay = _0x85d7f5;
                if (typeof _0x4278de === 'string') {
                    _0x4278de = SpringPresets_default[_0x4278de];
                }
                if (!SpringPresets_default[_0x4278de]) {
                    _0x4278de = DEFAULTS;
                }
                var _x4278de = _0x4278de;
                var _0x2a618b = _x4278de.mass;
                var _0x1d4212 = _x4278de.tension;
                var _0xd46111 = _x4278de.friction;
                if (typeof _x4278de.mass === 'number') {
                    _this.mass = _0x2a618b;
                } else {
                    _this.mass = DEFAULTS.mass;
                }
                _this.tension = (typeof _x4278de.tension === 'number' ? _0x1d4212 : DEFAULTS.tension) * 0.000001;
                _this.friction = (typeof _x4278de.friction === 'number' ? _0xd46111 : DEFAULTS.friction) * 0.001;
                _this.minAcceleration = 1e-10;
                _this.$lastTime = _0x85d7f5;
                _this.$endTime = Infinity;
                return _this;
            }
        _inherits(SpringTween, _AbstractTween);
        return _createClass(SpringTween, [
            {
                key: 'gotoElapsedTime',
                value(_0x317ae8) {
                    if (_0x317ae8 >= this.delay) {
                        var _0x513135 = this.toValue;
                        var _0x43328c = this.mass;
                        var _0x32db1d = this.tension;
                        var _0x4fb2ea = this.friction;
                        var _0x22baf9 = this.minAcceleration;
                        var _0x93f29e = this.velocity || 0;
                        var _0x392c8d = this.currentValue;
                        for (var _0x49e1cd = this.$lastTime; _0x49e1cd < _0x317ae8; _0x49e1cd++) {
                            var _0x3e7033 = (_0x32db1d * (_0x513135 - _0x392c8d) - _0x4fb2ea * _0x93f29e) / _0x43328c;
                            if (Math.abs(_0x3e7033) < _0x22baf9) {
                                _0x93f29e = 0;
                                _0x392c8d = _0x513135;
                                this.$endTime = _0x49e1cd;
                                break;
                            } else {
                                _0x93f29e += _0x3e7033;
                                _0x392c8d += _0x93f29e;
                            }
                        }
                        this.velocity = _0x93f29e;
                        this.$lastTime = _0x317ae8;
                        this.callback(this.currentValue = _0x392c8d);
                    }
                }
            },
            {
                key: 'gotoEnd',
                value() {
                    this.velocity = 0;
                    this.$lastTime = this.$endTime;
                    this.callback(this.currentValue = this.toValue);
                }
            },
            {
                key: 'isDoneAtElapsedTime',
                value(_0x4bc4b9) {
                    return _0x4bc4b9 >= this.$endTime;
                }
            }
        ]);
    }(AbstractTween);
var SpringTween_default = SpringTween;