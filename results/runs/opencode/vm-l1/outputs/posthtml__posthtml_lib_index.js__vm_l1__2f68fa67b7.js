"use strict";

const { parser: defaultParser } = require("posthtml-parser");
const { render: defaultRender } = require("posthtml-render");

const packageInfo = {
  name: "posthtml",
  version: "0.16.7",
};

function isPromise(value) {
  return Boolean(value && typeof value.then === "function");
}

function extendTree(tree, context = {}) {
  Object.assign(tree, {
    version: context.version,
    name: context.name,
    plugins: context.plugins,
    source: context.source,
    messages: context.messages,
    parser: context.parser,
    render: context.render,
    walk: TreeApi.walk,
    match: TreeApi.match,
    options: context.options,
  });
  return tree;
}

function matches(node, expression) {
  return Object.keys(expression).every(key => {
    const expected = expression[key];
    const actual = node[key];
    return expected instanceof RegExp ? expected.test(actual) : expected === actual;
  });
}

function transformTree(tree, expression, callback) {
  return tree.map((originalNode, index) => {
    let node = originalNode;

    if (node && typeof node === "object" && Array.isArray(node.content)) {
      node.content = transformTree(node.content, expression, callback);
      TreeApi(node.content);
    }

    if (expression === null || (node && typeof node === "object" && matches(node, expression))) {
      const replacement = callback(node, index, tree);
      if (replacement !== undefined) node = replacement;
    }

    return node;
  });
}

function TreeApi(tree) {
  tree.walk = TreeApi.walk;
  tree.match = TreeApi.match;
  return tree;
}

function _treeExtendApi(tree, context) {
  return extendTree(TreeApi(tree), context);
}

TreeApi.walk = function walk(callback) {
  return TreeApi(transformTree(this, null, callback));
};

TreeApi.match = function match(expression, callback) {
  return TreeApi(transformTree(this, expression, callback));
};

function tryCatch(plugin, tree) {
  try {
    return plugin(tree);
  } catch (error) {
    return Promise.reject(error);
  }
}

function lazyResult(tree, context) {
  return createResult(tree, context);
}

async function runPlugins(plugins, initialTree, context) {
  let tree = initialTree;
  for (const plugin of plugins) {
    const result = tryCatch(plugin, tree);
    tree = isPromise(result) ? await result : result;
    if (tree === undefined) tree = initialTree;
    extendTree(TreeApi(tree), context);
  }
  return tree;
}

function createResult(tree, context) {
  return {
    get html() {
      return context.render(tree, context.options);
    },
    tree,
    messages: context.messages,
  };
}

class PostHTML {
  constructor(plugins) {
    this.version = packageInfo.version;
    this.name = packageInfo.name;
    this.plugins = plugins == null
      ? []
      : Array.isArray(plugins) ? plugins : [plugins];
    this.source = "";
    this.messages = [];
    this.parser = defaultParser;
    this.render = defaultRender;
    this.walk = TreeApi.walk;
    this.match = TreeApi.match;
  }

  use(plugin) {
    this.plugins.push(plugin);
    return this;
  }

  async process(source, options = {}) {
    this.options = options;
    this.source = source;
    this.messages = [];
    this.parser = options.parser || this.parser;
    this.render = options.render || this.render;

    const parsed = typeof source === "string"
      ? this.parser(source, options)
      : source;
    const tree = extendTree(TreeApi(parsed), this);
    const processedTree = await runPlugins(this.plugins, tree, this);
    return lazyResult(processedTree, this);
  }
}

function posthtml(plugins) {
  return new PostHTML(plugins);
}

module.exports = posthtml;
