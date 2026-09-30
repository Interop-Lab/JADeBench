"use strict";

const stringWidthModule = require("string-width");
const stringWidth = stringWidthModule.default || stringWidthModule;

const CHAR_NAMES = [
  "top", "top-mid", "top-left", "top-right",
  "bottom", "bottom-mid", "bottom-left", "bottom-right",
  "left", "left-mid", "mid", "mid-mid", "right", "right-mid", "middle",
];

const ANSI_PATTERN = /\u001b\[((?:\d*;){0,5}\d*)m/g;

function strlen(value) {
  return stringWidth(String(value).replace(ANSI_PATTERN, ""));
}

function repeat(value, count) {
  return new Array(Math.max(0, count) + 1).join(value);
}

function pad(value, length, direction = "left", padding = " ") {
  value = String(value);
  const missing = Math.max(0, length - strlen(value));
  if (direction === "right") return repeat(padding, missing) + value;
  if (direction === "center") {
    const left = Math.ceil(missing / 2);
    return repeat(padding, left) + value + repeat(padding, missing - left);
  }
  return value + repeat(padding, missing);
}

function truncate(value, length, marker = "…") {
  value = String(value);
  if (strlen(value) <= length) return value;
  const target = Math.max(0, length - strlen(marker));
  let result = "";
  for (const character of value) {
    if (strlen(result + character) > target) break;
    result += character;
  }
  return result + marker;
}

function mergeOptions(...options) {
  const result = Object.assign({}, ...options);
  result.chars = Object.assign({}, ...options.map(option => option && option.chars));
  result.style = Object.assign({}, ...options.map(option => option && option.style));
  return result;
}

function wordWrap(maxLength, input) {
  const words = String(input).split(/(\s+)/g);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (!word.trim()) continue;
    if (line && strlen(`${line} ${word}`) > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line += `${line ? " " : ""}${word}`;
    }
  }
  if (line || !lines.length) lines.push(line);
  return lines;
}

function textWrap(maxLength, input) {
  const lines = [];
  let line = "";
  for (const character of String(input)) {
    if (strlen(line + character) > maxLength) {
      lines.push(line);
      line = character;
    } else {
      line += character;
    }
  }
  lines.push(line);
  return lines;
}

function hyperlink(url, text) {
  return `\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007`;
}

function firstDefined(...values) {
  return values.find(value => value !== undefined);
}

function setOption(target, options, name, defaultValue) {
  const camelName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  target[camelName] = firstDefined(options && options[name], options && options[camelName], defaultValue);
}

function findDimension(values, start, span) {
  return values.slice(start, start + span).reduce((sum, value) => sum + value, 0) + span - 1;
}

function sumPlusOne(sum, value) {
  return sum + value + 1;
}

function styleText(value, styles) {
  if (!styles || !styles.length) return value;
  let ansis;
  try {
    const moduleValue = require("ansis");
    ansis = moduleValue.default || moduleValue;
  } catch {
    return value;
  }
  return styles.reduce((text, style) => {
    if (typeof style !== "string") return text;
    if (/^#[\da-f]{3,6}$/i.test(style) && ansis.hex) return ansis.hex(style)(text);
    return typeof ansis[style] === "function" ? ansis[style](text) : text;
  }, value);
}

class Cell {
  constructor(options) {
    this.setOptions(options);
  }

  setOptions(options) {
    const primitive = ["boolean", "number", "bigint", "string"].includes(typeof options);
    if (primitive || options == null) options = { content: options == null ? "" : String(options) };
    if (typeof options !== "object") {
      throw new Error(`Content needs to be a primitive, got: ${typeof options}`);
    }
    this.options = options;
    this.content = options.content == null ? "" : String(options.content);
    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;
  }

  mergeTableOptions(tableOptions, cells) {
    this.options = mergeOptions(tableOptions || {}, this.options || {});
    this.cells = cells;
    this.chars = this.options.chars || {};
    for (const name of CHAR_NAMES) setOption(this, this.chars, name, "");
    setOption(this, this.options, "truncate", "…");
    this.style = this.options.style || {};
    setOption(this, this.style, "padding-left", 1);
    setOption(this, this.style, "padding-right", 1);
    this.head = this.style.head || [];
    this.border = this.style.border || [];
    this.x = this.options.x || 0;
    this.y = this.options.y || 0;
    this.fixedWidth = findDimension(this.options.colWidths || [strlen(this.content)], this.x, this.colSpan);
    this.computeLines(this.fixedWidth);
    return this;
  }

  computeLines(width = this.fixedWidth) {
    const contentWidth = Math.max(1, width - this.paddingLeft - this.paddingRight);
    this.lines = this.wrapLines(contentWidth);
    this.desiredWidth = Math.max(...this.lines.map(strlen), 0) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
    return this.lines;
  }

  wrapLines(width) {
    const wrap = this.options.wordWrap === false ? textWrap : wordWrap;
    const lines = String(this.content).split("\n").flatMap(line => wrap(width, line));
    return lines.map(line => styleText(line, this.head));
  }

  init(tableOptions, cells) {
    return this.mergeTableOptions(tableOptions, cells);
  }

  draw(lineNumber, spanningCell) {
    if (lineNumber === "top") return this.drawTop(spanningCell);
    if (lineNumber === "bottom") return this.drawBottom(spanningCell);
    if (typeof lineNumber === "number") return this.drawLine(lineNumber, 0, this.width || this.fixedWidth, spanningCell);
    return this.drawEmpty(0, spanningCell);
  }

  drawTop() {
    return this.wrapWithStyleColors(
      this._topLeftChar() + repeat(this.chars.top || this.top || "", this.width || this.fixedWidth) +
        (this.chars["top-right"] || this.topRight || ""),
      this.border,
    );
  }

  _topLeftChar() {
    return this.chars[this.x === 0 ? "top-left" : "top-mid"] || "";
  }

  wrapWithStyleColors(value, colors) {
    return styleText(value, colors);
  }

  drawLine(lineNumber, offset = 0, width = this.width || this.fixedWidth) {
    const line = this.lines[lineNumber - offset] || "";
    const innerWidth = Math.max(0, width - this.paddingLeft - this.paddingRight);
    const body = repeat(" ", this.paddingLeft) + pad(truncate(line, innerWidth, this.truncate), innerWidth, this.options.hAlign) + repeat(" ", this.paddingRight);
    return this.stylizeLine(this.chars.left || this.left || "", body, this.chars.right || this.right || "");
  }

  stylizeLine(left, content, right) {
    return this.wrapWithStyleColors(left, this.border) + content + this.wrapWithStyleColors(right, this.border);
  }

  drawBottom() {
    return this.wrapWithStyleColors(
      (this.chars["bottom-left"] || this.bottomLeft || "") +
        repeat(this.chars.bottom || this.bottom || "", this.width || this.fixedWidth) +
        (this.chars["bottom-right"] || this.bottomRight || ""),
      this.border,
    );
  }

  drawEmpty(offset = 0) {
    return this.drawLine(-1, offset, this.width || this.fixedWidth);
  }
}

class ColSpanCell {
  constructor() {}
  draw() { return ""; }
  init() {}
  mergeTableOptions() {}
}

class RowSpanCell {
  constructor(originalCell) {
    this.originalCell = originalCell;
  }

  init(tableOptions) {
    this.y = tableOptions.y;
    this.cellOffset = findDimension(tableOptions.rowHeights, this.originalCell.y, this.y - this.originalCell.y);
    this.offset = this.cellOffset;
  }

  draw(line) {
    return this.originalCell.draw(line, this);
  }

  mergeTableOptions() {}
}

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
