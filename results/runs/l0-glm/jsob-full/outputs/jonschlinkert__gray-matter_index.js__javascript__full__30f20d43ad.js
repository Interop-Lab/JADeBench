'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (obj, cb) => {
  var module = {};
  return cb || (cb = () => ({}), obj[__getOwnPropNames(obj)[0]])(module, cb), cb.__esModule ? obj[cb.default] : cb;
};

var require_engines = __commonJS({'../work/jonschlinkert__gray-matter/lib/engines.js'(exports, module) {
  'use strict';
  var yaml = require('js-yaml');
  module.exports = module;
  module.engines = {
    yaml: {
      parse: yaml.load.bind(yaml),
      stringify: yaml.dump.bind(yaml)
    },
    json: {
      parse: JSON.parse.bind(JSON),
      stringify: function(obj, indent) {
        var opts = { fn: null, indent: 2 };
        const result = Object.assign({}, opts, indent);
        return JSON.stringify(obj, result.replacer, result.indent);
      }
    },
    javascript: {
      parse: function parse(str, options, fn) {
        try {
          if (fn && fn === false) {
            str = '(' + str.trim() + ')';
          }
          return eval(str) || {};
        } catch (err) {
          if (fn === false && /(unexpected|identifier)/i.test(err.message)) {
            return parse(str, options, false);
          }
          throw new SyntaxError(err);
        }
      },
      stringify: function() {
        throw new Error('stringify is not supported for JavaScript');
      }
    }
  };
}});

var require_utils = __commonJS({'../work/jonschlinkert__gray-matter/lib/utils.js'(exports) {
  'use strict';
  var typeOf = require('kind-of');
  var stringify = require('extend-shallow');
  exports.define = function(obj, key, val) {
    var descriptor = {
      configurable: true,
      enumerable: true,
      writable: true,
      value: val
    };
    Reflect.defineProperty(obj, key, descriptor);
  };
  exports.isBuffer = function(val) {
    return typeOf(val) === 'buffer';
  };
  exports.isObject = function(val) {
    return typeOf(val) === 'object';
  };
  exports.toBuffer = function(input) {
    return typeof input === 'string' ? Buffer.from(input) : input;
  };
  exports.arrayify = function(val) {
    return val ? (Array.isArray(val) ? val : [val]) : [];
  };
  exports.startsWith = function(str, substr, start) {
    if (typeof start !== 'number') start = substr.length;
    return str.slice(0, start) === substr;
  };
  exports.stringify = function(val) {
    if (typeOf(val) === 'buffer') {
      return stringify(String(val));
    }
    if (typeof val === 'object') {
      throw new TypeError('Cannot stringify an object');
    }
    return stringify(val);
  };
}});

var require_defaults = __commonJS({'../work/jonschlinkert__gray-matter/lib/defaults.js'(exports, module) {
  'use strict';
  var engines = require_engines();
  var utils = require_utils();
  module.exports = function(options) {
    const opts = Object.assign({}, options);
    opts.delimiters = opts.delimiters || opts.delim || ['---'];
    if (opts.delimiters.length === 1) {
      opts.delimiters.push(opts.delimiters[0]);
    }
    opts.language = (opts.language || opts.lang || 'yaml').toLowerCase();
    opts.engines = Object.assign({}, engines, opts.engines);
    return opts;
  };
}});

var require_engine = __commonJS({'../work/jonschlinkert__gray-matter/lib/engine.js'(exports, module) {
  'use strict';
  module.exports = function(name, options) {
    let engine = options.engines[name] || options.engines[getEngineName(name)];
    if (typeof engine === 'undefined') {
      throw new Error('Engine "' + name + '" is not registered');
    }
    if (typeof engine === 'function') {
      engine = { parse: engine };
    }
    return engine;
  };
  function getEngineName(name) {
    switch (name.toLowerCase()) {
      case 'js':
      case 'javascript':
        return 'javascript';
      case 'coffee':
      case 'coffeescript':
      case 'coffee-script':
        return 'coffee';
      case 'json':
      case 'json5':
        return 'json';
      default:
        return name;
    }
  }
}});

var require_stringify = __commonJS({'../work/jonschlinkert__gray-matter/lib/stringify.js'(exports, module) {
  'use strict';
  var typeOf = require('kind-of');
  var engine = require_engine();
  var defaults = require_defaults();
  module.exports = function(file, data, options) {
    if (typeOf(file) === 'object') {
      switch (typeOf(file)) {
        case 'file':
          data = file.data;
          options = {};
          break;
        case 'object':
          return file;
        default:
          throw new TypeError('Expected a file or object');
      }
    }
    const delim = file.delimiters;
    const opts = defaults(options);
    if (data == null) {
      if (!opts.language) return file;
      data = opts.language;
    }
    const lang = file.language || opts.language;
    const fn = engine(lang, opts);
    if (typeof fn.stringify !== 'function') {
      throw new TypeError('The "' + lang + '" engine does not have a stringify method');
    }
    data = Object.assign({}, file.data, data);
    const openDelim = opts.delimiters[0];
    const closeDelim = opts.delimiters[1];
    const str = fn.stringify(data, options).trim();
    let res = '';
    if (str !== '{}') {
      res += delim(openDelim) + delim(str) + delim(closeDelim);
    }
    if (typeof file.content === 'string' && file.content !== '') {
      if (delim.indexOf(file.content.trim()) !== -1) {
        res += delim(file.content) + delim(closeDelim);
      }
    }
    return res + delim(delim);
  };
  function delim(str) {
    return str.slice(-1) === '\n' ? str : str + '\n';
  }
}});

