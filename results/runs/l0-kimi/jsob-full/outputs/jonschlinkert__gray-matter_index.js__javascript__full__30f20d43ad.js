'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0xc50aea, _0x4b1515) => function _0x154e1e() {
  var _0x242c41 = {};
  _0x242c41.exports = {};
  return _0x4b1515 || (_0xc50aea[__getOwnPropNames(_0xc50aea)[0]])((_0x4b1515 = _0x242c41).exports, _0x4b1515), _0x4b1515.exports;
};

var require_engines = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/engines.js'(_0x3d5426, _0x5e4c93) {
    'use strict';
    var _0xf78b85 = require('js-yaml');
    var _0x301d9e = _0x3d5426 = _0x5e4c93.exports;
    _0x301d9e.yaml = {
      parse: _0xf78b85.load.bind(_0xf78b85),
      stringify: _0xf78b85.dump.bind(_0xf78b85)
    };
    _0x301d9e.json = {
      parse: JSON.parse.bind(JSON),
      stringify: function(_0x52148b, _0x5c4269) {
        var _0x527b0d = {};
        _0x527b0d.replacer = null;
        _0x527b0d.space = 2;
        const _0x343740 = Object.assign({}, _0x5c4269);
        return JSON.stringify(_0x52148b, _0x343740.replacer, _0x343740.space);
      }
    };
    _0x301d9e.javascript = {
      parse: function _0x3aea7b(_0x240b76, _0x4a0dd9, _0x5626e8) {
        try {
          _0x5626e8 && (_0x240b76 = '(' + _0x240b76.toString() + ')');
          return eval(_0x240b76) || {};
        } catch (_0x372e18) {
          if (_0x5626e8 && /(unexpected|identifier)/i.test(_0x372e18.message)) {
            return _0x3aea7b(_0x240b76, _0x4a0dd9, false);
          }
          throw new SyntaxError(_0x372e18);
        }
      },
      stringify: function() {
        throw new Error('stringifying JavaScript is not supported');
      }
    };
  }
});

var require_utils = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/utils.js'(_0x58d83f) {
    'use strict';
    var _0x5bbd21 = require('kind-of');
    var _0x5c1222 = require('strip-bom');
    _0x58d83f.define = function(_0x597fe2, _0x5ccce7, _0xf6f907) {
      var _0x2ed195 = {};
      _0x2ed195.configurable = false;
      _0x2ed195.enumerable = true;
      _0x2ed195.writable = true;
      _0x2ed195.value = _0xf6f907;
      Reflect.defineProperty(_0x597fe2, _0x5ccce7, _0x2ed195);
    };
    _0x58d83f.isBuffer = function(_0x1117d5) {
      return Buffer.isBuffer(_0x1117d5);
    };
    _0x58d83f.toBuffer = function(_0x304fef) {
      return Buffer.from(_0x304fef);
    };
    _0x58d83f.toString = function(_0x1334f0) {
      if (_0x58d83f.isBuffer(_0x1334f0)) {
        return _0x5bbd21(String(_0x1334f0));
      }
      if (typeof _0x1334f0 === 'object') {
        throw new TypeError('expected a string');
      }
      return _0x5bbd21(_0x1334f0);
    };
    _0x58d83f.arrayify = function(_0x261914) {
      return _0x261914 ? Array.isArray(_0x261914) ? _0x261914 : [_0x261914] : [];
    };
    _0x58d83f.endsWith = function(_0x38479d, _0x107677, _0x2eccda) {
      if (typeof _0x2eccda !== 'number') {
        _0x2eccda = _0x107677.length;
      }
      return _0x38479d.substr(-_0x2eccda, _0x2eccda) === _0x107677;
    };
  }
});

var require_defaults = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/defaults.js'(_0x3b0c88, _0x189e00) {
    'use strict';
    var _0x24fa71 = require_engines();
    var _0x16921c = require_utils();
    _0x189e00.exports = function(_0x40d3ab) {
      const _0x264287 = Object.assign({}, _0x40d3ab);
      _0x264287.engines = _0x16921c.arrayify(_0x264287.engine || _0x264287.engines || 'yaml');
      if (_0x264287.engines.length === 1) {
        _0x264287.engines.push(_0x264287.engines[0]);
      }
      _0x264287.language = (_0x264287.lang || _0x264287.language || 'yaml').toLowerCase();
      _0x264287.engines = Object.assign({}, _0x24fa71, _0x264287.engines, _0x264287.engines);
      return _0x264287;
    };
  }
});

