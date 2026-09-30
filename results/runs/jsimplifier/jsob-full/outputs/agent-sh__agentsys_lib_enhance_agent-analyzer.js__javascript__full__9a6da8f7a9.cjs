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
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0x1cbc3e, _0x53b54a)
    /* Called:undefined | Scope Closed:true*/
    {
        return function _0x55fcc5()
            /* Called:undefined | Scope Closed:false| writes:false*/
            {
                if (!_0x53b54a) {
                    _0x1cbc3e[Object.getOwnPropertyNames(_0x1cbc3e)[0]]((_0x53b54a = { exports: {} }).exports, _0x53b54a);
                }
                return _0x53b54a.exports;
            };
    };
var require_agent_patterns = function _0x55fcc5()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x53b54a) {
            _0x1cbc3e[Object.getOwnPropertyNames(_0x1cbc3e)[0]]((_0x53b54a = { exports: {} }).exports, _0x53b54a);
        }
        return _0x53b54a.exports;
    };
var require_atomic_write = function _0x55fcc5()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x53b54a) {
            _0x1cbc3e[Object.getOwnPropertyNames(_0x1cbc3e)[0]]((_0x53b54a = { exports: {} }).exports, _0x53b54a);
        }
        return _0x53b54a.exports;
    };
var require_fixer = function _0x55fcc5()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x53b54a) {
            _0x1cbc3e[Object.getOwnPropertyNames(_0x1cbc3e)[0]]((_0x53b54a = { exports: {} }).exports, _0x53b54a);
        }
        return _0x53b54a.exports;
    };
var require_reporter = function _0x55fcc5()
    /* Called:undefined | Scope Closed:false| writes:false*/
    {
        if (!_0x53b54a) {
            _0x1cbc3e[Object.getOwnPropertyNames(_0x1cbc3e)[0]]((_0x53b54a = { exports: {} }).exports, _0x53b54a);
        }
        return _0x53b54a.exports;
    };
var fs = require('fs');
var path = require('path');
var _require_agent_patter = require_agent_patterns();
var agentPatterns = _require_agent_patter.agentPatterns;
function parseMarkdownFrontmatter(_0x642250)
    /*Scope Closed:false | writes:false*/
    {
        if (!_0x642250 || typeof _0x642250 !== 'string') {
            var _0x15cdaa = {
                frontmatter: null,
                body: _0x642250
            };
            return _0x15cdaa;
        }
        var _0xf30165 = _0x642250.trim();
        if (!_0xf30165.startsWith('---')) {
            var _0x58cf98 = {
                frontmatter: null,
                body: _0x642250
            };
            return _0x58cf98;
        }
        var _0x213e83 = _0xf30165.split('\n');
        var _0x438c21 = -1;
        for (var _0x155e0f = 1; _0x155e0f < _0x213e83.length; _0x155e0f++) {
            if (_0x213e83[_0x155e0f].trim() === '---') {
                _0x438c21 = _0x155e0f;
                break;
            }
        }
        if (false) {
            var _0x3dde10 = {
                frontmatter: null,
                body: _0x642250
            };
            return _0x3dde10;
        }
        var _0x47efc7 = {};
        var _0x35796 = _0x213e83.slice(1, _0x438c21);
        var _iterator51 = _createForOfIteratorHelper(_0x35796);
        var _step51;
        try {
            for (_iterator51.s(); !(_step51 = _iterator51.n()).done;) {
                var _0x35a993 = _step51.value;
                var _0x262a50 = _0x35a993.indexOf(':');
                if (_0x262a50 > 0) {
                    var _0x3cef12 = _0x35a993.substring(0, _0x262a50).trim();
                    var _0x5512d5 = _0x35a993.substring(_0x35a993.indexOf(':') + 1).trim();
                    _0x47efc7[_0x3cef12] = _0x5512d5;
                }
            }
        } catch (err) {
            _iterator51.e(err);
        } finally {
            _iterator51.f();
        }
        var _0x297439 = _0x213e83.slice(2).join('\n');
        var _0x4669c5 = {
            frontmatter: _0x47efc7,
            body: _0x297439
        };
        return _0x4669c5;
    }
