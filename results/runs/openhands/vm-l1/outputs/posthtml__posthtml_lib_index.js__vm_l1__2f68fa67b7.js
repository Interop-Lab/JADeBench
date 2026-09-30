'use strict';

let { parser } = require('posthtml-parser');
let { render } = require('posthtml-render');

const packageMetadata = {
  name: 'posthtml',
  version: '0.16.7',
  description: 'HTML/XML processor',
  keywords: [
    'html',
    'xml',
    'postproccessor',
    'parser',
    'transform',
    'transformations',
    'manipulation',
    'preprocessor',
    'processor',
  ],
  main: 'lib',
  types: 'types/posthtml.d.ts',
  files: ['types', 'lib'],
  engines: {
    node: '>=12.0.0',
  },
  dependencies: {
    'posthtml-parser': '^0.11.0',
    'posthtml-render': '^3.0.0',
  },
  devDependencies: {
    '@commitlint/cli': '^16.2.1',
    '@commitlint/config-angular': '^16.2.1',
    c8: '^7.7.3',
    chai: '^4.3.4',
    'chai-as-promised': '^7.1.1',
    'chai-subset': '^1.6.0',
    'conventional-changelog-cli': '^2.1.1',
    husky: '^7.0.1',
    'jsdoc-to-markdown': '^7.0.1',
    'lint-staged': '^12.3.4',
    mocha: '^9.0.3',
    standard: '^16.0.2',
  },
  scripts: {
    prepare: 'husky install',
    version: 'conventional-changelog -i changelog.md -s -r 0 && git add changelog.md',
    test: 'c8 mocha',
    'docs:api': 'jsdoc2md lib/api.js > docs/api.md',
    'docs:core': 'jsdoc2md lib/index.js > docs/core.md',
  },
  author: 'Ivan Voischev <voischev.ivan@ya.ru>',
  contributors: [
    {
      name: 'Ivan Voischev',
      email: 'voischev.ivan@ya.ru',
    },
    {
      name: 'Ivan Demidov',
      email: 'scrum@list.ru',
    },
  ],
  homepage: 'https://github.com/posthtml/posthtml',
  repository: 'https://github.com/posthtml/posthtml.git',
  bugs: 'https://github.com/posthtml/posthtml/issues',
  license: 'MIT',
};

function installTreeApi() {
  this.walk = walk;
  this.match = match;
}

function walk(callback) {
  return walkTree(this, callback);
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
    tree.content = walkTree(tree.content, callback);
  }

  return tree;
}

function match(expression, callback) {
  if (Array.isArray(expression)) {
    return walkTree(this, (node) => {
      for (let index = 0; index < expression.length; index += 1) {
        if (matches(expression[index], node)) {
          return callback(node);
        }
      }

      return node;
    });
  }

  return walkTree(this, (node) => (matches(expression, node) ? callback(node) : node));
}

function matches(pattern, value) {
  if (pattern instanceof RegExp) {
    if (typeof value === 'object') {
      return false;
    }

    if (typeof value === 'string') {
      return pattern.test(value);
    }
  }

  if (typeof pattern !== typeof value) {
    return false;
  }

  if (typeof pattern !== 'object' || pattern === null) {
    return pattern === value;
  }

  if (Array.isArray(pattern)) {
    return pattern.every((expectedItem) =>
      [].some.call(value, (actualItem) => matches(expectedItem, actualItem)),
    );
  }

  return Object.keys(pattern).every((key) => {
    const expected = pattern[key];
    const actual = value[key];

    if (typeof actual === 'object' && actual !== null && expected !== null) {
      return matches(expected, actual);
    }

    if (typeof actual === 'boolean') {
      return actual !== (expected == null);
    }

    return expected === actual;
  });
}

function extendTreeApi(tree, api) {
  if (typeof tree === 'object') {
    tree = Object.assign(tree, api);
  }
}

function isPromise(value) {
  return !!value && typeof value.then === 'function';
}

function tryCatch(callback, onError) {
  try {
    return callback();
  } catch (error) {
    onError(error);
  }
}

function createLazyResult(renderTree, tree) {
  return {
    get html() {
      return renderTree(tree, tree.options);
    },
    tree,
    messages: tree.messages,
  };
}

class PostHTML {
  constructor(plugins) {
    this.version = packageMetadata.version;
    this.name = packageMetadata.name;
    this.plugins = typeof plugins === 'function' ? [plugins] : plugins || [];
    this.source = '';
    this.messages = [];
    this.parser = parser;
    this.render = render;

    installTreeApi.call(this);
  }

  use(...plugins) {
    this.plugins.push(...plugins);
    return this;
  }

  process(source) {
    let options = arguments[1];
    if (options === undefined) {
      options = {};
    }

    this.options = options;
    this.source = source;

    if (options.parser) {
      this.parser = parser = options.parser;
    }

    if (options.render) {
      this.render = render = options.render;
    }

    let tree;
    if (options.skipParse) {
      tree = source || [];
    } else {
      tree = parser(source, options);
    }
    tree = [].concat(tree);

    if (options.sync === true) {
      this.plugins.forEach((plugin, index) => {
        extendTreeApi(tree, this);

        let result;
        if (plugin.length === 2 || isPromise((result = plugin(tree)))) {
          throw new Error(
            `Can’t process contents in sync mode because of async plugin: ${plugin.name}`,
          );
        }

        if (index !== this.plugins.length - 1 && !options.skipParse) {
          tree = [].concat(tree);
        }

        tree = result || tree;
      });

      return createLazyResult(render, tree);
    }

    let pluginIndex = 0;

    const processNext = (currentTree, callback) => {
      const continueWith = (result) => {
        if (result && !options.skipParse) {
          result = [].concat(result);
        }

        processNext(result || currentTree, callback);
      };

      extendTreeApi(currentTree, this);

      if (this.plugins.length <= pluginIndex) {
        callback(null, currentTree);
        return;
      }

      const plugin = this.plugins[pluginIndex++];
      if (plugin.length === 2) {
        plugin(currentTree, (error, result) => {
          if (error) {
            return callback(error);
          }

          continueWith(result);
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
        callback(pluginError);
        return;
      }

      if (isPromise(result)) {
        result.then(continueWith).catch(callback);
        return;
      }

      continueWith(result);
    };

    return new Promise((resolve, reject) => {
      const finish = (error, processedTree) => {
        if (error) {
          reject(error);
        } else {
          resolve(createLazyResult(render, processedTree));
        }
      };

      processNext(tree, finish);
    });
  }
}

module.exports = (plugins) => new PostHTML(plugins);
