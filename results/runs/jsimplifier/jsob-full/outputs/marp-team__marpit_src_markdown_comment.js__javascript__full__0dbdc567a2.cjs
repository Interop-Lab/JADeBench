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
var __commonJS = function __commonJS(_0x56189e, _0x4123e7)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x29658e()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x4123e7) {
                    _0x56189e[Object.getOwnPropertyNames(_0x56189e)[0]]((_0x4123e7 = { exports: {} }).exports, _0x4123e7);
                }
                return _0x4123e7.exports;
            };
    };
var __export = function __export(_0x140592, _0x34b965)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        for (var _0x75781f in _0x34b965) {
            Object.defineProperty(_0x140592, _0x75781f, {
                get: _0x34b965[_0x75781f],
                enumerable: true
            });
        }
    };
var __copyProps = function __copyProps(_0x41ea9a, _0x2265b7, _0x339133, _0x2f483f)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x2265b7 && _typeof(_0x2265b7) === 'object' || typeof _0x2265b7 === 'function') {
            var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(_0x2265b7));
            var _step;
            try {
                var _loop = function _loop()
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x3c5247 = _step.value;
                        if (!__hasOwnProp.call(_0x41ea9a, _0x3c5247) && _0x3c5247 !== _0x339133) {
                            Object.defineProperty(_0x41ea9a, _0x3c5247, {
                                get()
                                    /* Called:undefined | Scope Closed:false| writes:false*/
                                    {
                                        return _0x2265b7[_0x3c5247];
                                    },
                                enumerable: !(_0x2f483f = Object.getOwnPropertyDescriptor(_0x2265b7, _0x3c5247)) || _0x2f483f.enumerable
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
        return _0x41ea9a;
    };
var __toESM = function __toESM(_0x3240c4, _0x1709dd, _0x4a477f)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x3240c4 != null) {
            _0x4a477f = Object.create(Object.getPrototypeOf(_0x3240c4));
        } else {
            _0x4a477f = {};
        }
        return __copyProps(_0x1709dd || !_0x3240c4 || !_0x3240c4.__esModule ? __defProp_new(_0x4a477f, 'default', {
            value: _0x3240c4,
            enumerable: true
        }) : _0x4a477f, _0x3240c4);
    };
var _0x243d8a = { value: true };
var __toCommonJS = function __toCommonJS(_0x4634d4)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return __copyProps(__defProp_new({}, '__esModule', _0x243d8a), _0x4634d4);
    };
var require_plugin = function _0x29658e()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x4123e7) {
            _0x56189e[Object.getOwnPropertyNames(_0x56189e)[0]]((_0x4123e7 = { exports: {} }).exports, _0x4123e7);
        }
        return _0x4123e7.exports;
    };
