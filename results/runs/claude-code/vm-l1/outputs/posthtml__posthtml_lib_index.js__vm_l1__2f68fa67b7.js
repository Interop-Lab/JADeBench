'use strict';

const { parser: defaultParser } = require('posthtml-parser');
const { render: defaultRender } = require('posthtml-render');

const packageInfo = { name: 'posthtml', version: '0.16.7' };

const treeApi = {
  match(expression, callback) {
    return this.walk((node) => {
      if (!node || Array.isArray(node) || typeof node !== 'object') return node;

      const matches = Object.keys(expression).every((property) => {
        const expected = expression[property];
        const actual = node[property];

        if (expected instanceof RegExp) return expected.test(actual);
        if (expected && typeof expected === 'object') {
          if (Array.isArray(expected)) {
            return Array.isArray(actual) && expected.every((value, index) => value === actual[index]);
          }
          return actual != null && Object.keys(expected).every((key) => expected[key] === actual[key]);
        }
        return expected === actual;
      });

      return matches ? callback(node) : node;
    });
  },

  walk(callback) {
    const visit = (tree) => tree.map((node, index) => {
      if (Array.isArray(node)) return visit(node);

      const result = callback(node, index, tree);
      if (
        result &&
        typeof result === 'object' &&
        Object.prototype.hasOwnProperty.call(result, 'content')
      ) {
        result.content = visit(result.content);
      }
      return result;
    });

    return visit(this);
  }
};

function extendTree(tree, api) {
  if (tree && typeof tree === 'object') Object.assign(tree, api);
  return tree;
}

function isPromise(value) {
  return value != null && typeof value.then === 'function';
}

function lazyResult(render, tree) {
  return {
    get html() {
      return render(tree, tree.options);
    },
    tree,
    messages: tree.messages
  };
}

class PostHTML {
  constructor(plugins) {
    this.version = packageInfo.version;
    this.name = packageInfo.name;
    this.plugins = typeof plugins === 'function' ? [plugins] : plugins || [];
    this.source = '';
    this.messages = [];
    this.parser = defaultParser;
    this.render = defaultRender;
    Object.assign(this, treeApi);
  }

  use() {
    const plugins = Array.prototype.slice.call(arguments);
    this.plugins.push.apply(this.plugins, plugins);
    return this;
  }

  process(source, options = {}) {
    const parser = options.parser || this.parser;
    const render = options.render || this.render;
    const initialTree = options.skipParse ? source : parser(source, options);
    const tree = extendTree(initialTree.concat(), treeApi);

    tree.options = options;
    tree.source = source;
    tree.messages = [];

    const plugins = this.plugins.slice();
    const finish = (processedTree) => lazyResult(render, processedTree);

    const runSynchronously = () => {
      let processedTree = tree;
      for (const plugin of plugins) {
        const nextTree = plugin(processedTree);
        if (isPromise(nextTree)) {
          throw new Error(
            'Can’t process contents in sync mode because of async plugin: ' + plugin.name
          );
        }
        processedTree = extendTree(nextTree, treeApi);
      }
      return finish(processedTree);
    };

    if (options.sync) return runSynchronously();

    let processedTree = Promise.resolve(tree);
    for (const plugin of plugins) {
      processedTree = processedTree.then((resolvedTree) => (
        plugin(extendTree(resolvedTree, treeApi))
      ));
    }

    return processedTree.then((resolvedTree) => finish(extendTree(resolvedTree, treeApi)));
  }
}

module.exports = (plugins) => new PostHTML(plugins);
