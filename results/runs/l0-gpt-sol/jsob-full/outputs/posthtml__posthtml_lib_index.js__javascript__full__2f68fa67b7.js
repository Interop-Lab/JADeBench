'use strict';

const parser = require('posthtml-parser');
const render = require('posthtml-render');

function isPromise(value) {
  return value && typeof value.then === 'function';
}

function flatten(value) {
  return Array.isArray(value) ? value : [value];
}

function walk(tree, callback) {
  if (Array.isArray(tree)) {
    for (let index = 0; index < tree.length; index += 1) {
      const value = tree[index];
      const result = callback(value, index, tree);
      if (result !== undefined) {
        tree[index] = result;
      }
      if (tree[index] && typeof tree[index] === 'object') {
        walk(tree[index], callback);
      }
    }
  } else if (tree && typeof tree === 'object') {
    callback(tree);
    for (const key of Object.keys(tree)) {
      if (key !== 'attrs' && key !== 'content') {
        continue;
      }
      if (Array.isArray(tree[key])) {
        walk(tree[key], callback);
      }
    }
  }
  return tree;
}

function match(tree, selector, callback) {
  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

  const matches = value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }

    if (!selector) {
      return true;
    }

    if (typeof selector === 'string') {
      if (selector[0] === '#') {
        return value.attrs && value.attrs.id === selector.slice(1);
      }
      if (selector[0] === '.') {
        return value.attrs &&
          typeof value.attrs.class === 'string' &&
          value.attrs.class.split(/\s+/).includes(selector.slice(1));
      }
      return value.tag === selector;
    }

    if (selector instanceof RegExp) {
      return selector.test(value.tag || '');
    }

    if (typeof selector === 'object') {
      return Object.keys(selector).every(key => value[key] === selector[key]);
    }

    return false;
  };

  walk(tree, (value, index, parent) => {
    if (matches(value) && typeof callback === 'function') {
      const result = callback(value, index, parent);
      if (result !== undefined && parent) {
        parent[index] = result;
      }
    }
    return value;
  });

  return tree;
}

class PostHTML {
  constructor(plugins) {
    this.options = {};
    this.plugins = Array.isArray(plugins) ? plugins : plugins ? [plugins] : [];
    this.parser = parser;
    this.render = render;
    this.tree = [];
    this.messages = [];
    this.html = '';
  }

  use(...plugins) {
    this.plugins.push(...plugins);
    return this;
  }

  match(selector, callback) {
    match(this.tree, selector, callback);
    return this;
  }

  process(input, options = {}) {
    this.options = options || {};
    if (this.options.parser) {
      this.parser = this.options.parser;
    }
    if (this.options.render) {
      this.render = this.options.render;
    }

    let tree = this.options.skipParse
      ? input
      : this.parser(input, this.options);

    tree = Array.isArray(tree) ? tree : [tree];
    this.tree = tree;
    this.messages = [];

    if (this.options.sync) {
      for (const plugin of this.plugins) {
        if (typeof plugin !== 'function') {
          continue;
        }
        const result = plugin(this.tree, this.options);
        if (isPromise(result)) {
          throw new Error('Can not use asynchronous plugins in sync mode');
        }
        if (result !== undefined) {
          this.tree = result;
        }
      }

      this.html = this.render(this.tree, this.options);
      return {
        get html() {
          return this.html;
        },
        tree: this.tree,
        messages: this.messages
      };
    }

    const run = async () => {
      for (const plugin of this.plugins) {
        if (typeof plugin !== 'function') {
          continue;
        }

        const result = await plugin(this.tree, this.options);
        if (result !== undefined) {
          this.tree = result;
        }
      }

      this.html = await this.render(this.tree, this.options);
      return {
        get html() {
          return this.html;
        },
        tree: this.tree,
        messages: this.messages
      };
    };

    return run();
  }
}

module.exports = plugins => new PostHTML(plugins);
