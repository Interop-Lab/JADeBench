const ansiPattern = /\u001b\[((?:\d*;){0,5}\d*)m/g;
const ansiPatternWithoutGroups = /\u001b\[(?:\d*;){0,5}\d*m/g;

const utils = {
  strLen(value) {
    return String(value).replace(ansiPatternWithoutGroups, '').length;
  },

  wordWrap(width, value, wrapOnWordBoundary = true) {
    const text = String(value);
    if (width <= 0) return [text];

    const lines = [];
    for (const line of text.split('\n')) {
      if (this.strLen(line) <= width) {
        lines.push(line);
        continue;
      }

      let remaining = line;
      while (this.strLen(remaining) > width) {
        let breakAt = width;
        if (wrapOnWordBoundary) {
          const boundary = remaining.lastIndexOf(' ', width);
          if (boundary > 0) breakAt = boundary;
        }
        lines.push(remaining.slice(0, breakAt));
        remaining = remaining.slice(breakAt).replace(/^ +/, '');
      }
      lines.push(remaining);
    }
    return lines;
  },

  truncate(value, width, placeholder = '…') {
    const text = String(value);
    if (this.strLen(text) <= width) return text;

    const targetWidth = Math.max(0, width - this.strLen(placeholder));
    let result = '';
    for (const character of text) {
      if (this.strLen(result + character) > targetWidth) break;
      result += character;
    }
    return result + placeholder;
  },

  colorize(value, color) {
    return `\u001b[${color}m${value}\u001b[0m`;
  },

  addMarkup(value) {
    return value.match(/#[0-9a-fA-F]{3,6}/)?.[0] || '';
  }
};

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function setOption(target, defaults, name, overrides) {
  const parts = name.split('-');
  if (parts.length > 1) {
    const key = parts.map((part, index) =>
      index === 0 ? part : part[0].toUpperCase() + part.slice(1)
    ).join('');
    overrides[key] = firstDefined(
      target[key],
      target[name],
      defaults[key],
      defaults[name]
    );
  } else {
    overrides[name] = firstDefined(target[name], defaults[name]);
  }
}

function findDimension(dimensions, index, span) {
  let total = dimensions[index];
  for (let offset = 1; offset < span; offset++) {
    total += 1 + dimensions[index + offset];
  }
  return total;
}

function sumPlusOne(values, start, end) {
  let total = 0;
  for (let index = start; index <= end; index++) {
    total += values[index] + 1;
  }
  return total;
}

const CHAR_NAMES = [
  'top', 'topMid', 'topLeft', 'topRight', 'bottom',
  'bottomMid', 'bottomLeft', 'bottomRight', 'left', 'leftMid',
  'mid', 'midMid', 'right', 'rightMid', 'middle'
];

class Cell {
  constructor(cell) {
    this.init(cell);
    this.x = null;
    this.y = null;
  }

  init(cell) {
    if (typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean') {
      cell = { content: String(cell) };
    }
    cell = cell || {};
    this.options = cell;

    const content = cell.content;
    if (typeof content === 'number' || typeof content === 'boolean') {
      this.content = String(content);
    } else if (!content) {
      this.content = cell.content || '';
    } else if (typeof content === 'string') {
      this.content = content;
    } else {
      throw new Error(`Unknown content type: ${typeof content}`);
    }

    this.colSpan = cell.colSpan || 1;
    this.rowSpan = cell.rowSpan || 1;
    this.width = cell.width || 0;
    this.height = cell.height || 0;

    if (cell.hlines) {
      Object.defineProperty(this, 'hlines', {
        get() {
          return this.options.hlines || '';
        }
      });
    }
  }

  mergeTableOptions(cell, tableOptions, x, y) {
    this.x = x;
    this.y = y;

    const cellOptions = this.options || {};
    const tableChars = tableOptions.chars || {};
    const chars = {};
    CHAR_NAMES.forEach((name) => setOption(cellOptions, tableChars, name, chars));
    this.chars = chars;

    const defaults = tableOptions.style || {};
    const style = cellOptions.style || {};
    const mergedStyle = {};
    setOption(style, defaults, 'head', mergedStyle);
    setOption(style, defaults, 'border', mergedStyle);
    this.style = mergedStyle;

    this.width = cell.width || tableOptions.colWidths?.[x] || 0;
    this.height = cell.height || tableOptions.rowHeights?.[y] || 0;
  }

  computeHeight(options) {
    const { wordWrap = options.wordWrap || false } = this.options;
    if (this.width && wordWrap) {
      const width = Math.max(1, this.width - this.paddingLeft - this.paddingRight);
      const { wrapOnWordBoundary = true } = this.options;
      return this.lines(utils.wordWrap(width, this.content, wrapOnWordBoundary)).length;
    }
    return this.lines(this.content.split('\n')).length;
  }

  lines(content) {
    const lines = Array.isArray(content) ? content : String(content).split('\n');
    if (!this.style?.border) return lines;
    return lines.map((line) => line);
  }

  toString() {
    return this.content;
  }

  truncate(width, placeholder = '…') {
    return utils.truncate(this.content, width, placeholder);
  }

  wrap(width, wrapOnWordBoundary = true) {
    return utils.wordWrap(width, this.content, wrapOnWordBoundary);
  }

  get contentHeight() {
    return this.content.split('\n').length;
  }
}

class ColSpanCell {
  constructor() {}

  init() {
    return '';
  }

  toString() {
    return '';
  }

  draw() {
    return '';
  }
}

class RowSpanCell {
  constructor(cell) {
    this.cell = cell;
  }

  init() {}

  draw() {
    return '';
  }

  toString() {
    return '';
  }
}

Cell.ColSpanCell = ColSpanCell;
Cell.RowSpanCell = RowSpanCell;
module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
