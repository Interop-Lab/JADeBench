'use strict';

const stringWidthModule = require('string-width');
const stringWidth = stringWidthModule.default || stringWidthModule;

const ANSI_PATTERN = /\u001b\[(?:\d*;){0,5}\d*m/g;

function strlen(value) {
  const lines = String(value).replace(ANSI_PATTERN, '').split('\n');
  return lines.reduce((maximum, line) => Math.max(maximum, stringWidth(line)), 0);
}

function repeat(value, count) {
  return Array(count + 1).join(value);
}

function pad(value, length, padCharacter = ' ', direction = 'right') {
  const width = strlen(value);
  if (length + 1 <= width) return value;
  const remaining = length - width;
  if (direction === 'left') return repeat(padCharacter, remaining) + value;
  if (direction === 'center') {
    const left = Math.ceil(remaining / 2);
    return repeat(padCharacter, left) + value + repeat(padCharacter, remaining - left);
  }
  return value + repeat(padCharacter, remaining);
}

function truncate(value, length, truncation = '…') {
  value = String(value);
  if (strlen(value) <= length) return value;
  const target = Math.max(0, length - strlen(truncation));
  let result = '';
  let width = 0;
  for (const character of value) {
    const characterWidth = stringWidth(character);
    if (width + characterWidth > target) break;
    result += character;
    width += characterWidth;
  }
  return result + truncation;
}

function mergeOptions(defaults, options) {
  const merged = {};
  for (const key of Object.keys(defaults)) {
    merged[key] = options[key] === undefined ? defaults[key] : options[key];
  }
  return merged;
}

function hardWrap(width, text) {
  const lines = [];
  let line = '';
  for (const character of text) {
    if (strlen(line + character) > width) {
      lines.push(line);
      line = '';
    }
    line += character;
  }
  if (line || !lines.length) lines.push(line);
  return lines;
}

function softWrap(width, text) {
  const lines = [];
  let line = '';
  for (const token of text.split(/(\s+)/g)) {
    if (!token) continue;
    if (strlen(line + token) <= width) {
      line += token;
      continue;
    }
    if (line.trim()) lines.push(line.trimEnd());
    if (strlen(token) > width) {
      const wrapped = hardWrap(width, token.trim());
      lines.push(...wrapped.slice(0, -1));
      line = wrapped.at(-1) || '';
    } else {
      line = token.trimStart();
    }
  }
  if (line || !lines.length) lines.push(line.trimEnd());
  return lines;
}

function wordWrap(width, text, hard = true) {
  const lines = [];
  const wrapper = hard ? hardWrap : softWrap;
  for (const sourceLine of String(text).split('\n')) lines.push(...wrapper(width, sourceLine));
  return lines;
}

function colorizeLines(lines) {
  const activeCodes = [];
  return lines.map((line) => {
    const prefix = activeCodes.join('');
    for (const match of line.matchAll(ANSI_PATTERN)) {
      if (match[0] === '\u001b[0m') activeCodes.length = 0;
      else activeCodes.push(match[0]);
    }
    return prefix + line + (activeCodes.length ? '\u001b[0m' : '');
  });
}

function hyperlink(url, text) {
  return ['\u001b]8;;', url, '\u0007', text, '\u001b]8;;\u0007'].join('');
}

function parseHexValue(value) {
  return (String(value).match(/#[0-9a-fA-F]{3,6}/) || ['#000'])[0];
}

const utils = { strlen, repeat, pad, truncate, mergeOptions, wordWrap, colorizeLines, hyperlink, parseHexValue };

const DEBUG = 0;
const INFO = 1;
const WARN = 2;
let debugLevel = 0;
let messages = [];
function log(message, level) { if (debugLevel >= level) messages.push(message); }
const debug = (message) => log(message, DEBUG);
const info = (message) => log(message, INFO);
debug.reset = () => { messages = []; };
debug.setDebugLevel = (level) => { debugLevel = level; };
debug.warn = (message) => log(message, WARN);
debug.info = info;
debug.debug = debug;
debug.debugMessages = () => messages;

function firstDefined(...values) {
  return values.find((value) => value !== undefined);
}

function setOption(local, defaults, name, target) {
  const camelCaseName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  target[camelCaseName] = firstDefined(local[camelCaseName], local[name], defaults[camelCaseName], defaults[name]);
}

function sumPlusOne(left, right) {
  return left + right + 1;
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
    else throw new Error('Content needs to be a primitive, got: ' + typeof content);
    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;
    if (options.href) Object.defineProperty(this, 'href', { get: () => this.options.href });
  }

  mergeTableOptions(tableOptions, cells) {
    this.cells = cells;
    this.chars = { ...tableOptions.chars, ...(this.options.chars || {}) };
    this.truncate = this.options.truncate || tableOptions.truncate;
    const style = (this.options.style ||= {});
    setOption(style, tableOptions.style, 'padding-left', this);
    setOption(style, tableOptions.style, 'padding-right', this);
    this.head = style.head || tableOptions.style.head;
    this.border = style.border || tableOptions.style.border;
    this.fixedWidth = tableOptions.colWidths[this.x];
    this.lines = this.computeLines(tableOptions);
    this.desiredWidth = utils.strlen(this.content) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }

  computeLines(tableOptions) {
    const useWordWrap = tableOptions.wordWrap || tableOptions.textWrap;
    const { wordWrap: cellWordWrap = useWordWrap } = this.options;
    if (this.fixedWidth && cellWordWrap) {
      this.fixedWidth -= this.paddingLeft + this.paddingRight;
      return utils.wordWrap(this.fixedWidth, this.content, cellWordWrap !== 'soft');
    }
    return String(this.content).split('\n');
  }

  wrapLines(lines) {
    return utils.colorizeLines(lines);
  }

  init(tableOptions, cells, x, y) {
    this.x = x;
    this.y = y;
    this.mergeTableOptions(tableOptions, cells);
    this.widths = tableOptions.colWidths.slice(x, x + this.colSpan);
    this.heights = tableOptions.rowHeights.slice(y, y + this.rowSpan);
    this.width = this.widths.reduce(sumPlusOne, -1);
    this.height = this.heights.reduce(sumPlusOne, -1);
    this.hAlign = this.options.hAlign || tableOptions.colAligns[x];
    this.vAlign = this.options.vAlign || tableOptions.rowAligns[y];
    this.drawRight = x + this.colSpan === tableOptions.colWidths.length;
    this.lines = this.wrapLines(this.lines);
  }

  draw(line, spanningCell) {
    if (line < 0 || line > this.height) return '';
    if (line === 0) return this.drawTop(this.drawRight);
    if (line === this.height) return this.drawBottom(this.drawRight);
    return this.drawLine(line - 1, this.drawRight, spanningCell, line);
  }

  drawTop(drawRight) {
    const left = this.chars[this.x === 0 ? 'top-left' : 'top-mid'];
    return this.wrapWithStyleColors('border', left + repeat(this.chars.top, this.width) + (drawRight ? this.chars['top-right'] : ''));
  }

  _topLeftChar(offset) {
    if (!this.cells || !this.x || !offset) return this.chars['left-mid'];
    return this.chars.mid;
  }

  wrapWithStyleColors(styleProperty, content) {
    const colors = this[styleProperty] || [];
    if (!colors.length) return content;
    let open = '';
    let close = '';
    for (const color of colors) {
      if (typeof color === 'function') return color(content);
      if (color && typeof color.open === 'string') open += color.open;
      if (color && typeof color.close === 'string') close = color.close + close;
    }
    return open + content + close;
  }

  drawLine(line, drawRight, spanningCell, rowOffset) {
    const left = this.chars[this.x === 0 ? 'left' : 'middle'];
    const right = drawRight ? this.chars.right : '';
    const contentWidth = this.width - this.paddingLeft - this.paddingRight;
    const verticalSpace = Math.max(this.height - this.lines.length - 1, 0);
    const topSpace = this.vAlign === 'bottom' ? verticalSpace : this.vAlign === 'center' ? Math.floor(verticalSpace / 2) : 0;
    const contentLine = this.lines[line - topSpace] || '';
    const aligned = utils.pad(utils.truncate(contentLine, contentWidth, this.truncate), contentWidth, ' ', this.hAlign || 'left');
    return this.stylizeLine(left, repeat(' ', this.paddingLeft) + aligned + repeat(' ', this.paddingRight), right);
  }

  stylizeLine(left, content, right) {
    return this.wrapWithStyleColors('border', left) + this.wrapWithStyleColors('head', content) + this.wrapWithStyleColors('border', right);
  }

  drawBottom(drawRight) {
    const left = this.chars[this.x === 0 ? 'bottom-left' : 'bottom-mid'];
    return this.wrapWithStyleColors('border', left + repeat(this.chars.bottom, this.width) + (drawRight ? this.chars['bottom-right'] : ''));
  }

  drawEmpty(drawRight, rowOffset) {
    let left = this.chars[this.x === 0 ? 'left' : 'middle'];
    if (this.x && rowOffset && this.cells) {
      let neighbor = this.cells[this.y + rowOffset][this.x - 1];
      while (neighbor instanceof ColSpanCell) neighbor = this.cells[neighbor.y][neighbor.x - 1];
      if (!(neighbor instanceof RowSpanCell)) left = this.chars['right-mid'];
    }
    return this.stylizeLine(left, repeat(' ', this.width), drawRight ? this.chars.right : '');
  }
}

class ColSpanCell {
  draw(line) { if (typeof line === 'number') debug(this.y + '-' + this.x + ': 1x1 ColSpanCell'); return ''; }
  init() {}
  mergeTableOptions() {}
}

class RowSpanCell {
  constructor(originalCell) { this.originalCell = originalCell; }
  init(tableOptions, cells, x, y) { this.x = x; this.y = y; this.cells = cells; this.originalCell.cells = cells; }
  draw(line) {
    const originalLine = this.y - this.originalCell.y + line;
    if (originalLine === this.originalCell.height) return this.originalCell.drawBottom(this.originalCell.drawRight);
    return this.originalCell.drawEmpty(this.originalCell.drawRight, this.y - this.originalCell.y);
  }
  mergeTableOptions() {}
}

const CHAR_NAMES = ['top', 'top-mid', 'top-left', 'top-right', 'bottom', 'bottom-mid', 'bottom-left', 'bottom-right', 'left', 'left-mid', 'mid', 'mid-mid', 'right', 'right-mid', 'middle'];
void CHAR_NAMES;

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
