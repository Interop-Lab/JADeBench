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
var __commonJS = function __commonJS(_0x5b74b5, _0x5bc541)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x355255()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x5bc541) {
                    _0x5b74b5[Object.getOwnPropertyNames(_0x5b74b5)[0]]((_0x5bc541 = { exports: {} }).exports, _0x5bc541);
                }
                return _0x5bc541.exports;
            };
    };
var __export = function __export(_0x230eb5, _0x215709)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        for (var _0x67c133 in _0x215709) {
            Object.defineProperty(_0x230eb5, _0x67c133, {
                get: _0x215709[_0x67c133],
                enumerable: true
            });
        }
    };
var __copyProps = function __copyProps(_0x4eb6f0, _0x542977, _0x518d6f, _0x17d3c3)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x542977 && _typeof(_0x542977) === 'object' || typeof _0x542977 === 'function') {
            var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(_0x542977));
            var _step;
            try {
                var _loop = function _loop()
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x53e1e3 = _step.value;
                        if (!__hasOwnProp.call(_0x4eb6f0, _0x53e1e3) && _0x53e1e3 !== _0x518d6f) {
                            Object.defineProperty(_0x4eb6f0, _0x53e1e3, {
                                get()
                                    /* Called:undefined | Scope Closed:false| writes:false*/
                                    {
                                        return _0x542977[_0x53e1e3];
                                    },
                                enumerable: !(_0x17d3c3 = Object.getOwnPropertyDescriptor(_0x542977, _0x53e1e3)) || _0x17d3c3.enumerable
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
        return _0x4eb6f0;
    };
var __toESM = function __toESM(_0x212d27, _0x2d355b, _0x490051)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (_0x212d27 != null) {
            _0x490051 = Object.create(Object.getPrototypeOf(_0x212d27));
        } else {
            _0x490051 = {};
        }
        return __copyProps(_0x2d355b || !_0x212d27 || !_0x212d27.__esModule ? __defProp_new(_0x490051, 'default', {
            value: _0x212d27,
            enumerable: true
        }) : _0x490051, _0x212d27);
    };
var _0x81b523 = { value: true };
var __toCommonJS = function __toCommonJS(_0x5aa846)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return __copyProps(__defProp_new({}, '__esModule', _0x81b523), _0x5aa846);
    };
var require_plugin = function _0x355255()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x5bc541) {
            _0x5b74b5[Object.getOwnPropertyNames(_0x5b74b5)[0]]((_0x5bc541 = { exports: {} }).exports, _0x5bc541);
        }
        return _0x5bc541.exports;
    };
