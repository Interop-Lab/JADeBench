const posthtml = require('posthtml');
const { parser } = require('posthtml-parser');
const { render } = require('posthtml-render');

class PostHTML {
  constructor(plugins) {
    this.plugins = plugins || [];
  }

  use(plugin) {
    this.plugins.push(plugin);
    return this;
  }

  process(tree) {
    return this.plugins.reduce((promise, plugin) => {
      return promise.then((result) => {
        return plugin(result);
      });
    }, Promise.resolve(tree));
  }
}

function createPostHTML(plugins) {
  return new PostHTML(plugins);
}

module.exports = createPostHTML;
