const {parser} = require('posthtml-parser');
const {render} = require('posthtml-render');

class PostHTML {
  constructor(plugins) {
    this.plugins = plugins || [];
    this.version = pkg.version;
    this.api = new Api();
  }

  use(plugin) {
    this.plugins.push(plugin);
    return this;
  }

  process(tree, options) {
    options = options || {};
    tree = typeof tree === 'string' ? parser(tree, options) : tree;
    
    const result = new lazyResult((resolve, reject) => {
      tryCatch(() => {
        const exec = (plugin, tree) => {
          tree = this.api.extend(tree);
          if (isPromise(tree)) {
            return tree.then(tree => exec(plugin, tree));
          }
          const result = plugin(tree);
          return isPromise(result) ? result : result;
        };

        const run = (plugins, tree) => {
          if (!plugins.length) {
            return resolve(render(tree, options));
          }
          const [plugin, ...rest] = plugins;
          const result = exec(plugin, tree);
          if (isPromise(result)) {
            return result.then(tree => run(rest, tree)).catch(reject);
          }
          return run(rest, result);
        };

        run(this.plugins, tree);
      }, reject);
    });

    return result;
  }
}

function isPromise(obj) {
  return obj && typeof obj.then === 'function';
}

function tryCatch(fn, reject) {
  try {
    return fn();
  } catch (e) {
    return reject(e);
  }
}

function lazyResult(executor) {
  let state = 'pending';
  let value;
  let handlers = [];

  const resolve = (v) => {
    if (state !== 'pending') return;
    state = 'fulfilled';
    value = v;
    handlers.forEach(h => h.onFulfilled(value));
    handlers = [];
  };

  const reject = (e) => {
    if (state !== 'pending') return;
    state = 'rejected';
    value = e;
    handlers.forEach(h => h.onRejected(value));
    handlers = [];
  };

  executor(resolve, reject);

  return {
    then(onFulfilled, onRejected) {
      return new lazyResult((resolve, reject) => {
        const handler = {
          onFulfilled: (v) => {
            try {
              resolve(onFulfilled ? onFulfilled(v) : v);
            } catch (e) {
              reject(e);
            }
          },
          onRejected: (e) => {
            try {
              if (onRejected) {
                resolve(onRejected(e));
              } else {
                reject(e);
              }
            } catch (err) {
              reject(err);
            }
          }
        };

        if (state === 'pending') {
          handlers.push(handler);
        } else if (state === 'fulfilled') {
          handler.onFulfilled(value);
        } else {
          handler.onRejected(value);
        }
      });
    },
    catch(onRejected) {
      return this.then(null, onRejected);
    }
  };
}

function _treeExtendApi(tree, options) {
  return tree;
}

const pkg = {
  name: 'posthtml',
  version: '0.16.6',
  description: 'HTML/XML processor',
  main: 'lib/index.js',
  types: 'lib/index.d.ts',
  scripts: {
    test: 'npm run lint && npm run test:unit',
    'test:unit': 'c8 mocha',
    lint: 'standard',
    docs: 'jsdoc2md lib/*.js > docs/*.md'
  },
  repository: {
    type: 'git',
    url: 'git+https://github.com/posthtml/posthtml.git'
  },
  keywords: ['html', 'xml', 'posthtml', 'postproccessor', 'parser', 'transform'],
  author: 'Anton Tuzhik <ituzhik@gmail.com>',
  license: 'MIT',
  bugs: {
    url: 'https://github.com/posthtml/posthtml/issues'
  },
  homepage: 'https://github.com/posthtml/posthtml#readme',
  dependencies: {
    'posthtml-parser': '^0.11.0',
    'posthtml-render': '^3.0.0'
  },
  devDependencies: {
    c8: '^7.11.0',
    chai: '^4.3.6',
    'jsdoc-to-markdown': '^7.1.1',
    mocha: '^9.2.2',
    standard: '^17.0.0'
  }
};

class Api {
  constructor() {
    this.version = pkg.version;
  }

  extend(tree) {
    tree.walk = (cb) => {
      const walk = (node) => {
        if (typeof node === 'string') return cb(node);
        if (node && node.content) {
          node.content = node.content.map(walk).filter(Boolean);
        }
        return cb(node);
      };
      return walk(tree);
    };

    tree.match = (selector, cb) => {
      return tree.walk((node) => {
        if (typeof node === 'object' && node.tag === selector) {
          return cb(node);
        }
        return node;
      });
    };

    return tree;
  }
}

module.exports = (plugins) => new PostHTML(plugins);
