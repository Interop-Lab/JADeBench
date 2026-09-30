const stringWidth = require('string-width');

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
  'middle',
];

function camelCase(name) {
  return name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function setOption(options, defaults, name, target) {
  const property = camelCase(name);
  const values = [options && options[name]];
  if (property !== name) values.push(options && options[property]);
  values.push(defaults && defaults[name]);
  if (property !== name) values.push(defaults && defaults[property]);
  target[property] = firstDefined(...values);
}

function sumPlusOne(total, value) {
  return total + value + 1;
}

function findDimension(dimensions, start, span) {
  return dimensions.slice(start, start + (span || 1)).reduce(sumPlusOne, -1);
}

function repeat(value, count) {
  return Array(Math.max(0, count) + 1).join(value);
}

function pad(value, width, fill, alignment) {
  const remaining = Math.max(0, width - stringWidth(value));
  if (alignment === 'right') return repeat(fill, remaining) + value;
  if (alignment === 'center') {
    const left = Math.floor(remaining / 2);
    return repeat(fill, left) + value + repeat(fill, remaining - left);
  }
  return value + repeat(fill, remaining);
}

function truncate(value, width, marker) {
  if (stringWidth(value) <= width) return value;
  const markerWidth = stringWidth(marker);
  const available = Math.max(0, width - markerWidth);
  let result = '';
  for (const character of value) {
    if (stringWidth(result + character) > available) break;
    result += character;
  }
  return result + marker;
}

function wordWrap(width, value, wrapOnWordBoundary) {
  const lines = [];
  for (const paragraph of String(value).split('\n')) {
    let remaining = paragraph;
    while (stringWidth(remaining) > width && width > 0) {
      let end = width;
      if (wrapOnWordBoundary) {
        const candidate = remaining.slice(0, width + 1);
        const whitespace = candidate.search(/\s+[^\s]*$/);
        if (whitespace > 0) end = whitespace;
      }
      lines.push(remaining.slice(0, end));
      remaining = remaining.slice(end).replace(/^\s+/, '');
    }
    lines.push(remaining);
  }
  return lines;
}

function colorizeLines(lines) {
  return Array.from(lines);
}

class Cell {
  constructor(options) {
    this.setOptions(options);
  }

  setOptions(options = {}) {
    this.options = options;
    this.content = options.content == null ? '' : String(options.content);
    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;
    this.x = null;
    this.y = null;
  }

  mergeTableOptions(tableOptions, cells) {
    this.cells = cells;
    this.chars = {};
    const cellChars = this.options.chars || {};
    const tableChars = tableOptions.chars || {};
    for (const name of CHAR_NAMES) setOption(cellChars, tableChars, name, this.chars);

    this.truncate = firstDefined(this.options.truncate, tableOptions.truncate, '…');
    this.options.style ||= {};
    const tableStyle = tableOptions.style || {};
    setOption(this.options.style, tableStyle, 'padding-left', this);
    setOption(this.options.style, tableStyle, 'padding-right', this);
    this.paddingLeft = firstDefined(this.paddingLeft, 0);
    this.paddingRight = firstDefined(this.paddingRight, 0);
    this.head = firstDefined(this.options.style.head, tableStyle.head, []);
    this.border = firstDefined(this.options.style.border, tableStyle.border, []);

    this.wordWrap = firstDefined(this.options.wordWrap, tableOptions.wordWrap, false);
    this.wrapOnWordBoundary = firstDefined(
      this.options.wrapOnWordBoundary,
      tableOptions.wrapOnWordBoundary,
      true,
    );

    const columnWidth = tableOptions.colWidths && tableOptions.colWidths[this.x];
    this.fixedWidth = this.wordWrap && columnWidth != null
      ? findDimension(tableOptions.colWidths, this.x, this.colSpan) -
        this.paddingLeft -
        this.paddingRight
      : columnWidth;
    this.lines = this.computeLines();
    this.desiredWidth = this.content.split('\n').reduce(
      (maximum, line) => Math.max(maximum, stringWidth(line)),
      0,
    ) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }

  computeLines() {
    const lines = this.wordWrap && this.fixedWidth != null
      ? wordWrap(this.fixedWidth, this.content, this.wrapOnWordBoundary)
      : this.content.split('\n');
    return this.wrapLines(lines);
  }

  wrapLines(lines) {
    return colorizeLines(lines);
  }

  init(tableOptions) {
    this.widths = tableOptions.colWidths.slice(this.x, this.x + this.colSpan);
    this.heights = tableOptions.rowHeights.slice(this.y, this.y + this.rowSpan);
    this.width = this.widths.reduce(sumPlusOne, -1);
    this.height = this.heights.reduce(sumPlusOne, -1);
    this.hAlign = firstDefined(
      this.options.colAlign,
      tableOptions.colAligns && tableOptions.colAligns[this.x],
      'left',
    );
    this.vAlign = firstDefined(
      this.options.rowAlign,
      tableOptions.rowAligns && tableOptions.rowAligns[this.y],
      'top',
    );
    this.drawRight = this.x + this.colSpan === tableOptions.colWidths.length;
  }

  draw(lineNumber, drawRight) {
    let contentIndex = lineNumber;
    const blankLines = this.height - this.lines.length;
    if (this.vAlign === 'center') contentIndex -= Math.floor(blankLines / 2);
    if (this.vAlign === 'bottom') contentIndex -= blankLines;

    if (contentIndex < 0 || contentIndex >= this.lines.length) {
      return this.drawEmpty(false, drawRight);
    }
    return this.drawLine(contentIndex, false, false, drawRight);
  }

  drawTop(drawRight) {
    const horizontal = this.y === 0 ? this.chars.top : this.chars.mid;
    const right = drawRight
      ? (this.y === 0 ? this.chars.topRight : this.chars.rightMid)
      : '';
    const line = this._topLeftChar(0) + repeat(horizontal, this.width) + right;
    return this.wrapWithStyleColors('border', line);
  }

  _topLeftChar(offset) {
    if (offset) return this.y === 0 ? this.chars.top : this.chars.mid;
    if (this.y === 0) return this.x === 0 ? this.chars.topLeft : this.chars.topMid;
    return this.x === 0 ? this.chars.leftMid : this.chars.midMid;
  }

  wrapWithStyleColors(styleName, value) {
    let styled = value;
    for (const style of this[styleName] || []) {
      if (typeof style === 'function') styled = style(styled);
    }
    return styled;
  }

  drawLine(lineNumber, forceLeft, forceRight, drawRight) {
    const left = forceLeft || this.x === 0 ? this.chars.left : this.chars.middle;
    const right = forceRight || this.drawRight ? this.chars.right : '';
    const innerWidth = Math.max(0, this.width - this.paddingLeft - this.paddingRight);
    const source = truncate(this.lines[lineNumber], this.width, this.truncate);
    const content =
      repeat(' ', this.paddingLeft) +
      pad(truncate(source, innerWidth, this.truncate), innerWidth, ' ', this.hAlign) +
      repeat(' ', this.paddingRight);
    return this.stylizeLine(left, content, right);
  }

  stylizeLine(left, content, right) {
    return (
      this.wrapWithStyleColors('border', left) +
      this.wrapWithStyleColors('head', content) +
      this.wrapWithStyleColors('border', right)
    );
  }

  drawBottom(drawRight) {
    const left = this.x === 0 ? this.chars.bottomLeft : this.chars.bottomMid;
    const right = drawRight ? this.chars.bottomRight : '';
    const line = left + repeat(this.chars.bottom, this.width) + right;
    return this.wrapWithStyleColors('border', line);
  }

  drawEmpty(forceLeft, drawRight) {
    const left = forceLeft || this.x === 0 ? this.chars.left : this.chars.middle;
    const right = this.drawRight ? this.chars.right : '';
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
    this.offset = findDimension(
      tableOptions.rowHeights,
      this.originalCell.y,
      this.cellOffset,
    );
  }

  draw(lineNumber) {
    return this.originalCell.draw(lineNumber + this.offset + 1);
  }

  mergeTableOptions() {}
}

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
