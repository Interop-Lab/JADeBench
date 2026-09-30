'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = function __commonJS(_0xc50aea, _0x4b1515) {
    return function _0x154e1e() {
        if (!_0x4b1515) {
            _0xc50aea[__getOwnPropNames_new(_0xc50aea)[0]]((_0x4b1515 = { exports: {} }).exports, _0x4b1515);
        }
        return _0x4b1515.exports;
    };
};
var require_engines = __commonJS({
    '../work/jonschlinkert__gray-matter/lib/engines.js'(_0x3d5426, _0x5e4c93) {
        'use strict';
        var _0xf78b85 = require('js-yaml');
        var _0x301d9e = _0x3d5426 = _0x5e4c93.exports;
        _0x301d9e.yaml = {
            parse: _0xf78b85.safeLoad.bind(_0xf78b85),
            stringify: _0xf78b85.safeDump.bind(_0xf78b85)
        };
        _0x301d9e.json = {
            parse: JSON.parse.bind(JSON),
            stringify(_0x52148b, _0x5c4269) {
                var _0x343740 = Object.assign({
                    replacer: null,
                    space: 2
                }, _0x5c4269);
                return JSON.stringify(_0x52148b, _0x343740.replacer, _0x343740.space);
            }
        };
        _0x301d9e.javascript = {
            parse(_0x240b76, _0x4a0dd9, _0x5626e8) {
                try {
                    if (_0x5626e8 !== false) {
                        _0x240b76 = '(function() {\nreturn ' + _0x240b76.trim() + ';\n}());';
                    }
                    return eval(_0x240b76) || {};
                } catch (_0x372e18) {
                    if (_0x5626e8 !== false && /(unexpected|identifier)/i.test(_0x372e18.message)) {
                        return _0x3aea7b(_0x240b76, _0x4a0dd9, false);
                    }
                    throw new SyntaxError(_0x372e18);
                }
            },
            stringify() {
                throw new Error('stringifying JavaScript is not supported');
            }
        };
    }
});
var require_utils = __commonJS({
    '../work/jonschlinkert__gray-matter/lib/utils.js'(_0x58d83f) {
        'use strict';
        var _0x5bbd21 = require('strip-bom-string');
        var _0x5c1222 = require('kind-of');
        _0x58d83f.define = function (_0x597fe2, _0x5ccce7, _0xf6f907) {
            var _0x2ed195 = {
                enumerable: false,
                configurable: true,
                writable: true,
                value: _0xf6f907
            };
            Reflect.defineProperty(_0x597fe2, _0x5ccce7, _0x2ed195);
        };
        _0x58d83f.isBuffer = function (_0x1117d5) {
            return _0x5c1222_new(_0x1117d5) === 'buffer';
        };
        _0x58d83f.isObject = function (_0x304fef) {
            return _0x5c1222_new(_0x304fef) === 'object';
        };
        _0x58d83f.toBuffer = function (_0x10966f) {
            if (typeof _0x10966f === 'string') {
                return Buffer.from(_0x10966f);
            } else {
                return _0x10966f;
            }
        };
        _0x58d83f.toString = function (_0x1334f0) {
            if (_0x58d83f.isBuffer(_0x1334f0)) {
                return _0x5bbd21(String(_0x1334f0));
            }
            if (typeof _0x1334f0 !== 'string') {
                throw new TypeError('expected input to be a string or buffer');
            }
            return _0x5bbd21(_0x1334f0);
        };
        _0x58d83f.arrayify = function (_0x261914) {
            if (_0x261914) {
                if (Array.isArray(_0x261914)) {
                    return _0x261914;
                } else {
                    return [_0x261914];
                }
            } else {
                return [];
            }
        };
        _0x58d83f.startsWith = function (_0x38479d, _0x107677, _0x2eccda) {
            if (typeof _0x2eccda !== 'number') {
                _0x2eccda = _0x107677.length;
            }
            return _0x38479d.slice(0, _0x2eccda) === _0x107677;
        };
    }
});
var require_defaults = __commonJS({
    '../work/jonschlinkert__gray-matter/lib/defaults.js'(_0x3b0c88, _0x189e00) {
        'use strict';
        var _0x24fa71 = require_engines();
        var _0x16921c = require_utils();
        _0x189e00.exports = function (_0x40d3ab) {
            var _0x264287 = Object.assign({}, _0x40d3ab);
            _0x264287.delimiters = _0x16921c.arrayify(_0x264287.delims || _0x264287.delimiters || '---');
            if (_0x264287.delimiters.length === 1) {
                _0x264287.delimiters.push(_0x264287.delimiters[0]);
            }
            _0x264287.language = (_0x264287.language || _0x264287.lang || 'yaml').toLowerCase();
            _0x264287.engines = Object.assign({}, _0x24fa71, _0x264287.parsers, _0x264287.engines);
            return _0x264287;
        };
    }
});
var require_engine = __commonJS({
    '../work/jonschlinkert__gray-matter/lib/engine.js'(_0x3c00cf, _0x239308) {
        'use strict';
        _0x239308.exports = function (_0x5d5480, _0x42cfc1) {
            var _0x5bb0cc = _0x42cfc1.engines[_0x5d5480] || _0x42cfc1.engines[_0x3c50d7(_0x5d5480)];
            if (typeof _0x5bb0cc === 'undefined') {
                throw new Error('gray-matter engine "' + _0x5d5480 + '" is not registered');
            }
            if (typeof _0x5bb0cc === 'function') {
                _0x5bb0cc = { parse: _0x5bb0cc };
            }
            return _0x5bb0cc;
        };
        function _0x3c50d7(_0x1d1b42) {
            switch (_0x1d1b42.toLowerCase()) {
            case 'js':
            case 'javascript':
                return 'javascript';
            case 'coffee':
            case 'coffeescript':
            case 'cson':
                return 'coffee';
            case 'yaml':
            case 'yml':
                return 'yaml';
            default: {
                    return _0x1d1b42;
                }
            }
        }
    }
});
var require_stringify = __commonJS({
    '../work/jonschlinkert__gray-matter/lib/stringify.js'(_0x50c67a, _0x2c993c) {
        'use strict';
        var _0xa5b5c6 = require('kind-of');
        var _0x48b8f7 = require_engine();
        var _0x163491 = require_defaults();
        _0x2c993c.exports = function (_0x5167f3, _0x320770, _0x576ad0) {
            if (_0x320770 == null && _0x576ad0 == null) {
                switch (_0xa5b5c6(_0x5167f3)) {
                case 'object':
                    _0x320770 = _0x5167f3.data;
                    _0x576ad0 = {};
                    break;
                case 'string':
                    return _0x5167f3;
                default: {
                        throw new TypeError('expected file to be a string or object');
                    }
                }
            }
            var _0x2fa149 = _0x5167f3.content;
            var _0x2a7cd8 = _0x163491(_0x576ad0);
            if (_0x320770 == null) {
                if (!_0x2a7cd8.data) {
                    return _0x5167f3;
                }
                _0x320770 = _0x2a7cd8.data;
            }
            var _0x2b5e04 = _0x5167f3.language || _0x2a7cd8.language;
            var _0x31fd71 = _0x48b8f7(_0x2b5e04, _0x2a7cd8);
            if (typeof _0x31fd71.stringify !== 'function') {
                throw new TypeError('expected "' + _0x2b5e04 + '.stringify" to be a function');
            }
            _0x320770 = Object.assign({}, _0x5167f3.data, _0x320770);
            var _0x1faf70 = _0x2a7cd8.delimiters[0];
            var _0x12577d = _0x2a7cd8.delimiters[1];
            var _0x49c3c9 = _0x31fd71.stringify(_0x320770, _0x576ad0).trim();
            var _0xb6609 = '';
            if (_0x49c3c9 !== '{}') {
                _0xb6609 = _0x1dba9d(_0x1faf70) + _0x1dba9d(_0x49c3c9) + _0x1dba9d(_0x12577d);
            }
            if (typeof _0x5167f3.excerpt === 'string' && _0x5167f3.excerpt !== '') {
                if (_0x2fa149.indexOf(_0x5167f3.excerpt.trim()) === -1) {
                    _0xb6609 += _0x1dba9d(_0x5167f3.excerpt) + _0x1dba9d(_0x12577d);
                }
            }
            return _0xb6609 + _0x1dba9d(_0x2fa149);
        };
        function _0x1dba9d(_0x12dee4) {
            if (_0x12dee4.slice(-1) !== '\n') {
                return _0x12dee4 + '\n';
            } else {
                return _0x12dee4;
            }
        }
    }
});
var require_excerpt = __commonJS({
    '../work/jonschlinkert__gray-matter/lib/excerpt.js'(_0x2026c5, _0x10a720) {
        'use strict';
        var _0x34152a = require_defaults();
        _0x10a720.exports = function (_0x22f5b9, _0x439d90) {
            var _0x424a0d = _0x34152a(_0x439d90);
            if (_0x22f5b9.data == null) {
                _0x22f5b9.data = {};
            }
            if (typeof _0x424a0d.excerpt === 'function') {
                return _0x424a0d.excerpt(_0x22f5b9, _0x424a0d);
            }
            var _0x514088 = _0x22f5b9.data.excerpt_separator || _0x424a0d.excerpt_separator;
            if (_0x514088 == null && (_0x424a0d.excerpt === false || _0x424a0d.excerpt == null)) {
                return _0x22f5b9;
            }
            var _0x5e02b5 = typeof _0x424a0d.excerpt === 'string' ? _0x424a0d.excerpt : _0x514088 || _0x424a0d.delimiters[0];
            var _0x3ead4b = _0x22f5b9.content.indexOf(_0x5e02b5);
            if (_0x3ead4b !== -1) {
                _0x22f5b9.excerpt = _0x22f5b9.content.slice(0, _0x3ead4b);
            }
            return _0x22f5b9;
        };
    }
});
var require_to_file = __commonJS({
    '../work/jonschlinkert__gray-matter/lib/to-file.js'(_0x40a52f, _0x278a95) {
        'use strict';
        var _0x29c5eb = require('kind-of');
        var _0x2e3269 = require_stringify();
        var _0x4190a8 = require_utils();
        _0x278a95.exports = function (_0x13f1c9) {
            if (_0x29c5eb(_0x13f1c9) !== 'object') {
                _0x13f1c9 = { content: _0x13f1c9 };
            }
            if (_0x29c5eb(_0x13f1c9.data) !== 'object') {
                _0x13f1c9.data = {};
            }
            if (_0x13f1c9.contents && _0x13f1c9.content == null) {
                _0x13f1c9.content = _0x13f1c9.contents;
            }
            _0x4190a8.define(_0x13f1c9, 'orig', _0x4190a8.toBuffer(_0x13f1c9.content));
            _0x4190a8.define(_0x13f1c9, 'language', _0x13f1c9.language || '');
            _0x4190a8.define(_0x13f1c9, 'matter', _0x13f1c9.matter || '');
            _0x4190a8.define(_0x13f1c9, 'stringify', function (_0xf96d9, _0x13ceec) {
                if (_0x13ceec && _0x13ceec.language) {
                    _0x13f1c9.language = _0x13ceec.language;
                }
                return _0x2e3269(_0x13f1c9, _0xf96d9, _0x13ceec);
            });
            _0x13f1c9.content = _0x4190a8.toString(_0x13f1c9.content);
            _0x13f1c9.isEmpty = false;
            _0x13f1c9.excerpt = '';
            return _0x13f1c9;
        };
    }
});
var require_parse = __commonJS({
    '../work/jonschlinkert__gray-matter/lib/parse.js'(_0x3cc798, _0x32b2ab) {
        'use strict';
        var _0x58819c = require_engine();
        var _0x41fa1a = require_defaults();
        _0x32b2ab.exports = function (_0x5049bb, _0x3cc220, _0x351c4f) {
            var _0x379f98 = _0x41fa1a(_0x351c4f);
            var _0xee75d4 = _0x58819c(_0x5049bb, _0x379f98);
            if (typeof _0xee75d4.parse !== 'function') {
                throw new TypeError('expected "' + _0x5049bb + '.parse" to be a function');
            }
            return _0xee75d4.parse(_0x3cc220, _0x379f98);
        };
    }
});
var fs = require('fs');
var sections = require('section-matter');
var defaults = require_defaults();
var stringify = require_stringify();
var excerpt = require_excerpt();
var engines2 = require_engines();
var toFile = require_to_file();
var parse2 = require_parse();
var utils = require_utils();
function matter(_0x6aa5fc, _0x319a9b) {
    if (_0x6aa5fc === '') {
        var _0x57592c = {
            data: {},
            content: _0x6aa5fc,
            excerpt: '',
            orig: _0x6aa5fc
        };
        return _0x57592c;
    }
    var _0x48de96 = toFile(_0x6aa5fc);
    var _0x4eeee8 = matter.cache[_0x48de96.content];
    if (!_0x319a9b) {
        if (_0x4eeee8) {
            _0x48de96 = Object.assign({}, _0x4eeee8);
            _0x48de96.orig = _0x4eeee8.orig;
            return _0x48de96;
        }
        matter.cache[_0x48de96.content] = _0x48de96;
    }
    return parseMatter(_0x48de96, _0x319a9b);
}
function parseMatter(_0x15ddd8, _0x13572d) {
    var _0x5ca219 = defaults(_0x13572d);
    var _0x4813b5 = _0x5ca219.delimiters[0];
    var _0x21a03c = '\n' + _0x5ca219.delimiters[1];
    var _0x322ed6 = _0x15ddd8.content;
    if (_0x5ca219.language) {
        _0x15ddd8.language = _0x5ca219.language;
    }
    var _0x343c09 = _0x4813b5.length;
    if (!utils.startsWith(_0x322ed6, _0x4813b5, _0x343c09)) {
        excerpt(_0x15ddd8, _0x5ca219);
        return _0x15ddd8;
    }
    if (_0x322ed6.charAt(_0x343c09) === _0x4813b5.slice(-1)) {
        return _0x15ddd8;
    }
    _0x322ed6 = _0x322ed6.slice(_0x343c09);
    var _0x15884b = _0x322ed6.length;
    var _0x1388b8 = matter.language(_0x322ed6, _0x5ca219);
    if (_0x1388b8.name) {
        _0x15ddd8.language = _0x1388b8.name;
        _0x322ed6 = _0x322ed6.slice(_0x1388b8.raw.length);
    }
    var _0x1f76bb = _0x322ed6.indexOf(_0x21a03c);
    if (_0x1f76bb === -1) {
        _0x1f76bb = _0x15884b;
    }
    _0x15ddd8.matter = _0x322ed6.slice(0, _0x1f76bb);
    var _0x3e5524 = _0x15ddd8.matter.replace(/^\s*#[^\n]+/gm, '').trim();
    if (_0x3e5524 === '') {
        _0x15ddd8.isEmpty = true;
        _0x15ddd8.empty = _0x15ddd8.content;
        _0x15ddd8.data = {};
    } else {
        _0x15ddd8.data = parse2(_0x15ddd8.language, _0x15ddd8.matter, _0x5ca219);
    }
    if (_0x1f76bb === _0x15884b) {
        _0x15ddd8.content = '';
    } else {
        _0x15ddd8.content = _0x322ed6.slice(_0x1f76bb + _0x21a03c.length);
        if (_0x15ddd8.content[0] === '\r') {
            _0x15ddd8.content = _0x15ddd8.content.slice(1);
        }
        if (_0x15ddd8.content[0] === '\n') {
            _0x15ddd8.content = _0x15ddd8.content.slice(1);
        }
    }
    excerpt(_0x15ddd8, _0x5ca219);
    if (_0x5ca219.sections === true || typeof _0x5ca219.section === 'function') {
        sections(_0x15ddd8, _0x5ca219.section);
    }
    return _0x15ddd8;
}
matter.engines = engines2;
matter.stringify = function (_0x3c3686, _0x23660a, _0x643286) {
    if (typeof _0x3c3686 === 'string') {
        _0x3c3686 = matter(_0x3c3686, _0x643286);
    }
    return stringify(_0x3c3686, _0x23660a, _0x643286);
};
matter.read = function (_0x8f441d, _0x21c64a) {
    var _0x35d34b = fs.readFileSync(_0x8f441d, 'utf8');
    var _0x1f0be1 = matter(_0x35d34b, _0x21c64a);
    _0x1f0be1.path = _0x8f441d;
    return _0x1f0be1;
};
matter.test = function (_0xaf85a4, _0x4ae0d7) {
    return utils.startsWith(_0xaf85a4, defaults(_0x4ae0d7).delimiters[0]);
};
matter.language = function (_0xd28855, _0x2d8971) {
    var _0x4761dc = defaults(_0x2d8971);
    var _0x24d9ac = _0x4761dc.delimiters[0];
    if (matter.test(_0xd28855)) {
        _0xd28855 = _0xd28855.slice(_0x24d9ac.length);
    }
    var _0x1ffe9a = _0xd28855.slice(0, _0xd28855.search(/\r?\n/));
    return {
        raw: _0x1ffe9a,
        name: _0x1ffe9a ? _0x1ffe9a.trim() : ''
    };
};
matter.cache = {};
matter.clearCache = function () {
    matter.cache = {};
};
module.exports = matter;