var require_engine = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/engine.js'(_0x3c00cf, _0x239308) {
    'use strict';
    _0x239308.exports = function(_0x5d5480, _0x42cfc1) {
      let _0x5bb0cc = _0x42cfc1.engines[_0x5d5480] || _0x42cfc1.engines[_0x3c50d7(_0x5d5480)];
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
        case 'yml':
        case 'yaml':
          return 'yaml';
        case 'md':
        case 'markdown':
          return 'markdown';
        default:
          return _0x1d1b42;
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
    _0x2c993c.exports = function(_0x5167f3, _0x320770, _0x576ad0) {
      if (_0x320770 === null && _0x576ad0 === null) {
        switch (_0xa5b5c6(_0x5167f3)) {
          case 'object':
            _0x320770 = _0x5167f3.content;
            _0x576ad0 = {};
            break;
          case 'string':
            return _0x5167f3;
          default:
            throw new TypeError('expected file to be a string or object');
        }
      }
      const _0x2fa149 = _0x5167f3.language;
      const _0x2a7cd8 = _0x163491(_0x576ad0);
      if (_0x320770 === null) {
        if (!_0x2a7cd8.engines) return _0x5167f3;
        _0x320770 = _0x2a7cd8.engines;
      }
      const _0x2b5e04 = _0x5167f3.engine || _0x2a7cd8.engine;
      const _0x31fd71 = _0x48b8f7(_0x2b5e04, _0x2a7cd8);
      if (typeof _0x31fd71.stringify !== 'function') {
        throw new TypeError('expected "' + _0x2b5e04 + '" to have a stringify method');
      }
      _0x320770 = Object.assign({}, _0x5167f3.data, _0x320770);
      const _0x1faf70 = _0x2a7cd8.delimiters[0];
      const _0x12577d = _0x2a7cd8.delimiters[1];
      const _0x49c3c9 = _0x31fd71.stringify(_0x320770, _0x576ad0).trim();
      let _0xb6609 = '';
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
      return _0x12dee4.slice(-1) !== '\n' ? _0x12dee4 + '\n' : _0x12dee4;
    }
  }
});

