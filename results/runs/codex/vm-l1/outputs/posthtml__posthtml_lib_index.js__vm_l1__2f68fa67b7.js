'use strict'

const { parser } = require('posthtml-parser')
const { render } = require('posthtml-render')

const packageInfo = {
  name: 'posthtml',
  version: '0.16.7'
}

const Api = {
  walk(callback) {
    return this.map(node => {
      node = callback(node)

      if (Array.isArray(node)) {
        node = Api.walk.call(node, callback)
      } else if (node && Array.isArray(node.content)) {
        node.content = Api.walk.call(node.content, callback)
      }

      return node
    })
  },

  match(expression, callback) {
    const matches = (value, pattern) => {
      if (pattern instanceof RegExp) {
        return typeof value === 'string' && pattern.test(value)
      }

      if (pattern && typeof pattern === 'object') {
        return value != null && Object.keys(pattern).every(key => matches(value[key], pattern[key]))
      }

      return value === pattern
    }

    return Api.walk.call(this, node => {
      if (node && typeof node === 'object' && matches(node, expression)) {
        return callback(node)
      }

      return node
    })
  }
}

function treeExtendApi(tree, api) {
  Object.assign(tree, api)
}

function isPromise(value) {
  return Boolean(value && typeof value.then === 'function')
}

function tryCatch(callback, onError) {
  try {
    return callback()
  } catch (error) {
    onError(error)
  }
}

function lazyResult(renderer, tree) {
  return {
    html: renderer(tree),
    tree,
    messages: tree.messages
  }
}

class PostHTML {
  constructor(plugins) {
    this.version = packageInfo.version
    this.name = packageInfo.name
    this.plugins = typeof plugins === 'function' ? [plugins] : plugins || []
    this.source = ''
    this.messages = []
    this.parser = parser
    this.render = render
    this.walk = Api.walk
    this.match = Api.match
  }

  use(plugin) {
    this.plugins.push(plugin)
    return this
  }

  process(html, options) {
    this.source = html
    this.options = options || {}

    const parse = this.options.parser || this.parser
    const stringify = this.options.render || this.render
    const tree = this.options.skipParse ? [html] : parse(html, this.options)

    treeExtendApi(tree, this)

    const result = this.plugins.reduce((promise, plugin) => {
      return promise.then(currentTree => new Promise((resolve, reject) => {
        const pluginResult = tryCatch(() => plugin(currentTree), reject)

        if (isPromise(pluginResult)) {
          pluginResult.then(resolve, reject)
        } else {
          resolve(pluginResult || currentTree)
        }
      }).then(nextTree => {
        if (nextTree !== currentTree) {
          treeExtendApi(nextTree, this)
        }

        return nextTree
      }))
    }, Promise.resolve(tree))

    return result.then(currentTree => lazyResult(
      value => stringify(value, this.options),
      currentTree
    ))
  }
}

module.exports = plugins => new PostHTML(plugins)
