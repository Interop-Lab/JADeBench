const { parser } = require('posthtml-parser');
const { render } = require('posthtml-render');

function isPromise(value) {
  return value != null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof value.then === 'function';
}

function tryCatch(fn, ...args) {
  try {
    return Promise.resolve(fn(...args));
  } catch (error) {
    return Promise.reject(error);
  }
}

function walkTree(tree, callback) {
  if (!Array.isArray(tree)) {
    return callback(tree);
  }

  for (let index = 0; index < tree.length; index += 1) {
    const node = tree[index];
    const result = callback(node, index);

    if (result !== undefined) {
      tree[index] = result;
    }

    const current = tree[index];
    if (current && typeof current === 'object' && Array.isArray(current.content)) {
      walkTree(current.content, callback);
    }
  }

  return tree;
}

function matches(node, selector) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    return false;
  }

  if (typeof selector === 'string') {
    return node.tag === selector;
  }

  if (!selector || typeof selector !== 'object') {
    return false;
  }

  return Object.keys(selector).every(key => {
    const expected = selector[key];

    if (key === 'attrs') {
      if (!node.attrs) {
        return false;
      }

      return Object.keys(expected).every(attribute => {
        return node.attrs[attribute] === expected[attribute];
      });
    }

    return node[key] === expected;
  });
}

function extendTree(tree) {
  if (!Array.isArray(tree)) {
    return tree;
  }

  if (typeof tree.walk !== 'function') {
    Object.defineProperty(tree, 'walk', {
      configurable: true,
      value(callback) {
        walkTree(this, callback);
        return this;
      }
    });
  }

  if (typeof tree.match !== 'function') {
    Object.defineProperty(tree, 'match', {
      configurable: true,
      value(selector, callback) {
        this.walk((node, index) => {
          if (!matches(node, selector)) {
            return node;
          }

          const result = callback(node, index);
          return result === undefined ? node : result;
        });

        return this;
      }
    });
  }

  if (typeof tree.matchAll !== 'function') {
    Object.defineProperty(tree, 'matchAll', {
      configurable: true,
      value(selector) {
        const result = [];

        this.walk(node => {
          if (matches(node, selector)) {
            result.push(node);
          }
          return node;
        });

        return result;
      }
    });
  }

  return tree;
}

class PostHTML {
  constructor(options) {
    this.options = Object.assign({}, options || {});
    this.plugins = [];
    this.messages = [];
  }

  use(plugin) {
    this.plugins.push(plugin);
    return this;
  }

  process(input, options) {
    const settings = Object.assign({}, this.options, options || {});
    const initialTree = Array.isArray(input)
      ? extendTree(input)
      : parser(input, settings);

    extendTree(initialTree);

    let chain = Promise.resolve(initialTree);

    for (const plugin of this.plugins) {
      chain = chain.then(tree => {
        const result = typeof plugin === 'function'
          ? plugin(tree, settings)
          : plugin.process(tree, settings);

        return Promise.resolve(result).then(nextTree => {
          if (nextTree === undefined) {
            return tree;
          }

          return extendTree(nextTree);
        });
      });
    }

    return chain.then(tree => ({
      html: render(tree, settings),
      tree,
      messages: this.messages
    }));
  }
}

module.exports = input => new PostHTML(input);
