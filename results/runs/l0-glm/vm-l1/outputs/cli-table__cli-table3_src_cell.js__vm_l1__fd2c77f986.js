'use strict';

var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

var require_debug = __commonJS({
  "../work/cli-table__cli-table3/src/debug.js"(exports, module) {
    let info;
    let debug;
    if (typeof process !== 'undefined' && process.env.CLI_TABLE_DEBUG) {
      let lastWriteTime = {};
      let writeCount = 0;
      info = function(...args) {
        writeCount++;
        let stack = new Error().stack;
        let caller = stack.split('\n')[3].trim();
        let now = Date.now();
        if (now - (lastWriteTime[caller] || 0) > 100) {
          writeCount = 1;
        }
        lastWriteTime[caller] = now;
        process.stderr.write(`[${writeCount}] ${caller}: ${args.join(' ')}\n`);
      };
      debug = function(...args) {
        let stack = new Error().stack;
        let caller = stack.split('\n')[3].trim();
        process.stderr.write(`[${caller}]: ${args.join(' ')}\n`);
      };
    } else {
      info = function() {};
      debug = function() {};
    }
    module.exports = { info, debug };
  }
});

var require_utils = __commonJS({
  "../work/cli-table__cli-table3/src/utils.js"(exports, module) {
    const { info, debug } = require_debug();
    
    function firstDefined(...args) {
      for (let i = 0; i < args.length; i++) {
        if (args[i] !== undefined) {
          return args[i];
        }
      }
      return undefined;
    }
    
    function setOption(objA, objB, propName, defaultValue) {
      let value = firstDefined(objA[propName], objB[propName], defaultValue);
      objA[propName] = value;
      objA[propName] = value;
      return value;
    }
    
    function findDimension(dimensionTable, defaultDimension, dimensionIndex, callback) {
      if (dimensionTable[dimensionIndex] === undefined) {
        return defaultDimension;
      }
      let dimension = dimensionTable[dimensionIndex];
      if (typeof dimension === 'function') {
        return dimension();
      }
      return dimension;
    }
    
    function sumPlusOne(numbers, index) {
      let sum = 0;
      for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i];
      }
      return sum + 1;
    }
    
    module.exports = { firstDefined, setOption, findDimension, sumPlusOne, info, debug };
  }
});

var { info, debug } = require_utils();
var utils = require_utils();

var Cell = class Cell {
  constructor(options) {
    this.setOptions(options);
  }
  
  setOptions(options) {
    if (options.colSpan && options.colSpan > 1) {
      return new ColSpanCell(options);
    }
    this.options = options;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.content = options.content || '';
    this.chars = options.chars;
    this.truncate = options.truncate || '…';
    this.style = options.style;
    this.hAlign = options.hAlign;
    this.vAlign = options.vAlign;
  }
  
  mergeTableOptions(tableOptions, cells) {
    if (!tableOptions) {
      return;
    }
    this.chars = this.chars || tableOptions.chars;
    this.truncate = this.truncate || tableOptions.truncate;
    this.style = this.style || tableOptions.style;
    this.hAlign = this.hAlign || tableOptions.hAlign;
    this.vAlign = this.vAlign || tableOptions.vAlign;
  }
  
  draw(lineNum, borderWidth) {
    return this.drawLine(lineNum, borderWidth);
  }
  
  drawLine(lineNum, borderWidth) {
    let content = this.content;
    let width = this.width;
    let height = this.height;
    let chars = this.chars;
    let style = this.style;
    
    let lines = content.split('\n');
    let line = lines[lineNum] || '';
    
    if (line.length > width) {
      line = line.substring(0, width - 1) + this.truncate;
    }
    
    let padding = ' '.repeat(width - line.length);
    let leftBorder = borderWidth > 0 ? chars.left : '';
    let rightBorder = borderWidth > 0 ? chars.right : '';
    
    let hAlign = this.hAlign || 'left';
    if (hAlign === 'center') {
      let leftPad = Math.floor(padding.length / 2);
      let rightPad = padding.length - leftPad;
      line = ' '.repeat(leftPad) + line + ' '.repeat(rightPad);
    } else if (hAlign === 'right') {
      line = padding + line;
    } else {
      line = line + padding;
    }
    
    return leftBorder + line + rightBorder;
  }
  
  drawTop() {
    return this.drawLine(0, 1);
  }
  
  drawBottom() {
    return this.drawLine(this.height - 1, 1);
  }
  
  drawEmpty() {
    return this.drawLine(0, 0);
  }
  
  drawEmptyWithBorder() {
    return this.drawLine(0, 1);
  }
};

var ColSpanCell = class ColSpanCell {
  constructor() {}
  
  draw(lineNum) {
    return '';
  }
  
  init() {}
  
  mergeTableOptions() {}
};

var RowSpanCell = class RowSpanCell {
  constructor(originalCell) {
    this.originalCell = originalCell;
  }
  
  init(tableOptions) {
    this.originalCell.init(tableOptions);
    this.options = this.originalCell.options;
    this.x = this.originalCell.x;
    this.y = this.originalCell.y;
    this.width = this.originalCell.width;
    this.height = this.originalCell.height;
    this.chars = this.originalCell.chars;
    this.truncate = this.originalCell.truncate;
    this.style = this.originalCell.style;
    this.hAlign = this.originalCell.hAlign;
    this.vAlign = this.originalCell.vAlign;
  }
  
  draw(lineNum) {
    return this.originalCell.draw(lineNum);
  }
  
  mergeTableOptions() {}
};

var CHAR_NAMES = [
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
  'right',
  'right-mid',
  'mid',
  'mid-mid',
  'middle'
];

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
