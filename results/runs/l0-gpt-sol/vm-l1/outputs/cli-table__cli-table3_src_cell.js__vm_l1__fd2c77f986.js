'use strict';

const { info, debug } = require('./debug');
const utils = require('./utils');

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

function firstDefined() {
  for (let i = 0; i < arguments.length; i++) {
    if (arguments[i] !== undefined) return arguments[i];
  }
}

function setOption(target, name, sources, defaultValue) {
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    if (source && source[name] !== undefined) {
      target[name] = source[name];
      return source[name];
    }
  }

  target[name] = defaultValue;
  return defaultValue;
}

function findDimension(dimension, cells, getter) {
  let result = 1;

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const desired = getter(cell);

    if (desired) {
      result = Math.max(
        result,
        desired - dimension + firstDefined(cell[dimension], 0)
      );
    }
  }

  return result;
}

function sumPlusOne(cells, dimension) {
  let result = 1;

  for (let i = 0; i < cells.length; i++) {
    result += firstDefined(cells[i][dimension], 0) + 1;
  }

  return result;
}

function visibleLength(value) {
  value = String(value);

  if (utils && typeof utils.strlen === 'function') {
    return utils.strlen(value);
  }

  return value.replace(
    // ANSI CSI and OSC sequences.
    /[\u001b\u009b][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g,
    ''
  ).length;
}

function repeat(value, count) {
  count = Math.max(0, count | 0);

  if (utils && typeof utils.repeat === 'function') {
    return utils.repeat(value, count);
  }

  return String(value).repeat(count);
}

function truncate(value, width, marker) {
  value = String(value);
  width = Math.max(0, width | 0);

  if (visibleLength(value) <= width) return value;

  if (utils && typeof utils.truncate === 'function') {
    return utils.truncate(value, width, marker);
  }

  marker = marker == null ? '…' : String(marker);

  if (width <= visibleLength(marker)) {
    return marker.slice(0, width);
  }

  let result = '';
  let length = 0;
  const target = width - visibleLength(marker);

  for (const character of value) {
    if (length >= target) break;
    result += character;
    length++;
  }

  return result + marker;
}

function pad(value, width, left, right) {
  value = String(value);
  const remaining = Math.max(0, width - visibleLength(value));

  if (left == null || right == null) {
    left = 0;
    right = remaining;
  }

  return repeat(' ', left) + value + repeat(' ', right);
}

function normalizeLines(value) {
  return String(value == null ? '' : value).split(/\r\n|\n|\r/);
}

function wrapLine(value, width, wordWrap, truncateMarker) {
  value = String(value);
  width = Math.max(0, width | 0);

  if (width === 0) return [''];
  if (visibleLength(value) <= width) return [value];

  if (utils) {
    if (wordWrap && typeof utils.wordWrap === 'function') {
      return utils.wordWrap(width, value);
    }

    if (!wordWrap && typeof utils.wrapWord === 'function') {
      return utils.wrapWord(width, value);
    }
  }

  const lines = [];
  let remaining = value;

  while (visibleLength(remaining) > width) {
    let splitAt = width;

    if (wordWrap) {
      const candidate = remaining.slice(0, width + 1);
      const whitespace = candidate.lastIndexOf(' ');
      if (whitespace > 0) splitAt = whitespace;
    }

    let line = remaining.slice(0, splitAt);
    remaining = remaining.slice(splitAt);

    if (wordWrap) {
      line = line.replace(/\s+$/, '');
      remaining = remaining.replace(/^\s+/, '');
    }

    lines.push(truncate(line, width, truncateMarker));
  }

  lines.push(remaining);
  return lines;
}

class Cell {
  constructor(options) {
    options = options || {};
    this.options = options;
    this.setOptions(options);
  }

  setOptions(options) {
    options = options || {};

    this.options = options;
    this.content = firstDefined(options.content, this.content, '');
    this.colSpan = firstDefined(options.colSpan, this.colSpan, 1);
    this.rowSpan = firstDefined(options.rowSpan, this.rowSpan, 1);
    this.hAlign = firstDefined(options.hAlign, this.hAlign);
    this.vAlign = firstDefined(options.vAlign, this.vAlign);
    this.desiredWidth = firstDefined(options.width, this.desiredWidth);
    this.desiredHeight = firstDefined(options.height, this.desiredHeight);
    this.wordWrap = firstDefined(options.wordWrap, this.wordWrap);
    this.truncate = firstDefined(options.truncate, this.truncate);
    this.chars = Object.assign({}, this.chars, options.chars);
    this.style = Object.assign({}, this.style, options.style);
    this.head = firstDefined(options.head, this.head);

    return this;
  }

  mergeTableOptions(tableOptions, cells) {
    tableOptions = tableOptions || {};
    cells = cells || [];

    const options = this.options || {};
    const optionStyle = options.style || {};
    const tableStyle = tableOptions.style || {};
    const optionChars = options.chars || {};
    const tableChars = tableOptions.chars || {};

    this.chars = this.chars || {};
    this.style = this.style || {};

    for (const name of CHAR_NAMES) {
      setOption(this.chars, name, [optionChars, tableChars], '');
    }

    setOption(
      this.style,
      'padding-left',
      [optionStyle, tableStyle],
      1
    );
    setOption(
      this.style,
      'padding-right',
      [optionStyle, tableStyle],
      1
    );
    setOption(this.style, 'head', [optionStyle, tableStyle], []);
    setOption(this.style, 'border', [optionStyle, tableStyle], []);

    setOption(this, 'hAlign', [options, tableOptions], 'left');
    setOption(this, 'vAlign', [options, tableOptions], 'top');
    setOption(this, 'wordWrap', [options, tableOptions], false);
    setOption(this, 'truncate', [options, tableOptions], '…');

    if (this.desiredWidth === undefined) {
      this.desiredWidth = findDimension('x', cells, cell => cell.desiredWidth);
    }

    if (this.desiredHeight === undefined) {
      this.desiredHeight = findDimension(
        'y',
        cells,
        cell => cell.desiredHeight
      );
    }

    return this;
  }

  init(tableOptions, cells) {
    this.mergeTableOptions(tableOptions, cells);

    this.x = firstDefined(this.x, 0);
    this.y = firstDefined(this.y, 0);
    this.width = Math.max(
      1,
      firstDefined(this.width, this.desiredWidth, 1)
    );
    this.height = Math.max(
      1,
      firstDefined(this.height, this.desiredHeight, 1)
    );

    this.lines = this.computeLines();
    return this;
  }

  wrapLines(content) {
    const paddingLeft = firstDefined(this.style['padding-left'], 0);
    const paddingRight = firstDefined(this.style['padding-right'], 0);
    const width = Math.max(0, this.width - paddingLeft - paddingRight - 2);
    const output = [];

    for (const sourceLine of normalizeLines(content)) {
      output.push(
        ...wrapLine(sourceLine, width, this.wordWrap, this.truncate)
      );
    }

    return output.length ? output : [''];
  }

  drawTop() {
    const left = firstDefined(
      this.chars[this.x === 0 ? 'top-left' : 'top-mid'],
      ''
    );
    const right = firstDefined(this.chars['top-right'], '');
    return (
      left +
      repeat(this.chars.top || '', Math.max(0, this.width - 2)) +
      right
    );
  }

  draw(lineNum, spanningCell) {
    if (lineNum === 0) return this.drawTop(spanningCell);
    if (lineNum === this.height - 1) return this.drawBottom(spanningCell);
    return this.drawLine(lineNum - 1, spanningCell);
  }

  drawBottom() {
    const left = firstDefined(
      this.chars[this.x === 0 ? 'bottom-left' : 'bottom-mid'],
      ''
    );
    const right = firstDefined(this.chars['bottom-right'], '');
    return (
      left +
      repeat(this.chars.bottom || '', Math.max(0, this.width - 2)) +
      right
    );
  }

  stylizeLine(line, style) {
    if (!style || style.length === 0) return line;

    if (utils && typeof utils.colorizeLines === 'function') {
      return utils.colorizeLines([line], style)[0];
    }

    if (utils && typeof utils.colorize === 'function') {
      return utils.colorize(line, style);
    }

    return line;
  }

  wrapWithStyleColors(line, content) {
    const style = this.head ? this.style.head : this.style.body;

    if (utils && typeof utils.colorizeLines === 'function') {
      const colored = utils.colorizeLines([content], style || []);
      return line.replace(content, colored[0]);
    }

    return line;
  }

  drawLine(lineNum) {
    const lines = this.lines || this.computeLines();
    const contentHeight = Math.max(0, this.height - 2);
    let topPadding = 0;

    if (this.vAlign === 'center') {
      topPadding = Math.floor((contentHeight - lines.length) / 2);
    } else if (this.vAlign === 'bottom') {
      topPadding = contentHeight - lines.length;
    }

    topPadding = Math.max(0, topPadding);

    let content =
      lineNum >= topPadding && lineNum < topPadding + lines.length
        ? lines[lineNum - topPadding]
        : '';

    const leftPadding = firstDefined(this.style['padding-left'], 0);
    const rightPadding = firstDefined(this.style['padding-right'], 0);
    const contentWidth = Math.max(
      0,
      this.width - leftPadding - rightPadding - 2
    );

    content = truncate(content, contentWidth, this.truncate);

    const remaining = Math.max(0, contentWidth - visibleLength(content));
    let before = 0;
    let after = remaining;

    if (this.hAlign === 'center') {
      before = Math.floor(remaining / 2);
      after = remaining - before;
    } else if (this.hAlign === 'right') {
      before = remaining;
      after = 0;
    }

    const styledContent = this.stylizeLine(
      content,
      this.head ? this.style.head : this.style.body
    );

    return (
      firstDefined(this.chars.left, '') +
      repeat(' ', leftPadding + before) +
      styledContent +
      repeat(' ', rightPadding + after) +
      firstDefined(this.chars.right, '')
    );
  }

  computeLines() {
    this.lines = this.wrapLines(this.content);

    const availableHeight = Math.max(0, this.height - 2);
    if (availableHeight && this.lines.length > availableHeight) {
      this.lines = this.lines.slice(0, availableHeight);
      const last = this.lines.length - 1;
      this.lines[last] = truncate(
        this.lines[last],
        Math.max(
          0,
          this.width -
            firstDefined(this.style['padding-left'], 0) -
            firstDefined(this.style['padding-right'], 0) -
            2
        ),
        this.truncate
      );
    }

    return this.lines;
  }

  _topLeftChar() {
    return firstDefined(
      this.chars[this.x === 0 ? 'top-left' : 'top-mid'],
      ''
    );
  }

  drawEmpty(lineNum, spanningCell) {
    if (lineNum === 0) {
      return (
        this._topLeftChar() +
        repeat(this.chars.top || '', Math.max(0, this.width - 2)) +
        firstDefined(this.chars['top-right'], '')
      );
    }

    if (lineNum === this.height - 1) {
      return this.drawBottom(spanningCell);
    }

    return (
      firstDefined(this.chars.left, '') +
      repeat(' ', Math.max(0, this.width - 2)) +
      firstDefined(this.chars.right, '')
    );
  }
}

class ColSpanCell {
  constructor() {}

  draw(cell) {
    if (!cell) return '';
    if (typeof cell.drawEmpty === 'function') {
      return cell.drawEmpty.apply(cell, Array.prototype.slice.call(arguments, 1));
    }
    return repeat(' ', firstDefined(this.width, 0));
  }

  init() {}

  mergeTableOptions() {}
}

class RowSpanCell {
  constructor(originalCell) {
    this.originalCell = originalCell;
    this.cell = originalCell;

    if (originalCell) {
      this.x = originalCell.x;
      this.y = originalCell.y;
      this.width = originalCell.width;
      this.height = originalCell.height;
      this.chars = originalCell.chars;
      this.style = originalCell.style;
    }
  }

  draw(lineNum) {
    const cell = this.originalCell || this.cell;
    if (!cell) return '';

    if (typeof cell.drawEmpty === 'function') {
      return cell.drawEmpty(lineNum, this);
    }

    return repeat(' ', firstDefined(this.width, cell.width, 0));
  }

  drawBottom() {
    const cell = this.originalCell || this.cell;
    if (cell && typeof cell.drawBottom === 'function') {
      return cell.drawBottom(this);
    }
    return '';
  }

  mergeTableOptions() {}
}

if (debug) {
  void debug;
}
if (info) {
  void info;
}
void sumPlusOne;

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
