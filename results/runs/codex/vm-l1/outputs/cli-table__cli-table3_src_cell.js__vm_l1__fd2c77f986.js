'use strict';

const ansisModule = require('ansis');
const stringWidthModule = require('string-width');

const ansis = ansisModule.default || ansisModule;
const stringWidth = stringWidthModule.default || stringWidthModule;

const CHAR_NAMES = [
  'top', 'topMid', 'topLeft', 'topRight',
  'bottom', 'bottomMid', 'bottomLeft', 'bottomRight',
  'left', 'leftMid', 'mid', 'midMid', 'right', 'rightMid', 'middle',
];

function firstDefined(...values) {
  return values.find((value) => value !== undefined);
}

function repeat(character, count) {
  return count > 0 ? character.repeat(count) : '';
}

function pad(text, length, character = ' ', alignment = 'left') {
  const remaining = length - stringWidth(text);
  if (remaining <= 0) return text;
  if (alignment === 'right') return repeat(character, remaining) + text;
  if (alignment === 'center') {
    const left = Math.floor(remaining / 2);
    return repeat(character, left) + text + repeat(character, remaining - left);
  }
  return text + repeat(character, remaining);
}

function truncate(text, desiredLength, truncationMarker = '…') {
  text = String(text);
  if (stringWidth(text) <= desiredLength) return text;
  const markerWidth = stringWidth(truncationMarker);
  let result = '';
  for (const character of text) {
    if (stringWidth(result + character) + markerWidth > desiredLength) break;
    result += character;
  }
  return result + (desiredLength >= markerWidth ? truncationMarker : '');
}

function wordWrap(maxLength, input, wrapOnWordBoundary) {
  const lines = [];
  for (const sourceLine of String(input).split('\n')) {
    let line = sourceLine;
    if (line === '') {
      lines.push('');
      continue;
    }
    while (stringWidth(line) > maxLength) {
      let splitAt = maxLength;
      if (wrapOnWordBoundary) {
        const candidate = line.slice(0, maxLength + 1).lastIndexOf(' ');
        if (candidate > 0) splitAt = candidate;
      }
      lines.push(line.slice(0, splitAt));
      line = line.slice(splitAt).replace(/^\s+/, '');
    }
    lines.push(line);
  }
  return lines;
}

function colorizeLines(lines, colors) {
  if (!Array.isArray(colors)) return lines.slice();
  return colors.reduce(
    (coloredLines, color) => coloredLines.map((line) =>
      typeof ansis[color] === 'function' ? ansis[color](line) : line),
    lines.slice(),
  );
}

function hyperlink(text, url) {
  return url
    ? '\\u001B]8;;' + url + '\\u0007' + text + '\\u001B]8;;\\u0007'
    : text;
}

function setOption(cellOptions, tableOptions, optionName, destination) {
  const parts = optionName.split('-');
  const camelCaseName = parts[0] + parts.slice(1)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
  destination[camelCaseName] = firstDefined(
    cellOptions && cellOptions[camelCaseName],
    cellOptions && cellOptions[optionName],
    tableOptions && tableOptions[camelCaseName],
    tableOptions && tableOptions[optionName],
  );
}

function findDimension(dimensions, start, span) {
  return dimensions.slice(start, start + span).reduce(sumPlusOne);
}

function sumPlusOne(total, value) {
  return total + 1 + value;
}

class Cell {
  constructor(options) {
    this.setOptions(options);
    this.x = null;
    this.y = null;
  }

  setOptions(options) {
    if (typeof options === 'string' || typeof options === 'number') {
      options = { content: String(options) };
    }
    options = options || {};
    const content = firstDefined(options.content, '');
    if (typeof content !== 'string' && typeof content !== 'number') {
      throw new Error('Content needs to be a primitive, got: ' + typeof content);
    }
    this.options = options;
    this.content = String(content);
    this.colSpan = firstDefined(options.colSpan, 1);
    this.rowSpan = firstDefined(options.rowSpan, 1);
  }

  mergeTableOptions(tableOptions, cells) {
    this.cells = cells;
    this.chars = {};
    const cellChars = this.options.chars || {};
    const tableChars = tableOptions.chars || {};
    for (const name of CHAR_NAMES) {
      this.chars[name] = firstDefined(cellChars[name], tableChars[name]);
    }

    this.truncate = firstDefined(this.options.truncate, tableOptions.truncate);
    const cellStyle = this.options.style || {};
    const tableStyle = tableOptions.style || {};
    setOption(cellStyle, tableStyle, 'padding-left', this);
    setOption(cellStyle, tableStyle, 'padding-right', this);
    setOption(cellStyle, tableStyle, 'head', this);
    setOption(cellStyle, tableStyle, 'border', this);

    this.fixedWidth = findDimension(tableOptions.colWidths, this.x, this.colSpan);
    this.lines = this.computeLines(tableOptions);
    this.desiredWidth = stringWidth(this.content) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }

