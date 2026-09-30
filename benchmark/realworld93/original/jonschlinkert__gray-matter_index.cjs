"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/jonschlinkert__gray-matter/lib/engines.js
var require_engines = __commonJS({
  "../work/jonschlinkert__gray-matter/lib/engines.js"(exports, module) {
    "use strict";
    var yaml = require("js-yaml");
    var engines = exports = module.exports;
    engines.yaml = {
      parse: yaml.safeLoad.bind(yaml),
      stringify: yaml.safeDump.bind(yaml)
    };
    engines.json = {
      parse: JSON.parse.bind(JSON),
      stringify: function(obj, options2) {
        const opts = Object.assign({ replacer: null, space: 2 }, options2);
        return JSON.stringify(obj, opts.replacer, opts.space);
      }
    };
    engines.javascript = {
      parse: function parse(str, options, wrap) {
        try {
          if (wrap !== false) {
            str = "(function() {\nreturn " + str.trim() + ";\n}());";
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
        throw new Error("stringifying JavaScript is not supported");
      }
    };
  }
});

// ../work/jonschlinkert__gray-matter/lib/utils.js
var require_utils = __commonJS({
  "../work/jonschlinkert__gray-matter/lib/utils.js"(exports2) {
    "use strict";
    var stripBom = require("strip-bom-string");
    var typeOf = require("kind-of");
    exports2.define = function(obj, key, val) {
      Reflect.defineProperty(obj, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: val
      });
    };
    exports2.isBuffer = function(val) {
      return typeOf(val) === "buffer";
    };
    exports2.isObject = function(val) {
      return typeOf(val) === "object";
    };
    exports2.toBuffer = function(input) {
      return typeof input === "string" ? Buffer.from(input) : input;
    };
    exports2.toString = function(input) {
      if (exports2.isBuffer(input)) return stripBom(String(input));
      if (typeof input !== "string") {
        throw new TypeError("expected input to be a string or buffer");
      }
      return stripBom(input);
    };
    exports2.arrayify = function(val) {
      return val ? Array.isArray(val) ? val : [val] : [];
    };
    exports2.startsWith = function(str2, substr, len) {
      if (typeof len !== "number") len = substr.length;
      return str2.slice(0, len) === substr;
    };
  }
});

// ../work/jonschlinkert__gray-matter/lib/defaults.js
var require_defaults = __commonJS({
  "../work/jonschlinkert__gray-matter/lib/defaults.js"(exports2, module2) {
    "use strict";
    var engines3 = require_engines();
    var utils2 = require_utils();
    module2.exports = function(options2) {
      const opts = Object.assign({}, options2);
      opts.delimiters = utils2.arrayify(opts.delims || opts.delimiters || "---");
      if (opts.delimiters.length === 1) {
        opts.delimiters.push(opts.delimiters[0]);
      }
      opts.language = (opts.language || opts.lang || "yaml").toLowerCase();
      opts.engines = Object.assign({}, engines3, opts.parsers, opts.engines);
      return opts;
    };
  }
});

// ../work/jonschlinkert__gray-matter/lib/engine.js
var require_engine = __commonJS({
  "../work/jonschlinkert__gray-matter/lib/engine.js"(exports2, module2) {
    "use strict";
    module2.exports = function(name, options2) {
      let engine = options2.engines[name] || options2.engines[aliase(name)];
      if (typeof engine === "undefined") {
        throw new Error('gray-matter engine "' + name + '" is not registered');
      }
      if (typeof engine === "function") {
        engine = { parse: engine };
      }
      return engine;
    };
    function aliase(name) {
      switch (name.toLowerCase()) {
        case "js":
        case "javascript":
          return "javascript";
        case "coffee":
        case "coffeescript":
        case "cson":
          return "coffee";
        case "yaml":
        case "yml":
          return "yaml";
        default: {
          return name;
        }
      }
    }
  }
});

// ../work/jonschlinkert__gray-matter/lib/stringify.js
var require_stringify = __commonJS({
  "../work/jonschlinkert__gray-matter/lib/stringify.js"(exports2, module2) {
    "use strict";
    var typeOf = require("kind-of");
    var getEngine = require_engine();
    var defaults2 = require_defaults();
    module2.exports = function(file, data, options2) {
      if (data == null && options2 == null) {
        switch (typeOf(file)) {
          case "object":
            data = file.data;
            options2 = {};
            break;
          case "string":
            return file;
          default: {
            throw new TypeError("expected file to be a string or object");
          }
        }
      }
      const str2 = file.content;
      const opts = defaults2(options2);
      if (data == null) {
        if (!opts.data) return file;
        data = opts.data;
      }
      const language = file.language || opts.language;
      const engine = getEngine(language, opts);
      if (typeof engine.stringify !== "function") {
        throw new TypeError('expected "' + language + '.stringify" to be a function');
      }
      data = Object.assign({}, file.data, data);
      const open = opts.delimiters[0];
      const close = opts.delimiters[1];
      const matter2 = engine.stringify(data, options2).trim();
      let buf = "";
      if (matter2 !== "{}") {
        buf = newline(open) + newline(matter2) + newline(close);
      }
      if (typeof file.excerpt === "string" && file.excerpt !== "") {
        if (str2.indexOf(file.excerpt.trim()) === -1) {
          buf += newline(file.excerpt) + newline(close);
        }
      }
      return buf + newline(str2);
    };
    function newline(str2) {
      return str2.slice(-1) !== "\n" ? str2 + "\n" : str2;
    }
  }
});

// ../work/jonschlinkert__gray-matter/lib/excerpt.js
var require_excerpt = __commonJS({
  "../work/jonschlinkert__gray-matter/lib/excerpt.js"(exports2, module2) {
    "use strict";
    var defaults2 = require_defaults();
    module2.exports = function(file, options2) {
      const opts = defaults2(options2);
      if (file.data == null) {
        file.data = {};
      }
      if (typeof opts.excerpt === "function") {
        return opts.excerpt(file, opts);
      }
      const sep = file.data.excerpt_separator || opts.excerpt_separator;
      if (sep == null && (opts.excerpt === false || opts.excerpt == null)) {
        return file;
      }
      const delimiter = typeof opts.excerpt === "string" ? opts.excerpt : sep || opts.delimiters[0];
      const idx = file.content.indexOf(delimiter);
      if (idx !== -1) {
        file.excerpt = file.content.slice(0, idx);
      }
      return file;
    };
  }
});

// ../work/jonschlinkert__gray-matter/lib/to-file.js
var require_to_file = __commonJS({
  "../work/jonschlinkert__gray-matter/lib/to-file.js"(exports2, module2) {
    "use strict";
    var typeOf = require("kind-of");
    var stringify2 = require_stringify();
    var utils2 = require_utils();
    module2.exports = function(file) {
      if (typeOf(file) !== "object") {
        file = { content: file };
      }
      if (typeOf(file.data) !== "object") {
        file.data = {};
      }
      if (file.contents && file.content == null) {
        file.content = file.contents;
      }
      utils2.define(file, "orig", utils2.toBuffer(file.content));
      utils2.define(file, "language", file.language || "");
      utils2.define(file, "matter", file.matter || "");
      utils2.define(file, "stringify", function(data, options2) {
        if (options2 && options2.language) {
          file.language = options2.language;
        }
        return stringify2(file, data, options2);
      });
      file.content = utils2.toString(file.content);
      file.isEmpty = false;
      file.excerpt = "";
      return file;
    };
  }
});

// ../work/jonschlinkert__gray-matter/lib/parse.js
var require_parse = __commonJS({
  "../work/jonschlinkert__gray-matter/lib/parse.js"(exports2, module2) {
    "use strict";
    var getEngine = require_engine();
    var defaults2 = require_defaults();
    module2.exports = function(language, str2, options2) {
      const opts = defaults2(options2);
      const engine = getEngine(language, opts);
      if (typeof engine.parse !== "function") {
        throw new TypeError('expected "' + language + '.parse" to be a function');
      }
      return engine.parse(str2, opts);
    };
  }
});

// ../work/jonschlinkert__gray-matter/index.js
var fs = require("fs");
var sections = require("section-matter");
var defaults = require_defaults();
var stringify = require_stringify();
var excerpt = require_excerpt();
var engines2 = require_engines();
var toFile = require_to_file();
var parse2 = require_parse();
var utils = require_utils();
function matter(input, options2) {
  if (input === "") {
    return { data: {}, content: input, excerpt: "", orig: input };
  }
  let file = toFile(input);
  const cached = matter.cache[file.content];
  if (!options2) {
    if (cached) {
      file = Object.assign({}, cached);
      file.orig = cached.orig;
      return file;
    }
    matter.cache[file.content] = file;
  }
  return parseMatter(file, options2);
}
function parseMatter(file, options2) {
  const opts = defaults(options2);
  const open = opts.delimiters[0];
  const close = "\n" + opts.delimiters[1];
  let str2 = file.content;
  if (opts.language) {
    file.language = opts.language;
  }
  const openLen = open.length;
  if (!utils.startsWith(str2, open, openLen)) {
    excerpt(file, opts);
    return file;
  }
  if (str2.charAt(openLen) === open.slice(-1)) {
    return file;
  }
  str2 = str2.slice(openLen);
  const len = str2.length;
  const language = matter.language(str2, opts);
  if (language.name) {
    file.language = language.name;
    str2 = str2.slice(language.raw.length);
  }
  let closeIndex = str2.indexOf(close);
  if (closeIndex === -1) {
    closeIndex = len;
  }
  file.matter = str2.slice(0, closeIndex);
  const block = file.matter.replace(/^\s*#[^\n]+/gm, "").trim();
  if (block === "") {
    file.isEmpty = true;
    file.empty = file.content;
    file.data = {};
  } else {
    file.data = parse2(file.language, file.matter, opts);
  }
  if (closeIndex === len) {
    file.content = "";
  } else {
    file.content = str2.slice(closeIndex + close.length);
    if (file.content[0] === "\r") {
      file.content = file.content.slice(1);
    }
    if (file.content[0] === "\n") {
      file.content = file.content.slice(1);
    }
  }
  excerpt(file, opts);
  if (opts.sections === true || typeof opts.section === "function") {
    sections(file, opts.section);
  }
  return file;
}
matter.engines = engines2;
matter.stringify = function(file, data, options2) {
  if (typeof file === "string") file = matter(file, options2);
  return stringify(file, data, options2);
};
matter.read = function(filepath, options2) {
  const str2 = fs.readFileSync(filepath, "utf8");
  const file = matter(str2, options2);
  file.path = filepath;
  return file;
};
matter.test = function(str2, options2) {
  return utils.startsWith(str2, defaults(options2).delimiters[0]);
};
matter.language = function(str2, options2) {
  const opts = defaults(options2);
  const open = opts.delimiters[0];
  if (matter.test(str2)) {
    str2 = str2.slice(open.length);
  }
  const language = str2.slice(0, str2.search(/\r?\n/));
  return {
    raw: language,
    name: language ? language.trim() : ""
  };
};
matter.cache = {};
matter.clearCache = function() {
  matter.cache = {};
};
module.exports = matter;