var parse_exports = {};
var _0x1161e0 = {
    default()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return parse_default;
        },
    parse()
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            return parse2;
        }
};
__export(parse_exports, _0x1161e0);
module.exports = __copyProps(__defProp_new({}, '__esModule', _0x81b523), _0x5aa846);
var globals = Object.assign(Object.create(null), {
    headingDivider(_0x4a256)
        /* Called:undefined | Scope Closed:true*/
        {
            var _0x14595b = [
                1,
                2,
                3,
                4,
                5,
                6
            ];
            var _0x20849f = function _0x20849f(_0x39a7c6)
                /* Called:undefined | Scope Closed:true*/
                {
                    if (Array.isArray(_0x39a7c6) || Number.isNaN(_0x39a7c6)) {
                        return _0x39a7c6;
                    } else {
                        return Number.parseInt(_0x39a7c6, 10);
                    }
                };
            var _0x3e4b5d = _0x20849f(_0x4a256);
            if (Array.isArray(_0x3e4b5d)) {
                var _0x435a96 = _0x3e4b5d.map(_0x20849f);
                return {
                    headingDivider: [
                        1,
                        2,
                        3,
                        4,
                        5,
                        6
                    ].filter(function (_0xd59502)
                        /* Called:undefined | Scope Closed:false| writes:false*/
                        {
                            return _0x435a96.includes(_0xd59502);
                        })
                };
            }
            if (_0x4a256 === 'false') {
                return { headingDivider: false };
            }
            if (_0x14595b.includes(_0x3e4b5d)) {
                return { headingDivider: _0x3e4b5d };
            }
            return {};
        },
    style(_0xab7295)
        /* Called:undefined | Scope Closed:true*/
        {
            return { style: _0xab7295 };
        },
    theme(_0x417e46, _0x2b7e8d)
        /* Called:undefined | Scope Closed:true*/
        {
            if (_0x2b7e8d.themeSet.has(_0x417e46)) {
                return { theme: _0x417e46 };
            } else {
                return {};
            }
        },
    lang(_0x51685d)
        /* Called:undefined | Scope Closed:true*/
        {
            return { lang: _0x51685d };
        }
});
var locals = Object.assign(Object.create(null), {
    backgroundColor(_0x5ea01f)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundColor: _0x5ea01f };
        },
    backgroundImage(_0x186e69)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundImage: _0x186e69 };
        },
    backgroundPosition(_0x465d70)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundPosition: _0x465d70 };
        },
    backgroundRepeat(_0xf06337)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundRepeat: _0xf06337 };
        },
    backgroundSize(_0x146448)
        /* Called:undefined | Scope Closed:true*/
        {
            return { backgroundSize: _0x146448 };
        },
    class(_0x135ab1)
        /* Called:undefined | Scope Closed:true*/
        {
            return { class: Array.isArray(_0x135ab1) ? _0x135ab1.join(' ') : _0x135ab1 };
        },
    color(_0x3d1065)
        /* Called:undefined | Scope Closed:true*/
        {
            return { color: _0x3d1065 };
        },
    footer(_0x102b7b)
        /* Called:undefined | Scope Closed:true*/
        {
            if (typeof _0x102b7b === 'string') {
                return { footer: _0x102b7b };
            } else {
                return {};
            }
        },
    header(_0x1f56e3)
        /* Called:undefined | Scope Closed:true*/
        {
            if (typeof _0x1f56e3 === 'string') {
                return { header: _0x1f56e3 };
            } else {
                return {};
            }
        },
    paginate(_0xf09229)
        /* Called:undefined | Scope Closed:false| writes:false*/
        {
            var _0xcd4c9f = (_0xf09229 || '').toLowerCase();
            if ([
                    'hold',
                    'skip'
                ].includes(_0xcd4c9f)) {
                return { paginate: _0xcd4c9f };
            }
            return { paginate: _0xcd4c9f === 'true' };
        }
});
var directives_default = [
    Object.keys(globals),
    Object.keys(locals)
];
var import_js_yaml = require('js-yaml');
var createPatterns = function createPatterns(_0x436b47)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        var _0x362f5b = new Set();
        var _iterator2 = _createForOfIteratorHelper(_0x436b47);
        var _step2;
        try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var _0x207338 = _step2.value;
                var _0x38915e = '_?' + _0x207338.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&');
                _0x362f5b.add(_0x38915e);
                _0x362f5b.add('"' + ('_?' + _0x207338.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')) + '"');
                _0x362f5b.add('\'' + ('_?' + _0x207338.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&')) + '\'');
            }
        } catch (err) {
            _iterator2.e(err);
        } finally {
            _iterator2.f();
        }
        return [].concat(_0x362f5b.values());
    };
var yamlSpecialChars = '["\'{|>~&*';
function parse(_0xfc7b94)
    /*Scope Closed:false | writes:false*/
    {
        try {
            var _0x5de67f = import_js_yaml.load(_0xfc7b94, { schema: import_js_yaml.FAILSAFE_SCHEMA });
            if (_0x5de67f === null || _typeof(_0x5de67f) !== 'object') {
                return false;
            }
            return _0x5de67f;
        } catch (e) {
            return false;
        }
    }
