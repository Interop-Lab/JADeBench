const stringWidth = require('string-width');

// Debug collector
let debugMessages = [];
let debugLevel = 0;

function debug(message, level) {
  if (debugLevel >= level) debugMessages.push(message);
}

debug.WARN = 1;
debug.INFO = 2;
debug.DEBUG = 3;
debug.reset = () => {
  debugMessages = [];
};
debug.setDebugLevel = (level) => {
  debugLevel = level;
};
debug.warn = (message) => debug(message, debug.WARN);
debug.info = (message) => debug(message, debug.INFO);
debug.debug = (message) => debug(message, debug.DEBUG);
debug.debugMessages = () => debugMessages;

// Utilities
function ansiPattern(capture = false) {
  return capture
    ? /\x1b\[((?:\d*;){0,5}\d*)m/g
    : /\x1b\[(?:\d*;){0,5}\d*m/g;
}

function visibleWidth(value) {
  return String(value)
    .replace(ansiPattern(), '')
    .split('\n')
    .reduce((maximum, line) => Math.max(maximum, stringWidth(line)), 0);
}

function repeat(character, count) {
  return Array(count + 1).join(character);
}

const ansiStyles = {};

function registerAnsiStyle(name, onCode, offCode) {
  const on = `\x1b[${onCode}m`;
  const off = `\x1b[${offCode}m`;
  ansiStyles[on] = { set: name, to: true };
  ansiStyles[off] = { set: name, to: false };
  ansiStyles[name] = { on, off };
}

registerAnsiStyle('bold', 1, 22);
registerAnsiStyle('italics', 3, 23);
registerAnsiStyle('underline', 4, 24);
registerAnsiStyle('inverse', 7, 27);
registerAnsiStyle('strikethrough', 9, 29);

function updateAnsiState(state, match) {
  const code = match[1] ? parseInt(match[1].split(';')[0]) : 0;
  if ((code >= 30 && code <= 39) || (code >= 90 && code <= 97)) {
    state.lastForegroundAdded = match[0];
    return;
  }
  if ((code >= 40 && code <= 49) || (code >= 100 && code <= 107)) {
    state.lastBackgroundAdded = match[0];
    return;
  }
  if (code === 0) {
    for (const key in state) {
      if (Object.prototype.hasOwnProperty.call(state, key)) delete state[key];
    }
    return;
  }
  const style = ansiStyles[match[0]];
  if (style) state[style.set] = style.to;
}

function getAnsiState(value) {
  const pattern = ansiPattern(true);
  const state = {};
  let match = pattern.exec(value);
  while (match !== null) {
    updateAnsiState(state, match);
    match = pattern.exec(value);
  }
  return state;
}

function closeAnsiStyles(state, value) {
  const background = state.lastBackgroundAdded;
  const foreground = state.lastForegroundAdded;
  delete state.lastBackgroundAdded;
  delete state.lastForegroundAdded;
  Object.keys(state).forEach((name) => {
    if (state[name]) value += ansiStyles[name].off;
  });
  if (background && background !== '\x1b[49m') value += '\x1b[49m';
  if (foreground && foreground !== '\x1b[39m') value += '\x1b[39m';
  return value;
}

function reopenAnsiStyles(state, value) {
  const background = state.lastBackgroundAdded;
  const foreground = state.lastForegroundAdded;
  delete state.lastBackgroundAdded;
  delete state.lastForegroundAdded;
  Object.keys(state).forEach((name) => {
    if (state[name]) value = ansiStyles[name].on + value;
  });
  if (background && background !== '\x1b[49m') value = background + value;
  if (foreground && foreground !== '\x1b[39m') value = foreground + value;
  return value;
}

function truncatePlain(value, width) {
  if (value.length === visibleWidth(value)) return value.substr(0, width);
  while (visibleWidth(value) > width) value = value.slice(0, -1);
  return value;
}

function truncateAnsi(value, width) {
  const pattern = ansiPattern(true);
  const segments = value.split(ansiPattern());
  const state = {};
  let segmentIndex = 0;
  let currentWidth = 0;
  let result = '';
  while (currentWidth < width) {
    const match = pattern.exec(value);
    let segment = segments[segmentIndex++];
    if (currentWidth + visibleWidth(segment) > width) {
      segment = truncatePlain(segment, width - currentWidth);
    }
    result += segment;
    currentWidth += visibleWidth(segment);
    if (currentWidth < width) {
      if (!match) break;
      result += match[0];
      updateAnsiState(state, match);
    }
  }
  return closeAnsiStyles(state, result);
}

function wrapOnWords(width, value) {
  let separator;
  const lines = [];
  const parts = value.split(/(\s+)/g);
  let currentLine = [];
  let currentWidth = 0;
  for (let index = 0; index < parts.length; index += 2) {
    const word = parts[index];
    let nextWidth = currentWidth + visibleWidth(word);
    if (currentWidth > 0 && separator) nextWidth += separator.length;
    if (nextWidth > width) {
      if (currentWidth !== 0) lines.push(currentLine.join(''));
      currentLine = [word];
      currentWidth = visibleWidth(word);
    } else {
      currentLine.push(separator || '', word);
      currentWidth = nextWidth;
    }
    separator = parts[index + 1];
  }
  if (currentWidth) lines.push(currentLine.join(''));
  return lines;
}

function wrapAnywhere(width, value) {
  const lines = [];
  let currentLine = '';
  function append(word, separator) {
    if (currentLine.length && separator) currentLine += separator;
    currentLine += word;
    while (currentLine.length > width) {
      lines.push(currentLine.slice(0, width));
      currentLine = currentLine.slice(width);
    }
  }
  const parts = value.split(/(\s+)/g);
  for (let index = 0; index < parts.length; index += 2) {
    append(parts[index], index && parts[index - 1]);
  }
  if (currentLine.length) lines.push(currentLine);
  return lines;
}

const utils = {
  strlen: visibleWidth,
  repeat,

  pad(value, width, character, alignment) {
    const length = visibleWidth(value);
    if (width + 1 >= length) {
      const amount = width - length;
      switch (alignment) {
        case 'right':
          value = repeat(character, amount) + value;
          break;
        case 'center': {
          const right = Math.ceil(amount / 2);
          value = repeat(character, amount - right) + value + repeat(character, right);
          break;
        }
        default:
          value += repeat(character, amount);
      }
    }
    return value;
  },

  truncate(value, width, suffix) {
    suffix = suffix || '…';
    if (visibleWidth(value) <= width) return value;
    width -= visibleWidth(suffix);
    let result = truncateAnsi(value, width) + suffix;
    const hyperlinkClose = '\x1b]8;;\x07';
    if (value.includes(hyperlinkClose) && !result.includes(hyperlinkClose)) {
      result += hyperlinkClose;
    }
    return result;
  },

  mergeOptions(options, defaults) {
    options = options || {};
    defaults = defaults || {
      chars: {
        top: '─',
        'top-mid': '┬',
        'top-left': '┌',
        'top-right': '┐',
        bottom: '─',
        'bottom-mid': '┴',
        'bottom-left': '└',
        'bottom-right': '┘',
        left: '│',
        'left-mid': '├',
        mid: '─',
        'mid-mid': '┼',
        right: '│',
        'right-mid': '┤',
        middle: '│',
      },
      truncate: '…',
      colWidths: [],
      rowHeights: [],
      colAligns: [],
      rowAligns: [],
      style: {
        'padding-left': 1,
        'padding-right': 1,
        head: ['red'],
        border: ['grey'],
        compact: false,
      },
      head: [],
    };
    const merged = Object.assign({}, defaults, options);
    merged.chars = Object.assign({}, defaults.chars, options.chars);
    merged.style = Object.assign({}, defaults.style, options.style);
    return merged;
  },

  wordWrap(width, value, wrapOnWordBoundary = true) {
    const lines = [];
    const inputLines = value.split('\n');
    const wrap = wrapOnWordBoundary ? wrapOnWords : wrapAnywhere;
    for (let index = 0; index < inputLines.length; index++) {
      lines.push.apply(lines, wrap(width, inputLines[index]));
    }
    return lines;
  },

  colorizeLines(lines) {
    let state = {};
    const colorized = [];
    for (let index = 0; index < lines.length; index++) {
      const line = reopenAnsiStyles(state, lines[index]);
      state = getAnsiState(line);
      colorized.push(closeAnsiStyles(Object.assign({}, state), line));
    }
    return colorized;
  },

  hyperlink(url, text) {
    const osc = '\x1b]';
    const bell = '\x07';
    const separator = ';';
    return [
      osc,
      '8',
      separator,
      separator,
      url || text,
      bell,
      text,
      osc,
      '8',
      separator,
      separator,
      bell,
    ].join('');
  },

  parseHexValue(value) {
    const [hex] = value.match(/#[0-9a-fA-F]{3,6}/) || ['#000'];
    return hex;
  },
};

// Cells
const { info, debug: debugMessage } = debug;

class ColSpanCell {
  constructor() {}

  draw(line) {
    if (typeof line === 'number') {
      debugMessage(`${this.y}-${this.x}: 1x1 ColSpanCell`);
    }
    return '';
  }

  init() {}

  mergeTableOptions() {}
}

class RowSpanCell {
  constructor(originalCell) {
    this.originalCell = originalCell;
  }

  init(options) {
    const originalRow = this.originalCell.y;
    this.cellOffset = this.y - originalRow;
    this.offset = options.rowHeights[originalRow];
    for (let index = 1; index < this.cellOffset; index++) {
      this.offset += 1 + options.rowHeights[originalRow + index];
    }
  }

  draw(line) {
    if (line === 'top') return this.originalCell.draw(this.offset, this.cellOffset);
    if (line === 'bottom') return this.originalCell.draw('bottom');
    debugMessage(
      `${this.y}-${this.x}: 1x${this.colSpan} RowSpanCell for ${this.originalCell.content}`,
    );
    return this.originalCell.draw(this.offset + 1 + line);
  }

  mergeTableOptions() {}
}

function firstDefined(...values) {
  return values.filter((value) => value != null).shift();
}

function mergeProperty(cellOptions, tableOptions, property, target) {
  const parts = property.split('-');
  if (parts.length > 1) {
    parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].substr(1);
    const camelProperty = parts.join('');
    target[camelProperty] = firstDefined(
      cellOptions[camelProperty],
      cellOptions[property],
      tableOptions[camelProperty],
      tableOptions[property],
    );
  } else {
    target[property] = firstDefined(cellOptions[property], tableOptions[property]);
  }
}

function sumDimension(total, value) {
  return total + value + 1;
}

const characterNames = [
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
  'middle',
];

class Cell {
  constructor(options) {
    this.setOptions(options);
    this.x = null;
    this.y = null;
  }

  setOptions(options) {
    if (['boolean', 'number', 'bigint', 'string'].includes(typeof options)) {
      options = { content: String(options) };
    }
    options = options || {};
    this.options = options;
    const content = options.content;
    if (['boolean', 'number', 'bigint', 'string'].includes(typeof content)) {
      this.content = String(content);
    } else if (content) {
      throw new Error(`Content needs to be a primitive, got: ${typeof content}`);
    } else {
      this.content = this.options.href || '';
    }
    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;
    if (options.href) {
      Object.defineProperty(this, 'href', {
        get() {
          return this.options.href;
        },
      });
    }
  }

  mergeTableOptions(tableOptions, cells) {
    this.cells = cells;
    const cellChars = this.options.chars || {};
    this.chars = {};
    characterNames.forEach((name) => {
      mergeProperty(cellChars, tableOptions.chars, name, this.chars);
    });
    this.truncate = this.options.truncate || tableOptions.truncate;
    const cellStyle = (this.options.style = this.options.style || {});
    mergeProperty(cellStyle, tableOptions.style, 'padding-left', this);
    mergeProperty(cellStyle, tableOptions.style, 'padding-right', this);
    this.head = cellStyle.head || tableOptions.style.head;
    this.border = cellStyle.border || tableOptions.style.border;
    this.fixedWidth = tableOptions.colWidths[this.x];
    this.lines = this.computeLines(tableOptions);
    this.desiredWidth = visibleWidth(this.content) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }

  computeLines(tableOptions) {
    const defaultWordWrap = tableOptions.wordWrap || tableOptions.textWrap;
    const { wordWrap = defaultWordWrap } = this.options;
    if (this.fixedWidth && wordWrap) {
      this.fixedWidth -= this.paddingLeft + this.paddingRight;
      if (this.colSpan) {
        let offset = 1;
        while (offset < this.colSpan) {
          this.fixedWidth += tableOptions.colWidths[this.x + offset];
          offset++;
        }
      }
      const { wrapOnWordBoundary: tableBoundary = true } = tableOptions;
      const { wrapOnWordBoundary = tableBoundary } = this.options;
      return this.wrapLines(utils.wordWrap(this.fixedWidth, this.content, wrapOnWordBoundary));
    }
    return this.wrapLines(this.content.split('\n'));
  }

  wrapLines(lines) {
    const colorized = utils.colorizeLines(lines);
    return this.href ? colorized.map((line) => utils.hyperlink(this.href, line)) : colorized;
  }

  init(options) {
    this.widths = options.colWidths.slice(this.x, this.x + this.colSpan);
    this.heights = options.rowHeights.slice(this.y, this.y + this.rowSpan);
    this.width = this.widths.reduce(sumDimension, -1);
    this.height = this.heights.reduce(sumDimension, -1);
    this.hAlign = this.options.hAlign || options.colAligns[this.x];
    this.vAlign = this.options.vAlign || options.rowAligns[this.y];
    this.drawRight = this.x + this.colSpan == options.colWidths.length;
  }

  draw(line, rowOffset) {
    if (line === 'top') return this.drawTop(this.drawRight);
    if (line === 'bottom') return this.drawBottom(this.drawRight);
    const preview = utils.truncate(this.content, 10, this.truncate);
    if (!line) {
      info(`${this.y}-${this.x}: ${this.rowSpan - line}x${this.colSpan} Cell ${preview}`);
    }
    const available = Math.max(this.height - this.lines.length, 0);
    let topPadding;
    switch (this.vAlign) {
      case 'center':
        topPadding = Math.ceil(available / 2);
        break;
      case 'bottom':
        topPadding = available;
        break;
      default:
        topPadding = 0;
    }
    if (line < topPadding || line >= topPadding + this.lines.length) {
      return this.drawEmpty(this.drawRight, rowOffset);
    }
    const truncateLine = this.lines.length > this.height && line + 1 >= this.height;
    return this.drawLine(line - topPadding, this.drawRight, truncateLine, rowOffset);
  }

  drawTop(drawRight) {
    const parts = [];
    if (this.cells) {
      this.widths.forEach((width, offset) => {
        parts.push(this.topLeftChar(offset));
        parts.push(repeat(this.chars[this.y === 0 ? 'top' : 'mid'], width));
      });
    } else {
      parts.push(this.topLeftChar(0));
      parts.push(repeat(this.chars[this.y === 0 ? 'top' : 'mid'], this.width));
    }
    if (drawRight) parts.push(this.chars[this.y === 0 ? 'topRight' : 'rightMid']);
    return this.wrapWithStyleColors('border', parts.join(''));
  }

  topLeftChar(offset) {
    const column = this.x + offset;
    let character;
    if (this.y === 0) {
      character = column === 0 ? 'topLeft' : offset === 0 ? 'topMid' : 'top';
    } else if (column === 0) {
      character = 'leftMid';
    } else {
      character = offset === 0 ? 'midMid' : 'bottomMid';
      if (this.cells) {
        if (this.cells[this.y - 1][column] instanceof ColSpanCell) {
          character = offset === 0 ? 'topMid' : 'mid';
        }
        if (offset === 0) {
          let left = 1;
          while (this.cells[this.y][column - left] instanceof ColSpanCell) left++;
          if (this.cells[this.y][column - left] instanceof RowSpanCell) character = 'leftMid';
        }
      }
    }
    return this.chars[character];
  }

  wrapWithStyleColors(styleName, value) {
    if (!this[styleName] || !this[styleName].length) return value;
    try {
      let color = require('ansis');
      for (let index = this[styleName].length - 1; index >= 0; index--) {
        const style = this[styleName][index];
        const isHex = style.startsWith('hex');
        const isBackgroundHex = style.startsWith('bgHex');
        if (isHex || isBackgroundHex) {
          const hex = utils.parseHexValue(style);
          color = isBackgroundHex ? color.bgHex(hex) : color.hex(hex);
        } else {
          color = color[style];
        }
      }
      return color(value);
    } catch (error) {
      return value;
    }
  }

  drawLine(line, drawRight, truncateLine, rowOffset) {
    let left = this.chars[this.x === 0 ? 'left' : 'middle'];
    if (this.x && rowOffset && this.cells) {
      let leftCell = this.cells[this.y + rowOffset][this.x - 1];
      while (leftCell instanceof ColSpanCell) {
        leftCell = this.cells[leftCell.y][leftCell.x - 1];
      }
      if (!(leftCell instanceof RowSpanCell)) left = this.chars.rightMid;
    }
    const leftPadding = repeat(' ', this.paddingLeft);
    const right = drawRight ? this.chars.right : '';
    const rightPadding = repeat(' ', this.paddingRight);
    let content = this.lines[line];
    const contentWidth = this.width - (this.paddingLeft + this.paddingRight);
    if (truncateLine) content += this.truncate || '…';
    content = utils.truncate(content, contentWidth, this.truncate);
    content = utils.pad(content, contentWidth, ' ', this.hAlign);
    content = leftPadding + content + rightPadding;
    return this.stylizeLine(left, content, right);
  }

  stylizeLine(left, content, right) {
    left = this.wrapWithStyleColors('border', left);
    right = this.wrapWithStyleColors('border', right);
    if (this.y === 0) content = this.wrapWithStyleColors('head', content);
    return left + content + right;
  }

  drawBottom(drawRight) {
    const left = this.chars[this.x === 0 ? 'bottomLeft' : 'bottomMid'];
    const middle = repeat(this.chars.bottom, this.width);
    const right = drawRight ? this.chars.bottomRight : '';
    return this.wrapWithStyleColors('border', left + middle + right);
  }

  drawEmpty(drawRight, rowOffset) {
    let left = this.chars[this.x === 0 ? 'left' : 'middle'];
    if (this.x && rowOffset && this.cells) {
      let leftCell = this.cells[this.y + rowOffset][this.x - 1];
      while (leftCell instanceof ColSpanCell) {
        leftCell = this.cells[leftCell.y][leftCell.x - 1];
      }
      if (!(leftCell instanceof RowSpanCell)) left = this.chars.rightMid;
    }
    const right = drawRight ? this.chars.right : '';
    return this.stylizeLine(left, repeat(' ', this.width), right);
  }
}

// Layout and dimensions
const { warn, debug: debugLayout } = debug;

function nextAvailableColumn(occupied, column) {
  return occupied[column] > 0 ? nextAvailableColumn(occupied, column + 1) : column;
}

function layoutTable(rows) {
  const occupied = {};
  rows.forEach((row, rowIndex) => {
    let column = 0;
    row.forEach((cell) => {
      cell.y = rowIndex;
      cell.x = rowIndex ? nextAvailableColumn(occupied, column) : column;
      const rowSpan = cell.rowSpan || 1;
      const colSpan = cell.colSpan || 1;
      if (rowSpan > 1) {
        for (let offset = 0; offset < colSpan; offset++) {
          occupied[cell.x + offset] = rowSpan;
        }
      }
      column = cell.x + colSpan;
    });
    Object.keys(occupied).forEach((key) => {
      occupied[key]--;
      if (occupied[key] < 1) delete occupied[key];
    });
  });
}

function maxWidth(rows) {
  let width = 0;
  rows.forEach((row) => {
    row.forEach((cell) => {
      width = Math.max(width, cell.x + (cell.colSpan || 1));
    });
  });
  return width;
}

function cellsOverlap(first, second) {
  const firstBottom = first.y - 1 + (first.rowSpan || 1);
  const secondBottom = second.y - 1 + (second.rowSpan || 1);
  const rowsOverlap = !(first.y > secondBottom || second.y > firstBottom);
  const firstRight = first.x - 1 + (first.colSpan || 1);
  const secondRight = second.x - 1 + (second.colSpan || 1);
  const columnsOverlap = !(first.x > secondRight || second.x > firstRight);
  return rowsOverlap && columnsOverlap;
}

function cellExistsAt(rows, column, row) {
  const lastRow = Math.min(rows.length - 1, row);
  const position = { x: column, y: row };
  for (let rowIndex = 0; rowIndex <= lastRow; rowIndex++) {
    const cells = rows[rowIndex];
    for (let index = 0; index < cells.length; index++) {
      if (cellsOverlap(position, cells[index])) return true;
    }
  }
  return false;
}

function rangeIsEmpty(rows, row, startColumn, endColumn) {
  for (let column = startColumn; column < endColumn; column++) {
    if (cellExistsAt(rows, column, row)) return false;
  }
  return true;
}

function insertCell(cell, row) {
  let index = 0;
  while (index < row.length && row[index].x < cell.x) index++;
  row.splice(index, 0, cell);
}

function addRowSpanCells(rows) {
  rows.forEach((row, rowIndex) => {
    row.forEach((cell) => {
      for (let offset = 1; offset < cell.rowSpan; offset++) {
        const placeholder = new RowSpanCell(cell);
        placeholder.x = cell.x;
        placeholder.y = cell.y + offset;
        placeholder.colSpan = cell.colSpan;
        insertCell(placeholder, rows[rowIndex + offset]);
      }
    });
  });
}

function addColSpanCells(rows) {
  for (let rowIndex = rows.length - 1; rowIndex >= 0; rowIndex--) {
    const row = rows[rowIndex];
    for (let index = 0; index < row.length; index++) {
      const cell = row[index];
      for (let offset = 1; offset < cell.colSpan; offset++) {
        const placeholder = new ColSpanCell();
        placeholder.x = cell.x + offset;
        placeholder.y = cell.y;
        row.splice(index + 1, 0, placeholder);
      }
    }
  }
}

function fillInTable(rows) {
  const rowCount = rows.length;
  const columnCount = maxWidth(rows);
  debugLayout(`Max rows: ${rowCount}; Max cols: ${columnCount}`);
  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < columnCount; column++) {
      if (!cellExistsAt(rows, column, row)) {
        const missing = { x: column, y: row, colSpan: 1, rowSpan: 1 };
        column++;
        while (column < columnCount && !cellExistsAt(rows, column, row)) {
          missing.colSpan++;
          column++;
        }
        let nextRow = row + 1;
        while (
          nextRow < rowCount &&
          rangeIsEmpty(rows, nextRow, missing.x, missing.x + missing.colSpan)
        ) {
          missing.rowSpan++;
          nextRow++;
        }
        const cell = new Cell(missing);
        cell.x = missing.x;
        cell.y = missing.y;
        warn(`Missing cell at ${cell.y}-${cell.x}.`);
        insertCell(cell, rows[row]);
      }
    }
  }
}