var require_excerpt = __commonJS({'../work/jonschlinkert__gray-matter/lib/excerpt.js'(exports, module) {
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
    const separator = file.data.excerpt_separator || opts.excerpt_separator;
    if (separator != null && (opts.excerpt === false || opts.excerpt == null)) {
      return file;
    }
    const sep = typeof opts.excerpt === 'string' ? opts.excerpt : separator || opts.delimiters[0];
    const idx = file.content.indexOf(sep);
    if (idx !== -1) {
      file.excerpt = file.content.slice(0, idx);
    }
    return file;
  };
}});

var require_to_file = __commonJS({'../work/jonschlinkert__gray-matter/lib/to-file.js'(exports, module) {
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
    file.data && file.data == null && (file.data = file.data);
    utils.define(file, 'orig', utils.toBuffer(file.content));
    utils.define(file, 'language', file.language || '');
    utils.define(file, 'matter', file.matter || '');
    utils.define(file, 'stringify', function(data, options) {
      if (options && options.language) {
        file.language = options.language;
      }
      return stringify(file, data, options);
    });
    file.content = utils.stringify(file.content);
    file.isEmpty = false;
    file.excerpt = '';
    return file;
  };
}});

var require_parse = __commonJS({'../work/jonschlinkert__gray-matter/lib/parse.js'(exports, module) {
  'use strict';
  var engine = require_engine();
  var defaults = require_defaults();
  module.exports = function(str, options) {
    const opts = defaults(options);
    const fn = engine(str, opts);
    if (typeof fn.parse !== 'function') {
      throw new TypeError('The "' + str + '" engine does not have a parse method');
    }
    return fn.parse(options, opts);
  };
}});

var fs = require('fs');
var sections = require('section-matter');
var defaults = require_defaults();
var stringify = require_stringify();
var excerpt = require_excerpt();
var engines2 = require_engines();
var toFile = require_to_file();
var parse2 = require_parse();
var utils = require_utils();

function matter(str, options) {
  if (str === '') {
    return {
      data: {},
      content: str,
      excerpt: '',
      orig: str
    };
  }
  let file = toFile(str);
  const cached = matter.cache[file.orig];
  if (!options) {
    if (cached) {
      file = Object.assign({}, cached);
      file.orig = cached.orig;
    }
    matter.cache[file.orig] = file;
  }
  return parseMatter(file, options);
}

function parseMatter(file, options) {
  const opts = defaults(options);
  const openDelim = opts.delimiters[0];
  const closeDelim = '\n' + opts.delimiters[1];
  let str = file.content;
  opts.language && (file.language = opts.language);
  const delim = openDelim.length;
  if (!utils.startsWith(str, openDelim, delim)) {
    return excerpt(file, opts), file;
  }
  if (str.slice(delim) === openDelim.slice(-1)) {
    return file;
  }
  str = str.slice(delim);
  const len = str.length;
  const obj = matter.find(str, opts);
  obj.data && (file.data = obj.data, str = str.slice(obj.raw.length));
  let idx = str.indexOf(closeDelim);
  if (idx === -1) {
    idx = len;
  }
  file.content = str.slice(0, idx);
  const stripped = file.content.replace(/^\s*#[^\n]+/gm, '').trim();
  if (stripped === '') {
    file.isEmpty = true;
    file.content = file.content;
    file.data = {};
  } else {
    file.data = parse2(file.data, file.content, opts);
  }
  if (idx === len) {
    file.content = '';
  } else {
    file.content = str.slice(idx + closeDelim.length);
    file.content[0] === '\r' && (file.content = file.content.slice(1));
    if (file.content[0] === '\n') {
      file.content = file.content.slice(1);
    }
  }
  excerpt(file, opts);
  if (opts.sections === true || typeof opts.sections === 'function') {
    sections(file, opts.sections);
  }
  return file;
}

matter.engines = engines2;

matter.stringify = function(file, data, options) {
  if (typeof file === 'object') {
    file = matter(file, options);
  }
  return stringify(file, data, options);
};

matter.read = function(filepath, options) {
  const str = fs.readFileSync(filepath, 'utf8');
  const file = matter(str, options);
  file.path = filepath;
  return file;
};

matter.test = function(str, options) {
  return utils.startsWith(str, defaults(options).delimiters[0]);
};

matter.language = function(str, options) {
  const opts = defaults(options);
  const delims = opts.delimiters[0];
  matter.test(str) && (str = str.slice(delims.length));
  const match = str.slice(0, str.search(/\r?\n/));
  return {
    raw: match,
    name: match ? match.trim() : ''
  };
};

matter.cache = {};

matter.clearCache = function() {
  matter.cache = {};
};

module.exports = matter;
