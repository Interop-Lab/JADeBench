const postcss = require("postcss");

class InlineStyle {
  constructor(options) {
    this.options = options;
  }

  process(node) {
    return node;
  }

  apply(node, value) {
    return node;
  }

  toString() {
    return "[object InlineStyle]";
  }
}

module.exports = {
  default: InlineStyle
};
