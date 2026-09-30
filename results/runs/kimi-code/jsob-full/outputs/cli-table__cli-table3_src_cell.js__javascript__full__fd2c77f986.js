'use strict';

const stringWidth = require('string-width');
const ansis = require('ansis');

const ESCAPE_PATTERN = /\u001b\[((?:\d*;){0,5}\d*)m/g;
const CHARACTER_NAMES = [
  'top', 'top-mid', 'top-left', 'top-right',
  'bottom', 'bottom-mid', 'bottom-left', 'bottom-right',
  'left', 'left-mid', 'mid', 'mid-mid', 'right', 'right-mid', 'middle',
];

function strlen(value) {
  return stringWidth(String(value));
}

function repeat(value, count) {
  return String(value).repeat(Math.max(0, count));
}

function pad(value, width, fill = ' ', alignment = 'left') {
  const missing = Math.max(0, width - strlen(value));
  if (alignment === 'right') return repeat(fill, missing) + value;
  if (alignment === 'center') {
    const left = Math.ceil(missing / 2);
    return repeat(fill, left) + value + repeat(fill, missing - left);
  }
  return value + repeat(fill, missing);
}

function truncate(value, width, omission = '…') {
  value = String(value);
  if (strlen(value) <= width) return value;
  const target = Math.max(0, width - strlen(omission));
  let result = '';
  for (const character of value) {
    if (strlen(result + character) > target) break;
    result += character;
  }
  return result + omission;
}

function wordWrap(width, value, wrapOnWordBoundary = true) {
  const lines = [];
  for (const sourceLine of String(value).split('\n')) {
    let remaining = sourceLine;
    while (strlen(remaining) > width) {
      let split = width;
      while (split > 0 && strlen(remaining.slice(0, split)) > width) split--;
      if (wrapOnWordBoundary) {
        const space = remaining.slice(0, split + 1).lastIndexOf(' ');
        if (space > 0) split = space;
      }
      lines.push(remaining.slice(0, split));
      remaining = remaining.slice(split).replace(/^\s+/, '');
    }
    lines.push(remaining);
  }
  return lines;
}

function colorizeLines(lines) {
  let active = '';
  return lines.map(line => {
    const result = active + line;
    const matches = [...result.matchAll(ESCAPE_PATTERN)];
    for (const match of matches) active = match[1] === '0' ? '' : `\u001b[${match[1]}m`;
    return active && !result.endsWith('\u001b[0m') ? result + '\u001b[0m' : result;
  });
}

function hyperlink(url, text) {
  return `\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007`;
}

function parseHexColor(value) {
  if (typeof value !== 'string' || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) return '#000';
  if (value.length === 4) return '#' + [...value.slice(1)].map(character => character + character).join('');
  return value;
}

function mergeOptions(target, source) {
  const result = Object.assign({}, target, source);
  result.chars = Object.assign({}, target?.chars, source?.chars);
  result.style = Object.assign({}, target?.style, source?.style);
  return result;
}

const utils = { strlen, repeat, pad, truncate, mergeOptions, wordWrap, colorizeLines, hyperlink, parseHexColor };

function setOption(cellOptions, tableOptions, name, target) {
  const value = cellOptions[name] !== undefined ? cellOptions[name] : tableOptions[name];
  target[name] = value;
}

function sumPlusOne(total, value) {
  return total + value + 1;
}

function findDimension(dimensions, start, count) {
  let total = dimensions[start];
  for (let index = 1; index < count; index++) total += dimensions[start + index] + 1;
  return total;
}

class Cell {
  constructor(options) {
    this.setOptions(options);
    this.x = null;
    this.y = null;
  }

  setOptions(options) {
    if (['boolean', 'number', 'bigint', 'string'].includes(typeof options)) options = { content: String(options) };
    options ||= {};
    this.options = options;
    const content = options.content;
    if (['boolean', 'number', 'bigint', 'string'].includes(typeof content)) this.content = String(content);
    else if (!content) this.content = options.href || '';
    else throw new Error(`Content needs to be a primitive, got: ${typeof content}`);
    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;
    if (options.href) Object.defineProperty(this, 'href', { get: () => this.options.href });
  }

  mergeTableOptions(tableOptions, cells) {
    this.cells = cells;
    this.chars = {};
    const ownChars = this.options.chars || {};
    for (const name of CHARACTER_NAMES) setOption(ownChars, tableOptions.chars, name, this.chars);
    this.truncate = this.options.truncate || tableOptions.truncate;
    this.options.style ||= {};
    setOption(this.options.style, tableOptions.style, 'padding-left', this);
    setOption(this.options.style, tableOptions.style, 'padding-right', this);
    this.head = this.options.style.head || tableOptions.style.head;
    this.border = this.options.style.border || tableOptions.style.border;
    this.fixedWidth = tableOptions.colWidths[this.x];
    this.lines = this.computeLines(tableOptions);
    this.desiredWidth = strlen(this.content) + this['padding-left'] + this['padding-right'];
    this.desiredHeight = this.lines.length;
  }

  computeLines(tableOptions) {
    const wordWrapEnabled = this.options.wordWrap ?? this.options.textWrap ?? tableOptions.wordWrap ?? tableOptions.textWrap;
    if (this.fixedWidth && wordWrapEnabled) {
      this.fixedWidth -= this['padding-left'] + this['padding-right'];
      for (let index = 1; index < this.colSpan; index++) this.fixedWidth += tableOptions.colWidths[this.x + index];
      const wrapOnWordBoundary = this.options.wrapOnWordBoundary ?? tableOptions.wrapOnWordBoundary ?? true;
      return this.wrapLines(wordWrap(this.fixedWidth, this.content, wrapOnWordBoundary));
    }
    for (let index = 1; index < this.colSpan; index++) this.fixedWidth += tableOptions.colWidths[this.x + index];
    return this.wrapLines(this.content.split('\n'));
  }

  wrapLines(lines) {
    const colored = colorizeLines(lines);
    return this.href ? colored.map(line => hyperlink(this.href, line)) : colored;
  }

  init(tableOptions) {
    this.widths = tableOptions.colWidths.slice(this.x, this.x + this.colSpan);
    this.heights = tableOptions.rowHeights.slice(this.y, this.y + this.rowSpan);
    this.width = this.widths.reduce(sumPlusOne, -1);
    this.height = this.heights.reduce(sumPlusOne, -1);
    this.hAlign = this.options.hAlign || tableOptions.colAligns[this.x];
    this.vAlign = this.options.vAlign || tableOptions.rowAligns[this.y];
    this.drawRight = this.x + this.colSpan === tableOptions.colWidths.length;
  }

  draw(line, spanningRowOffset) {
    if (line === 'top') return this.drawTop(this.drawRight);
    if (line === 'bottom') return this.drawBottom(this.drawRight);
    const blankLines = Math.max(this.height - this.lines.length, 0);
    const start = this.vAlign === 'center' ? Math.ceil(blankLines / 2) : this.vAlign === 'bottom' ? blankLines : 0;
    if (line < start || line >= start + this.lines.length) return this.drawEmpty(this.drawRight, spanningRowOffset);
    const truncated = this.lines.length > this.height && line + 1 >= this.height;
    return this.drawLine(line - start, this.drawRight, truncated, spanningRowOffset);
  }

  drawTop(drawRight) {
    const parts = [];
    if (this.cells) {
      this.widths.forEach((width, index) => parts.push(this._topLeftChar(index), repeat(this.chars[this.y === 0 ? 'top' : 'mid'], width)));
    } else {
      parts.push(this._topLeftChar(0), repeat(this.chars[this.y === 0 ? 'top' : 'mid'], this.width));
    }
    if (drawRight) parts.push(this.chars[this.y === 0 ? 'top-right' : 'right-mid']);
    return this.wrapWithStyleColors('border', parts.join(''));
  }

  _topLeftChar(index) {
    if (this.y === 0) return index === 0 && this.x === 0 ? this.chars['top-left'] : this.chars['top-mid'];
    if (index === 0 && this.x === 0) return this.chars['left-mid'];
    return this.chars['mid-mid'];
  }

  wrapWithStyleColors(style, value) {
    const colors = this[style];
    if (!colors) return value;
    const names = Array.isArray(colors) ? colors : [colors];
    return names.reduceRight((result, name) => typeof ansis[name] === 'function' ? ansis[name](result) : result, value);
  }

  drawLine(line, drawRight, truncated, spanningRowOffset) {
    let left = this.chars[this.x === 0 ? 'left' : 'middle'];
    if (this.x && spanningRowOffset && this.cells) {
      let neighbor = this.cells[this.y + spanningRowOffset][this.x - 1];
      while (neighbor instanceof ColSpanCell) neighbor = this.cells[neighbor.y][neighbor.x - 1];
      if (!(neighbor instanceof RowSpanCell)) left = this.chars['right-mid'];
    }
    const available = this.width - this['padding-left'] - this['padding-right'];
    let content = this.lines[line];
    if (truncated) content += this.truncate || '…';
    content = pad(truncate(content, available, this.truncate), available, ' ', this.hAlign);
    return this.stylizeLine(left, repeat(' ', this['padding-left']) + content + repeat(' ', this['padding-right']), drawRight ? this.chars.right : '');
  }

  stylizeLine(left, content, right) {
    left = this.wrapWithStyleColors('border', left);
    right = this.wrapWithStyleColors('border', right);
    if (this.y === 0) content = this.wrapWithStyleColors('head', content);
    return left + content + right;
  }

  drawBottom(drawRight) {
    const left = this.chars[this.x === 0 ? 'bottom-left' : 'bottom-mid'];
    const right = drawRight ? this.chars['bottom-right'] : '';
    return this.wrapWithStyleColors('border', left + repeat(this.chars.bottom, this.width) + right);
  }

  drawEmpty(drawRight, spanningRowOffset) {
    let left = this.chars[this.x === 0 ? 'left' : 'middle'];
    if (this.x && spanningRowOffset && this.cells) {
      let neighbor = this.cells[this.y + spanningRowOffset][this.x - 1];
      while (neighbor instanceof ColSpanCell) neighbor = this.cells[neighbor.y][neighbor.x - 1];
      if (!(neighbor instanceof RowSpanCell)) left = this.chars['right-mid'];
    }
    return this.stylizeLine(left, repeat(' ', this.width), drawRight ? this.chars.right : '');
  }
}

class ColSpanCell {
  draw() { return ''; }
  init() {}
  mergeTableOptions() {}
}

class RowSpanCell {
  constructor(originalCell) {
    this.originalCell = originalCell;
  }

  init(tableOptions) {
    this.cellOffset = this.y - this.originalCell.y;
    this.offset = findDimension(tableOptions.rowHeights, this.originalCell.y, this.cellOffset);
  }

  draw(line) {
    if (line === 'top') return this.originalCell.draw(this.offset, this.cellOffset);
    if (line === 'bottom') return this.originalCell.draw('bottom');
    return this.originalCell.draw(this.offset + 1 + line);
  }

  mergeTableOptions() {}
}

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