function normalizeRows(rows) {
  return rows.map((row) => {
    if (!Array.isArray(row)) {
      const key = Object.keys(row)[0];
      row = row[key];
      if (Array.isArray(row)) {
        row = row.slice();
        row.unshift(key);
      } else {
        row = [key, row];
      }
    }
    return row.map((value) => new Cell(value));
  });
}

function makeTableLayout(rows) {
  const layout = normalizeRows(rows);
  layoutTable(layout);
  fillInTable(layout);
  addRowSpanCells(layout);
  addColSpanCells(layout);
  return layout;
}

function createDimensionCalculator(spanProperty, desiredProperty, positionProperty, minimum) {
  return function calculateDimensions(givenDimensions, rows) {
    const dimensions = [];
    const spanningCells = [];
    const spanMinimums = {};
    rows.forEach((row) => {
      row.forEach((cell) => {
        if ((cell[spanProperty] || 1) > 1) {
          spanningCells.push(cell);
        } else {
          dimensions[cell[positionProperty]] = Math.max(
            dimensions[cell[positionProperty]] || 0,
            cell[desiredProperty] || 0,
            minimum,
          );
        }
      });
    });
    givenDimensions.forEach((value, index) => {
      if (typeof value === 'number') dimensions[index] = value;
    });
    for (let index = spanningCells.length - 1; index >= 0; index--) {
      const cell = spanningCells[index];
      const span = cell[spanProperty];
      const start = cell[positionProperty];
      let current = dimensions[start];
      let adjustable = typeof givenDimensions[start] === 'number' ? 0 : 1;
      if (typeof current === 'number') {
        for (let offset = 1; offset < span; offset++) {
          current += 1 + dimensions[start + offset];
          if (typeof givenDimensions[start + offset] !== 'number') adjustable++;
        }
      } else {
        current = desiredProperty === 'desiredWidth' ? cell.desiredWidth - 1 : 1;
        if (!spanMinimums[start] || spanMinimums[start] < current) {
          spanMinimums[start] = current;
        }
      }
      if (cell[desiredProperty] > current) {
        let offset = 0;
        while (adjustable > 0 && cell[desiredProperty] > current) {
          if (typeof givenDimensions[start + offset] !== 'number') {
            const increase = Math.round((cell[desiredProperty] - current) / adjustable);
            current += increase;
            dimensions[start + offset] += increase;
            adjustable--;
          }
          offset++;
        }
      }
    }
    Object.assign(givenDimensions, dimensions, spanMinimums);
    for (let index = 0; index < givenDimensions.length; index++) {
      givenDimensions[index] = Math.max(minimum, givenDimensions[index] || 0);
    }
  };
}

