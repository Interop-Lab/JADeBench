var { parser } = require('posthtml-parser');
var { render } = require('posthtml-render');
var pkg = require('./package.json');
var Api = require('./lib/api.js');

function PostHTML(plugins) {
  function posthtml(html) {
    const result = new PostHTMLProcess(html, plugins);
    return result;
  }

  posthtml.use = function () {
    plugins = plugins.concat(Array.prototype.slice.call(arguments));
    return this;
  };

  posthtml.process = function (html, options) {
    return new PostHTMLProcess(html, plugins, options);
  };

  return posthtml;
}

class PostHTMLProcess {
  constructor(html, plugins, options) {
    this.html = html;
    this.plugins = plugins || [];
    this.options = options || {};
  }

  process() {
    const _this = this;
    return lazyResult(function () {
      const tree = parser(_this.html, _this.options);
      return tree;
    }, function (tree) {
      let result = tree;
      const plugins = _this.plugins;
      function next(i) {
        if (i >= plugins.length) {
          return lazyResult(function () {
            return render(result, _this.options);
          }, function (html) {
            return { html: html, tree: result };
          });
        }
        return lazyResult(function () {
          return plugins[i](result);
        }, function (res) {
          if (res !== undefined) result = res;
          return next(i + 1);
        });
      }
      return next(0);
    });
  }
}

module.exports = function (plugins) {
  return new PostHTML(plugins || []);
};

module.exports.version = pkg.version;

function lazyResult(getTree, getHtml) {
  let tree;
  let html;
  let processed = false;

  function process() {
    if (processed) return;
    processed = true;
    tree = getTree();
    return getHtml(tree);
  }

  return {
    get tree() {
      if (!processed) tree = getTree();
      return tree;
    },
    get html() {
      if (!html) html = process();
      return html;
    },
    then(onFulfilled, onRejected) {
      return Promise.resolve(this.html).then(onFulfilled, onRejected);
    },
    async: function () {
      return this;
    }
  };
}

function tryCatch(fn, handler) {
  try {
    return fn();
  } catch (e) {
    return handler(e);
  }
}

function isPromise(value) {
  return value && typeof value.then === 'function';
}

function _treeExtendApi(target, source) {
  if (!target || !source) return target;
  const keys = Object.keys(source);
  for (const key of keys) {
    if (key !== 'prototype' && key !== 'name') {
      try {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      } catch (e) {}
    }
  }
  return target;
}

var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (cb) => {
  let fn;
  return function () {
    if (!fn) fn = cb();
    return fn.apply(this, arguments);
  };
};

var require_package = __commonJS({ '../work/posthtml__posthtml/package.json'(module, exports) {
  module.exports = { "name": "posthtml", "version": "0.16.6" };
}});

var require_api = __commonJS({ '../work/posthtml__posthtml/lib/api.js'(module, exports) {
  'use strict';
  module.exports = Api;
}});

var pkg = require_package();
var Api = require_api();
