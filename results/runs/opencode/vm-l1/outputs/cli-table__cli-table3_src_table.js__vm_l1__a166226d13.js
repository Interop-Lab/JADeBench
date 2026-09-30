"use strict";

const stringWidth = require("string-width");

const DEFAULT_CHARS = {
  top: "─", "top-mid": "┬", "top-left": "┌", "top-right": "┐",
  bottom: "─", "bottom-mid": "┴", "bottom-left": "└", "bottom-right": "┘",
  left: "│", "left-mid": "├", mid: "─", "mid-mid": "┼",
  right: "│", "right-mid": "┤", middle: "│",
};

const DEFAULT_STYLE = {
  "padding-left": 1,
  "padding-right": 1,
  head: ["red"],
  border: ["grey"],
  compact: false,
};

const tableOptions = new WeakMap();

function repeat(text, count) {
  return count > 0 ? String(text).repeat(count) : "";
}

function truncate(text, width, marker = "…") {
  text = String(text);
  if (stringWidth(text) <= width) return text;
  if (width <= 0) return "";
  const markerWidth = Math.min(stringWidth(marker), width);
  let output = "";
  for (const character of text) {
    if (stringWidth(output + character) + markerWidth > width) break;
    output += character;
  }
  return output + truncate(marker, markerWidth, "");
}

function padLine(text, width, alignment) {
  const missing = Math.max(0, width - stringWidth(text));
  if (alignment === "right") return repeat(" ", missing) + text;
  if (alignment === "center") {
    const left = Math.floor(missing / 2);
    return repeat(" ", left) + text + repeat(" ", missing - left);
  }
  return text + repeat(" ", missing);
}

function wrapLine(text, width, wordWrap, marker) {
  if (width <= 0) return [""];
  if (!wordWrap) return [truncate(text, width, marker)];
  const words = text.trim().split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const shortened = truncate(word, width, marker);
    const candidate = line ? `${line} ${shortened}` : shortened;
    if (line && stringWidth(candidate) > width) {
      lines.push(line);
      line = shortened;
    } else line = candidate;
  }
  if (line || !lines.length) lines.push(line);
  return lines;
}

function cellValue(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...value, content: String(value.content ?? "") };
  }
  return { content: String(value ?? "") };
}

function normalizeRows(table, options) {
  const rows = [];
  if (Array.isArray(options.head) && options.head.length) rows.push(options.head);
  for (const row of table) {
    if (Array.isArray(row)) rows.push(row);
    else if (row && typeof row === "object") {
      for (const [key, value] of Object.entries(row)) {
        rows.push([key, ...(Array.isArray(value) ? value : [value])]);
      }
    } else rows.push([row]);
  }
  return rows;
}

function createLayout(table, options) {
  const sourceRows = normalizeRows(table, options);
  const grid = [];
  const cells = [];
  let columnCount = options.colWidths?.length || 0;

  sourceRows.forEach((sourceRow, rowIndex) => {
    grid[rowIndex] ||= [];
    let column = 0;
    for (const value of sourceRow) {
      while (grid[rowIndex][column]) column++;
      const data = cellValue(value);
      const colSpan = Math.max(1, Number(data.colSpan) || 1);
      const rowSpan = Math.max(1, Number(data.rowSpan) || 1);
      const cell = { ...data, row: rowIndex, col: column, colSpan, rowSpan, lines: [] };
      cells.push(cell);
      for (let y = rowIndex; y < rowIndex + rowSpan; y++) {
        grid[y] ||= [];
        for (let x = column; x < column + colSpan; x++) grid[y][x] = cell;
      }
      column += colSpan;
      columnCount = Math.max(columnCount, column);
    }
  });

  if (!grid.length) return { grid, cells, widths: [], heights: [] };
  for (const row of grid) for (let x = 0; x < columnCount; x++) {
    if (!row[x]) {
      const empty = { content: "", row: grid.indexOf(row), col: x, colSpan: 1, rowSpan: 1, lines: [] };
      row[x] = empty;
      cells.push(empty);
    }
  }

  const leftPadding = Number(options.style["padding-left"] ?? 1);
  const rightPadding = Number(options.style["padding-right"] ?? 1);
  const widths = options.colWidths ? options.colWidths.slice() : Array(columnCount).fill(1);
  while (widths.length < columnCount) widths.push(1);

  if (!options.colWidths) {
    for (const cell of cells) {
      if (cell.colSpan !== 1) continue;
      const longest = Math.max(0, ...cell.content.split("\n").map(stringWidth));
      widths[cell.col] = Math.max(widths[cell.col], longest + leftPadding + rightPadding);
    }
    for (const cell of cells) {
      if (cell.colSpan === 1) continue;
      const needed = Math.max(...cell.content.split("\n").map(stringWidth)) + leftPadding + rightPadding;
      const current = widths.slice(cell.col, cell.col + cell.colSpan).reduce((a, b) => a + b, 0) + cell.colSpan - 1;
      if (needed > current) widths[cell.col + cell.colSpan - 1] += needed - current;
    }
  }

  for (const cell of cells) {
    cell.width = widths.slice(cell.col, cell.col + cell.colSpan).reduce((a, b) => a + b, 0) + cell.colSpan - 1;
    cell.paddingLeft = Number(cell.style?.["padding-left"] ?? cell["padding-left"] ?? leftPadding);
    cell.paddingRight = Number(cell.style?.["padding-right"] ?? cell["padding-right"] ?? rightPadding);
    const contentWidth = Math.max(0, cell.width - cell.paddingLeft - cell.paddingRight);
    cell.lines = cell.content.split("\n").flatMap(line => wrapLine(line, contentWidth, cell.wordWrap ?? options.wordWrap, cell.truncate ?? options.truncate ?? "…"));
  }

  const heights = Array(grid.length).fill(1);
  for (const cell of cells) if (cell.rowSpan === 1) heights[cell.row] = Math.max(heights[cell.row], cell.lines.length);
  for (const cell of cells) if (cell.rowSpan > 1) {
    const available = heights.slice(cell.row, cell.row + cell.rowSpan).reduce((a, b) => a + b, 0);
    if (cell.lines.length > available) heights[cell.row + cell.rowSpan - 1] += cell.lines.length - available;
  }
  return { grid, cells, widths, heights };
}

