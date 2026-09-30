'use strict';

const stringWidth = require('string-width');
const colors = require('ansis');

const defaultChars = {
  top: '─',
  'top-mid': '┬',
  'top-left': '┌',
  'top-right': '┐',
  bottom: '─',
  'bottom-mid': '┴',
  'bottom-left': '└',
  'bottom-right': '┘',
  left: '│',
  'left-mid': '├',
  mid: '─',
  'mid-mid': '┼',
  right: '│',
  'right-mid': '┤',
  middle: '│',
};

const defaultOptions = {
  chars: defaultChars,
  truncate: '…',
  colWidths: [],
  rowHeights: [],
  colAligns: [],
  rowAligns: [],
  style: {
    'padding-left': 1,
    'padding-right': 1,
    head: [],
    border: ['grey'],
    compact: false,
  },
  head: [],
};

function visibleWidth(value) {
  return stringWidth(String(value));
}

function repeat(value, count) {
  return count > 0 ? value.repeat(count) : '';
}

function applyColors(value, styles) {
  return (styles || []).reduce((result, style) => {
    const formatter = colors[style];
    return typeof formatter === 'function' ? formatter(result) : result;
  }, value);
}

function pad(value, width, align = 'left') {
  value = String(value);
  const space = Math.max(0, width - visibleWidth(value));
  if (align === 'right') return repeat(' ', space) + value;
  if (align === 'center') {
    const left = Math.floor(space / 2);
    return repeat(' ', left) + value + repeat(' ', space - left);
  }
  return value + repeat(' ', space);
}

