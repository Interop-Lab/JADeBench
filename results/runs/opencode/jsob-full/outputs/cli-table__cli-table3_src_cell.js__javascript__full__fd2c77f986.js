"use strict";

const ANSI_PATTERN = /[\u001b\u009b][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*)?\u0007)|(?:(?:\d{1,4}(?:[;:]\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

const BORDER_NAMES = [
  "top", "top-mid", "top-left", "top-right",
  "bottom", "bottom-mid", "bottom-left", "bottom-right",
  "left", "left-mid", "mid", "mid-mid", "right", "right-mid", "middle",
];

function visibleLength(value) {
  return [...String(value).replace(ANSI_PATTERN, "")].length;
}

function repeat(value, count) {
  return count > 0 ? String(value).repeat(count) : "";
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined);
}

function mergeOptions(tableOptions = {}, cellOptions = {}) {
  const merged = { ...tableOptions, ...cellOptions };
  merged.style = { ...(tableOptions.style || {}), ...(cellOptions.style || {}) };
  merged.chars = { ...(tableOptions.chars || {}), ...(cellOptions.chars || {}) };
  return merged;
}

function truncate(value, width, marker = "…") {
  value = String(value);
  if (visibleLength(value) <= width) return value;
  const markerWidth = visibleLength(marker);
  if (width <= markerWidth) return [...marker].slice(0, width).join("");
  let result = "";
  for (const character of value.replace(ANSI_PATTERN, "")) {
    if (visibleLength(result + character) > width - markerWidth) break;
    result += character;
  }
  return result + marker;
}

function wrapLine(value, width, wordWrap) {
  value = String(value);
  if (width <= 0) return [""];
  if (!wordWrap) {
    const lines = [];
    let rest = value;
    while (visibleLength(rest) > width) {
      let taken = "";
      for (const character of rest) {
        if (visibleLength(taken + character) > width) break;
        taken += character;
      }
      lines.push(taken);
      rest = rest.slice(taken.length);
    }
    lines.push(rest);
    return lines;
  }

  const lines = [];
  let current = "";
  for (const word of value.split(/(\s+)/)) {
    if (visibleLength(current + word) <= width) {
      current += word;
    } else {
      if (current.trim()) lines.push(current.trimEnd());
      current = word.trimStart();
      while (visibleLength(current) > width) {
        lines.push(current.slice(0, width));
        current = current.slice(width);
      }
    }
  }
  lines.push(current);
  return lines;
}

function applyColor(value, color) {
  if (!color) return value;
  if (typeof color === "function") return color(value);
  if (Array.isArray(color)) return color.reduce((text, style) => applyColor(text, style), value);
  return value;
}

class Cell {
  constructor(options) {
    this.setOptions(options);
    this.x = null;
    this.y = null;
  }

  setOptions(options) {
    if (typeof options === "string" || typeof options === "number") {
      options = { content: String(options) };
    } else {
      options = options || { content: "" };
    }

    const content = options.content;
    if (content === undefined || content === null) this.content = "";
    else if (typeof content === "string" || typeof content === "number") this.content = String(content);
    else throw new Error(`Content needs to be a string or number, got ${typeof content}`);

    this.options = options;
    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;
    if (options.href) {
      Object.defineProperty(this, "href", {
        configurable: true,
        get: () => this.options.href,
      });
    }
    return this;
  }

  mergeTableOptions(tableOptions = {}, cells) {
    this.options = mergeOptions(tableOptions, this.options);
    this.cells = cells || this.cells;
    this.chars = this.options.chars || {};
    this.style = this.options.style || {};
    return this;
  }

  computeLines() {
    const left = Number(firstDefined(this.style?.["padding-left"], 1));
    const right = Number(firstDefined(this.style?.["padding-right"], 1));
    const available = Math.max(1, this.desiredWidth - left - right);
    const lines = [];
    for (const sourceLine of this.content.split("\n")) {
      lines.push(...wrapLine(sourceLine, available, this.options.wordWrap));
    }
    this.lines = lines.map((line) => truncate(line, available, this.options.truncate || "…"));
    return this.lines;
  }

  wrapLines() {
    return this.computeLines();
  }

  init(tableOptions = {}) {
    this.mergeTableOptions(tableOptions, this.cells);
    const left = Number(firstDefined(this.style["padding-left"], 1));
    const right = Number(firstDefined(this.style["padding-right"], 1));
    const naturalWidth = Math.max(0, ...this.content.split("\n").map(visibleLength)) + left + right;
    this.desiredWidth = Number(firstDefined(this.options.width, this.width, naturalWidth));
    this.width = this.desiredWidth;
    this.computeLines();
    this.desiredHeight = Number(firstDefined(this.options.height, this.height, this.lines.length + 2));
    this.height = this.desiredHeight;
    return this;
  }

  draw(lineNumber) {
    if (!this.lines) this.init(this.options);
    if (lineNumber === 0) return this.drawTop();
    if (lineNumber === this.height - 1) return this.drawBottom();

    const contentHeight = Math.max(0, this.height - 2);
    let contentLine = lineNumber - 1;
    const emptyRows = Math.max(0, contentHeight - this.lines.length);
    if (this.options.vAlign === "center") contentLine -= Math.floor(emptyRows / 2);
    else if (this.options.vAlign === "bottom") contentLine -= emptyRows;
    return contentLine >= 0 && contentLine < this.lines.length
      ? this.drawLine(this.lines[contentLine])
      : this.drawEmpty();
  }

  drawTop() {
    return this._topLeftChar() + repeat(this.chars.top || "-", Math.max(0, this.width - 2)) +
      (this.chars["top-right"] || "+");
  }

  _topLeftChar() {
    return this.chars["top-left"] || "+";
  }

  wrapWithStyleColors(value) {
    return applyColor(value, this.style.head);
  }

  drawLine(value) {
    const leftPadding = Number(firstDefined(this.style["padding-left"], 1));
    const rightPadding = Number(firstDefined(this.style["padding-right"], 1));
    const innerWidth = Math.max(0, this.width - 2 - leftPadding - rightPadding);
    value = truncate(value, innerWidth, this.options.truncate || "…");
    const spare = Math.max(0, innerWidth - visibleLength(value));
    let before = 0;
    if (this.options.hAlign === "right") before = spare;
    else if (this.options.hAlign === "center") before = Math.floor(spare / 2);
    const after = spare - before;
    const text = repeat(" ", leftPadding + before) + this.stylizeLine(value) +
      repeat(" ", rightPadding + after);
    return (this.chars.left || "|") + text + (this.chars.right || "|");
  }

  stylizeLine(value) {
    return this.wrapWithStyleColors(String(value));
  }

  drawBottom() {
    return (this.chars["bottom-left"] || "+") +
      repeat(this.chars.bottom || "-", Math.max(0, this.width - 2)) +
      (this.chars["bottom-right"] || "+");
  }

  drawEmpty() {
    return this.drawLine("");
  }
}

class ColSpanCell {
  constructor() {}
  draw(lineNumber) {
    if (typeof lineNumber === "number" && this.debug) this.debug(`${this.y}-${this.x}: 1x1 ColSpanCell`);
    return "";
  }
  init() {}
  mergeTableOptions() {}
}

class RowSpanCell {
  constructor(originalCell) {
    this.originalCell = originalCell;
  }

  init(tableOptions = {}) {
    this.cellOffset = this.y - this.originalCell.y;
    const heights = tableOptions.rowHeights || [];
    this.offset = findDimension(heights, this.originalCell.y, this.cellOffset);
    return this;
  }

  draw(lineNumber) {
    return this.originalCell.draw(lineNumber + (this.offset || 0));
  }

  mergeTableOptions() {}
}

function findDimension(dimensions, start, count) {
  let result = dimensions[start] || 0;
  for (let index = 0; index < count; index++) result += 1 + (dimensions[start + index] || 0);
  return result;
}

// Kept as documentation for table-layout callers that use these names when
// supplying a `chars` option.
Cell.BORDER_NAMES = BORDER_NAMES;

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