var comment_exports = {};
var _0x1241a7 = {
    comment()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _comment2;
        },
    default()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return comment_default;
        },
    markAsParsed()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return _markAsParsed;
        }
};
__export(comment_exports, _0x1241a7);
module.exports = __copyProps(__defProp_new({}, '__esModule', _0x243d8a), _0x4634d4);
var globals = Object.assign(Object.create(null), {
    headingDivider(_0x1590a6)
        /* Called:undefined | Scope Closed:true*/
        {
            var _0xf945b7 = [
                1,
                2,
                3,
                4,
                5,
                6
            ];
            var _0x272c5f = function _0x272c5f(_0x7770eb)
                /* Called:undefined | Scope Closed:true*/
                {
                    if (Array.isArray(_0x7770eb) || Number.isNaN(_0x7770eb)) {
                        return _0x7770eb;
                    } else {
                        return Number.parseInt(_0x7770eb, 10);
                    }
                };
            var _0x248995 = _0x272c5f(_0x1590a6);
            if (Array.isArray(_0x248995)) {
                var _0x5a35ed = _0x248995.map(_0x272c5f);
                return {
                    headingDivider: [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6
                    ].filter(function (_0xad39ca)
                        /* Called:undefined | Scope Closed:false| writes:false*/
                        {
                            return _0x5a35ed.includes(_0xad39ca);
                        })
                };
            }
            if (_0x1590a6 === 'false') {
                return { headingDivider: false };
            }
            if (_0xf945b7.includes(_0x248995)) {
                return { headingDivider: _0x248995 };
            }
            return {};
        },
    style(_0x408722)
        /* Called:undefined | Scope Closed:true*/
        {
            return { style: _0x408722 };
        },
    theme(_0x5028d2, _0x3f02a9)
        /* Called:undefined | Scope Closed:true*/
        {
            if (_0x3f02a9.themeSet.has(_0x5028d2)) {
                return { theme: _0x5028d2 };
            } else {
                return {};
            }
        },
    lang(_0x2b01d0)
        /* Called:undefined | Scope Closed:true*/
        {
            return { lang: _0x2b01d0 };
        }
});
var locals = Object.assign(Object.create(null), {
    backgroundColor(_0x572dc0)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundColor: _0x572dc0 };
        },
    backgroundImage(_0x590785)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundImage: _0x590785 };
        },
    backgroundPosition(_0x32b3be)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundPosition: _0x32b3be };
        },
    backgroundRepeat(_0x5db080)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundRepeat: _0x5db080 };
        },
    backgroundSize(_0x4496d2)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundSize: _0x4496d2 };
        },
    class(_0x3113d)
        /* Called:undefined | Scope Closed:true*/
        {
            return { class: Array.isArray(_0x3113d) ? _0x3113d.join(' ') : _0x3113d };
        },
    color(_0x375cff)
        /* Called:undefined | Scope Closed:true*/
        {
            return { color: _0x375cff };
        },
    footer(_0x461aee)
        /* Called:undefined | Scope Closed:true*/
        {
            if (typeof _0x461aee === 'string') {
                return { footer: _0x461aee };
            } else {
                return {};
            }
        },
    header(_0x3c1b7e)
        /* Called:undefined | Scope Closed:true*/
        {
            if (typeof _0x3c1b7e === 'string') {
                return { header: _0x3c1b7e };
            } else {
                return {};
            }
        },
    paginate(_0x16b6d6)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            var _0x37fec8 = (_0x16b6d6 || '').toLowerCase();
            if ([
                    'hold',
                    'skip'
                ].includes(_0x37fec8)) {
                return { paginate: _0x37fec8 };
            }
            return { paginate: _0x37fec8 === 'true' };
        }
});
var directives_default = [
    Object.keys(globals),
    Object.keys(locals)
];
var import_js_yaml = require('js-yaml');
var createPatterns = function createPatterns(_0x199f33)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        var _0x1e9a24 = new Set();
        var _iterator2 = _createForOfIteratorHelper(_0x199f33);
        var _step2;
        try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var _0x23d0fb = _step2.value;
                var _0x101e8a = '_?' + _0x23d0fb.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&');
                _0x1e9a24.add(_0x101e8a);
                _0x1e9a24.add('"' + ('_?' + _0x23d0fb.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')) + '"');
                _0x1e9a24.add('\'' + ('_?' + _0x23d0fb.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')) + '\'');
            }
        } catch (err) {
            _iterator2.e(err);
        } finally {
            _iterator2.f();
        }
        return [].concat(_0x1e9a24.values());
    };
var yamlSpecialChars = '["\'{|>~&*';
function parse(_0x56ef33)
    /*Scope Closed:false | writes:false*/
    {
        try {
            var _0x229f34 = import_js_yaml.load(_0x56ef33, { schema: import_js_yaml.FAILSAFE_SCHEMA });
            if (_0x229f34 === null || _typeof(_0x229f34) !== 'object') {
                return false;
            }
            return _0x229f34;
        } catch (e) {
            return false;
        }
    }
function convertLoose(_0x27da86, _0x3f08a1)
    /*Scope Closed:false | writes:false*/
    {
        var _0x4772e4 = '(?:' + createPatterns(_0x3f08a1).join('|') + ')';
        var _0x4bce63 = new RegExp('^(' + ('(?:' + createPatterns(_0x3f08a1).join('|') + ')') + '\\s*:)(.+)$');
        var _0x55c7f3 = '';
        var _iterator3 = _createForOfIteratorHelper(_0x27da86.split(/\r?\n/));
        var _step3;
        try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var _0x4a3dc4 = _step3.value;
                _0x55c7f3 += _0x4a3dc4.replace(_0x4bce63, function (_0x104b7c, _0x43079f, _0x270735)
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x13e75f = _0x270735.trim();
                        if (_0x13e75f.length === 0 || yamlSpecialChars.includes(_0x13e75f[0])) {
                            return _0x104b7c;
                        }
                        var _0x3c5fd2 = _0x270735.length - _0x270735.trimLeft().length;
                        var _0x9373aa = _0x270735.substring(0, _0x3c5fd2);
                        return '' + _0x43079f + _0x9373aa + '"' + _0x13e75f.split('"').join('\\"') + '"';
                    }) + '\n';
            }
        } catch (err) {
            _iterator3.e(err);
        } finally {
            _iterator3.f();
        }
        return _0x55c7f3.trim();
    }
var yaml = function yaml(_0x5d94a2, _0xdf41d = false)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return parse(_0xdf41d ? convertLoose(_0x5d94a2, [].concat(directives_default, Array.isArray(_0xdf41d) ? _0xdf41d : [])) : _0x5d94a2);
    };
var yaml_default = yaml;
var import_plugin = __toESM(require_plugin());
var commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
var commentMatcherOpening = /^<!--/;
var commentMatcherClosing = /-->/;
var magicCommentMatchers = [
    /^prettier-ignore(-(start|end))?$/,
    /^markdownlint-((disable|enable).*|capture|restore)$/,
    /^lint (disable|enable|ignore).*$/
];
function _markAsParsed(_0x9f50bf, _0x22a6cb)
    /*Scope Closed:true*/
    {
        _0x9f50bf.meta = _0x9f50bf.meta || {};
        _0x9f50bf.meta.marpitCommentParsed = _0x22a6cb;
    }
