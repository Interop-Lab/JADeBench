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
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function __export(_0x151810, _0x4198a7)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        for (var _0x3a3eb2 in _0x4198a7) {
            Object.defineProperty(_0x151810, _0x3a3eb2, {
                get: _0x4198a7[_0x3a3eb2],
                enumerable: true
            });
        }
    };
var __copyProps = function __copyProps(_0x15c6ba, _0x29f44d, _0x190272, _0x588510)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x29f44d && _typeof(_0x29f44d) === 'object' || typeof _0x29f44d === 'function') {
            var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(_0x29f44d));
            var _step;
            try {
                var _loop = function _loop()
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x2e83cf = _step.value;
                        if (!__hasOwnProp.call(_0x15c6ba, _0x2e83cf) && _0x2e83cf !== _0x190272) {
                            Object.defineProperty(_0x15c6ba, _0x2e83cf, {
                                get()
                                    /* Called:undefined | Scope Closed:false| writes:false*/
                                    {
                                        return _0x29f44d[_0x2e83cf];
                                    },
                                enumerable: !(_0x588510 = Object.getOwnPropertyDescriptor(_0x29f44d, _0x2e83cf)) || _0x588510.enumerable
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
        return _0x15c6ba;
    };
var _0x3c95b0 = { value: true };
var __toCommonJS = function __toCommonJS(_0x3f9cff)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return __copyProps(__defProp_new({}, '__esModule', _0x3c95b0), _0x3f9cff);
    };
var yaml_exports = {};
var _0x4e72b4 = {
    default()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return yaml_default;
        },
    yaml()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _yaml;
        }
};
__export(yaml_exports, _0x4e72b4);
module.exports = __copyProps(__defProp_new({}, '__esModule', _0x3c95b0), _0x3f9cff);
var globals = Object.assign(Object.create(null), {
    headingDivider(_0x2d9abd)
        /* Called:undefined | Scope Closed:true*/
        {
            var _0x4f6887 = [
                1,
                2,
                3,
                4,
                5,
                6
            ];
            var _0x198b49 = function _0x198b49(_0x162fa3)
                /* Called:undefined | Scope Closed:true*/
                {
                    if (Array.isArray(_0x162fa3) || Number.isNaN(_0x162fa3)) {
                        return _0x162fa3;
                    } else {
                        return Number.parseInt(_0x162fa3, 10);
                    }
                };
            var _0x373c20 = _0x198b49(_0x2d9abd);
            if (Array.isArray(_0x373c20)) {
                var _0xd688a9 = _0x373c20.map(_0x198b49);
                return {
                    headingDivider: [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6
                    ].filter(function (_0x5b8add)
                        /* Called:undefined | Scope Closed:false| writes:false*/
                        {
                            return _0xd688a9.includes(_0x5b8add);
                        })
                };
            }
            if (_0x2d9abd === 'false') {
                return { headingDivider: false };
            }
            if (_0x4f6887.includes(_0x373c20)) {
                return { headingDivider: _0x373c20 };
            }
            return {};
        },
    style(_0x29876d)
        /* Called:undefined | Scope Closed:true*/
        {
            return { style: _0x29876d };
        },
    theme(_0x1a20b6, _0x4f5364)
        /* Called:undefined | Scope Closed:true*/
        {
            if (_0x4f5364.themeSet.has(_0x1a20b6)) {
                return { theme: _0x1a20b6 };
            } else {
                return {};
            }
        },
    lang(_0x2bc45f)
        /* Called:undefined | Scope Closed:true*/
        {
            return { lang: _0x2bc45f };
        }
});
var locals = Object.assign(Object.create(null), {
    backgroundColor(_0x123b2a)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundColor: _0x123b2a };
        },
    backgroundImage(_0x356e0b)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundImage: _0x356e0b };
        },
    backgroundPosition(_0x423a2c)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundPosition: _0x423a2c };
        },
    backgroundRepeat(_0x41022b)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundRepeat: _0x41022b };
        },
    backgroundSize(_0xccf0b0)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundSize: _0xccf0b0 };
        },
    class(_0x3207b1)
        /* Called:undefined | Scope Closed:true*/
        {
            return { class: Array.isArray(_0x3207b1) ? _0x3207b1.join(' ') : _0x3207b1 };
        },
    color(_0x3f2b93)
        /* Called:undefined | Scope Closed:true*/
        {
            return { color: _0x3f2b93 };
        },
    footer(_0x9fcb5a)
        /* Called:undefined | Scope Closed:true*/
        {
            if (typeof _0x9fcb5a === 'string') {
                return { footer: _0x9fcb5a };
            } else {
                return {};
            }
        },
    header(_0x170adc)
        /* Called:undefined | Scope Closed:true*/
        {
            if (typeof _0x170adc === 'string') {
                return { header: _0x170adc };
            } else {
                return {};
            }
        },
    paginate(_0x1e3e01)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            var _0x386ff1 = (_0x1e3e01 || '').toLowerCase();
            if ([
                    'hold',
                    'skip'
                ].includes(_0x386ff1)) {
                return { paginate: _0x386ff1 };
            }
            return { paginate: _0x386ff1 === 'true' };
        }
});
var directives_default = [
    Object.keys(globals),
    Object.keys(locals)
];
var import_js_yaml = require('js-yaml');
var createPatterns = function createPatterns(_0x121345)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        var _0x12f462 = new Set();
        var _iterator2 = _createForOfIteratorHelper(_0x121345);
        var _step2;
        try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var _0xa0392c = _step2.value;
                var _0x301dbe = '_?' + _0xa0392c.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&');
                _0x12f462.add(_0x301dbe);
                _0x12f462.add('"' + ('_?' + _0xa0392c.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')) + '"');
                _0x12f462.add('\'' + ('_?' + _0xa0392c.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')) + '\'');
            }
        } catch (err) {
            _iterator2.e(err);
        } finally {
            _iterator2.f();
        }
        return [].concat(_0x12f462.values());
    };
