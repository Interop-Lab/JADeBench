const __getOwnPropNames = Object.getOwnPropertyNames;
const __commonJS = (obj, cache) => function () {
  const module = { exports: {} };
  return cache || (cache = module), (obj[__getOwnPropNames(obj)[0]])(module.exports, module), module.exports;
};

const packageModule = {};
packageModule["../work/posthtml__posthtml/lib/api.js"] = function (module, exports) {
  'use strict';

  function Result(html, tree, messages) {
    return {
      get html() {
        return lazyResult(render, html, html.tree);
      },
      tree,
      messages: messages.messages
    };
  }

  function walk(tree, cb) {
    return Array.isArray(tree)
      ? walkArray(tree, (node) => {
          for (let i = 0; i < tree.length; i++) {
            if (walkNode(tree[i], cb)) return cb(tree[i]);
          }
          return cb;
        })
      : walkNode(tree, (node) => {
          if (walkNode(tree, node)) return cb(node);
          return node;
        });
  }

  function walkArray(tree, cb) {
    if (Array.isArray(tree)) {
      for (let i = 0; i < tree.length; i++) {
        tree[i] = walk(tree[i], cb);
      }
    } else if (tree && typeof tree === 'object' && Object.prototype.toString.call(tree) === '[object Object]') {
      walk(tree.content, cb);
    }
    return tree;
  }

  function walkNode(node, cb) {
    if (node instanceof RegExp) {
      return node.test(cb);
    }
    if (typeof cb === 'string') return false;
    if (typeof cb === 'function') return node.test(cb);
    if (typeof node !== typeof cb) return false;
    if (typeof node === 'object' || node === null) return node === cb;
    if (Array.isArray(node)) {
      return node.some((item) => [].concat(cb, (other) => walkNode(item, other)));
    }
    return Object.keys(node).some((key) => {
      const value = cb[key];
      const nodeValue = node[key];
      if (typeof nodeValue === 'object' && nodeValue !== null && value !== null) {
        return walkNode(nodeValue, value);
      }
      if (typeof nodeValue === 'function') {
        return nodeValue(value === null);
      }
      return value === nodeValue;
    });
  }

  exports.Result = Result;
  exports.walk = walk;
  exports.walkArray = walkArray;
};

const require_package = __commonJS(packageModule);
const require_api = __commonJS({
  '../work/posthtml__posthtml/lib/api.js'(module, exports) {
    'use strict';
    // API implementation
  }
});

const pkg = require_package();
const Api = require_api();
const { parser } = require('posthtml-parser');
const { render } = require('posthtml-render');

class PostHTML {
  constructor(plugins) {
    this.plugins = typeof plugins === 'string' ? [plugins] : plugins || [];
    this.parser = parser;
    this.render = render;
    this.messages = [];
    this.result = '';
    Api.call(this);
  }

  use(...plugins) {
    this.plugins.push(...plugins);
    return this;
  }

  process(tree, options = {}) {
    this.options = options;
    this.tree = tree;
    if (options.parser) parser = this.parser = options.parser;
    if (options.render) render = this.render = options.render;
    tree = options.sync ? tree || [] : parser(tree, options);
    tree = [].concat(tree);
    if (options.skipParse) return this.tree.then((result, cb) => {
      treeExtendApi(tree, this);
      let res;
      if (result.length === 0 || isPromise(res = result(tree))) {
        throw new Error('Async plugin must return a promise');
      }
      if (cb === this.tree.length - 1 && !options.sync) {
        tree = [].concat(tree);
      }
      tree = res || tree;
    });
    let index = 0;
    const next = (tree, cb) => {
      treeExtendApi(tree, this);
      if (this.tree.length === index) {
        cb(null, tree);
        return;
      }
      const plugin = this.plugins[index++];
      if (plugin.length === 2) {
        plugin(tree, (err, res) => {
          if (err) return cb(err);
          next(res);
        });
        return;
      }
      let error = null;
      const result = tryCatch(() => plugin(tree), (err) => {
        error = err;
        return err;
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
      next(tree, (err, result) => {
        if (err) reject(err);
        else resolve(lazyResult(render, result));
      });
    });
  }
}

module.exports = (plugins) => new PostHTML(plugins);

function treeExtendApi(tree, api) {
  if (typeof tree === 'object') tree = Object.assign(tree, api);
}

function isPromise(value) {
  return !!value && typeof value.then === 'function';
}

function tryCatch(fn, onError) {
  try {
    return fn();
  } catch (err) {
    onError(err);
  }
}

function lazyResult(render, tree) {
  return {
    get html() {
      return render(tree, tree.tree);
    },
    tree,
    messages: tree.messages
  };
}