function _comment(_0x258e68)
    /*Scope Closed:true*/
    {
        var _0x86bee0 = function _0x86bee0(_0x2254d2, _0x49e50e)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                var _0x3d9882 = parse(_0xdf41d ? convertLoose(_0x5d94a2, [
                    directives_default,
                    Array.isArray(_0xdf41d) ? _0xdf41d : []
                ]) : _0x5d94a2);
                _0x2254d2.meta = _0x2254d2.meta || {};
                if (_0x3d9882 === false) {
                    _0x2254d2.meta.marpitParsedDirectives = {};
                } else {
                    _0x2254d2.meta.marpitParsedDirectives = _0x3d9882;
                }
                var _iterator4 = _createForOfIteratorHelper(magicCommentMatchers);
                var _step4;
                try {
                    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                        var _0x4a1b0d = _step4.value;
                        if (_0x4a1b0d.test(_0x49e50e.trim())) {
                            _markAsParsed(_0x2254d2, 'well-known-magic-comment');
                            break;
                        }
                    }
                } catch (err) {
                    _iterator4.e(err);
                } finally {
                    _iterator4.f();
                }
            };
        _0x258e68.block.ruler.before('html_block', 'marpit_comment', function (_0x43182b, _0x5608c4, _0x2a4955, _0x24b100)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                var _0x146c12 = 'undefinedundefined';
                if (_0x43182b.src.charCodeAt(_0x146c12) !== 60) {
                    return false;
                }
                var _0x2eba98 = _0x43182b.eMarks[_0x5608c4];
                var _0x2f71d7 = _0x43182b.src.slice(_0x146c12, _0x2eba98);
                if (!commentMatcherOpening.test(_0x2f71d7)) {
                    return false;
                }
                if (_0x24b100) {
                    return true;
                }
                var _0x3817b6 = _0x5608c4 + 1;
                if (!commentMatcherClosing.test(_0x2f71d7)) {
                    while (_0x3817b6 < _0x2a4955) {
                        if (_0x43182b.sCount[_0x3817b6] < _0x43182b.blkIndent) {
                            break;
                        }
                        _0x146c12 = _0x43182b.bMarks[_0x3817b6] + _0x43182b.tShift[_0x3817b6];
                        _0x2eba98 = _0x43182b.eMarks[_0x3817b6];
                        _0x2f71d7 = _0x43182b.src.slice(_0x146c12, _0x2eba98);
                        _0x3817b6 += 1;
                        if (commentMatcherClosing.test(_0x2f71d7)) {
                            break;
                        }
                    }
                }
                _0x43182b.line = 1;
                var _0x4cdc78 = _0x43182b.push('marpit_comment', '', 0);
                _0x4cdc78.map = [
                    _0x5608c4,
                    _0x3817b6
                ];
                _0x4cdc78.markup = _0x43182b.getLines(_0x5608c4, _0x3817b6, _0x43182b.blkIndent, true);
                _0x4cdc78.hidden = true;
                var _0x2b530a = commentMatcher.exec(_0x4cdc78.markup);
                if (_0x2b530a) {
                    _0x4cdc78.content = _0x2b530a[1].trim();
                } else {
                    _0x4cdc78.content = '';
                }
                _0x86bee0(_0x4cdc78, _0x4cdc78.content);
                return true;
            });
        _0x258e68.inline.ruler.before('html_inline', 'marpit_inline_comment', function (_0x1085e7, _0x4e3254)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                var _0x597abc = _0x1085e7.posMax;
                var _0x481e05 = _0x1085e7.src;
                if ('undefined2' >= _0x597abc || _0x481e05.charCodeAt(_0x1085e7.pos) !== 60 || _0x481e05.charCodeAt('undefined1') !== 33) {
                    return false;
                }
                var _0x5625c0 = _0x481e05.slice(_0x1085e7.pos).match(commentMatcher);
                if (!_0x481e05.slice(_0x1085e7.pos).match(commentMatcher)) {
                    return false;
                }
                if (!_0x4e3254) {
                    var _0x43dc20 = _0x1085e7.push('marpit_comment', '', 0);
                    _0x43dc20.hidden = true;
                    _0x43dc20.markup = _0x481e05.slice(_0x1085e7.pos, _0x1085e7.pos + _0x5625c0[0].length);
                    _0x43dc20.content = _0x5625c0[1].trim();
                    _0x86bee0(_0x43dc20, _0x43dc20.content);
                }
                _0x1085e7.pos = _0x1085e7.pos + _0x5625c0[0].length;
                return true;
            });
    }
var _comment2 = import_plugin.default(_comment);
var comment_default = _comment2;
var _0x8eb834 = {
    comment: _comment2,
    markAsParsed: _markAsParsed
};