var yamlSpecialChars = '["\'{|>~&*';
function parse(_0x25079f)
    /*Scope Closed:false | writes:false*/
    {
        try {
            var _0x5d37d9 = import_js_yaml.load(_0x25079f, { schema: import_js_yaml.FAILSAFE_SCHEMA });
            if (_0x5d37d9 === null || _typeof(_0x5d37d9) !== 'object') {
                return false;
            }
            return _0x5d37d9;
        } catch (e) {
            return false;
        }
    }
function convertLoose(_0x51535a, _0x313960)
    /*Scope Closed:false | writes:false*/
    {
        var _0x212b31 = '(?:' + createPatterns(_0x313960).join('|') + ')';
        var _0x6eaa2 = new RegExp('^(' + ('(?:' + createPatterns(_0x313960).join('|') + ')') + '\\s*:)(.+)$');
        var _0x2050ab = '';
        var _iterator3 = _createForOfIteratorHelper(_0x51535a.split(/\r?\n/));
        var _step3;
        try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var _0x263f96 = _step3.value;
                _0x2050ab += _0x263f96.replace(_0x6eaa2, function (_0x5b1299, _0x4618c7, _0x4becd4)
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x47bc8a = _0x4becd4.trim();
                        if (_0x47bc8a.length === 0 || yamlSpecialChars.includes(_0x47bc8a[0])) {
                            return _0x5b1299;
                        }
                        var _0x590ba6 = _0x4becd4.length - _0x4becd4.trimLeft().length;
                        var _0x42c57d = _0x4becd4.substring(0, _0x590ba6);
                        return '' + _0x4618c7 + _0x42c57d + '"' + _0x47bc8a.split('"').join('\\"') + '"';
                    }) + '\n';
            }
        } catch (err) {
            _iterator3.e(err);
        } finally {
            _iterator3.f();
        }
        return _0x2050ab.trim();
    }
var _yaml = function _yaml(_0x5237be, _0x15b4fb = false)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return parse(_0x15b4fb ? convertLoose(_0x5237be, [].concat(directives_default, Array.isArray(_0x15b4fb) ? _0x15b4fb : [])) : _0x5237be);
    };
var yaml_default = _yaml;
var _0x26308b = { yaml: _yaml };