function analyzeAgent(_0x35f534, _0x47924d = {})
    /*Scope Closed:false | writes:true*/
    {
        var _0x1a3e9a = {
            agentName: path.basename(_0x35f534, '.md'),
            agentPath: _0x35f534,
            frontmatter: null,
            structureIssues: [],
            toolIssues: [],
            xmlIssues: [],
            cotIssues: [],
            exampleIssues: [],
            antiPatternIssues: [],
            crossPlatformIssues: []
        };
        if (!fs.existsSync(_0x35f534)) {
            var _0xf1dbbf = {
                issue: 'File not found',
                file: _0x35f534,
                certainty: 'HIGH',
                patternId: 'file_not_found'
            };
            [].push(_0xf1dbbf);
            return _0x1a3e9a;
        }
        var _0x3e4760;
        try {
            _0x3e4760 = fs.readFileSync(_0x35f534, 'utf8');
        } catch (_0x3dd153) {
            var _0xadd99d = {
                issue: 'Failed to read file: ' + _0x3dd153.message,
                file: _0x35f534,
                certainty: 'HIGH',
                patternId: 'read_error'
            };
            [].push(_0xadd99d);
            return _0x1a3e9a;
        }
        var _parseMarkdownFrontma = parseMarkdownFrontmatter(_0x3e4760);
        var _0x27c224 = _parseMarkdownFrontma.frontmatter;
        _0x1a3e9a.frontmatter = _0x27c224;
        var _0x38f6e9 = agentPatterns.missing_frontmatter;
        var _0x5eaa56 = _0x38f6e9.check(_0x3e4760);
        if (_0x5eaa56) {
            var _0x27d573 = Object.assign({}, _0x5eaa56);
            _0x27d573.file = _0x35f534;
            _0x27d573.certainty = _0x38f6e9.certainty;
            _0x27d573.patternId = _0x38f6e9.id;
            [].push(_0x27d573);
        }
        if (_0x27c224) {
            var _0x436e3d = agentPatterns.missing_name;
            var _0x58c9b9 = _0x436e3d.check(_0x27c224);
            if (_0x58c9b9) {
                var _0x57e746 = Object.assign({}, _0x58c9b9);
                _0x57e746.file = _0x35f534;
                _0x57e746.certainty = _0x436e3d.certainty;
                _0x57e746.patternId = _0x436e3d.id;
                [].push(_0x57e746);
            }
            var _0x3fadab = agentPatterns.missing_description;
            var _0x43c382 = _0x3fadab.check(_0x27c224);
            if (_0x43c382) {
                var _0x3338ca = Object.assign({}, _0x43c382);
                _0x3338ca.file = _0x35f534;
                _0x3338ca.certainty = _0x3fadab.certainty;
                _0x3338ca.patternId = _0x3fadab.id;
                [].push(_0x3338ca);
            }
            var _0x54ab51 = agentPatterns.unrestricted_tools;
            var _0xc59ad0 = _0x54ab51.check(_0x27c224);
            if (_0xc59ad0) {
                var _0xdc2513 = Object.assign({}, _0xc59ad0);
                _0xdc2513.file = _0x35f534;
                _0xdc2513.certainty = _0x54ab51.certainty;
                _0xdc2513.patternId = _0x54ab51.id;
                [].push(_0xdc2513);
            }
            var _0x3ca3e2 = agentPatterns.unrestricted_bash;
            var _0x586f6c = _0x3ca3e2.check(_0x27c224);
            if (_0x586f6c) {
                var _0x4bf0c7 = Object.assign({}, _0x586f6c);
                _0x4bf0c7.file = _0x35f534;
                _0x4bf0c7.filePath = _0x35f534;
                _0x4bf0c7.certainty = _0x3ca3e2.certainty;
                _0x4bf0c7.patternId = _0x3ca3e2.id;
                [].push(_0x4bf0c7);
            }
        }
        var _0x193455 = agentPatterns.missing_role;
        var _0x7e972a = _0x193455.check(_0x3e4760);
        if (_0x7e972a) {
            var _0x4c34f8 = Object.assign({}, _0x7e972a);
            _0x4c34f8.file = _0x35f534;
            _0x4c34f8.filePath = _0x35f534;
            _0x4c34f8.certainty = _0x193455.certainty;
            _0x4c34f8.patternId = _0x193455.id;
            [].push(_0x4c34f8);
        }
        var _0x39c8ef = agentPatterns.missing_output_format;
        var _0x500362 = _0x39c8ef.check(_0x3e4760);
        if (_0x500362) {
            var _0x28baf2 = Object.assign({}, _0x500362);
            _0x28baf2.file = _0x35f534;
            _0x28baf2.certainty = _0x39c8ef.certainty;
            _0x28baf2.patternId = _0x39c8ef.id;
            [].push(_0x28baf2);
        }
        var _0x5a543f = agentPatterns.missing_constraints;
        var _0x57dd77 = _0x5a543f.check(_0x3e4760);
        if (_0x57dd77) {
            var _0x527a19 = Object.assign({}, _0x57dd77);
            _0x527a19.file = _0x35f534;
            _0x527a19.certainty = _0x5a543f.certainty;
            _0x527a19.patternId = _0x5a543f.id;
            [].push(_0x527a19);
        }
        var _0x2c7d51 = agentPatterns.missing_xml_structure;
        var _0x442d5d = _0x2c7d51.check(_0x3e4760);
        if (_0x442d5d && (_0x47924d.verbose || _0x2c7d51.certainty !== 'LOW')) {
            var _0x3abbef = Object.assign({}, _0x442d5d);
            _0x3abbef.file = _0x35f534;
            _0x3abbef.certainty = _0x2c7d51.certainty;
            _0x3abbef.patternId = _0x2c7d51.id;
            [].push(_0x3abbef);
        }
        var _0x2a1849 = agentPatterns.unnecessary_cot;
        var _0xb1652c = _0x2a1849.check(_0x3e4760);
        if (_0xb1652c && (_0x47924d.verbose || _0x2a1849.certainty !== 'LOW')) {
            var _0xbe4336 = Object.assign({}, _0xb1652c);
            _0xbe4336.file = _0x35f534;
            _0xbe4336.certainty = _0x2a1849.certainty;
            _0xbe4336.patternId = _0x2a1849.id;
            [].push(_0xbe4336);
        }
        var _0x5cc31b = agentPatterns.missing_cot;
        var _0x22a0cd = _0x5cc31b.check(_0x3e4760);
        if (_0x22a0cd && (_0x47924d.verbose || _0x5cc31b.certainty !== 'LOW')) {
            var _0x2d07d8 = Object.assign({}, _0x22a0cd);
            _0x2d07d8.file = _0x35f534;
            _0x2d07d8.certainty = _0x5cc31b.certainty;
            _0x2d07d8.patternId = _0x5cc31b.id;
            [].push(_0x2d07d8);
        }
        var _0x3aa001 = agentPatterns.example_count_suboptimal;
        var _0x19a142 = _0x3aa001.check(_0x3e4760);
        if (_0x19a142 && _0x47924d.verbose) {
            var _0x18809a = Object.assign({}, _0x19a142);
            _0x18809a.file = _0x35f534;
            _0x18809a.certainty = _0x3aa001.certainty;
            _0x18809a.patternId = _0x3aa001.id;
            [].push(_0x18809a);
        }
        var _0x3089e4 = agentPatterns.vague_instructions;
        var _0x388717 = _0x3089e4.check(_0x3e4760);
        if (_0x388717 && (_0x47924d.verbose || _0x3089e4.certainty !== 'LOW')) {
            var _0x1d2cc9 = Object.assign({}, _0x388717);
            _0x1d2cc9.file = _0x35f534;
            _0x1d2cc9.certainty = _0x3089e4.certainty;
            _0x1d2cc9.patternId = _0x3089e4.id;
            [].push(_0x1d2cc9);
        }
        var _0x168208 = agentPatterns.prompt_bloat;
        var _0x3b777c = _0x168208.check(_0x3e4760);
        if (_0x3b777c && _0x47924d.verbose) {
            var _0x1604b4 = Object.assign({}, _0x3b777c);
            _0x1604b4.file = _0x35f534;
            _0x1604b4.certainty = _0x168208.certainty;
            _0x1604b4.patternId = _0x168208.id;
            [].push(_0x1604b4);
        }
        var _0xd521b3 = [
            'hardcoded_claude_dir',
            'claude_md_reference',
            'no_xml_for_data'
        ];
        for (var _i11 = 0, _xd521b = _0xd521b3; _i11 < _xd521b.length; _i11++) {
            var _0x4ffd2f = _xd521b[_i11];
            var _0x15b077 = agentPatterns[_0x4ffd2f];
            if (!agentPatterns[_0x4ffd2f]) {
                continue;
            }
            var _0xa2e62d = _0x15b077.check(_0x3e4760);
            if (_0xa2e62d && (_0x47924d.verbose || _0x15b077.certainty !== 'LOW')) {
                var _0x43ccd1 = Object.assign({}, _0xa2e62d);
                _0x43ccd1.file = _0x35f534;
                _0x43ccd1.certainty = _0x15b077.certainty;
                _0x43ccd1.patternId = _0x15b077.id;
                [].push(_0x43ccd1);
            }
        }
        return _0x1a3e9a;
    }
