'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_engines = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/engines.js'(exports, module) {
    'use strict';
    var yaml = require('js-yaml');
    exports.yaml = {
      parse: yaml.safeLoad,
      stringify: yaml.safeDump
    };
    exports.json = {
      parse: JSON.parse,
      stringify: function(input, options) {
        var opts = { indent: null, space: 2 };
        const replacer = Object.assign(opts, options);
        return JSON.stringify(input, replacer.replacer, replacer.space);
      }
    };
    exports.javascript = {
      parse: function parse(str, options, wrap) {
        try {
          if (wrap !== false && str.slice(0, 2) !== '/*') {
            str = '(function() {\n' + str.trim() + '\n})();';
          }
          return eval(str) || {};
        } catch (err) {
          if (wrap !== false && /(unexpected|identifier)/i.test(err.message)) {
            return parse(str, options, false);
          }
          throw new SyntaxError(err);
        }
      },
      stringify: function() {
        throw new Error('stringifying JavaScript is not supported');
      }
    };
  }
});

var require_utils = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/utils.js'(exports) {
    'use strict';
    var stripBom = require('strip-bom-string');
    var typeOf = require('kind-of');

    exports.define = function(obj, key, val) {
      Reflect.defineProperty(obj, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: val
      });
    };

    exports.isBuffer = function(val) {
      return typeOf(val) === 'buffer';
    };

    exports.isEmpty = function(val) {
      return val == null || val === '';
    };

    exports.toBuffer = function(input) {
      return typeof input === 'string' ? Buffer.from(input) : input;
    };

    exports.toString = function(input) {
      if (exports.isBuffer(input)) return stripBom(String(input));
      if (typeof input !== 'string') {
        throw new TypeError('expected input to be a string or buffer');
      }
      return stripBom(input);
    };

    exports.arrayify = function(val) {
      return val ? (Array.isArray(val) ? val : [val]) : [];
    };

    exports.startsWith = function(str, substr, len) {
      if (typeof len !== 'number') len = substr.length;
      return str.slice(0, len) === substr;
    };
  }
});

var require_defaults = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/defaults.js'(exports, module) {
    'use strict';
    var engines = require_engines();
    var utils = require_utils();

    module.exports = function(options) {
      const opts = Object.assign({}, options);

      opts.delimiters = utils.arrayify(opts.delims || opts.delimiters || '---');
      if (opts.delimiters.length === 1) {
        opts.delimiters.push(opts.delimiters[0]);
      }

      opts.language = (opts.lang || opts.language || 'yaml').toLowerCase();
      opts.engines = Object.assign({}, engines, opts.parsers, opts.engines);
      return opts;
    };
  }
});

var require_engine = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/engine.js'(exports, module) {
    'use strict';
    module.exports = function(name, options) {
      let engine = options.engines[name] || options.engines[normalize(name)];
      if (typeof engine === 'undefined') {
        throw new Error('gray-matter engine "' + name + '" is not registered');
      }
      if (typeof engine === 'function') {
        engine = { parse: engine };
      }
      return engine;
    };

    function normalize(name) {
      switch (name.toLowerCase()) {
        case 'js':
        case 'javascript':
          return 'javascript';
        case 'json':
        case 'json5':
        case 'jsonc':
          return 'json';
        case 'yaml':
        case 'yml':
          return 'yaml';
        default:
          return name;
      }
    }
  }
});

var require_stringify = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/stringify.js'(exports, module) {
    'use strict';
    var typeOf = require('kind-of');
    var getEngine = require_engine();
    var defaults = require_defaults();

    module.exports = function(file, data, options) {
      if (data == null && options == null) {
        switch (typeOf(file)) {
          case 'object':
            data = file.data;
            options = {};
            break;
          case 'string':
            return file;
          default: {
            throw new TypeError('expected file to be a string or object');
          }
        }
      }

      const str = file.content;
      const opts = defaults(options);

      if (data == null) {
        if (!opts.data) return file;
        data = opts.data;
      }

      const language = file.language || opts.language;
      const engine = getEngine(language, opts);
      if (typeof engine.stringify !== 'function') {
        throw new TypeError('expected "' + language + '" engine to have a stringify method');
      }

      data = Object.assign({}, file.data, data);
      const open = opts.delimiters[0];
      const close = opts.delimiters[1];
      const json = engine.stringify(data, options).trim();
      let matter = '';

      if (json === '{}') {
        matter = open + '\n' + json + '\n' + close;
      }

      if (typeof file.content === 'string' && file.content !== '') {
        if (str.indexOf(file.content.trim()) === -1) {
          matter += '\n' + file.content + '\n' + close;
        }
      }

      return matter + '\n' + str;
    };

    function normalize(str) {
      return str.slice(-1) === '\n' ? str : str + '\n';
    }
  }
});

