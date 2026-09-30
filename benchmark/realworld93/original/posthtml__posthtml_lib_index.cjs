var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/posthtml__posthtml/package.json
var require_package = __commonJS({
  "../work/posthtml__posthtml/package.json"(exports2, module2) {
    module2.exports = {
      name: "posthtml",
      version: "0.16.7",
      description: "HTML/XML processor",
      keywords: [
        "html",
        "xml",
        "postproccessor",
        "parser",
        "transform",
        "transformations",
        "manipulation",
        "preprocessor",
        "processor"
      ],
      main: "lib",
      types: "types/posthtml.d.ts",
      files: [
        "types",
        "lib"
      ],
      engines: {
        node: ">=12.0.0"
      },
      dependencies: {
        "posthtml-parser": "^0.11.0",
        "posthtml-render": "^3.0.0"
      },
      devDependencies: {
        "@commitlint/cli": "^16.2.1",
        "@commitlint/config-angular": "^16.2.1",
        c8: "^7.7.3",
        chai: "^4.3.4",
        "chai-as-promised": "^7.1.1",
        "chai-subset": "^1.6.0",
        "conventional-changelog-cli": "^2.1.1",
        husky: "^7.0.1",
        "jsdoc-to-markdown": "^7.0.1",
        "lint-staged": "^12.3.4",
        mocha: "^9.0.3",
        standard: "^16.0.2"
      },
      scripts: {
        prepare: "husky install",
        version: "conventional-changelog -i changelog.md -s -r 0 && git add changelog.md",
        test: "c8 mocha",
        "docs:api": "jsdoc2md lib/api.js > docs/api.md",
        "docs:core": "jsdoc2md lib/index.js > docs/core.md"
      },
      author: "Ivan Voischev <voischev.ivan@ya.ru>",
      contributors: [
        {
          name: "Ivan Voischev",
          email: "voischev.ivan@ya.ru"
        },
        {
          name: "Ivan Demidov",
          email: "scrum@list.ru"
        }
      ],
      homepage: "https://github.com/posthtml/posthtml",
      repository: "https://github.com/posthtml/posthtml.git",
      bugs: "https://github.com/posthtml/posthtml/issues",
      license: "MIT"
    };
  }
});

// ../work/posthtml__posthtml/lib/api.js
var require_api = __commonJS({
  "../work/posthtml__posthtml/lib/api.js"(exports2, module2) {
    "use strict";
    function Api2() {
      this.walk = walk;
      this.match = match;
    }
    function walk(cb) {
      return traverse(this, cb);
    }
    function match(expression, cb) {
      return Array.isArray(expression) ? traverse(this, (node) => {
        for (let i = 0; i < expression.length; i++) {
          if (compare(expression[i], node)) return cb(node);
        }
        return node;
      }) : traverse(this, (node) => {
        if (compare(expression, node)) return cb(node);
        return node;
      });
    }
    module2.exports = Api2;
    module2.exports.match = match;
    module2.exports.walk = walk;
    function traverse(tree, cb) {
      if (Array.isArray(tree)) {
        for (let i = 0; i < tree.length; i++) {
          tree[i] = traverse(cb(tree[i]), cb);
        }
      } else if (tree && typeof tree === "object" && Object.prototype.hasOwnProperty.call(tree, "content")) traverse(tree.content, cb);
      return tree;
    }
    function compare(expected, actual) {
      if (expected instanceof RegExp) {
        if (typeof actual === "object") return false;
        if (typeof actual === "string") return expected.test(actual);
      }
      if (typeof expected !== typeof actual) return false;
      if (typeof expected !== "object" || expected === null) {
        return expected === actual;
      }
      if (Array.isArray(expected)) {
        return expected.every((exp) => [].some.call(actual, (act) => compare(exp, act)));
      }
      return Object.keys(expected).every((key) => {
        const ao = actual[key];
        const eo = expected[key];
        if (typeof eo === "object" && eo !== null && ao !== null) {
          return compare(eo, ao);
        }
        if (typeof eo === "boolean") {
          return eo !== (ao == null);
        }
        return ao === eo;
      });
    }
  }
});

