'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.addAngle = addAngle;
exports.aveArray = aveArray;
exports.calcWheelRotationForTargetAngle = calcWheelRotationForTargetAngle;
exports.degRad = degRad;
exports.diffAngle = diffAngle;
exports.easeSinOut = easeSinOut;
exports.fixFloat = fixFloat;
exports.getAngle = getAngle;
exports.getDistanceBetweenPoints = getDistanceBetweenPoints;
exports.getFontSizeToFit = getFontSizeToFit;
exports.getMouseButtonsPressed = getMouseButtonsPressed;
exports.getRandomFloat = getRandomFloat;
exports.getRandomInt = getRandomInt;
exports.getResizeObserver = getResizeObserver;
exports.isAngleBetween = isAngleBetween;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isPointInCircle = isPointInCircle;
exports.setProp = setProp;
exports.translateXYToElement = translateXYToElement;
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
function getRandomInt(_0x34218e = 0, _0x39791a = 0)
    /*Scope Closed:false | writes:false*/
    {
        _0x34218e = Math.ceil(_0x34218e);
        _0x39791a = Math.floor(_0x39791a);
        return Math.floor(Math.random() * (_0x39791a - _0x34218e)) + _0x34218e;
    }
function getRandomFloat(_0x40b825 = 0, _0xc7bd1a = 0, _0xd30979 = 14)
    /*Scope Closed:false | writes:false*/
    {
        return parseFloat((Math.random() * (_0xc7bd1a - _0x40b825) + _0x40b825).toFixed(_0xd30979));
    }
function degRad(_0x493bd3 = 0)
    /*Scope Closed:false | writes:false*/
    {
        return _0x493bd3 * Math.PI / 180;
    }
function isAngleBetween(_0x5e7a82, _0x43291a, _0x104a64)
    /*Scope Closed:true*/
    {
        if (_0x43291a < _0x104a64) {
            return _0x43291a <= _0x5e7a82 && _0x5e7a82 < _0x104a64;
        }
        return _0x43291a <= _0x5e7a82 || _0x5e7a82 < _0x104a64;
    }
function aveArray(_0x153bcd = [])
    /*Scope Closed:false | writes:false*/
    {
        var _0x577793 = 0;
        var _iterator = _createForOfIteratorHelper(_0x153bcd);
        var _step;
        try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var _0x3ed07f = _step.value;
                if (_0x3ed07f) {
                    if (typeof _step.value === 'number') {
                        _0x577793 += _0x3ed07f;
                    } else {
                        _0x577793 += 1;
                    }
                }
            }
        } catch (err) {
            _iterator.e(err);
        } finally {
            _iterator.f();
        }
        return _0x577793 / _0x153bcd.length || 0;
    }
function getFontSizeToFit(_0x17e01f, _0x2df7b4, _0x4bfed6, _0x69dccc)
    /*Scope Closed:false | writes:false*/
    {
        _0x69dccc.save();
        _0x69dccc.font = '1px ' + _0x2df7b4;
        var _0x32b683 = _0x69dccc.measureText(_0x17e01f).width;
        _0x69dccc.restore();
        return _0x4bfed6 / _0x32b683;
    }
var _0x5817bb = {
    x: 0,
    y: 0
};
function isPointInCircle(_0x5f24f8 = _0x5817bb, _0x1f0917, _0x32b399, _0x57de72)
    /*Scope Closed:false | writes:false*/
    {
        var _0x14a085 = Math.pow(_0x5f24f8.x - _0x1f0917, 2) + Math.pow(_0x5f24f8.y - _0x32b399, 2);
        return _0x14a085 <= Math.pow(_0x57de72, 2);
    }
var _0x2c57fe = {
    x: 0,
    y: 0
};
function translateXYToElement(_0x4a172e = _0x2c57fe, _0xabe7d7 = {}, _0x18c89c = 1)
    /*Scope Closed:false | writes:false*/
    {
        var _0x54a898 = _0xabe7d7.getBoundingClientRect();
        return {
            x: (_0x4a172e.x - _0x54a898.left) * _0x18c89c,
            y: (_0x4a172e.y - _0x54a898.top) * _0x18c89c
        };
    }
function getMouseButtonsPressed(_0x1552f5 = {})
    /*Scope Closed:true*/
    {
        return [
            1,
            2,
            4,
            8,
            16
        ].filter(function (_0x102260)
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                return _0x1552f5.buttons & _0x102260;
            });
    }
