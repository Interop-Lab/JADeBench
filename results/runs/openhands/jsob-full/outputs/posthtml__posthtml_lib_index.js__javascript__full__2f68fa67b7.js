'use strict';

const { parser: defaultParser } = require('posthtml-parser');
const { render: defaultRender } = require('posthtml-render');

const packageInfo = {
  name: 'posthtml',
  version: '0.16.7',
};

let parser = defaultParser;
let render = defaultRender;

function Api() {
  this.walk = walk;
  this.match = match;
}

function walk(callback) {
  return walkTree(this, callback);
}

function match(expression, callback) {
  if (Array.isArray(expression)) {
    return walkTree(this, (node) => {
      for (let index = 0; index < expression.length; index += 1) {
        if (matches(expression[index], node)) return callback(node);
      }
      return node;
    });
  }

  return walkTree(this, (node) => (matches(expression, node) ? callback(node) : node));
}

function walkTree(tree, callback) {
  if (Array.isArray(tree)) {
    for (let index = 0; index < tree.length; index += 1) {
      tree[index] = walkTree(callback(tree[index]), callback);
    }
  } else if (
    tree
    && typeof tree === 'object'
    && Object.prototype.hasOwnProperty.call(tree, 'content')
  ) {
    walkTree(tree.content, callback);
  }

  return tree;
}

function matches(pattern, value) {
  if (pattern instanceof RegExp) {
    if (typeof value === 'object') return false;
    if (typeof value === 'string') return pattern.test(value);
  }

  if (typeof pattern !== typeof value) return false;
  if (typeof pattern !== 'object' || pattern === null) return pattern === value;

  if (Array.isArray(pattern)) {
    return pattern.every((patternItem) => (
      [].some.call(value, (valueItem) => matches(patternItem, valueItem))
    ));
  }

  return Object.keys(pattern).every((key) => {
    const actual = value[key];
    const expected = pattern[key];

    if (typeof expected === 'object' && expected !== null && actual !== null) {
      return matches(expected, actual);
    }
    if (typeof expected === 'boolean') return expected !== (actual == null);
    return actual === expected;
  });
}

class PostHTML {
  constructor(plugins) {
    this.version = packageInfo.version;
    this.name = packageInfo.name;
    this.plugins = typeof plugins === 'function' ? [plugins] : plugins || [];
    this.source = '';
    this.messages = [];
    this.parser = parser;
    this.render = render;
    Api.call(this);
  }

  use(...plugins) {
    this.plugins.push(...plugins);
    return this;
  }

  process(source, options = {}) {
    this.options = options;
    this.source = source;

    if (options.parser) parser = this.parser = options.parser;
    if (options.render) render = this.render = options.render;

    let tree = options.skipParse ? source || [] : parser(source, options);
    tree = [].concat(tree);

    if (options.sync === true) {
      this.plugins.forEach((plugin, index) => {
        extendTreeApi(tree, this);

        let result;
        if (plugin.length === 2 || isPromise(result = plugin(tree))) {
          throw new Error(
            `Can’t process contents in sync mode because of async plugin: ${plugin.name}`,
          );
        }

        if (index !== this.plugins.length - 1 && !options.skipParse) {
          tree = [].concat(tree);
        }
        tree = result || tree;
      });

      return createResult(render, tree);
    }

    let pluginIndex = 0;
    const runPlugin = (currentTree, done) => {
      extendTreeApi(currentTree, this);

      if (this.plugins.length <= pluginIndex) {
        done(null, currentTree);
        return;
      }

      const continueWith = (result) => {
        if (result && !options.skipParse) result = [].concat(result);
        runPlugin(result || currentTree, done);
      };

      const plugin = this.plugins[pluginIndex++];
      if (plugin.length === 2) {
        plugin(currentTree, (error, result) => {
          if (error) done(error);
          else continueWith(result);
        });
        return;
      }

      let pluginError = null;
      const result = tryCatch(
        () => plugin(currentTree),
        (error) => {
          pluginError = error;
          return error;
        },
      );

      if (pluginError) {
        done(pluginError);
        return;
      }

      if (isPromise(result)) {
        result.then(continueWith).catch(done);
        return;
      }

      continueWith(result);
    };

    return new Promise((resolve, reject) => {
      runPlugin(tree, (error, resultTree) => {
        if (error) reject(error);
        else resolve(createResult(render, resultTree));
      });
    });
  }
}

function extendTreeApi(tree, api) {
  if (typeof tree === 'object') Object.assign(tree, api);
}

function isPromise(value) {
  return Boolean(value) && typeof value.then === 'function';
}

function tryCatch(callback, onError) {
  try {
    return callback();
  } catch (error) {
    return onError(error);
  }
}

function createResult(renderer, tree) {
  return {
    get html() {
      return renderer(tree, tree.options);
    },
    tree,
    messages: tree.messages,
  };
}

module.exports = (plugins) => new PostHTML(plugins);
