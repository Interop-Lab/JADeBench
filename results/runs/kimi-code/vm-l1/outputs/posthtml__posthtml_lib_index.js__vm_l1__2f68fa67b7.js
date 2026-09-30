'use strict'

const { parser: defaultParser } = require('posthtml-parser')
const { render: defaultRender } = require('posthtml-render')

const packageInfo = {
  name: 'posthtml',
  version: '0.16.7'
}

function matchesValue(actual, expected) {
  if (expected instanceof RegExp) return expected.test(actual)

  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object') return false
    return Object.keys(expected).every(key => matchesValue(actual[key], expected[key]))
  }

  return actual === expected
}

function matchesExpression(node, expression) {
  if (typeof expression === 'function') return expression(node)
  return matchesValue(node, expression)
}

function walk(callback) {
  for (let index = 0; index < this.length; index++) {
    let node = callback(this[index])

    if (node && typeof node === 'object' && Array.isArray(node.content)) {
      node.content.walk = walk
      node.content.match = match
      node.content.walk(callback)
    }

    this[index] = node
  }

  return this
}

function match(expression, callback) {
  return walk.call(this, node => {
    if (node && typeof node === 'object' && matchesExpression(node, expression)) {
      return callback(node)
    }
    return node
  })
}

function extendTreeApi(tree, context) {
  if (typeof tree === 'string') tree = [tree]
  if (!tree || (typeof tree !== 'object' && typeof tree !== 'function')) return tree

  Object.assign(tree, {
    version: context.version,
    name: context.name,
    plugins: context.plugins,
    source: context.source,
    messages: context.messages,
    parser: context.parser,
    render: context.render,
    walk,
    match,
    options: context.options
  })

  return tree
}

function isPromise(value) {
  return Boolean(value && typeof value.then === 'function')
}

function applyPlugin(plugin, tree) {
  return plugin(tree) || tree
}

function createResult(tree, render, options) {
  return {
    get html() {
      return render(tree, options)
    },
    tree,
    messages: tree.messages
  }
}

class PostHTML {
  constructor(plugins) {
    this.version = packageInfo.version
    this.name = packageInfo.name
    this.plugins = plugins || []
    if (typeof this.plugins === 'function') this.plugins = [this.plugins]
    this.source = ''
    this.messages = []
    this.parser = defaultParser
    this.render = defaultRender
    this.walk = walk
    this.match = match
  }

  use(plugin) {
    if (plugin !== undefined) this.plugins.push(plugin)
    return this
  }

  process(source, options = {}) {
    this.options = options
    this.parser = options.parser || defaultParser
    this.render = options.render || defaultRender
    this.source = source
    this.messages = []

    const parsedTree = this.parser(source, options)

    if (options.sync === true) {
      if (this.plugins.length === 0) return createResult(parsedTree, this.render)

      let tree = parsedTree
      for (const plugin of this.plugins) {
        const transformedTree = applyPlugin(plugin, extendTreeApi(tree, this))
        if (isPromise(transformedTree)) {
          throw new Error(`Can’t process contents in sync mode because of async plugin: ${plugin.name || ''}`)
        }
        tree = transformedTree
      }
      return createResult(tree, this.render, this.options)
    }

    const initialTree = extendTreeApi(parsedTree, this)
    return this.plugins
      .reduce(
        (result, plugin) => result.then(currentTree => applyPlugin(plugin, extendTreeApi(currentTree, this))),
        Promise.resolve(initialTree)
      )
      .then(processedTree => createResult(extendTreeApi(processedTree, this), this.render, this.options))
  }
}

module.exports = plugins => new PostHTML(plugins)
