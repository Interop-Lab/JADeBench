'use strict';

const ansis = require('ansis');
const stringWidth = require('string-width');
const ANSI_PATTERN = /\x1b\[[0-?]*[ -\/]*[@-~]/g;
const CHAR_NAMES = [
  'top', 'top-mid', 'top-left', 'top-right',
  'bottom', 'bottom-mid', 'bottom-left', 'bottom-right',
  'left', 'left-mid', 'mid', 'mid-mid',
  'right', 'right-mid', 'middle'
];

function visibleLength(value) {
  return stringWidth(String(value));
}

function repeat(value, count) {
  return new Array(Math.max(0, count) + 1).join(value);
}

function pad(value, width, fill, alignment) {
  const remaining = width - visibleLength(value);
  if (remaining <= 0) return value;
  if (alignment === 'right') return repeat(fill, remaining) + value;
  if (alignment === 'center') {
    const left = Math.ceil(remaining / 2);
    return repeat(fill, left) + value + repeat(fill, remaining - left);
  }
  return value + repeat(fill, remaining);
}

function truncate(value, width, marker = '…') {
  value = String(value);
  if (visibleLength(value) <= width) return value;
  const targetWidth = Math.max(0, width - visibleLength(marker));
  let result = '';
  let visible = 0;
  for (let index = 0; index < value.length && visible < targetWidth;) {
    if (value[index] === '\x1b') {
      const match = ANSI_PATTERN.exec(value.slice(index));
      ANSI_PATTERN.lastIndex = 0;
      if (match && match.index === 0) {
        result += match[0];
        index += match[0].length;
        continue;
      }
    }
    const character = String.fromCodePoint(value.codePointAt(index));
    const width = visibleLength(character);
    if (visible + width > targetWidth) break;
    result += character;
    visible += width;
    index += character.length;
  }
  return result + marker;
}

function firstDefined(...values) {
  return values.find(value => value !== undefined && value !== null);
}

function option(object, camelName, dashedName, fallback) {
  if (!object) return fallback;
  return firstDefined(object[camelName], object[dashedName], fallback);
}

function normalizeChars(chars = {}) {
  const normalized = {};
  for (const dashedName of CHAR_NAMES) {
    const camelName = dashedName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    normalized[camelName] = firstDefined(chars[camelName], chars[dashedName]);
  }
  return normalized;
}

function wrapText(value, width, wrapOnWordBoundary) {
  const lines = [];
  for (const inputLine of String(value).split('\n')) {
    if (!width || visibleLength(inputLine) <= width) {
      lines.push(inputLine);
      continue;
    }
    let remaining = inputLine;
    while (visibleLength(remaining) > width) {
      let end = width;
      if (wrapOnWordBoundary) {
        const space = remaining.lastIndexOf(' ', width);
        if (space > 0) end = space;
      }
      lines.push(remaining.slice(0, end));
      remaining = remaining.slice(end);
      if (wrapOnWordBoundary) remaining = remaining.replace(/^\s+/, '');
    }
    lines.push(remaining);
  }
  return lines;
}

function applyStyles(styles, value) {
  let result = value;
  for (const style of styles || []) {
    if (style.startsWith('#')) result = ansis.hex(style)(result);
    else if (style.startsWith('bg#')) result = ansis.bgHex(style.slice(2))(result);
    else if (typeof ansis[style] === 'function') result = ansis[style](result);
  }
  return result;
}

class Cell {
  constructor(options) {
    this.setOptions(options);
  }

  setOptions(options) {
    if (options == null) options = {};
    else if (typeof options !== 'object') options = { content: String(options) };
    this.options = options;
    const content = options.content == null ? '' : options.content;
    if (!['boolean', 'number', 'bigint', 'string'].includes(typeof content)) {
      throw new Error(`Content needs to be a primitive, got: ${typeof content}`);
    }
    this.content = String(content);
    if (options.href) this.content = `\x1b]8;;${options.href}\x07${this.content}\x1b]8;;\x07`;
    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;
    this.x = null;
    this.y = null;
  }

  mergeTableOptions(tableOptions, cells) {
    const style = tableOptions.style || {};
    const ownStyle = this.options.style || (this.options.style = {});
    this.cells = cells;
    this.chars = normalizeChars({ ...(tableOptions.chars || {}), ...(this.options.chars || {}) });
    this.truncate = firstDefined(this.options.truncate, tableOptions.truncate);
    this.paddingLeft = option(ownStyle, 'paddingLeft', 'padding-left', option(style, 'paddingLeft', 'padding-left'));
    this.paddingRight = option(ownStyle, 'paddingRight', 'padding-right', option(style, 'paddingRight', 'padding-right'));
    this.head = firstDefined(ownStyle.head, style.head);
    this.border = firstDefined(ownStyle.border, style.border);

    this.fixedWidth = tableOptions.colWidths && this.x != null
      ? tableOptions.colWidths[this.x]
      : undefined;
    this.lines = this.computeLines(tableOptions);
    this.desiredWidth = Math.max(0, ...String(this.content).split('\n').map(visibleLength)) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }

  computeLines(tableOptions) {
    const originalLines = String(this.content).split('\n');
    if (!tableOptions.wordWrap || !this.fixedWidth) return originalLines;
    return originalLines.flatMap(line => wrapText(line, this.fixedWidth, tableOptions.wrapOnWordBoundary));
  }

  wrapLines(width) {
    return wrapText(this.content, width, true);
  }

  init(tableOptions) {
    this.widths = tableOptions.colWidths.slice(this.x, this.x + this.colSpan);
    this.heights = tableOptions.rowHeights.slice(this.y, this.y + this.rowSpan);
    this.width = this.widths.reduce((total, width) => total + width + 1, -1);
    this.height = this.heights.reduce((total, height) => total + height + 1, -1);
    this.hAlign = firstDefined(this.options.hAlign, tableOptions.colAligns && tableOptions.colAligns[this.x]);
    this.vAlign = firstDefined(this.options.vAlign, tableOptions.rowAligns && tableOptions.rowAligns[this.y]);
    this.drawRight = this.colSpan > 1 || this.x === tableOptions.colWidths.length - 1;
  }

  draw(line, spanningCell) {
    const contentHeight = this.lines.length;
    let topPadding = 0;
    if (this.vAlign === 'center') topPadding = Math.ceil((this.height - contentHeight) / 2);
    else if (this.vAlign === 'bottom') topPadding = this.height - contentHeight;

    const contentIndex = line - topPadding;
    if (contentIndex < 0 || contentIndex >= contentHeight) return this.drawEmpty(undefined, spanningCell);
    return this.drawLine(contentIndex, undefined, false, spanningCell);
  }

  drawTop(drawRight) {
    return this.wrapWithStyleColors(
      this.border,
      this._topLeftChar() + repeat(this.chars.top, this.width) + (drawRight ? this.chars.topRight : '')
    );
  }

  _topLeftChar() {
    return this.x === 0 ? this.chars.topLeft : this.chars.topMid;
  }

  wrapWithStyleColors(styles, value) {
    return applyStyles(styles, value);
  }

  drawLine(_line, _value, forceTruncate, spanningCell) {
    const left = this.x === 0 ? this.chars.left : this.chars.middle;
    const right = this.drawRight ? this.chars.right : '';
    const innerWidth = this.width - this.paddingLeft - this.paddingRight;
    let value = this.lines[_line] || '';
    if (forceTruncate) value += this.truncate;
    const content = pad(truncate(value, innerWidth, this.truncate), innerWidth, ' ', this.hAlign);
    return this.stylizeLine(
      left,
      repeat(' ', this.paddingLeft) + content + repeat(' ', this.paddingRight),
      spanningCell ? '' : right
    );
  }

  stylizeLine(left, content, right) {
    return this.wrapWithStyleColors(this.border, left)
      + this.wrapWithStyleColors(this.y === 0 ? this.head : [], content)
      + this.wrapWithStyleColors(this.border, right);
  }

  drawBottom(drawRight) {
    const left = this.x === 0 ? this.chars.bottomLeft : this.chars.bottomMid;
    const line = left + repeat(this.chars.bottom, this.width) + (drawRight ? this.chars.bottomRight : '');
    return this.wrapWithStyleColors(this.border, line);
  }

  drawEmpty(line, spanningCell) {
    return this.drawLine(line, '', false, spanningCell);
  }
}

class ColSpanCell {
  draw() {
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
    this.offset = tableOptions.rowHeights.slice(this.originalCell.y, this.y).reduce((total, height) => total + height + 1, 0);
  }

  draw(line) {
    return this.originalCell.draw(this.offset + line, this);
  }

  mergeTableOptions() {}
}

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