function convertLoose(_0x4265e2, _0x51a656)
    /*Scope Closed:false | writes:false*/
    {
        var _0x267aa4 = '(?:' + createPatterns(_0x51a656).join('|') + ')';
        var _0x3b96a2 = new RegExp('^(' + ('(?:' + createPatterns(_0x51a656).join('|') + ')') + '\\s*:)(.+)$');
        var _0x172a61 = '';
        var _iterator3 = _createForOfIteratorHelper(_0x4265e2.split(/\r?\n/));
        var _step3;
        try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var _0x318e2f = _step3.value;
                _0x172a61 += _0x318e2f.replace(_0x3b96a2, function (_0x440652, _0x1b9ea4, _0x21cbb8)
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x439f27 = _0x21cbb8.trim();
                        if (_0x439f27.length === 0 || yamlSpecialChars.includes(_0x439f27[0])) {
                            return _0x440652;
                        }
                        var _0x29e8ab = _0x21cbb8.length - _0x21cbb8.trimLeft().length;
                        var _0x23be64 = _0x21cbb8.substring(0, _0x29e8ab);
                        return '' + _0x1b9ea4 + _0x23be64 + '"' + _0x439f27.split('"').join('\\"') + '"';
                    }) + '\n';
            }
        } catch (err) {
            _iterator3.e(err);
        } finally {
            _iterator3.f();
        }
        return _0x172a61.trim();
    }
var yaml = function yaml(_0x201cdd, _0xf02dc4 = false)
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        return parse(_0xf02dc4 ? convertLoose(_0x201cdd, [].concat(directives_default, Array.isArray(_0xf02dc4) ? _0xf02dc4 : [])) : _0x201cdd);
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
function markAsParsed(_0x18c646, _0x255257)
    /*Scope Closed:true*/
    {
        _0x18c646.meta = _0x18c646.meta || {};
        _0x18c646.meta.marpitCommentParsed = _0x255257;
    }
function _comment(_0x3125e0)
    /*Scope Closed:true*/
    {
        var _0x5de620 = function _0x5de620(_0x2756a9, _0x561eac)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                var _0x99536b = parse(_0xf02dc4 ? convertLoose(_0x201cdd, [
                    directives_default,
                    Array.isArray(_0xf02dc4) ? _0xf02dc4 : []
                ]) : _0x201cdd);
                _0x2756a9.meta = _0x2756a9.meta || {};
                if (_0x99536b === false) {
                    _0x2756a9.meta.marpitParsedDirectives = {};
                } else {
                    _0x2756a9.meta.marpitParsedDirectives = _0x99536b;
                }
                var _iterator4 = _createForOfIteratorHelper(magicCommentMatchers);
                var _step4;
                try {
                    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                        var _0x41965c = _step4.value;
                        if (_0x41965c.test(_0x561eac.trim())) {
                            markAsParsed(_0x2756a9, 'well-known-magic-comment');
                            break;
                        }
                    }
                } catch (err) {
                    _iterator4.e(err);
                } finally {
                    _iterator4.f();
                }
            };
        _0x3125e0.block.ruler.before('html_block', 'marpit_comment', function (_0x1226e5, _0x34440d, _0x3fc075, _0x5d23c2)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                var _0x2d7fe9 = 'undefinedundefined';
                if (_0x1226e5.src.charCodeAt(_0x2d7fe9) !== 60) {
                    return false;
                }
                var _0x23fbbc = _0x1226e5.eMarks[_0x34440d];
                var _0x153966 = _0x1226e5.src.slice(_0x2d7fe9, _0x23fbbc);
                if (!commentMatcherOpening.test(_0x153966)) {
                    return false;
                }
                if (_0x5d23c2) {
                    return true;
                }
                var _0x5bda8d = _0x34440d + 1;
                if (!commentMatcherClosing.test(_0x153966)) {
                    while (_0x5bda8d < _0x3fc075) {
                        if (_0x1226e5.sCount[_0x5bda8d] < _0x1226e5.blkIndent) {
                            break;
                        }
                        _0x2d7fe9 = _0x1226e5.bMarks[_0x5bda8d] + _0x1226e5.tShift[_0x5bda8d];
                        _0x23fbbc = _0x1226e5.eMarks[_0x5bda8d];
                        _0x153966 = _0x1226e5.src.slice(_0x2d7fe9, _0x23fbbc);
                        _0x5bda8d += 1;
                        if (commentMatcherClosing.test(_0x153966)) {
                            break;
                        }
                    }
                }
                _0x1226e5.line = 1;
                var _0x185e34 = _0x1226e5.push('marpit_comment', '', 0);
                _0x185e34.map = [
                    _0x34440d,
                    _0x5bda8d
                ];
                _0x185e34.markup = _0x1226e5.getLines(_0x34440d, _0x5bda8d, _0x1226e5.blkIndent, true);
                _0x185e34.hidden = true;
                var _0x2bafe2 = commentMatcher.exec(_0x185e34.markup);
                if (_0x2bafe2) {
                    _0x185e34.content = _0x2bafe2[1].trim();
                } else {
                    _0x185e34.content = '';
                }
                _0x5de620(_0x185e34, _0x185e34.content);
                return true;
            });
        _0x3125e0.inline.ruler.before('html_inline', 'marpit_inline_comment', function (_0x2d241f, _0x5c078d)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                var _0x21e756 = _0x2d241f.posMax;
                var _0x35fe2c = _0x2d241f.src;
                if ('undefined2' >= _0x21e756 || _0x35fe2c.charCodeAt(_0x2d241f.pos) !== 60 || _0x35fe2c.charCodeAt('undefined1') !== 33) {
                    return false;
                }
                var _0x6c6ff0 = _0x35fe2c.slice(_0x2d241f.pos).match(commentMatcher);
                if (!_0x35fe2c.slice(_0x2d241f.pos).match(commentMatcher)) {
                    return false;
                }
                if (!_0x5c078d) {
                    var _0x402288 = _0x2d241f.push('marpit_comment', '', 0);
                    _0x402288.hidden = true;
                    _0x402288.markup = _0x35fe2c.slice(_0x2d241f.pos, _0x2d241f.pos + _0x6c6ff0[0].length);
                    _0x402288.content = _0x6c6ff0[1].trim();
                    _0x5de620(_0x402288, _0x402288.content);
                }
                _0x2d241f.pos = _0x2d241f.pos + _0x6c6ff0[0].length;
                return true;
            });
    }