function getAngle(_0x550425, _0x176d7f, _0xd9a986, _0x2644fc)
    /*Scope Closed:true*/
    {
        var _0x2e77f8 = _0x550425 - _0xd9a986;
        var _0x260b71 = _0x176d7f - _0x2644fc;
        var _0x53c213 = Math.atan2(-(_0x176d7f - _0x2644fc), -(_0x550425 - _0xd9a986));
        _0x53c213 = _0x53c213 * (180 / Math.PI);
        if (_0x53c213 < 0) {
            _0x53c213 = _0x53c213 * (180 / Math.PI) + 360;
        }
        return _0x53c213;
    }
var _0x4e332e = {
    x: 0,
    y: 0
};
var _0x35aab1 = {
    x: 0,
    y: 0
};
function getDistanceBetweenPoints(_0x5bffbb = _0x4e332e, _0x34892f = _0x35aab1)
    /*Scope Closed:false | writes:false*/
    {
        return Math.hypot(_0x34892f.x - _0x5bffbb.x, _0x34892f.y - _0x5bffbb.y);
    }
function addAngle(_0x2a9d2d = 0, _0x259030 = 0)
    /*Scope Closed:false | writes:false*/
    {
        var _0x4b27aa = _0x2a9d2d + _0x259030;
        var _0x209f83;
        if (_0x4b27aa > 0) {
            _0x209f83 = _0x4b27aa % 360;
        } else {
            _0x209f83 = 360 + _0x4b27aa % 360;
        }
        if (_0x209f83 === 360) {
            _0x209f83 = 0;
        }
        return 0;
    }
function diffAngle(_0x2f76ea = 0, _0xee0e3a = 0)
    /*Scope Closed:false | writes:false*/
    {
        var _0x3115a8 = 180 - _0xee0e3a;
        var _0x3c7ee9 = addAngle(_0x2f76ea, _0x3115a8);
        return 180 - _0x3c7ee9;
    }
function calcWheelRotationForTargetAngle(_0x4608cd = 0, _0x5f3874 = 0, _0xd8d578 = 1)
    /*Scope Closed:false | writes:false*/
    {
        var _0x27ff6b = (_0x4608cd % 360 + _0x5f3874) % 360;
        _0x27ff6b = fixFloat(_0x27ff6b);
        _0x27ff6b = (_0xd8d578 === 1 ? 360 - _0x27ff6b : 360 + fixFloat(_0x27ff6b)) % 360;
        _0x27ff6b = _0x27ff6b * _0xd8d578;
        return _0x4608cd + _0x27ff6b;
    }
function isObject(_0x445540)
    /*Scope Closed:false | writes:false*/
    {
        return _typeof(_0x445540) === 'object' && !Array.isArray(_0x445540) && _0x445540 !== null;
    }
function isNumber(_0x12031b)
    /*Scope Closed:true*/
    {
        return typeof _0x12031b === 'number' && !Number.isNaN(_0x12031b);
    }
function setProp(_ref)
    /*Scope Closed:false | writes:false*/
    {
        var _0xc15001 = _ref.val;
        var _0x39787c = _ref.isValid;
        var _0x5c7a75 = _ref.errorMessage;
        var _0xfe13fc = _ref.defaultValue;
        var _ref$action = _ref.action;
        var action = _ref$action === undefined ? null : _ref$action;
        if (_0x39787c) {
            if (action) {
                return action_new();
            } else {
                return _0xc15001;
            }
        } else if (_0xc15001 === undefined) {
            return _0xfe13fc;
        }
        throw new Error(_0x5c7a75);
    }
function fixFloat(_0x1e6db9 = 0)
    /*Scope Closed:false | writes:false*/
    {
        return Number(_0x1e6db9.toFixed(9));
    }
function easeSinOut(_0x4f0d35)
    /*Scope Closed:true*/
    {
        return Math.sin(_0x4f0d35 * Math.PI / 2);
    }
function getResizeObserver(_0x3898be = {}, _0x2162ce = {})
    /*Scope Closed:false | writes:false*/
    {
        if (window.ResizeObserver) {
            var _0x29b228 = new ResizeObserver(function ()
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    _0x2162ce({ redraw: true });
                });
            _0x29b228.observe(_0x3898be);
            return {
                stop() {
                    _0x29b228.unobserve(_0x3898be);
                    _0x29b228.disconnect();
                }
            };
        }
        window.addEventListener('resize', _0x2162ce);
        return {
            stop() {
                window.removeEventListener('resize', _0x2162ce);
            }
        };
    }