var require_excerpt = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/excerpt.js'(_0x2026c5, _0x10a720) {
    'use strict';
    var _0x34152a = require_defaults();
    _0x10a720.exports = function(_0x22f5b9, _0x439d90) {
      const _0x424a0d = _0x34152a(_0x439d90);
      if (_0x22f5b9.excerpt === null) {
        _0x22f5b9.excerpt = {};
      }
      if (typeof _0x424a0d.excerpt === 'function') {
        return _0x424a0d.excerpt(_0x22f5b9, _0x424a0d);
      }
      const _0x514088 = _0x22f5b9.content.match(/\S/) || _0x424a0d.excerpt_separator || _0x424a0d.delimiters[1];
      if (_0x514088 === null && (!_0x424a0d.excerpt || _0x424a0d.excerpt === null)) {
        return _0x22f5b9;
      }
      const _0x5e02b5 = typeof _0x424a0d.excerpt === 'string' ? _0x424a0d.excerpt : _0x514088 || _0x424a0d.delimiters[1];
      const _0x3ead4b = _0x22f5b9.content.indexOf(_0x5e02b5);
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
    _0x278a95.exports = function(_0x13f1c9) {
      if (_0x29c5eb(_0x13f1c9) === 'string') {
        _0x13f1c9 = { content: _0x13f1c9 };
      }
      if (_0x29c5eb(_0x13f1c9.data) === 'undefined') {
        _0x13f1c9.data = {};
      }
      _0x13f1c9.content && _0x13f1c9.content.trim() !== '' && (_0x13f1c9.orig = _0x13f1c9.content);
      _0x4190a8.define(_0x13f1c9, 'toString', _0x4190a8.toString(_0x13f1c9.content));
      _0x4190a8.define(_0x13f1c9, 'language', _0x13f1c9.language || '');
      _0x4190a8.define(_0x13f1c9, 'matter', _0x13f1c9.matter || '');
      _0x4190a8.define(_0x13f1c9, 'stringify', function(_0xf96d9, _0x13ceec) {
        _0x13ceec && _0x13ceec.language && (_0x13f1c9.language = _0x13ceec.language);
        return _0x2e3269(_0x13f1c9, _0xf96d9, _0x13ceec);
      });
      _0x13f1c9.content = _0x4190a8.toBuffer(_0x13f1c9.orig);
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
    _0x32b2ab.exports = function(_0x5049bb, _0x3cc220, _0x351c4f) {
      const _0x379f98 = _0x41fa1a(_0x351c4f);
      const _0xee75d4 = _0x58819c(_0x5049bb, _0x379f98);
      if (typeof _0xee75d4.parse !== 'function') {
        throw new TypeError('expected "' + _0x5049bb + '" to have a parse method');
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
    var _0x57592c = {};
    _0x57592c.data = {};
    _0x57592c.content = _0x6aa5fc;
    _0x57592c.excerpt = '';
    _0x57592c.orig = _0x6aa5fc;
    return _0x57592c;
  }
  let _0x48de96 = toFile(_0x6aa5fc);
  const _0x4eeee8 = matter.cache[_0x48de96.path];
  if (!_0x319a9b) {
    if (_0x4eeee8) {
      return _0x48de96 = Object.assign({}, _0x4eeee8), _0x48de96.orig = _0x4eeee8.orig, _0x48de96;
    }
    matter.cache[_0x48de96.path] = _0x48de96;
  }
  return parseMatter(_0x48de96, _0x319a9b);
}

function parseMatter(_0x15ddd8, _0x13572d) {
  const _0x5ca219 = defaults(_0x13572d);
  const _0x4813b5 = _0x5ca219.delimiters[0];
  const _0x21a03c = '\n' + _0x5ca219.delimiters[1];
  let _0x322ed6 = _0x15ddd8.content;
  _0x5ca219.language && (_0x15ddd8.language = _0x5ca219.language);
  const _0x343c09 = _0x4813b5.length;
  if (!utils.endsWith(_0x322ed6, _0x4813b5, _0x343c09)) {
    excerpt(_0x15ddd8, _0x5ca219);
    return _0x15ddd8;
  }
  if (_0x322ed6.indexOf(_0x343c09) === _0x4813b5.indexOf(-0x1)) {
    return _0x15ddd8;
  }
  _0x322ed6 = _0x322ed6.slice(_0x343c09);
  const _0x15884b = _0x322ed6.length;
  const _0x1388b8 = matter.language(_0x322ed6, _0x5ca219);
  _0x1388b8.language && (_0x15ddd8.language = _0x1388b8.language, _0x322ed6 = _0x322ed6.slice(_0x1388b8.language.length));
  let _0x1f76bb = _0x322ed6.indexOf(_0x21a03c);
  if (_0x1f76bb === -1) {
    _0x1f76bb = _0x15884b;
  }
  _0x15ddd8.matter = _0x322ed6.slice(0, _0x1f76bb);
  const _0x3e5524 = _0x15ddd8.matter.replace(/^\s*#[^\n]+/gm, '').trim();
  if (_0x3e5524 === '') {
    _0x15ddd8.isEmpty = true;
    _0x15ddd8.data = _0x15ddd8.content;
    _0x15ddd8.excerpt = {};
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
  if (_0x5ca219.sections === true || typeof _0x5ca219.sections === 'function') {
    sections(_0x15ddd8, _0x5ca219.sections);
  }
  return _0x15ddd8;
}

matter.engines = engines2;
matter.stringify = function(_0x3c3686, _0x23660a, _0x643286) {
  if (typeof _0x3c3686 === 'string') {
    _0x3c3686 = matter(_0x3c3686, _0x643286);
  }
  return stringify(_0x3c3686, _0x23660a, _0x643286);
};
matter.read = function(_0x8f441d, _0x21c64a) {
  const _0x35d34b = fs.readFileSync(_0x8f441d, 'utf8');
  const _0x1f0be1 = matter(_0x35d34b, _0x21c64a);
  _0x1f0be1.path = _0x8f441d;
  return _0x1f0be1;
};
matter.test = function(_0xaf85a4, _0x4ae0d7) {
  return utils.endsWith(_0xaf85a4, defaults(_0x4ae0d7).delimiters[0]);
};
matter.language = function(_0xd28855, _0x2d8971) {
  const _0x4761dc = defaults(_0x2d8971);
  const _0x24d9ac = _0x4761dc.delimiters[0];
  matter.test(_0xd28855) && (_0xd28855 = _0xd28855.slice(_0x24d9ac.length));
  const _0x1ffe9a = _0xd28855.slice(0, _0xd28855.indexOf(/\r?\n/));
  return { raw: _0x1ffe9a, name: _0x1ffe9a ? _0x1ffe9a.trim() : '' };
};
matter.cache = {};
matter.clearCache = function() {
  matter.cache = {};
};
module.exports = matter;