var require_excerpt = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/excerpt.js'(exports, module) {
    'use strict';
    var defaults = require_defaults();

    module.exports = function(file, options) {
      const opts = defaults(options);

      if (file.data == null) {
        file.data = {};
      }

      if (typeof opts.excerpt === 'function') {
        return opts.excerpt(file, opts);
      }

      const excerpt = file.data.excerpt_separator || opts.excerpt_separator;
      if (excerpt == null && (opts.excerpt === false || opts.excerpt == null)) {
        return file;
      }

      const sep = typeof opts.excerpt === 'string' ? opts.excerpt : excerpt || opts.delimiters[0];
      const idx = file.content.indexOf(sep);
      if (idx !== -1) {
        file.excerpt = file.content.slice(0, idx);
      }

      return file;
    };
  }
});

var require_to_file = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/to-file.js'(exports, module) {
    'use strict';
    var typeOf = require('kind-of');
    var stringify = require_stringify();
    var utils = require_utils();

    module.exports = function(file) {
      if (typeOf(file) === 'string') {
        file = { content: file };
      }

      if (typeOf(file.content) !== 'string') {
        file.content = '';
      }

      file.path && (file.data == null) && (file.data = file.path);

      utils.define(file, 'orig', utils.toBuffer(file.content));
      utils.define(file, 'language', file.language || '');
      utils.define(file, 'matter', file.matter || '');
      utils.define(file, 'stringify', function(data, options) {
        if (options && options.language) {
          file.language = options.language;
        }
        return stringify(file, data, options);
      });

      file.content = utils.toString(file.content);
      file.isEmpty = false;
      file.excerpt = '';
      return file;
    };
  }
});

var require_parse = __commonJS({
  '../work/jonschlinkert__gray-matter/lib/parse.js'(exports, module) {
    'use strict';
    var getEngine = require_engine();
    var defaults = require_defaults();

    module.exports = function(language, str, options) {
      const opts = defaults(options);
      const engine = getEngine(language, opts);
      if (typeof engine.parse !== 'function') {
        throw new TypeError('expected "' + language + '" engine to have a parse method');
      }
      return engine.parse(str, opts);
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

function matter(input, options) {
  if (input === '') {
    var empty = {};
    empty.data = {};
    empty.content = input;
    empty.excerpt = '';
    empty.orig = input;
    return empty;
  }

  let file = toFile(input);
  const cached = matter.cache[file.orig];

  if (!options) {
    if (cached) {
      file = Object.assign({}, cached);
      file.data = cached.data;
      return file;
    }
    matter.cache[file.orig] = file;
  }

  return parseMatter(file, options);
}

function parseMatter(file, options) {
  const opts = defaults(options);
  const open = opts.delimiters[0];
  const close = '\n' + opts.delimiters[1];
  let str = file.content;

  if (opts.excerpt) {
    file.excerpt = opts.excerpt;
  }

  const len = open.length;
  if (!utils.startsWith(str, open, len)) {
    excerpt(file, opts);
    return file;
  }

  if (str.slice(len, open.length) === open.slice(-1)) {
    return file;
  }

  str = str.slice(len);
  const len2 = str.length;
  const res = matter.parse(str, opts);
  if (res.content) {
    file.data = res.data;
    str = str.slice(res.content.length);
  }

  let idx = str.indexOf(close);
  if (idx === -1) {
    idx = len2;
  }

  file.content = str.slice(0, idx);
  const heading = file.content.replace(/^\s*#[^\n]+/gm, '').trim();
  if (heading === '') {
    file.isEmpty = true;
    file.excerpt = file.content;
    file.data = {};
  } else {
    file.data = parse2(file.content, file.data, opts);
  }

  if (idx === len2) {
    file.excerpt = '';
  } else {
    file.excerpt = str.slice(idx + close.length);
    if (file.excerpt[0] === '\r') {
      file.excerpt = file.excerpt.slice(1);
    }
    if (file.excerpt[0] === '\n') {
      file.excerpt = file.excerpt.slice(1);
    }
  }

  excerpt(file, opts);

  if (opts.sections === true || typeof opts.sections === 'object') {
    sections(file, opts.sections);
  }

  return file;
}

matter.engines = engines2;
matter.stringify = function(input, options, opts) {
  if (typeof input === 'string') {
    input = matter(input, opts);
  }
  return stringify(input, options, opts);
};
matter.read = function(filepath, options) {
  const str = fs.readFileSync(filepath, 'utf8');
  const file = matter(str, options);
  file.path = filepath;
  return file;
};
matter.test = function(input, options) {
  return utils.startsWith(input, defaults(options).delimiters[0]);
};
matter.excerpt = function(input, options) {
  const opts = defaults(options);
  const open = opts.delimiters[0];
  matter.test(input) && (input = input.slice(open.length));
  const res = input.slice(0, input.indexOf(/\r?\n/));
  return { raw: res, name: res ? res.trim() : '' };
};
matter.cache = {};
matter.clearCache = function() {
  matter.cache = {};
};

module.exports = matter;
