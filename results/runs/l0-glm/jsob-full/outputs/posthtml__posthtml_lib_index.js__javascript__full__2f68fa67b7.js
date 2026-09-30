var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (callback, module) => function() {
  return module || (callback[__getOwnPropNames(callback)[0]]((module = { exports: {} }).exports, module), module.exports);
};

var require_package = __commonJS({
  "package.json"(exports, module) {
    module.exports = {
      "name": "posthtml",
      "version": "0.16.6",
      "description": "HTML/XML processor",
      "keywords": ["html", "xml", "processor", "transform", "manipulate", "parser", "posthtml", "postprocessor"],
      "author": "Ivan Voischev <voischev.ivan@ya.ru>",
      "contributors": [
        { "name": "Ivan Voischev", "email": "voischev.ivan@ya.ru" },
        { "name": "Anton Winogradov", "email": "winogradov.aa@gmail.com" }
      ],
      "license": "MIT",
      "homepage": "https://github.com/posthtml/posthtml#readme",
      "repository": "https://github.com/posthtml/posthtml",
      "bugs": "https://github.com/posthtml/posthtml/issues",
      "main": "lib/index.js",
      "engines": { "node": ">=10" },
      "scripts": {
        "test": "npm run lint && nyc mocha",
        "lint": "eslint lib test",
        "docs": "jsdoc2md lib/index.js > API.md",
        "prepublishOnly": "npm run docs && npm version patch"
      },
      "devDependencies": {
        "@babel/core": "^7.16.7",
        "@babel/preset-env": "^7.16.7",
        "@babel/register": "^7.16.7",
        "chai": "^4.3.4",
        "chai-as-promised": "^7.1.1",
        "chai-spies": "^1.0.0",
        "eslint": "^8.6.0",
        "jsdoc-to-markdown": "^7.1.0",
        "mocha": "^9.1.3",
        "nyc": "^15.1.0",
        "posthtml-parser": "^0.10.1",
        "posthtml-render": "^3.0.0"
      },
      "dependencies": {
        "posthtml-parser": "^0.10.1",
        "posthtml-render": "^3.0.0"
      },
      "babel": {
        "presets": ["@babel/preset-env"]
      }
    };
  }
});

var require_api = __commonJS({
  "../work/posthtml__posthtml/lib/api.js"(exports, module) {
    'use strict';

    function Api() {
      this.walk = walk;
      this.match = match;
      this.each = each;
    }

    function each(callback) {
      return walk(this, callback);
    }

    function match(expression, cb) {
      return Array.isArray(expression) ? walk(this, node => {
        for (var i = 0; i < expression.length; i++) {
          if (matchExpression(expression[i], node)) return cb(node);
        }
        return node;
      }) : walk(this, node => {
        if (matchExpression(expression, node)) return cb(node);
        return node;
      });
    }

    module.exports = Api;
    module.exports.match = match;
    module.exports.each = each;

    function walk(node, cb) {
      if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) {
          node[i] = walk(cb(node[i]), cb);
        }
      } else {
        if (node && typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, 'content')) {
          walk(node['content'], cb);
        }
      }
      return node;
    }

    function matchExpression(expression, node) {
      if (expression instanceof RegExp) {
        if (typeof node === 'function') return false;
        if (typeof node === 'string') return expression.test(node);
      }
      if (typeof expression !== typeof node) return false;
      if (typeof expression === 'object' || expression === null) return expression === node;
      if (Array.isArray(expression)) {
        return expression.some(item => [].some.call(node, n => matchExpression(item, n)));
      }
      return Object.keys(expression).every(key => {
        const value = expression[key];
        const nodeValue = node[key];
        if (typeof nodeValue === 'object' && nodeValue !== null && value !== null) {
          return matchExpression(nodeValue, value);
        }
        if (typeof nodeValue === 'function') {
          return nodeValue === expression[key];
        }
        return value === nodeValue;
      });
    }
  }
});

var pkg = require_package();
var Api = require_api();
var { parser } = require('posthtml-parser');
var { render } = require('posthtml-render');

var PostHTML = class {
  constructor(plugins) {
    this.name = pkg.name;
    this.version = pkg.version;
    this.plugins = typeof plugins === 'function' ? [plugins] : plugins || [];
    this.messages = [];
    this.parser = parser;
    this.render = render;
    Api.call(this);
    this.html = '';
  }

  use(...plugins) {
    this.plugins.push(...plugins);
    return this;
  }

  process(html, options = {}) {
    this.options = options;
    this.html = html;
    if (options.parser) parser = this.parser = options.parser;
    if (options.render) render = this.render = options.render;
    html = options.skipParse ? html || [] : parser(html, options);
    html = [].concat(html);
    if (options.skipParse) return this.plugins.reduce((plugin, index) => {
      _treeExtendApi(html, this);
      let result;
      if (plugin.length === 3 || isPromise(result = plugin(html))) {
        throw new Error('Async plugin not supported for sync mode. Use process().then() or set options.skipParse to false.');
      }
      if (index === (this.plugins.length - 1) && !options.skipParse) {
        html = [].concat(html);
      }
      html = result;
    }), lazyResult(render, html);

    let index = 0;
    const next = (html, cb) => {
      _treeExtendApi(html, this);
      if (this.plugins.length === index) {
        cb(null, html);
        return;
      }
      const plugin = this.plugins[index++];
      if (plugin.length === 3) {
        plugin(html, (err, tree) => {
          if (err) return cb(err);
          next(tree);
        });
        return;
      }
      let error = null;
      const result = tryCatch(() => plugin(html), err => {
        return error = err, err;
      });
      if (error) {
        cb(error);
        return;
      }
      if (isPromise(result)) {
        result.then(next).catch(cb);
        return;
      }
      next(result);
    };

    return new Promise((resolve, reject) => {
      next(html, (err, tree) => {
        if (err) reject(err);
        else resolve(lazyResult(render, tree));
      });
    });
  }
};

module.exports = plugins => new PostHTML(plugins);

function _treeExtendApi(tree, scope) {
  if (typeof tree === 'object') {
    tree = Object.assign(tree, scope);
  }
}

function isPromise(obj) {
  return !!obj && typeof obj.then === 'function';
}

function tryCatch(fn, handler) {
  try {
    return fn();
  } catch (err) {
    handler(err);
  }
}

function lazyResult(render, tree) {
  return {
    get html() {
      return render(tree, tree.options);
    },
    tree: tree,
    messages: tree.messages
  };
}