function truncate(value, width, marker = '…') {
  value = String(value);
  if (visibleWidth(value) <= width) return value;
  const markerWidth = visibleWidth(marker);
  if (markerWidth >= width) return marker.slice(0, width);
  let result = '';
  for (const character of value) {
    if (visibleWidth(result + character) + markerWidth > width) break;
    result += character;
  }
  const openAnsi = [...result.matchAll(/\u001b\[(\d+)m/g)].at(-1)?.[1];
  if (openAnsi && openAnsi !== '0' && !/\u001b\[(?:0|39)m$/.test(result)) result += '\u001b[39m';
  return result + marker;
}

function wordWrap(value, width) {
  const lines = [];
  for (const sourceLine of String(value).split('\n')) {
    let line = sourceLine;
    while (visibleWidth(line) > width) {
      let splitAt = width;
      while (splitAt > 0 && visibleWidth(line.slice(0, splitAt)) > width) splitAt--;
      const whitespace = line.slice(0, splitAt + 1).lastIndexOf(' ');
      if (whitespace > 0) splitAt = whitespace;
      lines.push(line.slice(0, splitAt));
      line = line.slice(splitAt).replace(/^\s+/, '');
    }
    lines.push(line);
  }
  return lines;
}

function mergeOptions(options = {}) {
  const hasHeader = Array.isArray(options.head) && options.head.length > 0;
  return {
    ...defaultOptions,
    ...options,
    chars: { ...defaultChars, ...(options.chars || {}) },
    style: { ...defaultOptions.style, ...(hasHeader ? { head: ['red'] } : {}), ...(options.style || {}) },
    colWidths: [...(options.colWidths || [])],
    rowHeights: [...(options.rowHeights || [])],
    colAligns: [...(options.colAligns || [])],
    rowAligns: [...(options.rowAligns || [])],
    head: [...(options.head || [])],
  };
}

function parseHexValue(value) {
  return /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value) ? value : '#000';
}

const utils = {
  strlen: visibleWidth,
  repeat,
  pad,
  truncate,
  mergeOptions,
  wordWrap,
  colorizeLines(lines, styles) {
    return lines.map((line) => applyColors(line, styles));
  },
  hyperlink(text, url) {
    return `\u001B]8;;${url}\u0007${text}\u001B]8;;\u0007`;
  },
  parseHexValue,
};

class Cell {
  constructor(options = {}) {
    this.setOptions(options);
  }

  setOptions(options) {
    const normalized = options && typeof options === 'object' && !Array.isArray(options)
      ? options
      : { content: options };
    Object.assign(this, normalized);
    this.content = normalized.content == null ? '' : String(normalized.content);
    this.isEmpty = normalized.content == null;
    this.colSpan = Math.max(1, normalized.colSpan || 1);
    this.rowSpan = Math.max(1, normalized.rowSpan || 1);
    this.style ||= {};
    return this;
  }
}

class ColSpanCell extends Cell {}
class RowSpanCell extends Cell {}
Cell.ColSpanCell = ColSpanCell;
Cell.RowSpanCell = RowSpanCell;

function normalizeRows(table) {
  const rows = table.options.head.length ? [table.options.head, ...table] : [...table];
  return rows.map((row) => {
    if (Array.isArray(row)) return row;
    if (row && typeof row === 'object') {
      const entries = Object.entries(row);
      if (entries.length === 1) {
        const [key, value] = entries[0];
        return Array.isArray(value) ? [key, ...value] : [key, value];
      }
    }
    return [row];
  });
}

function makeGrid(rows) {
  const grid = [];
  const cells = [];
  rows.forEach((row, rowIndex) => {
    grid[rowIndex] ||= [];
    let column = 0;
    for (const value of row) {
      while (grid[rowIndex][column]) column++;
      const cell = value instanceof Cell ? value : new Cell(value);
      const record = { cell, row: rowIndex, column };
      cells.push(record);
      for (let y = rowIndex; y < rowIndex + cell.rowSpan; y++) {
        grid[y] ||= [];
        for (let x = column; x < column + cell.colSpan; x++) grid[y][x] = record;
      }
      column += cell.colSpan;
    }
  });
  return { grid, cells, columnCount: Math.max(0, ...grid.map((row) => row.length)) };
}

function computeWidths(table, layout) {
  const padding = table.options.style['padding-left'] + table.options.style['padding-right'];
  const widths = Array.from({ length: layout.columnCount }, (_, index) => table.options.colWidths[index] || 0);
  for (const { cell, column } of layout.cells) {
    if (cell.colSpan !== 1 || table.options.colWidths[column]) continue;
    widths[column] = Math.max(widths[column], ...cell.content.split('\n').map((line) => visibleWidth(line) + padding));
  }
  for (const { cell, column } of layout.cells) {
    if (cell.colSpan === 1) continue;
    const current = widths.slice(column, column + cell.colSpan).reduce((sum, width) => sum + width, 0) + cell.colSpan - 1;
    const needed = Math.max(...cell.content.split('\n').map(visibleWidth)) + padding;
    if (needed > current) {
      const extra = needed - current;
      const share = Math.floor(extra / cell.colSpan);
      for (let index = 0; index < cell.colSpan; index++) widths[column + index] += share;
      widths[column + cell.colSpan - 1] += extra - share * cell.colSpan;
    }
  }
  return widths.map((width) => width || padding + 1);
}

function cellLines(record, widths, table, isHeader) {
  const { cell, column } = record;
  const width = widths.slice(column, column + cell.colSpan).reduce((sum, item) => sum + item, 0) + cell.colSpan - 1;
  const left = cell.isEmpty ? 0 : cell.paddingLeft ?? table.options.style['padding-left'];
  const right = cell.isEmpty ? 0 : cell.paddingRight ?? table.options.style['padding-right'];
  const contentWidth = Math.max(1, width - left - right);
  let lines = cell.wordWrap ? wordWrap(cell.content, contentWidth) : cell.content.split('\n').map((line) => truncate(line, contentWidth, table.options.truncate));
  const align = cell.hAlign || cell.align || table.options.colAligns[column] || 'left';
  lines = lines.map((line) => repeat(' ', left) + pad(line, contentWidth, align) + repeat(' ', right));
  return isHeader ? lines.map((line) => applyColors(line, table.options.style.head)) : lines;
}

function borderLine(widths, chars, left, middle, right, fill) {
  return chars[left] + widths.map((width) => repeat(chars[fill], width)).join(chars[middle]) + chars[right];
}

function renderTable(table) {
  const rows = normalizeRows(table);
  if (!rows.length) return '';
  const layout = makeGrid(rows);
  const widths = computeWidths(table, layout);
  const chars = table.options.chars;
  const topSpans = layout.grid[0].map((record, column) => column > 0 && record === layout.grid[0][column - 1]);
  let top = chars['top-left'];
  widths.forEach((width, column) => {
    top += repeat(chars.top, width);
    if (column === widths.length - 1) top += chars['top-right'];
    else top += topSpans[column + 1] ? chars.top : chars['top-mid'];
  });
  const output = [top];
  const renderedCells = new Map(layout.cells.map((record) => [record, cellLines(record, widths, table, table.options.head.length > 0 && record.row === 0)]));

  rows.forEach((row, rowIndex) => {
    const starts = [...new Set(layout.grid[rowIndex].filter((record) => record.row === rowIndex))];
    const height = table.options.rowHeights[rowIndex] || Math.max(1, ...starts.map((record) => renderedCells.get(record).length));
    for (let line = 0; line < height; line++) {
      let text = chars.left;
      for (let column = 0; column < layout.columnCount;) {
        const record = layout.grid[rowIndex][column];
        if (!record) {
          text += repeat(' ', widths[column]) + chars.middle;
          column++;
          continue;
        }
        const span = record.cell.colSpan;
        const width = widths.slice(column, column + span).reduce((sum, item) => sum + item, 0) + span - 1;
        const lines = renderedCells.get(record);
        const alignment = record.cell.vAlign || table.options.rowAligns[rowIndex] || 'top';
        const missing = Math.max(0, height - lines.length);
        const offset = alignment === 'bottom' ? missing : alignment === 'center' ? Math.floor(missing / 2) : 0;
        const relativeRow = rowIndex - record.row;
        const value = relativeRow === 0 ? lines[line - offset] || '' : lines[relativeRow] || '';
        text += pad(value, width) + chars.middle;
        column += span;
      }
      output.push(text.slice(0, -chars.middle.length) + chars.right);
    }
    if (rowIndex < rows.length - 1 && !table.options.style.compact) {
      const activeSpans = layout.grid[rowIndex].map((record) => record && record.row + record.cell.rowSpan > rowIndex + 1);
      if (activeSpans.some(Boolean)) {
        let separator = chars.left;
        for (let column = 0; column < layout.columnCount; column++) {
          separator += activeSpans[column] ? repeat(' ', widths[column]) : repeat(chars.mid, widths[column]);
          if (column === layout.columnCount - 1) separator += activeSpans[column] ? chars.right : chars['right-mid'];
          else if (activeSpans[column] && !activeSpans[column + 1]) separator += chars['left-mid'];
          else if (!activeSpans[column] && activeSpans[column + 1]) separator += chars['right-mid'];
          else separator += activeSpans[column] ? chars.middle : chars['top-mid'];
        }
        output.push(separator);
      } else {
        const current = layout.grid[rowIndex];
        let separator = chars['left-mid'];
        widths.forEach((width, column) => {
          separator += repeat(chars.mid, width);
          if (column === widths.length - 1) separator += chars['right-mid'];
          else separator += current[column] === current[column + 1] ? chars['top-mid'] : chars['mid-mid'];
        });
        output.push(separator);
      }
    }
  });
  const lastRow = layout.grid[rows.length - 1];
  let bottom = chars['bottom-left'];
  widths.forEach((width, column) => {
    bottom += repeat(chars.bottom, width);
    if (column === widths.length - 1) bottom += chars['bottom-right'];
    else bottom += lastRow[column] === lastRow[column + 1] ? chars.bottom : chars['bottom-mid'];
  });
  output.push(bottom);
  return output.join('\n');
}

const tableLayout = {
  makeTableLayout(rows) { return makeGrid(rows); },
  layoutTable(table) { return makeGrid(normalizeRows(table)); },
  addRowSpanCells(rows) { return rows; },
  maxWidth(cells) { return Math.max(0, ...cells.map((cell) => visibleWidth(cell.content ?? cell))); },
  fillInTable(rows) { return makeGrid(rows).grid; },
  computeWidths(table) { const layout = makeGrid(normalizeRows(table)); return computeWidths(table, layout); },
  computeHeights(table) { return normalizeRows(table).map(() => 1); },
};

class Table extends Array {
  constructor(options) {
    super();
    this.options = mergeOptions(options);
  }

  toString() {
    const addCellDefaults = (value) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return;
      if ('content' in value || 'colSpan' in value || 'rowSpan' in value || 'hAlign' in value || 'vAlign' in value || 'wordWrap' in value) {
        value.style ||= {};
        return;
      }
      for (const nested of Object.values(value)) {
        if (nested && typeof nested === 'object' && !Array.isArray(nested)) nested.style ||= {};
      }
    };
    for (const row of this) Array.isArray(row) ? row.forEach(addCellDefaults) : addCellDefaults(row);
    const rows = normalizeRows(this);
    if (rows.length) {
      const layout = makeGrid(rows);
      this.options.colWidths = computeWidths(this, layout);
      this.options.rowHeights = rows.map((row, rowIndex) => {
        const records = [...new Set(layout.grid[rowIndex].filter((record) => record.row === rowIndex))];
        const computed = Math.max(1, ...records.map((record) => cellLines(record, this.options.colWidths, this, this.options.head.length > 0 && rowIndex === 0).length));
        return this.options.rowHeights[rowIndex] || computed;
      });
    }
    return renderTable(this);
  }

  get width() {
    const rows = normalizeRows(this);
    if (!rows.length) return 0;
    const layout = makeGrid(rows);
    return computeWidths(this, layout).reduce((sum, width) => sum + width, 0) + layout.columnCount + 1;
  }
}

module.exports = Table;