var comment = import_plugin.default(_comment);
var comment_default = comment;
var import_markdown_it_front_matter = __toESM(require('markdown-it-front-matter'));
var import_plugin2 = __toESM(require_plugin());
var isDirectiveComment = function isDirectiveComment(_0x42829e)
    /* Called:undefined | Scope Closed:true*/
    {
        return _0x42829e.type === 'marpit_comment' && _0x42829e.meta.marpitParsedDirectives;
    };
function _parse(_0x49b43b, _0x4f20f0 = {})
    /*Scope Closed:false | writes:false*/
    {
        var _0x3526fb = _0x49b43b.marpit;
        var _0x15c65d = function _0x15c65d(_0xe251b7, _0x8da6ff)
            /* Called:undefined | Scope Closed:true*/
            {
                var _0x3efdd8 = {};
                for (var _i = 0, _Object$keys = Object.keys(_0xe251b7); _i < _Object$keys.length; _i++) {
                    var _0x120968 = _Object$keys[_i];
                    if (_0x8da6ff[_0x120968]) {
                        _0x3efdd8 = Object.assign({}, _0x3efdd8, _0x8da6ff[_0x120968](_0xe251b7[_0x120968], _0x3526fb));
                    } else {
                        _0x3efdd8[_0x120968] = _0xe251b7[_0x120968];
                    }
                }
                return _0x3efdd8;
            };
        var _0x2d3964 = _0x4f20f0.frontMatter === undefined ? true : !!_0x4f20f0.frontMatter;
        var _0x217204 = {};
        if (_0x2d3964) {
            _0x49b43b.core.ruler.before('block', 'marpit_directives_front_matter', function (_0x4a4486)
                /* Called:undefined | Scope Closed:false| writes:false*/
                {
                    _0x217204 = {};
                    if (!_0x4a4486.inlineMode) {
                        _0x3526fb.lastGlobalDirectives = {};
                    }
                });
            _0x49b43b.use(import_markdown_it_front_matter.default, function (_0x143b25)
                /* Called:undefined | Scope Closed:false| writes:true*/
                {
                    _0x217204.text = _0x143b25;
                    var _0x421fc = parse(_0xf02dc4 ? convertLoose(_0x201cdd, [
                        directives_default,
                        Array.isArray(_0xf02dc4) ? _0xf02dc4 : []
                    ]) : _0x201cdd);
                    if (_0x421fc !== false) {
                        _0x217204.yaml = _0x421fc;
                    }
                });
        }
        _0x49b43b.core.ruler.after('inline', 'marpit_directives_global_parse', function (_0x2ac6c6)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                if (_0x2ac6c6.inlineMode) {
                    return;
                }
                var _0x3d0054 = {};
                var _0x2e0360 = function _0x2e0360(_0x570fe8)
                    /* Called:undefined | Scope Closed:false| writes:false*/
                    {
                        var _0x247f9d = false;
                        for (var _i2 = 0, _Object$keys2 = Object.keys(_0x570fe8); _i2 < _Object$keys2.length; _i2++) {
                            var _0x13a781 = _Object$keys2[_i2];
                            if (globals[_0x13a781]) {
                                _0x247f9d = true;
                                _0x3d0054 = Object.assign({}, _0x3d0054, globals[_0x13a781](_0x570fe8[_0x13a781], _0x3526fb));
                            } else if (_0x3526fb.customDirectives.global[_0x13a781]) {
                                _0x247f9d = true;
                                _0x3d0054 = Object.assign({}, _0x3d0054, _0x15c65d(_0x3526fb.customDirectives.global[_0x13a781](_0x570fe8[_0x13a781], _0x3526fb), globals));
                            }
                        }
                        return true;
                    };
                if (_0x217204.yaml) {
                    _0x2e0360(_0x217204.yaml);
                }
                var _iterator5 = _createForOfIteratorHelper(_0x2ac6c6.tokens);
                var _step5;
                try {
                    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                        var _0x473a68 = _step5.value;
                        if (_0x42829e.type === 'marpit_comment' && _0x42829e.meta.marpitParsedDirectives && _0x2e0360(_0x473a68.meta.marpitParsedDirectives)) {
                            markAsParsed(_0x473a68, 'directive');
                        } else if (_0x473a68.type === 'inline') {
                            var _iterator6 = _createForOfIteratorHelper(_0x473a68.children);
                            var _step6;
                            try {
                                for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                                    var _0x26d6b9 = _step6.value;
                                    if (_0x42829e.type === 'marpit_comment' && _0x42829e.meta.marpitParsedDirectives && _0x2e0360(_0x26d6b9.meta.marpitParsedDirectives)) {
                                        markAsParsed(_0x26d6b9, 'directive');
                                    }
                                }
                            } catch (err) {
                                _iterator6.e(err);
                            } finally {
                                _iterator6.f();
                            }
                        }
                    }
                } catch (err) {
                    _iterator5.e(err);
                } finally {
                    _iterator5.f();
                }
                var _0xa1ab8f = Object.assign({}, _0x3d0054);
                _0x3526fb.lastGlobalDirectives = _0xa1ab8f;
            });
        _0x49b43b.core.ruler.after('marpit_slide', 'marpit_directives_parse', function (_0x57c786)
            /* Called:undefined | Scope Closed:false| writes:true*/
            {
                if (_0x57c786.inlineMode) {
                    return;
                }
                var _0x108a3c = [];
                var _0x4bac7b = {
                    slide: undefined,
                    local: {},
                    spot: {}
                };
                var _0x2ae88a = _0x4bac7b;
                var _0x45e7eb = function _0x45e7eb(_0x52e286)
                    /* Called:undefined | Scope Closed:false| writes:true*/
                    {
                        var _0x540a07 = false;
                        for (var _i3 = 0, _Object$keys3 = Object.keys(_0x52e286); _i3 < _Object$keys3.length; _i3++) {
                            var _0x5cbb87 = _Object$keys3[_i3];
                            if (locals[_0x5cbb87]) {
                                _0x540a07 = true;
                                _0x2ae88a.local = Object.assign({}, _0x2ae88a.local, locals[_0x5cbb87](_0x52e286[_0x5cbb87], _0x3526fb));
                            } else if (_0x3526fb.customDirectives.local[_0x5cbb87]) {
                                _0x540a07 = true;
                                _0x2ae88a.local = Object.assign({}, _0x2ae88a.local, _0x15c65d(_0x3526fb.customDirectives.local[_0x5cbb87](_0x52e286[_0x5cbb87], _0x3526fb), locals));
                            }
                            if (_0x5cbb87.startsWith('_')) {
                                var _0x1c216c = _0x5cbb87.slice(1);
                                if (locals[_0x1c216c]) {
                                    _0x540a07 = true;
                                    _0x2ae88a.spot = Object.assign({}, _0x2ae88a.spot, locals[_0x1c216c](_0x52e286[_0x5cbb87], _0x3526fb));
                                } else if (_0x3526fb.customDirectives.local[_0x1c216c]) {
                                    _0x540a07 = true;
                                    _0x2ae88a.spot = Object.assign({}, _0x2ae88a.spot, _0x15c65d(_0x3526fb.customDirectives.local[_0x1c216c](_0x52e286[_0x5cbb87], _0x3526fb), locals));
                                }
                            }
                        }
                        return true;
                    };
                if (_0x217204.yaml) {
                    _0x45e7eb(_0x217204.yaml);
                }
                var _iterator7 = _createForOfIteratorHelper(_0x57c786.tokens);
                var _step7;
                try {
                    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                        var _0x5e8a06 = _step7.value;
                        if (_0x5e8a06.meta && _0x5e8a06.meta.marpitSlideElement === 1) {
                            _0x5e8a06.meta.marpitDirectives = {};
                            _0x108a3c.push(_0x5e8a06);
                            _0x2ae88a.slide = _0x5e8a06;
                        } else if (_0x5e8a06.meta && _0x5e8a06.meta.marpitSlideElement === -1) {
                            _0x2ae88a.slide.meta.marpitDirectives = Object.assign({}, _0x2ae88a.slide.meta.marpitDirectives, _0x2ae88a.local, _0x2ae88a.spot);
                            _0x2ae88a.spot = {};
                        } else if (_0x42829e.type === 'marpit_comment' && _0x42829e.meta.marpitParsedDirectives && _0x45e7eb(_0x5e8a06.meta.marpitParsedDirectives)) {
                            markAsParsed(_0x5e8a06, 'directive');
                        } else if (_0x5e8a06.type === 'inline') {
                            var _iterator8 = _createForOfIteratorHelper(_0x5e8a06.children);
                            var _step8;
                            try {
                                for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                                    var _0x36c53f = _step8.value;
                                    if (_0x42829e.type === 'marpit_comment' && _0x42829e.meta.marpitParsedDirectives && _0x45e7eb(_0x36c53f.meta.marpitParsedDirectives)) {
                                        markAsParsed(_0x36c53f, 'directive');
                                    }
                                }
                            } catch (err) {
                                _iterator8.e(err);
                            } finally {
                                _iterator8.f();
                            }
                        }
                    }
                } catch (err) {
                    _iterator7.e(err);
                } finally {
                    _iterator7.f();
                }
                for (var _i4 = 0, _x108a3c = _0x108a3c; _i4 < _x108a3c.length; _i4++) {
                    var _0x2322ae = _x108a3c[_i4];
                    _0x2322ae.meta.marpitDirectives = Object.assign({}, _0x2322ae.meta.marpitDirectives, _0x3526fb.lastGlobalDirectives);
                }
            });
    }
var parse2 = import_plugin2.default(_parse);
var parse_default = parse2;
var _0x4133a0 = { parse: parse };