function analyzeAllAgents(_0x391266, _0x48bed6 = {})
    /*Scope Closed:false | writes:false*/
    {
        var _0x1fc33c = [];
        if (!fs.existsSync(_0x391266)) {
            return _0x1fc33c;
        }
        var _0x289a46 = fs.readdirSync(_0x391266).filter(function (_0x29dd4a)
            /* Called:undefined | Scope Closed:true*/
            {
                return _0x29dd4a.endsWith('.md') && _0x29dd4a !== 'README.md';
            });
        var _iterator52 = _createForOfIteratorHelper(_0x289a46);
        var _step52;
        try {
            for (_iterator52.s(); !(_step52 = _iterator52.n()).done;) {
                var _0x4936b8 = _step52.value;
                var _0x4d9185 = path.join(_0x391266, _0x4936b8);
                var _0xadf56e = analyzeAgent(_0x4d9185, _0x48bed6);
                _0x1fc33c.push(_0xadf56e);
            }
        } catch (err) {
            _iterator52.e(err);
        } finally {
            _iterator52.f();
        }
        return _0x1fc33c;
    }
function analyze(_0xb293a2 = {})
    /*Scope Closed:false | writes:false*/
    {
        var _0x531305 = _0xb293a2.agent;
        var _xb293a2$agentsDir = _0xb293a2.agentsDir;
        var agentsDir = _xb293a2$agentsDir === undefined ? 'plugins/enhance/agents' : _xb293a2$agentsDir;
        var _xb293a2$verbose = _0xb293a2.verbose;
        var verbose = _xb293a2$verbose === undefined ? false : _xb293a2$verbose;
        if (_0x531305) {
            var _0x3cd83e = _0x531305.endsWith('.md') ? path.join(agentsDir, _0x531305) : path.join(agentsDir, _0xb293a2.agent + '.md');
            var _0x334e99 = { verbose: verbose };
            return analyzeAgent(_0x3cd83e, _0x334e99);
        } else {
            var _0x10eb79 = { verbose: verbose };
            return analyzeAllAgents(agentsDir, _0x10eb79);
        }
    }
