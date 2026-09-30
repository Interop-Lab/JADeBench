const postcss = require("postcss");

class InlineStyle {
  constructor(options) {
    this.options = options;
  }

  process(css, opts) {
    return postcss(this.options.plugins).process(css, opts);
  }

  async processAsync(css, opts) {
    return postcss(this.options.plugins).process(css, opts);
  }

  toString() {
    return "InlineStyle";
  }
}

module.exports = InlineStyle;