const tableLayout = {
  makeTableLayout,
  layoutTable,
  addRowSpanCells,
  maxWidth,
  fillInTable,
  computeWidths: createDimensionCalculator('colSpan', 'desiredWidth', 'x', 1),
  computeHeights: createDimensionCalculator('rowSpan', 'desiredHeight', 'y', 1),
};

// Public table
class Table extends Array {
  constructor(options) {
    super();
    const mergedOptions = utils.mergeOptions(options);
    Object.defineProperty(this, 'options', {
      value: mergedOptions,
      enumerable: mergedOptions.debug,
    });
    if (mergedOptions.debug) {
      switch (typeof mergedOptions.debug) {
        case 'boolean':
          debug.setDebugLevel(debug.WARN);
          break;
        case 'number':
          debug.setDebugLevel(mergedOptions.debug);
          break;
        case 'string':
          debug.setDebugLevel(parseInt(mergedOptions.debug, 10));
          break;
        default:
          debug.setDebugLevel(debug.WARN);
          debug.warn(
            `Debug option is expected to be boolean, number, or string. Received a ${typeof mergedOptions.debug}`,
          );
      }
      Object.defineProperty(this, 'messages', {
        get: () => debug.debugMessages(),
      });
    }
  }

  toString() {
    let rows = this;
    const hasHead = this.options.head && this.options.head.length;
    if (hasHead) {
      rows = [this.options.head];
      if (this.length) rows.push.apply(rows, this);
    } else {
      this.options.style.head = [];
    }
    const layout = tableLayout.makeTableLayout(rows);
    layout.forEach((row) => {
      row.forEach((cell) => cell.mergeTableOptions(this.options, layout));
    });
    tableLayout.computeWidths(this.options.colWidths, layout);
    tableLayout.computeHeights(this.options.rowHeights, layout);
    layout.forEach((row) => {
      row.forEach((cell) => cell.init(this.options));
    });
    const output = [];
    for (let rowIndex = 0; rowIndex < layout.length; rowIndex++) {
      const row = layout[rowIndex];
      const height = this.options.rowHeights[rowIndex];
      if (
        rowIndex === 0 ||
        !this.options.style.compact ||
        (rowIndex === 1 && hasHead)
      ) {
        drawRow(row, 'top', output);
      }
      for (let line = 0; line < height; line++) drawRow(row, line, output);
      if (rowIndex + 1 == layout.length) drawRow(row, 'bottom', output);
    }
    return output.join('\n');
  }

  get width() {
    return this.toString().split('\n')[0].length;
  }
}

Table.reset = () => debug.reset();

function drawRow(row, line, output) {
  const parts = [];
  row.forEach((cell) => parts.push(cell.draw(line)));
  const rendered = parts.join('');
  if (rendered.length) output.push(rendered);
}

module.exports = Table;
