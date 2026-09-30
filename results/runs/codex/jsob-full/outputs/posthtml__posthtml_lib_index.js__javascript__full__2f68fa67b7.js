'use strict';

const { parser: defaultParser } = require('posthtml-parser');
const { render: defaultRender } = require('posthtml-render');

function isPromise(value) {
  return Boolean(value) && typeof value.then === 'function';
}

function walk(tree, callback) {
  if (Array.isArray(tree)) {
    for (let index = 0; index < tree.length; index += 1) {
      tree[index] = walk(callback(tree[index]), callback);
    }
  } else if (tree && typeof tree === 'object' && Object.prototype.hasOwnProperty.call(tree, 'content')) {
    tree.content = walk(tree.content, callback);
  }
  return tree;
}

function match(selector, callback) {
  return walk(this, (node) => {
    if (Array.isArray(selector)) {
      for (const pattern of selector) {
        if (matches(pattern, node)) return callback(node);
      }
    } else if (matches(selector, node)) {
      return callback(node);
    }
    return node;
  });
}

function matches(selector, node) {
  if (selector instanceof RegExp) return typeof node === 'string' && selector.test(node);
  if (typeof selector !== typeof node) return false;
  if (selector === null || node === null || typeof selector !== 'object') return selector === node;
  if (Array.isArray(selector)) {
    return selector.every((item) => [].some.call(node, (candidate) => matches(item, candidate)));
  }
  return Object.keys(selector).every((key) => {
    const expected = selector[key];
    const actual = node[key];
    if (typeof expected === 'function') return expected(actual);
    if (expected && typeof expected === 'object' && actual !== null) return matches(expected, actual);
    return actual === expected;
  });
}

function extendTreeApi(tree, api) {
  if (tree && typeof tree === 'object') Object.assign(tree, api);
}

function createLazyResult(render, tree) {
  return {
    get html() {
      return render(tree, tree.messages);
    },
    tree,
    messages: tree.messages,
  };
}

function createApi() {
  this.walk = walk;
  this.match = match;
}

class PostHTML {
  constructor(plugins) {
    this.version = '0.16.7';
    this.name = 'posthtml';
    this.plugins = typeof plugins === 'function' ? [plugins] : plugins || [];
    this.source = '';
    this.parser = defaultParser;
    this.render = defaultRender;
    createApi.call(this);
    this.messages = [];
  }

  use(...plugins) {
    this.plugins.push(...plugins);
    return this;
  }

  process(source, options = {}) {
    this.options = options;
    this.source = source;
    let parser = this.parser;
    let render = this.render;
    if (options.parser) parser = this.parser = options.parser;
    if (options.render) render = this.render = options.render;

    let tree = options.skipParse ? source || [] : parser(source, options);
    tree = [].concat(tree);

    if (options.sync === true) {
      this.plugins.forEach((plugin, index) => {
        extendTreeApi(tree, this);
        let result = plugin(tree);
        if (plugin.length === 2 || isPromise(result)) {
          throw new Error(`Cannot process contents in sync mode because of async plugin: ${plugin.name}`);
        }
        if (index !== this.plugins.length - 1 && !options.skipParse) tree = [].concat(tree);
        tree = result || tree;
      });
      return createLazyResult(render, tree);
    }

    let index = 0;
    return new Promise((resolve, reject) => {
      const next = (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (result) tree = result;
        if (index >= this.plugins.length) {
          resolve(createLazyResult(render, tree));
          return;
        }
        if (!options.skipParse) tree = [].concat(tree);
        const plugin = this.plugins[index++];
        extendTreeApi(tree, this);
        if (plugin.length === 2) {
          plugin(tree, next);
          return;
        }
        try {
          const pluginResult = plugin(tree);
          if (isPromise(pluginResult)) pluginResult.then((value) => next(null, value), next);
          else next(null, pluginResult);
        } catch (pluginError) {
          next(pluginError);
        }
      };
      next(null, tree);
    });
  }
}

module.exports = (options) => new PostHTML(options);