const CONNECTION = {
  "0101": "┌", "0110": "┐", "1001": "└", "1010": "┘",
  "1100": "│", "0011": "─", "1110": "┤", "1101": "├",
  "1011": "┴", "0111": "┬", "1111": "┼",
};

function junction(up, down, left, right) {
  return CONNECTION[`${+up}${+down}${+left}${+right}`] || (up || down ? "│" : "─");
}

function borderLine(layout, boundary, options) {
  const { grid, widths } = layout;
  const rowCount = grid.length;
  const top = boundary === 0;
  const bottom = boundary === rowCount;
  const horizontal = widths.map((_, x) => top || bottom || grid[boundary - 1][x] !== grid[boundary][x]);
  if (!top && !bottom && options.style.compact && horizontal.every(Boolean)) return null;
  let output = "";
  for (let x = 0; x <= widths.length; x++) {
    const up = !top && (x === 0 || x === widths.length || grid[boundary - 1][x - 1] !== grid[boundary - 1][x]);
    const down = !bottom && (x === 0 || x === widths.length || grid[boundary][x - 1] !== grid[boundary][x]);
    const left = x > 0 && horizontal[x - 1];
    const right = x < widths.length && horizontal[x];
    let character = junction(up, down, left, right);
    const chars = options.chars;
    if (top) {
      const divider = x > 0 && x < widths.length && grid[0][x - 1] !== grid[0][x];
      character = x === 0 ? chars["top-left"] : x === widths.length ? chars["top-right"] : divider ? chars["top-mid"] : chars.top;
    } else if (bottom) {
      const divider = x > 0 && x < widths.length && grid[rowCount - 1][x - 1] !== grid[rowCount - 1][x];
      character = x === 0 ? chars["bottom-left"] : x === widths.length ? chars["bottom-right"] : divider ? chars["bottom-mid"] : chars.bottom;
    }
    else if (x === 0) character = chars["left-mid"];
    else if (x === widths.length) character = chars["right-mid"];
    else if (character === "┼") character = chars["mid-mid"];
    output += character;
    if (x < widths.length) output += repeat(top ? chars.top : bottom ? chars.bottom : chars.mid, widths[x]);
  }
  return output;
}

function renderCellLine(cell, absoluteLine, layout, options) {
  const start = layout.heights.slice(0, cell.row).reduce((a, b) => a + b, 0);
  const spanHeight = layout.heights.slice(cell.row, cell.row + cell.rowSpan).reduce((a, b) => a + b, 0);
  let offset = 0;
  if (cell.vAlign === "bottom") offset = spanHeight - cell.lines.length;
  else if (cell.vAlign === "center") offset = Math.floor((spanHeight - cell.lines.length) / 2);
  const text = cell.lines[absoluteLine - start - offset] || "";
  const innerWidth = Math.max(0, cell.width - cell.paddingLeft - cell.paddingRight);
  const alignment = cell.hAlign || options.colAligns?.[cell.col] || "left";
  return repeat(" ", cell.paddingLeft) + padLine(text, innerWidth, alignment) + repeat(" ", cell.paddingRight);
}

function renderTable(table, options) {
  const layout = createLayout(table, options);
  if (!layout.grid.length) return "";
  const output = [borderLine(layout, 0, options)];
  let absoluteLine = 0;
  for (let row = 0; row < layout.grid.length; row++) {
    for (let line = 0; line < layout.heights[row]; line++, absoluteLine++) {
      let text = options.chars.left;
      for (let col = 0; col < layout.widths.length;) {
        const cell = layout.grid[row][col];
        text += renderCellLine(cell, absoluteLine, layout, options);
        col += cell.colSpan;
        text += col < layout.widths.length ? options.chars.middle : options.chars.right;
      }
      output.push(text);
    }
    const border = borderLine(layout, row + 1, options);
    if (border !== null) output.push(border);
  }
  return output.join("\n");
}

class Table extends Array {
  constructor(options = {}) {
    super();
    tableOptions.set(this, {
      ...options,
      chars: { ...DEFAULT_CHARS, ...(options.chars || {}) },
      style: { ...DEFAULT_STYLE, ...(options.style || {}) },
    });
  }

  toString() {
    return renderTable(this, tableOptions.get(this));
  }

  get width() {
    const firstLine = this.toString().split("\n", 1)[0];
    return stringWidth(firstLine);
  }

  static reset() {}
}

module.exports = Table;
