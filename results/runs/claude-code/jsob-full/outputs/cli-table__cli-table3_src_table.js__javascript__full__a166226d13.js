'use strict';

const stringWidthModule = require('string-width');
const stringWidth = stringWidthModule.default || stringWidthModule;

const ANSI_PATTERN = /\u001b\[(?:\d*;){0,5}\d*m/g;

function visibleWidth(value) {
  return String(value)
    .replace(ANSI_PATTERN, '')
    .split('\n')
    .reduce((maximum, line) => Math.max(maximum, stringWidth(line)), 0);
}

function repeat(value, count) {
  return Array(Math.max(0, count) + 1).join(value);
}

function pad(value, width, fill = ' ', alignment = 'left') {
  const missing = width - visibleWidth(value);
  if (missing <= 0) return value;
  if (alignment === 'right') return repeat(fill, missing) + value;
  if (alignment === 'center') {
    const right = Math.ceil(missing / 2);
    return repeat(fill, missing - right) + value + repeat(fill, right);
  }
  return value + repeat(fill, missing);
}

function truncateVisible(value, width) {
  if (value.length === visibleWidth(value)) return value.slice(0, width);
  while (visibleWidth(value) > width) value = value.slice(0, -1);
  return value;
}

function truncate(value, width, suffix = '…') {
  if (visibleWidth(value) <= width) return value;
  const result = truncateVisible(value, Math.max(0, width - visibleWidth(suffix))) + suffix;
  const reset = '\u001b[0m';
  return value.includes(reset) && !result.includes(reset) ? result + reset : result;
}

function wrapCharacters(width, text) {
  if (width <= 0) return [''];
  const lines = [];
  let remaining = text;
  while (visibleWidth(remaining) > width) {
    const line = truncateVisible(remaining, width);
    lines.push(line);
    remaining = remaining.slice(line.length);
  }
  lines.push(remaining);
  return lines;
}

function wrapWords(width, text) {
  if (width <= 0) return [''];
  const lines = [];
  let line = '';

  for (const token of text.split(/(\s+)/g)) {
    if (line && visibleWidth(line + token) > width) {
      lines.push(line.trimEnd());
      line = token.trimStart();
    } else {
      line += token;
    }

    while (visibleWidth(line) > width) {
      const fragment = truncateVisible(line, width);
      lines.push(fragment);
      line = line.slice(fragment.length);
    }
  }

  lines.push(line.trimEnd());
  return lines;
}

function wordWrap(width, text, wrapOnWordBoundary = true) {
  const wrap = wrapOnWordBoundary ? wrapWords : wrapCharacters;
  return String(text).split('\n').flatMap(line => wrap(width, line));
}

function hyperlink(url, text) {
  return `\u001b]8;;${url || text}\u0007${text}\u001b]8;;\u0007`;
}

function parseHexValue(value) {
  return (value.match(/#[0-9a-fA-F]{3,6}/) || ['#000'])[0];
}

function defaultOptions() {
  return {
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
      middle: '│'
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
      compact: false
    },
    head: []
  };
}

function mergeOptions(options = {}, defaults = defaultOptions()) {
  return {
    ...defaults,
    ...options,
    chars: { ...defaults.chars, ...options.chars },
    style: { ...defaults.style, ...options.style }
  };
}

let debugMessages = [];
let debugLevel = 0;

function debug(message, level) {
  if (debugLevel >= level) debugMessages.push(message);
}

debug.WARN = 1;
debug.INFO = 2;
debug.DEBUG = 3;
debug.warn = message => debug(message, debug.WARN);
debug.info = message => debug(message, debug.INFO);
debug.debug = message => debug(message, debug.DEBUG);
debug.reset = () => {
  debugMessages = [];
};
debug.setDebugLevel = level => {
  debugLevel = level;
};
debug.messages = () => debugMessages;

function firstDefined(...values) {
  return values.find(value => value !== undefined && value !== null);
}

function copyOption(source, defaults, dashedName, target) {
  const parts = dashedName.split('-');
  const camelName = parts.length === 1
    ? dashedName
    : parts[0] + parts[1][0].toUpperCase() + parts[1].slice(1);
  target[camelName] = firstDefined(
    source[camelName],
    source[dashedName],
    defaults[camelName],
    defaults[dashedName]
  );
}

function sumDimensions(dimensions, start, count) {
  let result = dimensions[start] || 0;
  for (let offset = 1; offset < count; offset++) {
    result += 1 + (dimensions[start + offset] || 0);
  }
  return result;
}

const CHARACTER_NAMES = [
  'top', 'top-mid', 'top-left', 'top-right',
  'bottom', 'bottom-mid', 'bottom-left', 'bottom-right',
  'left', 'left-mid', 'mid', 'mid-mid', 'right', 'right-mid', 'middle'
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

    this.options = options || {};
    const content = this.options.content;
    if (['boolean', 'number', 'bigint', 'string'].includes(typeof content)) {
      this.content = String(content);
    } else if (!content) {
      this.content = this.options.href || '';
    } else {
      throw new Error(`Content needs to be a primitive, got: ${typeof content}`);
    }

    this.colSpan = this.options.colSpan || 1;
    this.rowSpan = this.options.rowSpan || 1;
    if (this.options.href) {
      Object.defineProperty(this, 'href', { get: () => this.options.href });
    }
  }

  mergeTableOptions(tableOptions, cells) {
    this.cells = cells;
    this.chars = {};
    for (const name of CHARACTER_NAMES) {
      copyOption(this.options.chars || {}, tableOptions.chars, name, this.chars);
    }

    this.truncate = this.options.truncate || tableOptions.truncate;
    this.options.style ||= {};
    copyOption(this.options.style, tableOptions.style, 'padding-left', this);
    copyOption(this.options.style, tableOptions.style, 'padding-right', this);
    this.head = this.options.style.head || tableOptions.style.head;
    this.border = this.options.style.border || tableOptions.style.border;

    this.fixedWidth = sumDimensions(tableOptions.colWidths, this.x, this.colSpan);
    if (!tableOptions.colWidths[this.x]) this.fixedWidth = 0;
    this.lines = this.computeLines(tableOptions);
    this.desiredWidth = visibleWidth(this.content) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }

  computeLines(tableOptions) {
    const wordWrapEnabled = this.options.wordWrap ?? tableOptions.wordWrap ?? tableOptions.textWrap;
    if (this.fixedWidth && wordWrapEnabled) {
      const contentWidth = this.fixedWidth - this.paddingLeft - this.paddingRight;
      const wrapOnWordBoundary = this.options.wrapOnWordBoundary
        ?? tableOptions.wrapOnWordBoundary
        ?? true;
      return this.wrapLines(wordWrap(contentWidth, this.content, wrapOnWordBoundary));
    }
    return this.wrapLines(this.content.split('\n'));
  }

  wrapLines(lines) {
    if (this.href) return lines.map(line => hyperlink(this.href, line));
    return lines;
  }

  init(tableOptions) {
    this.widths = tableOptions.colWidths.slice(this.x, this.x + this.colSpan);
    this.heights = tableOptions.rowHeights.slice(this.y, this.y + this.rowSpan);
    this.width = this.widths.reduce((sum, width) => sum + width + 1, -1);
    this.height = this.heights.reduce((sum, height) => sum + height + 1, -1);
    this.hAlign = this.options.hAlign || tableOptions.colAligns[this.x];
    this.vAlign = this.options.vAlign || tableOptions.rowAligns[this.y];
    this.drawRight = this.x + this.colSpan === tableOptions.colWidths.length;
  }

  draw(position, rowOffset) {
    if (position === 'top') return this.drawTop(this.drawRight);
    if (position === 'bottom') return this.drawBottom(this.drawRight);

    debug.info(`${this.y}-${this.x}: ${this.rowSpan - position}x${this.colSpan} Cell ${truncate(this.content, 10, this.truncate)}`);
    const spareLines = Math.max(this.height - this.lines.length, 0);
    const firstLine = this.vAlign === 'center'
      ? Math.ceil(spareLines / 2)
      : this.vAlign === 'bottom' ? spareLines : 0;

    if (position < firstLine || position >= firstLine + this.lines.length) {
      return this.drawEmpty(this.drawRight, rowOffset);
    }

    const truncated = this.lines.length > this.height && position + 1 >= this.height;
    return this.drawLine(position - firstLine, this.drawRight, truncated, rowOffset);
  }

  drawTop(drawRight) {
    const output = [];
    if (this.cells) {
      this.widths.forEach((width, offset) => {
        output.push(this.topLeftCharacter(offset));
        output.push(repeat(this.chars[this.y === 0 ? 'top' : 'mid'], width));
      });
    } else {
      output.push(this.topLeftCharacter(0));
      output.push(repeat(this.chars[this.y === 0 ? 'top' : 'mid'], this.width));
    }
    if (drawRight) output.push(this.chars[this.y === 0 ? 'topRight' : 'rightMid']);
    return this.applyStyle('border', output.join(''));
  }

  topLeftCharacter(offset) {
    const column = this.x + offset;
    let name;
    if (this.y === 0) {
      name = column === 0 ? 'topLeft' : offset === 0 ? 'topMid' : 'top';
    } else if (column === 0) {
      name = 'leftMid';
    } else {
      name = offset === 0 ? 'midMid' : 'bottomMid';
      if (this.cells) {
        const above = this.cells[this.y - 1][column];
        if (above instanceof ColSpanCell) name = offset === 0 ? 'topMid' : 'mid';
        if (offset === 0) {
          let distance = 1;
          while (this.cells[this.y][column - distance] instanceof ColSpanCell) distance++;
          if (this.cells[this.y][column - distance] instanceof RowSpanCell) name = 'leftMid';
        }
      }
    }
    return this.chars[name];
  }

  applyStyle(group, value) {
    if (!this[group]?.length) return value;
    try {
      const ansisModule = require('ansis');
      let style = ansisModule.default || ansisModule;
      for (let index = this[group].length - 1; index >= 0; index--) {
        const name = this[group][index];
        if (name.startsWith('bgHex')) style = style.bgHex(parseHexValue(name));
        else if (name.startsWith('hex')) style = style.hex(parseHexValue(name));
        else style = style[name];
      }
      return style(value);
    } catch {
      return value;
    }
  }

  leftBorder(rowOffset) {
    let border = this.chars[this.x === 0 ? 'left' : 'middle'];
    if (this.x && rowOffset && this.cells) {
      let leftCell = this.cells[this.y + rowOffset][this.x - 1];
      while (leftCell instanceof ColSpanCell) leftCell = this.cells[leftCell.y][leftCell.x - 1];
      if (!(leftCell instanceof RowSpanCell)) border = this.chars.rightMid;
    }
    return border;
  }

  drawLine(lineIndex, drawRight, isTruncated, rowOffset) {
    const left = this.leftBorder(rowOffset);
    const right = drawRight ? this.chars.right : '';
    const contentWidth = this.width - this.paddingLeft - this.paddingRight;
    let line = this.lines[lineIndex];
    if (isTruncated) line += this.truncate || '…';
    line = truncate(line, contentWidth, this.truncate);
    line = pad(line, contentWidth, ' ', this.hAlign);
    line = repeat(' ', this.paddingLeft) + line + repeat(' ', this.paddingRight);
    return this.stylizeLine(left, line, right);
  }

  stylizeLine(left, content, right) {
    left = this.applyStyle('border', left);
    right = this.applyStyle('border', right);
    if (this.y === 0) content = this.applyStyle('head', content);
    return left + content + right;
  }

  drawBottom(drawRight) {
    const left = this.chars[this.x === 0 ? 'bottomLeft' : 'bottomMid'];
    const middle = repeat(this.chars.bottom, this.width);
    const right = drawRight ? this.chars.bottomRight : '';
    return this.applyStyle('border', left + middle + right);
  }

  drawEmpty(drawRight, rowOffset) {
    const left = this.leftBorder(rowOffset);
    const right = drawRight ? this.chars.right : '';
    return this.stylizeLine(left, repeat(' ', this.width), right);
  }
}

class ColSpanCell {
  draw(position) {
    if (typeof position === 'number') debug.debug(`${this.y}-${this.x}: 1x1 ColSpanCell`);
    return '';
  }
  init() {}
  mergeTableOptions() {}
}

class RowSpanCell {
  constructor(originalCell) {
    this.originalCell = originalCell;
  }

  init(tableOptions) {
    this.cellOffset = this.y - this.originalCell.y;
    this.offset = sumDimensions(tableOptions.rowHeights, this.originalCell.y, this.cellOffset);
  }

  draw(position) {
    if (position === 'top') return this.originalCell.draw(this.offset, this.cellOffset);
    if (position === 'bottom') return this.originalCell.draw('bottom');
    debug.debug(`${this.y}-${this.x}: 1x${this.colSpan} RowSpanCell for ${this.originalCell.content}`);
    return this.originalCell.draw(this.offset + 1 + position);
  }

  mergeTableOptions() {}
}

Cell.ColSpanCell = ColSpanCell;
Cell.RowSpanCell = RowSpanCell;

function normalizeRows(rows) {
  return rows.map(row => {
    if (!Array.isArray(row)) {
      const key = Object.keys(row)[0];
      const value = row[key];
      row = Array.isArray(value) ? [key, ...value] : [key, value];
    }
    return row.map(value => new Cell(value));
  });
}

function firstFreeColumn(grid, row, start = 0) {
  let column = start;
  while (grid[row]?.[column]) column++;
  return column;
}

function placeCells(rows) {
  const grid = [];
  for (let row = 0; row < rows.length; row++) {
    grid[row] ||= [];
    let column = 0;
    for (const cell of rows[row]) {
      column = firstFreeColumn(grid, row, column);
      cell.x = column;
      cell.y = row;
      for (let y = row; y < row + cell.rowSpan; y++) {
        grid[y] ||= [];
        for (let x = column; x < column + cell.colSpan; x++) {
          if (x === column && y === row) continue;
          let placeholder;
          if (x === column) placeholder = new RowSpanCell(cell);
          else placeholder = new ColSpanCell();
          placeholder.x = x;
          placeholder.y = y;
          placeholder.colSpan = cell.colSpan;
          grid[y][x] = placeholder;
        }
      }
      grid[row][column] = cell;
      column += cell.colSpan;
    }
  }

  for (const row of grid) {
    for (let column = 0; column < row.length; column++) {
      row[column] ||= new Cell('');
      if (row[column].x === null) {
        row[column].x = column;
        row[column].y = grid.indexOf(row);
      }
    }
  }
  return grid;
}

function distributeDimension(target, cells, spanName, desiredName, coordinateName, minimum) {
  const spanned = [];
  for (const row of cells) {
    for (const cell of row) {
      if (!(cell instanceof Cell)) continue;
      if (cell[spanName] > 1) spanned.push(cell);
      else if (typeof target[cell[coordinateName]] !== 'number') {
        target[cell[coordinateName]] = Math.max(cell[desiredName] || 0, minimum);
      }
    }
  }

  for (const cell of spanned.reverse()) {
    const start = cell[coordinateName];
    let current = sumDimensions(target, start, cell[spanName]);
    let flexible = 0;
    for (let offset = 0; offset < cell[spanName]; offset++) {
      if (typeof target[start + offset] !== 'number') flexible++;
    }
    while (current < cell[desiredName]) {
      let changed = false;
      for (let offset = 0; offset < cell[spanName] && current < cell[desiredName]; offset++) {
        const index = start + offset;
        if (flexible && typeof target[index] === 'number') continue;
        target[index] = (target[index] || minimum) + 1;
        current++;
        changed = true;
      }
      if (!changed) break;
    }
  }

  for (let index = 0; index < target.length; index++) target[index] = Math.max(minimum, target[index] || 0);
}

function makeTableLayout(rows) {
  return placeCells(normalizeRows(rows));
}

function renderRow(cells, position, output) {
  const line = cells.map(cell => cell.draw(position)).join('');
  if (line.length) output.push(line);
}

class Table extends Array {
  constructor(options) {
    super();
    const mergedOptions = mergeOptions(options);
    Object.defineProperty(this, 'options', {
      value: mergedOptions,
      enumerable: Boolean(mergedOptions.debug)
    });

    if (mergedOptions.debug) {
      if (typeof mergedOptions.debug === 'boolean') debug.setDebugLevel(debug.WARN);
      else if (typeof mergedOptions.debug === 'number') debug.setDebugLevel(mergedOptions.debug);
      else if (typeof mergedOptions.debug === 'string') debug.setDebugLevel(parseInt(mergedOptions.debug, 10));
      else {
        debug.setDebugLevel(debug.WARN);
        debug.warn(`Debug option is expected to be boolean, number, or string. Received a ${typeof mergedOptions.debug}`);
      }
      Object.defineProperty(this, 'messages', { get: () => debug.messages() });
    }
  }

  toString() {
    let rows = this;
    const hasHead = this.options.head?.length;
    if (hasHead) rows = [this.options.head, ...this];
    else this.options.style.head = [];

    const cells = makeTableLayout(rows);
    for (const row of cells) {
      for (const cell of row) cell.mergeTableOptions(this.options, cells);
    }

    distributeDimension(this.options.colWidths, cells, 'colSpan', 'desiredWidth', 'x', 1);
    distributeDimension(this.options.rowHeights, cells, 'rowSpan', 'desiredHeight', 'y', 1);

    for (const row of cells) {
      for (const cell of row) cell.init(this.options);
    }

    const output = [];
    for (let row = 0; row < cells.length; row++) {
      const rowCells = cells[row];
      const height = this.options.rowHeights[row];
      if (row === 0 || !this.options.style.compact || (row === 1 && hasHead)) {
        renderRow(rowCells, 'top', output);
      }
      for (let line = 0; line < height; line++) renderRow(rowCells, line, output);
      if (row + 1 === cells.length) renderRow(rowCells, 'bottom', output);
    }
    return output.join('\n');
  }

  get width() {
    return this.toString().split('\n')[0].length;
  }
}

Table.reset = () => debug.reset();
module.exports = Table;
