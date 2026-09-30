'use strict';

const stringWidth = require('string-width');
const ansis = require('ansis');

const CHAR_NAMES = [
  'top', 'top-mid', 'top-left', 'top-right',
  'bottom', 'bottom-mid', 'bottom-left', 'bottom-right',
  'left', 'left-mid', 'mid', 'mid-mid',
  'right', 'right-mid', 'middle',
];

function firstDefined(...values) {
  return values.find(value => value !== undefined && value !== null);
}

function sumPlusOne(total, value) {
  return total + value + 1;
}

function findDimension(values, start, span) {
  if (!values || values.length < start + span) return undefined;
  return values.slice(start, start + span).reduce(sumPlusOne, -1);
}

function optionName(name) {
  const parts = name.split('-');
  return parts[0] + parts.slice(1).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function setOption(target, name, sources, aliases = []) {
  const keys = [name, optionName(name), ...aliases];
  for (const source of Array.isArray(sources) ? sources : [sources]) {
    if (!source) continue;
    for (const key of keys) {
      if (source[key] !== undefined && source[key] !== null) {
        target[optionName(name)] = source[key];
        return;
      }
    }
  }
}

function repeat(character, count) {
  return count > 0 ? character.repeat(count) : '';
}

function truncate(text, width, marker = '…') {
  text = String(text);
  if (stringWidth(text) <= width) return text;
  if (width <= stringWidth(marker)) return marker.slice(0, width);
  let result = '';
  const available = width - stringWidth(marker);
  for (const character of text) {
    if (stringWidth(result + character) > available) break;
    result += character;
  }
  return result + marker;
}

function pad(text, width, character = ' ', alignment = 'left') {
  const missing = Math.max(0, width - stringWidth(text));
  if (alignment === 'right') return repeat(character, missing) + text;
  if (alignment === 'center') {
    const left = Math.floor(missing / 2);
    return repeat(character, left) + text + repeat(character, missing - left);
  }
  return text + repeat(character, missing);
}

function wrapWords(text, width) {
  if (width <= 0) return [''];
  const lines = [];
  let remaining = text;
  while (stringWidth(remaining) > width) {
    let line = '';
    let lastSpace = -1;
    for (const character of remaining) {
      if (stringWidth(line + character) > width) break;
      line += character;
      if (/\s/.test(character)) lastSpace = line.length - 1;
    }
    if (lastSpace >= 0) line = line.slice(0, lastSpace);
    if (!line) line = remaining.charAt(0);
    lines.push(line);
    remaining = remaining.slice(line.length).replace(/^\s+/, '');
  }
  lines.push(remaining);
  return lines;
}

function wrapText(text, width, wrapOnWordBoundary) {
  return String(text).split('\n').flatMap(line => {
    if (wrapOnWordBoundary) return wrapWords(line, width);
    const lines = [];
    let remainder = line;
    while (stringWidth(remainder) > width) {
      let part = '';
      for (const character of remainder) {
        if (stringWidth(part + character) > width) break;
        part += character;
      }
      lines.push(part);
      remainder = remainder.slice(part.length);
    }
    lines.push(remainder);
    return lines;
  });
}

function applyStyle(text, style) {
  if (!style) return text;
  let styled = text;
  for (const name of ['bold', 'italics', 'underline', 'inverse', 'strikethrough']) {
    if (style[name] && typeof ansis[name] === 'function') styled = ansis[name](styled);
  }
  if (style.color && typeof ansis[style.color] === 'function') styled = ansis[style.color](styled);
  if (style.bgColor && typeof ansis[style.bgColor] === 'function') styled = ansis[style.bgColor](styled);
  if (style.hex && typeof ansis.hex === 'function') styled = ansis.hex(style.hex)(styled);
  if (style.bgHex && typeof ansis.bgHex === 'function') styled = ansis.bgHex(style.bgHex)(styled);
  return styled;
}

class Cell {
  constructor(options) {
    this.options = {};
    this.chars = {};
    this.x = 0;
    this.y = 0;
    this.setOptions(options);
  }

  setOptions(options) {
    if (options === undefined || options === null) options = '';
    const primitiveTypes = ['boolean', 'number', 'bigint', 'string'];
    if (primitiveTypes.includes(typeof options)) options = { content: String(options) };
    if (typeof options !== 'object') {
      throw new Error(`Content needs to be a primitive, got: ${typeof options}`);
    }
    this.content = String(firstDefined(options.content, ''));
    this.options = { ...this.options, ...options };
    this.colSpan = firstDefined(options.colSpan, 1);
    this.rowSpan = firstDefined(options.rowSpan, 1);
    if (options.href) Object.defineProperty(this, 'href', { configurable: true, enumerable: true, get: () => options.href });
  }

  mergeTableOptions(tableOptions = {}, cells = []) {
    this.cells = cells;
    for (const name of CHAR_NAMES) setOption(this.chars, name, [this.options.chars, tableOptions.chars]);
    setOption(this.options, 'truncate', [this.options, tableOptions]);
    setOption(this.options, 'padding-left', [this.options.style, tableOptions.style]);
    setOption(this.options, 'padding-right', [this.options.style, tableOptions.style]);
    setOption(this.options, 'head', [this.options.style, tableOptions.style]);
    setOption(this.options, 'border', [this.options.style, tableOptions.style]);
    this.paddingLeft = firstDefined(this.options.paddingLeft, 1);
    this.paddingRight = firstDefined(this.options.paddingRight, 1);
    this.computeLines(tableOptions);
  }

  computeLines(tableOptions) {
    const contentWidth = Math.max(0,
      firstDefined(this.options.fixedWidth, findDimension(tableOptions.colWidths, this.x, this.colSpan),
        stringWidth(this.content) + this.paddingLeft + this.paddingRight) - this.paddingLeft - this.paddingRight,
    );
    this.lines = this.wrapLines(contentWidth);
    this.desiredWidth = stringWidth(this.content) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }

  wrapLines(width) {
    return wrapText(this.content, width, firstDefined(this.options.wordWrap, this.options.textWrap, false));
  }

  init(tableOptions) {
    const colWidths = tableOptions.colWidths || [];
    const rowHeights = tableOptions.rowHeights || [];
    this.width = firstDefined(this.options.fixedWidth, findDimension(colWidths, this.x, this.colSpan), this.desiredWidth);
    this.height = firstDefined(this.options.fixedHeight, findDimension(rowHeights, this.y, this.rowSpan), this.desiredHeight);
    this.hAlign = firstDefined(this.options.hAlign, tableOptions.colAligns?.[this.x], 'left');
    this.vAlign = firstDefined(this.options.vAlign, tableOptions.rowAligns?.[this.y], 'top');
    this.drawRight = this.x + this.colSpan === colWidths.length;
  }

  draw(lineNumber, spanningCell) {
    if (lineNumber === 'top') return this.drawTop(spanningCell);
    if (lineNumber === 'bottom') return this.drawBottom(spanningCell);
    const contentHeight = Math.max(this.height, this.lines.length);
    let offset = 0;
    if (this.vAlign === 'center') offset = Math.ceil((contentHeight - this.lines.length) / 2);
    else if (this.vAlign === 'bottom') offset = contentHeight - this.lines.length;
    const line = this.lines[lineNumber - offset];
    return line === undefined ? this.drawEmpty(lineNumber, spanningCell) : this.drawLine(line, lineNumber, spanningCell);
  }

  drawTop() {
    const right = this.drawRight ? this.chars.topRight || '' : this.chars.topMid || '';
    return this.wrapWithStyleColors(this._topLeftChar() + repeat(this.chars.top || '', this.width) + right, 'border');
  }

  _topLeftChar() {
    if (this.x === 0 && this.y === 0) return this.chars.topLeft || '';
    if (this.y === 0) return this.chars.topMid || '';
    if (this.x === 0) return this.chars.leftMid || '';
    return this.chars.midMid || '';
  }

  wrapWithStyleColors(text, styleName) {
    return applyStyle(text, this.options[styleName]);
  }

  drawLine(line, lineNumber, spanningCell) {
    const left = this.x === 0 ? this.chars.left || '' : this.chars.middle || '';
    const right = this.drawRight ? this.chars.right || '' : '';
    const innerWidth = Math.max(0, this.width - this.paddingLeft - this.paddingRight);
    line = truncate(line, innerWidth, firstDefined(this.options.truncate, '…'));
    line = pad(line, innerWidth, ' ', this.hAlign);
    const content = repeat(' ', this.paddingLeft) + line + repeat(' ', this.paddingRight);
    return this.stylizeLine(left + content + right, lineNumber, spanningCell);
  }

  stylizeLine(line, lineNumber) {
    return this.wrapWithStyleColors(line, lineNumber === 0 ? 'head' : 'border');
  }

  drawBottom() {
    const left = this.x === 0 ? this.chars.bottomLeft || '' : this.chars.bottomMid || '';
    const right = this.drawRight ? this.chars.bottomRight || '' : this.chars.bottomMid || '';
    return this.wrapWithStyleColors(left + repeat(this.chars.bottom || '', this.width) + right, 'border');
  }

  drawEmpty(lineNumber, spanningCell) {
    const left = this.x === 0 ? this.chars.left || '' : this.chars.middle || '';
    const right = this.drawRight ? this.chars.right || '' : '';
    return this.stylizeLine(left + repeat(' ', this.width) + right, lineNumber, spanningCell);
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
    this.cellOffset = findDimension(tableOptions.rowHeights, this.originalCell.y, this.y - this.originalCell.y);
    this.offset = firstDefined(this.cellOffset, 0);
  }

  draw(lineNumber) {
    if (lineNumber === 'top') return this.originalCell.draw(this.offset, this);
    if (lineNumber === 'bottom') return this.originalCell.draw('bottom', this);
    return this.originalCell.draw(this.offset + lineNumber, this);
  }

  mergeTableOptions() {}
}

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
