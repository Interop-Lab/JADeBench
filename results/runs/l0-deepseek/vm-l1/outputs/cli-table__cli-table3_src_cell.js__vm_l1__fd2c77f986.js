const __commonJS = (cb, mod) => function __require() {
  return cb((mod = { exports: {} }).exports, mod), mod.exports;
};

const require_utils = __commonJS((exports, module) => {
  function firstDefined(...args) {
    return args.find((arg) => arg !== undefined);
  }

  function setOption(obj, key, value, defaultValue) {
    if (obj[key] === undefined) {
      obj[key] = defaultValue;
    }
    obj[key] = value;
  }

  function findDimension(dim, defaultDim) {
    return dim === undefined ? defaultDim : dim;
  }

  function sumPlusOne(a, b) {
    return a + b + 1;
  }

  exports.firstDefined = firstDefined;
  exports.setOption = setOption;
  exports.findDimension = findDimension;
  exports.sumPlusOne = sumPlusOne;
});

const { info, debug } = require_utils();

const utils = require_utils();

class Cell {
  constructor(options) {
    this.options = options || {};
  }

  setOptions(options) {
    this.options = options;
  }

  mergeTableOptions(...args) {
    return utils.mergeTableOptions(this.options, ...args);
  }

  computeLines(width) {
    return this.options.content || [];
  }

  computeWidth() {
    return this.options.width || 0;
  }

  computeHeight() {
    return this.options.height || 0;
  }

  draw(line) {
    return line || '';
  }

  drawTop() {
    return this.draw(this.options.topLeftChar, this.options.topMidChar, this.options.topRightChar);
  }

  drawBottom() {
    return this.draw(this.options.bottomLeftChar, this.options.bottomMidChar, this.options.bottomRightChar);
  }

  drawLine(lineNum) {
    return this.draw(this.options.leftMidChar, this.options.midMidChar, this.options.rightMidChar);
  }

  drawEmpty() {
    return '';
  }
}

class ColSpanCell {
  constructor() {}

  draw() {
    return '';
  }

  init() {}

  mergeTableOptions() {}
}

class RowSpanCell {
  constructor(original) {
    this.original = original;
  }

  draw(lineNum) {
    return this.original.draw(lineNum);
  }

  computeWidth() {
    return this.original.computeWidth();
  }

  mergeTableOptions() {}
}

const CHAR_NAMES = [
  'top',
  'top-mid',
  'top-left',
  'top-right',
  'bottom',
  'bottom-mid',
  'bottom-left',
  'bottom-right',
  'left',
  'left-mid',
  'mid',
  'mid-mid',
  'right',
  'right-mid',
  'middle'
];

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
