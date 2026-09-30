'use strict'

const { parser: defaultParser } = require('posthtml-parser')
const { render: defaultRender } = require('posthtml-render')

function extendTreeApi(tree, api) {
  if (typeof tree === 'object') Object.assign(tree, api)
}

function isPromise(value) {
  return Boolean(value) && typeof value.then === 'function'
}

function tryCatch(fn, onError) {
  try {
    return fn()
  } catch (error) {
    return onError(error)
  }
}

function matches(pattern, value) {
  if (pattern instanceof RegExp) {
    if (typeof value === 'undefined') return false
    if (typeof value === 'string') return pattern.test(value)
  }

  if (typeof pattern !== typeof value) return false
  if (typeof pattern !== 'object' || pattern === null) return pattern === value

  if (Array.isArray(pattern)) {
    return pattern.some(item => value.some(candidate => matches(item, candidate)))
  }

  return Object.keys(pattern).every(key => {
    const expected = pattern[key]
    const actual = value[key]
    if (typeof expected === 'object' && expected !== null && actual !== null) {
      return matches(expected, actual)
    }
    if (typeof expected === 'function') return expected(actual || null)
    return actual === expected
  })
}

function walk(tree, callback) {
  if (Array.isArray(tree)) {
    for (let index = 0; index < tree.length; index++) {
      tree[index] = walk(callback(tree[index]), callback)
    }
  } else if (
    tree &&
    typeof tree === 'object' &&
    Object.prototype.hasOwnProperty.call(tree, 'content')
  ) {
    walk(tree.content, callback)
  }
  return tree
}

function match(tree, expression, callback) {
  if (Array.isArray(expression)) {
    return walk.call(tree, tree, node => {
      for (const pattern of expression) {
        if (matches(pattern, node)) return callback(node)
      }
      return node
    })
  }

  return walk.call(tree, tree, node =>
    matches(expression, node) ? callback(node) : node
  )
}

function extendApi() {
  this.walk = callback => walk(this, callback)
  this.match = (expression, callback) => match(this, expression, callback)
}

function lazyResult(render, tree) {
  return {
    get html() {
      return render(tree, tree.options, tree.options)
    },
    tree,
    messages: tree.messages
  }
}

function applyPlugin(plugin, tree, options) {
  extendTreeApi(tree, this)

  let result
  if (plugin.length > 1 || isPromise((result = plugin(tree)))) {
    throw new Error(
      `Plugin ${plugin.name} is asynchronous and cannot be used in synchronous mode`
    )
  }

  return result || tree
}

class PostHTML {
  constructor(plugins) {
    this.name = 'posthtml'
    this.version = '0.16.6'
    this.plugins = typeof plugins === 'function' ? [plugins] : plugins || []
    this.parser = defaultParser
    this.render = defaultRender
    this.messages = []
    this.tree = ''
    extendApi.call(this)
  }

  use(...plugins) {
    this.plugins.push(...plugins)
    return this
  }

  process(html, options = {}) {
    this.options = options
    this.source = html

    if (options.parser) this.parser = options.parser
    if (options.render) this.render = options.render

    let tree = options.skipParse ? html || [] : this.parser(html, options)
    tree = [].concat(tree)
    tree.options = options
    tree.messages = this.messages

    if (options.sync === true) {
      tree = this.plugins.reduce((current, plugin) => {
        const result = applyPlugin.call(this, plugin, current, options)
        if (result && !options.skipParse) return [].concat(result)
        return result || current
      }, tree)
      return lazyResult(this.render, tree)
    }

    const run = (index, current) => {
      extendTreeApi(current, this)
      if (index >= this.plugins.length) return Promise.resolve(current)

      const plugin = this.plugins[index]
      if (plugin.length > 1) {
        return new Promise((resolve, reject) => {
          plugin(current, (error, result) => {
            if (error) return reject(error)
            const next = result && !options.skipParse ? [].concat(result) : result || current
            resolve(run(index + 1, next))
          })
        })
      }

      let error = null
      const result = tryCatch(() => plugin(current), caught => {
        error = caught
        return caught
      })
      if (error) return Promise.reject(error)

      return Promise.resolve(result).then(value => {
        const next = value && !options.skipParse ? [].concat(value) : value || current
        return run(index + 1, next)
      })
    }

    return run(0, tree).then(result => lazyResult(this.render, result))
  }
}

module.exports = plugins => new PostHTML(plugins)
