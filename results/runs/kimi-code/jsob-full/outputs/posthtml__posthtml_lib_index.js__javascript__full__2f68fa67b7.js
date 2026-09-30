'use strict';

const { parser: defaultParser } = require('posthtml-parser');
const { render: defaultRender } = require('posthtml-render');

function extendTree(tree, api) {
  if (tree && typeof tree === 'object') Object.assign(tree, api);
  return tree;
}

function matches(actual, expected) {
  if (expected instanceof RegExp) return expected.test(actual);
  if (typeof expected === 'function') return expected(actual);
  if (Array.isArray(expected)) {
    return expected.some(candidate => matches(actual, candidate));
  }
  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object') return false;
    return Object.keys(expected).every(key => matches(actual[key], expected[key]));
  }
  return actual === expected;
}

function createTreeApi() {
  const api = {
    walk(callback) {
      const visit = node => {
        let replacement = callback(node);
        if (replacement === undefined) replacement = node;

        if (Array.isArray(replacement)) {
          return replacement.map(visit);
        }
        if (replacement && typeof replacement === 'object' && 'content' in replacement) {
          replacement.content = [].concat(replacement.content).map(visit);
        }
        return replacement;
      };

      const result = this.map(visit);
      return extendTree(result, api);
    },

    match(expression, callback) {
      return this.walk(node => matches(node, expression) ? callback(node) : node);
    },
  };

  return api;
}

function prepareTree(tree, messages) {
  const normalizedTree = [].concat(tree == null ? [] : tree);
  normalizedTree.messages = messages || (tree && tree.messages) || [];
  return extendTree(normalizedTree, createTreeApi());
}

function isPromise(value) {
  return Boolean(value) && typeof value.then === 'function';
}

function createResult(render, tree, options) {
  return {
    get html() {
      return render(tree, options);
    },
    tree,
    messages: tree.messages,
  };
}

function runPlugin(plugin, tree) {
  return plugin(tree);
}

const packageInfo = {
  name: 'posthtml',
  version: '0.16.7',
};

class PostHTML {
  constructor(plugins) {
    this.name = packageInfo.name;
    this.version = packageInfo.version;
    this.parser = defaultParser;
    this.render = defaultRender;
    this.messages = [];
    this.plugins = typeof plugins === 'function' ? [plugins] : plugins || [];
    this.source = '';
  }

  use(...plugins) {
    this.plugins.push(...plugins);
    return this;
  }

  process(html, options = {}) {
    this.options = options;
    this.source = html;
    if (options.parser) this.parser = options.parser;
    if (options.render) this.render = options.render;

    const parsed = options.skipParse ? html || [] : this.parser(html, options);
    const tree = prepareTree(parsed, this.messages);

    if (options.sync === true) {
      let currentTree = tree;

      for (const plugin of this.plugins) {
        const result = runPlugin(plugin, currentTree);
        if (isPromise(result)) {
          throw new Error(
            `Can’t process contents in sync mode because of async plugin: ${plugin.name}`,
          );
        }
        currentTree = prepareTree(result, currentTree.messages);
      }

      this.messages = currentTree.messages;
      return createResult(this.render, currentTree, options);
    }

    const processing = this.plugins.reduce(
      (chain, plugin) => chain.then(currentTree => {
        const result = runPlugin(plugin, currentTree);
        return Promise.resolve(result).then(nextTree =>
          prepareTree(nextTree, currentTree.messages),
        );
      }),
      Promise.resolve(tree),
    );

    return processing.then(result => {
      this.messages = result.messages;
      return createResult(this.render, result, options);
    });
  }
}

module.exports = plugins => new PostHTML(plugins);
