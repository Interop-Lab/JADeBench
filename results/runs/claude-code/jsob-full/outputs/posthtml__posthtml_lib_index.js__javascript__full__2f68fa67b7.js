'use strict';

const { parser: defaultParser } = require('posthtml-parser');
const { render: defaultRender } = require('posthtml-render');

const packageInfo = {
  name: 'posthtml',
  version: '0.16.6'
};

function isPromise(value) {
  return Boolean(value) && typeof value.then === 'function';
}

function tryCatch(callback, onError) {
  try {
    return callback();
  } catch (error) {
    onError(error);
  }
}

function extendTreeApi(tree, api) {
  if (typeof tree === 'object') {
    Object.assign(tree, api);
  }
}

function matchExpression(node, expression) {
  if (expression instanceof RegExp) {
    return Boolean(node) && typeof node.tag === 'string' && expression.test(node.tag);
  }

  if (typeof expression === 'function') {
    return expression(node);
  }

  if (typeof node !== typeof expression) {
    return false;
  }

  if (typeof node !== 'object' || node === null) {
    return node === expression;
  }

  if (Array.isArray(node)) {
    return node.some(item => matchExpression(item, expression));
  }

  return Object.keys(expression).every(key => {
    const expected = expression[key];
    const actual = node[key];

    if (typeof actual === 'object' && actual !== null && expected !== null) {
      return matchExpression(actual, expected);
    }

    if (typeof actual === 'function') {
      return actual(expected || null);
    }

    return expected === actual;
  });
}

function walkTree(tree, callback) {
  if (Array.isArray(tree)) {
    for (let index = 0; index < tree.length; index += 1) {
      tree[index] = walkTree(callback(tree[index]), callback);
    }
  } else if (
    tree &&
    typeof tree === 'object' &&
    Object.prototype.hasOwnProperty.call(tree, 'content')
  ) {
    walkTree(tree.content, callback);
  }

  return tree;
}

function createTreeApi() {
  function walk(callback) {
    return walkTree(this, callback);
  }

  function match(expression, callback) {
    if (Array.isArray(expression)) {
      return walkTree(this, node => {
        for (const pattern of expression) {
          if (matchExpression(node, pattern)) {
            return callback(node);
          }
        }
        return node;
      });
    }

    return walkTree(this, node => (
      matchExpression(node, expression) ? callback(node) : node
    ));
  }

  return { walk, match };
}

function createResult(render, tree) {
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
    this.parser = defaultParser;
    this.render = defaultRender;
    this.options = {};
    this.messages = [];
    this.tree = '';
    Object.assign(this, createTreeApi());
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

    if (options.parser) {
      parser = this.parser = options.parser;
    }
    if (options.render) {
      render = this.render = options.render;
    }

    let tree = options.skipParse ? source || [] : parser(source, options);
    tree = [].concat(tree);

    if (options.sync === true) {
      tree = this.plugins.reduce((currentTree, plugin, index) => {
        extendTreeApi(currentTree, this);

        let result;
        if (plugin.length > 1 || isPromise(result = plugin(currentTree))) {
          throw new Error(
            `Async plugin can't be used with sync mode: ${plugin.name || 'anonymous'}`
          );
        }

        if (index === this.plugins.length - 1 && !options.skipParse) {
          currentTree = [].concat(currentTree);
        }

        return result || currentTree;
      }, tree);

      return createResult(render, tree);
    }

    const runPlugin = (currentTree, index, done) => {
      extendTreeApi(currentTree, this);

      if (index >= this.plugins.length) {
        done(null, currentTree);
        return;
      }

      const plugin = this.plugins[index];
      const next = result => {
        if (result && !options.skipParse) {
          result = [].concat(result);
        }
        runPlugin(result || currentTree, index + 1, done);
      };

      if (plugin.length > 1) {
        plugin(currentTree, (error, result) => {
          if (error) {
            done(error);
          } else {
            next(result);
          }
        });
        return;
      }

      let caughtError = null;
      const result = tryCatch(
        () => plugin(currentTree),
        error => {
          caughtError = error;
          return error;
        }
      );

      if (caughtError) {
        done(caughtError);
        return;
      }

      if (isPromise(result)) {
        result.then(next).catch(done);
        return;
      }

      next(result);
    };

    return new Promise((resolve, reject) => {
      runPlugin(tree, 0, (error, resultTree) => {
        if (error) {
          reject(error);
        } else {
          resolve(createResult(render, resultTree));
        }
      });
    });
  }
}

module.exports = plugins => new PostHTML(plugins);