// ../work/posthtml__posthtml/lib/index.js
var pkg = require_package();
var Api = require_api();
var { parser } = require("posthtml-parser");
var { render } = require("posthtml-render");
var PostHTML = class {
  constructor(plugins) {
    this.version = pkg.version;
    this.name = pkg.name;
    this.plugins = typeof plugins === "function" ? [plugins] : plugins || [];
    this.source = "";
    this.messages = [];
    this.parser = parser;
    this.render = render;
    Api.call(this);
  }
  /**
  * @this posthtml
  * @param   {Function} plugin - A PostHTML plugin
  * @returns {Constructor} - this(PostHTML)
  *
  * **Usage**
  * ```js
  * ph.use((tree) => { tag: 'div', content: tree })
  *   .process('<html>..</html>', {})
  *   .then((result) => result))
  * ```
  */
  use(...args) {
    this.plugins.push(...args);
    return this;
  }
  /**
   * @param   {String} html - Input (HTML)
   * @param   {?Object} options - PostHTML Options
   * @returns {Object<{html: String, tree: PostHTMLTree}>} - Sync Mode
   * @returns {Promise<{html: String, tree: PostHTMLTree}>} - Async Mode (default)
   *
   * **Usage**
   *
   * **Sync**
   * ```js
   * ph.process('<html>..</html>', { sync: true }).html
   * ```
   *
   * **Async**
   * ```js
   * ph.process('<html>..</html>', {}).then((result) => result))
   * ```
   */
  process(tree, options = {}) {
    this.options = options;
    this.source = tree;
    if (options.parser) parser = this.parser = options.parser;
    if (options.render) render = this.render = options.render;
    tree = options.skipParse ? tree || [] : parser(tree, options);
    tree = [].concat(tree);
    if (options.sync === true) {
      this.plugins.forEach((plugin, index) => {
        _treeExtendApi(tree, this);
        let result;
        if (plugin.length === 2 || isPromise(result = plugin(tree))) {
          throw new Error(
            `Can\u2019t process contents in sync mode because of async plugin: ${plugin.name}`
          );
        }
        if (index !== this.plugins.length - 1 && !options.skipParse) {
          tree = [].concat(tree);
        }
        tree = result || tree;
      });
      return lazyResult(render, tree);
    }
    let i = 0;
    const next = (result, cb) => {
      _treeExtendApi(result, this);
      if (this.plugins.length <= i) {
        cb(null, result);
        return;
      }
      function _next(res2) {
        if (res2 && !options.skipParse) {
          res2 = [].concat(res2);
        }
        return next(res2 || result, cb);
      }
      const plugin = this.plugins[i++];
      if (plugin.length === 2) {
        plugin(result, (err2, res2) => {
          if (err2) return cb(err2);
          _next(res2);
        });
        return;
      }
      let err = null;
      const res = tryCatch(() => plugin(result), (e) => {
        err = e;
        return e;
      });
      if (err) {
        cb(err);
        return;
      }
      if (isPromise(res)) {
        res.then(_next).catch(cb);
        return;
      }
      _next(res);
    };
    return new Promise((resolve, reject) => {
      next(tree, (err, tree2) => {
        if (err) reject(err);
        else resolve(lazyResult(render, tree2));
      });
    });
  }
};
module.exports = (plugins) => new PostHTML(plugins);
function _treeExtendApi(t, _t) {
  if (typeof t === "object") {
    t = Object.assign(t, _t);
  }
}
function isPromise(promise) {
  return !!promise && typeof promise.then === "function";
}
function tryCatch(tryFn, catchFn) {
  try {
    return tryFn();
  } catch (err) {
    catchFn(err);
  }
}
function lazyResult(render2, tree) {
  return {
    get html() {
      return render2(tree, tree.options);
    },
    tree,
    messages: tree.messages
  };
}