  computeLines(tableOptions) {
    const wordWrapEnabled = firstDefined(tableOptions.wordWrap, this.options.wordWrap, false);
    if (!this.fixedWidth) return this.wrapLines(this.content.split('\n'));

    const availableWidth = this.fixedWidth - this.paddingLeft - this.paddingRight;
    const wrapOnWordBoundary = firstDefined(
      tableOptions.wrapOnWordBoundary,
      this.options.wrapOnWordBoundary,
      true,
    );
    const lines = wordWrapEnabled
      ? wordWrap(availableWidth, this.content, wrapOnWordBoundary)
      : this.content.split('\n').map((line) => truncate(line, availableWidth, this.truncate));
    return this.wrapLines(lines);
  }

  wrapLines(lines) {
    return colorizeLines(lines, this.head).map((line) => hyperlink(line, this.options.href));
  }

  init(tableOptions) {
    this.widths = tableOptions.colWidths.slice(this.x, this.x + this.colSpan);
    this.heights = tableOptions.rowHeights.slice(this.y, this.y + this.rowSpan);
    this.width = this.widths.reduce(sumPlusOne, -1);
    this.height = this.heights.reduce(sumPlusOne, -1);
    this.hAlign = firstDefined(this.options.hAlign, tableOptions.colAligns[this.x], 'left');
    this.vAlign = firstDefined(this.options.vAlign, tableOptions.rowAligns[this.y], 'top');
    this.drawRight = this.x + this.colSpan === tableOptions.colWidths.length;
  }

  draw(lineNumber) {
    const contentHeight = this.lines.length;
    let topPadding = 0;
    if (this.vAlign === 'center') topPadding = Math.floor((this.height - contentHeight) / 2);
    else if (this.vAlign === 'bottom') topPadding = this.height - contentHeight;

    const contentLine = lineNumber - topPadding;
    if (contentLine < 0 || contentLine >= contentHeight) {
      return this.drawEmpty(lineNumber, this.drawRight);
    }
    return this.drawLine(contentLine, this.lines[contentLine], this.drawRight, lineNumber);
  }

  drawTop() {
    let content = '';
    this.widths.forEach((width, index) => {
      if (index > 0) content += this.chars[this.y === 0 ? 'topMid' : 'midMid'];
      content += repeat(this.chars[this.y === 0 ? 'top' : 'mid'], width);
    });
    content = this._topLeftChar() + content + this.chars[this.y === 0 ? 'topRight' : 'rightMid'];
    return this.wrapWithStyleColors('border', content);
  }

  _topLeftChar() {
    if (this.x === 0) return this.chars[this.y === 0 ? 'topLeft' : 'leftMid'];
    const cellToLeft = this.cells[this.y][this.x - 1];
    if (cellToLeft instanceof RowSpanCell) return this.chars.midMid;
    return this.chars[this.y === 0 ? 'topMid' : 'midMid'];
  }

  wrapWithStyleColors(styleName, content) {
    return colorizeLines([content], this[styleName])[0];
  }

  drawLine(lineNumber, line, drawRight) {
    let left = this.x === 0 ? this.chars.left : this.chars.middle;
    const cellToLeft = this.x > 0 && this.cells[this.y][this.x - 1];
    if (cellToLeft instanceof RowSpanCell) left = this.chars.leftMid;
    const right = drawRight ? this.chars.right : this.chars.middle;
    const innerWidth = this.width - this.paddingLeft - this.paddingRight;
    const fittedLine = pad(
      truncate(line, innerWidth, this.truncate),
      innerWidth,
      ' ',
      this.hAlign,
    );
    return this.stylizeLine(
      left + repeat(' ', this.paddingLeft),
      fittedLine,
      repeat(' ', this.paddingRight) + right,
    );
  }

  stylizeLine(left, content, right) {
    return this.wrapWithStyleColors('border', left) +
      content +
      this.wrapWithStyleColors('border', right);
  }

  drawBottom() {
    const left = this.x === 0 ? this.chars.bottomLeft : this.chars.bottomMid;
    const content = repeat(this.chars.bottom, this.width);
    return this.wrapWithStyleColors('border', left + content + this.chars.bottomRight);
  }

  drawEmpty(lineNumber, drawRight) {
    let left = this.x === 0 ? this.chars.left : this.chars.middle;
    const cellToLeft = this.x > 0 && this.cells[this.y][this.x - 1];
    if (cellToLeft instanceof RowSpanCell) left = this.chars.leftMid;
    const right = drawRight ? this.chars.right : this.chars.middle;
    return this.stylizeLine(left, repeat(' ', this.width), right);
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
    this.offset = tableOptions.rowHeights
      .slice(this.originalCell.y, this.y)
      .reduce(sumPlusOne, -1);
  }

  draw(lineNumber) {
    return this.originalCell.draw(lineNumber + this.offset);
  }

  mergeTableOptions() {}
}

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