function applyFixes(_0x89a7c3, _0x25bd3f = {})
    /*Scope Closed:false | writes:false*/
    {
        var _0x562407 = require_fixer();
        var _0x1ff107 = [];
        if (Array.isArray(_0x89a7c3)) {
            var _iterator53 = _createForOfIteratorHelper(_0x89a7c3);
            var _step53;
            try {
                for (_iterator53.s(); !(_step53 = _iterator53.n()).done;) {
                    var _0x17375d = _step53.value;
                    _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
                    _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
                    _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
                    _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
                    _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
                    _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
                    _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
                }
            } catch (err) {
                _iterator53.e(err);
            } finally {
                _iterator53.f();
            }
        } else {
            _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
            _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
            _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
            _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
            _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
            _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
            _0x1ff107.push.apply(_0x1ff107, _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread());
        }
        return _0x562407.applyFixes(_0x1ff107, _0x25bd3f);
    }
function generateReport(_0x174c3f, _0x5105b2 = {})
    /*Scope Closed:false | writes:false*/
    {
        var _0x59ee24 = require_reporter();
        if (Array.isArray(_0x174c3f)) {
            return _0x59ee24.generateAgentSummaryReport(_0x174c3f, _0x5105b2);
        } else {
            return _0x59ee24.generateAgentReport(_0x174c3f, _0x5105b2);
        }
    }
var _0x40019e = {
    parseMarkdownFrontmatter: parseMarkdownFrontmatter,
    analyzeAgent: analyzeAgent,
    analyzeAllAgents: analyzeAllAgents,
    analyze: analyze,
    applyFixes: applyFixes,
    generateReport: generateReport
};
module.exports = _0x40019e;