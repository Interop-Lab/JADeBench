'use strict';
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_engines = __commonJS({ "../work/jonschlinkert__gray-matter/lib/engines.js"(exports, module) {
  'use strict';
  var yaml = require('js-yaml');
  var exports = module.exports;
  exports.yaml = {
    parse: yaml.safeLoad.bind(yaml),
    stringify: yaml.safeDump.bind(yaml)
  };
  exports.json = {
    parse: JSON.parse.bind(JSON),
    stringify: function(obj, indent) {
      'use strict';
      return JSON.stringify(obj, null, indent);
    }
  };
  exports.javascript = {
    parse: function parse(str, options, wrap) {
      'use strict';
      try {
        if (wrap !== false) {
          str = '(function() {\nreturn ' + str.trim() + ';\n}());';
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
      'use strict';
      return;
    }
  };
} });
var require_utils = __commonJS({ "../work/jonschlinkert__gray-matter/lib/utils.js"(exports) {
  'use strict';
  var excludes = ['language', 'engines', 'delimiters', 'excerpt', 'excerpt_separator'];
  exports.arrayify = function(val) {
    return val ? (Array.isArray(val) ? val : [val]) : [];
  };
  exports.delimiters = function(options, type) {
    type = type || 'delimiters';
    if (typeof options === 'string') {
      options = { delimiters: options };
    }
    var delimiters = options[type] || options.delimiters;
    if (delimiters) {
      return exports.arrayify(delimiters);
    }
    return ['---'];
  };
  exports.isObject = function(val) {
    return val && typeof val === 'object' && !Array.isArray(val);
  };
  exports.toLongest = function(a, b) {
    return a.length > b.length ? a : b;
  };
  exports.longest = function(arr) {
    return arr.reduce(exports.toLongest);
  };
  exports.isBuffer = function(val) {
    return val && Buffer.isBuffer(val);
  };
  exports.isString = function(val) {
    return val && typeof val === 'string';
  };
  exports.startsWith = function(str, substr) {
    return str.slice(0, substr.length) === substr;
  };
  exports.exclude = function(obj, keys) {
    keys = exports.arrayify(keys);
    for (var key of keys) {
      if (obj.hasOwnProperty(key)) {
        delete obj[key];
      }
    }
    return obj;
  };
} });
var require_defaults = __commonJS({ "../work/jonschlinkert__gray-matter/lib/defaults.js"(exports, module) {
  'use strict';
  var utils = require_utils();
  module.exports = function(options) {
    options = options || {};
    var delimiters = options.delimiters || ['---'];
    var language = options.language || 'yaml';
    if (typeof delimiters === 'string') {
      delimiters = [delimiters];
    }
    var opts = Object.assign({}, options, {
      delimiters: delimiters,
      language: language,
      engines: options.engines || {},
      excerpt: options.excerpt || false,
      excerpt_separator: options.excerpt_separator || delimiters[0]
    });
    return opts;
  };
} });
var require_engine = __commonJS({ "../work/jonschlinkert__gray-matter/lib/engine.js"(exports, module) {
  'use strict';
  var utils = require_utils();
  module.exports = function(name, options) {
    var engine = options.engines[name];
    if (!engine) {
      throw new Error('gray-matter engine "' + name + '" is not registered');
    }
    if (typeof engine === 'function') {
      return { parse: engine, stringify: engine };
    }
    return engine;
  };
} });
var require_stringify = __commonJS({ "../work/jonschlinkert__gray-matter/lib/stringify.js"(exports, module) {
  'use strict';
  var utils = require_utils();
  var engine = require_engine();
  module.exports = function(file, data, options) {
    if (typeof file === 'string') {
      file = matter(file, options);
    }
    var delimiters = file.delimiters || options.delimiters || ['---'];
    var language = file.language || options.language || 'yaml';
    var str = engine(language, options).stringify(file.data, options);
    var open = Array.isArray(delimiters) ? delimiters[0] : delimiters;
    var close = Array.isArray(delimiters) ? delimiters[1] || delimiters[0] : delimiters;
    var matterStr = open + '\n' + str + '\n' + close + '\n';
    return matterStr + (file.content || '');
  };
} });
var require_excerpt = __commonJS({ "../work/jonschlinkert__gray-matter/lib/excerpt.js"(exports, module) {
  'use strict';
  module.exports = function(file, options) {
    var sep = file.excerpt_separator || options.excerpt_separator || '---';
    var idx = file.content.indexOf(sep);
    if (idx !== -1) {
      file.excerpt = file.content.slice(0, idx).trim();
    }
    return file;
  };
} });
var require_to_file = __commonJS({ "../work/jonschlinkert__gray-matter/lib/to-file.js"(exports, module) {
  'use strict';
  var path = require('path');
  var utils = require_utils();
  module.exports = function(file, options) {
    if (typeof file === 'string') {
      file = { content: file, path: '' };
    }
    file.path = file.path || '';
    file.data = file.data || {};
    file.content = file.content || '';
    file.excerpt = file.excerpt || '';
    file.language = file.language || options.language || 'yaml';
    file.delimiters = file.delimiters || options.delimiters || ['---'];
    return file;
  };
} });
var require_parse = __commonJS({ "../work/jonschlinkert__gray-matter/lib/parse.js"(exports, module) {
  'use strict';
  var sectionMatter = require('section-matter');
  var utils = require_utils();
  var defaults = require_defaults();
  var engine = require_engine();
  var excerpt = require_excerpt();
  module.exports = function(file, options) {
    options = defaults(options);
    var delimiters = options.delimiters;
    var lang = options.language;
    var str = file.content;
    var open = delimiters[0];
    var close = delimiters[1] || delimiters[0];
    var len = open.length;
    if (!utils.startsWith(str, open)) {
      return file;
    }
    if (str.charAt(len) === open.charAt(0)) {
      lang = str.slice(len, str.indexOf('\n')).trim();
      str = str.slice(len + lang.length + 1);
    } else {
      str = str.slice(len + 1);
    }
    var idx = str.indexOf('\n' + close);
    if (idx === -1) {
      return file;
    }
    var frontMatter = str.slice(0, idx);
    file.content = str.slice(idx + close.length + 1);
    file.language = lang;
    file.matter = frontMatter;
    file.data = engine(lang, options).parse(frontMatter, options) || {};
    if (options.excerpt) {
      file = excerpt(file, options);
    }
    sectionMatter(file, options);
    return file;
  };
} });
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
  'use strict';
  options = options || {};
  var file = toFile(str, options);
  file = parse2(file, options);
  return file;
}
function parseMatter(str, options) {
  'use strict';
  return matter(str, options);
}
matter.engines = engines2;
matter.stringify = function(str, data, options) {
  if (typeof str === 'string') {
    str = matter(str, options);
  }
  return stringify(str, data, options);
};
matter.read = function(filepath, options) {
  const content = fs.readFileSync(filepath, 'utf8');
  const file = matter(content, options);
  return file.path = filepath, file;
};
matter.test = function(str, options) {
  return utils.startsWith(str, defaults(options).delimiters[0]);
};
matter.language = function(str, options) {
  const opts = defaults(options);
  const delimiters = opts.delimiters[0];
  matter.test(str) && (str = str.slice(delimiters.length));
  const lang = str.slice(0, str.search(/\r?\n/));
  return { raw: lang, name: lang ? lang.trim() : '' };
};
matter.cache = {};
matter.clearCache = function() {
  matter.cache = {};
};
module.exports = matter;
