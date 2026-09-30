'use strict';

let measureString;
try {
  const stringWidthModule = require('string-width');
  measureString = stringWidthModule.default || stringWidthModule;
} catch {
  measureString = value => Array.from(stripAnsi(String(value))).reduce(
    (width, character) => width + (character.codePointAt(0) > 0xffff ? 2 : 1),
    0,
  );
}

const ANSI_PATTERN = /[\u001b\u009b][[\]()#;?]*(?:(?:[\dA-PR-TZcf-nq-uy=><~](?:;[-a-zA-Z\d\/#&.:=?%@~_]+)*)?\u0007|(?:(?:\d{1,4}(?:[;:]\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

const DEFAULT_CHARACTERS = {
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

const DEFAULT_OPTIONS = {
  chars: DEFAULT_CHARACTERS,
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

const debugState = {
  level: 0,
  messages: [],
};

function stripAnsi(value) {
  return value.replace(ANSI_PATTERN, '');
}

function visibleWidth(value) {
  return measureString(String(value));
}

function repeat(value, count) {
  return count > 0 ? String(value).repeat(count) : '';
}

function truncate(value, desiredWidth, marker = '…') {
  const text = String(value);
  if (visibleWidth(text) <= desiredWidth) return text;
  const markerWidth = visibleWidth(marker);
  const availableWidth = Math.max(0, desiredWidth - markerWidth);
  let result = '';
  for (const character of text) {
    if (visibleWidth(result + character) > availableWidth) break;
    result += character;
  }
  return result + (markerWidth <= desiredWidth ? marker : '');
}

function pad(value, desiredWidth, padding = ' ', alignment = 'left') {
  const text = String(value);
  const missingWidth = Math.max(0, desiredWidth - visibleWidth(text));
  if (alignment === 'right') return repeat(padding, missingWidth) + text;
  if (alignment === 'center') {
    const left = Math.floor(missingWidth / 2);
    return repeat(padding, left) + text + repeat(padding, missingWidth - left);
  }
  return text + repeat(padding, missingWidth);
}

function mergeOptions(options = {}, defaults = DEFAULT_OPTIONS) {
  return {
    ...defaults,
    ...options,
    colWidths: [...(options.colWidths || defaults.colWidths || [])],
    rowHeights: [...(options.rowHeights || defaults.rowHeights || [])],
    colAligns: [...(options.colAligns || defaults.colAligns || [])],
    rowAligns: [...(options.rowAligns || defaults.rowAligns || [])],
    head: [...(options.head || defaults.head || [])],
    chars: { ...(defaults.chars || {}), ...(options.chars || {}) },
    style: { ...(defaults.style || {}), ...(options.style || {}) },
  };
}

function wrapWords(value, width) {
  if (width <= 0) return [''];
  const output = [];
  for (const sourceLine of String(value).split('\n')) {
    let line = '';
    for (const word of sourceLine.split(/\s+/)) {
      if (!word) continue;
      if (line && visibleWidth(`${line} ${word}`) <= width) {
        line += ` ${word}`;
        continue;
      }
      if (line) output.push(line);
      line = '';
      let remainder = word;
      while (visibleWidth(remainder) > width) {
        let chunk = '';
        for (const character of remainder) {
          if (visibleWidth(chunk + character) > width) break;
          chunk += character;
        }
        output.push(chunk);
        remainder = remainder.slice(chunk.length);
      }
      line = remainder;
    }
    output.push(line);
  }
  return output.length ? output : [''];
}

function splitContent(value, width, wordWrap, truncationMarker) {
  const lines = [];
  for (const sourceLine of String(value ?? '').split('\n')) {
    if (wordWrap) lines.push(...wrapWords(sourceLine, width));
    else lines.push(truncate(sourceLine, width, truncationMarker));
  }
  return lines;
}

function normalizeCell(value, rowIndex, columnIndex, tableOptions, isHeader = false) {
  const supplied = value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : { content: value };
  const paddingLeft = supplied.style?.['padding-left'] ?? tableOptions.style['padding-left'];
  const paddingRight = supplied.style?.['padding-right'] ?? tableOptions.style['padding-right'];
  return {
    content: supplied.content == null ? '' : String(supplied.content),
    colSpan: Math.max(1, Number(supplied.colSpan) || 1),
    rowSpan: Math.max(1, Number(supplied.rowSpan) || 1),
    hAlign: supplied.hAlign || tableOptions.colAligns[columnIndex] || 'left',
    vAlign: supplied.vAlign || tableOptions.rowAligns[rowIndex] || 'top',
    paddingLeft,
    paddingRight,
    wordWrap: supplied.wordWrap ?? tableOptions.wordWrap ?? false,
    truncate: supplied.truncate ?? tableOptions.truncate,
    style: supplied.style || (isHeader ? tableOptions.style.head : []),
    x: columnIndex,
    y: rowIndex,
  };
}

function normalizeRows(table, options) {
  const rows = [];
  if (options.head.length) rows.push(options.head.map(value => ({ value, header: true })));
  for (const inputRow of table) {
    if (Array.isArray(inputRow)) {
      rows.push(inputRow.map(value => ({ value, header: false })));
      continue;
    }
    if (inputRow && typeof inputRow === 'object') {
      const entries = Object.entries(inputRow);
      for (const [key, value] of entries) {
        const values = Array.isArray(value) ? value : [value];
        rows.push([{ value: key, header: false }, ...values.map(item => ({ value: item, header: false }))]);
      }
      continue;
    }
    rows.push([{ value: inputRow, header: false }]);
  }
  return rows;
}

function makeGrid(table, options) {
  const sourceRows = normalizeRows(table, options);
  const grid = [];
  const cells = [];

  sourceRows.forEach((sourceRow, rowIndex) => {
    grid[rowIndex] ||= [];
    let columnIndex = 0;
    for (const entry of sourceRow) {
      while (grid[rowIndex][columnIndex]) columnIndex++;
      const cell = normalizeCell(entry.value, rowIndex, columnIndex, options, entry.header);
      cells.push(cell);
      for (let rowOffset = 0; rowOffset < cell.rowSpan; rowOffset++) {
        const targetRow = rowIndex + rowOffset;
        grid[targetRow] ||= [];
        for (let columnOffset = 0; columnOffset < cell.colSpan; columnOffset++) {
          grid[targetRow][columnIndex + columnOffset] = {
            cell,
            origin: rowOffset === 0 && columnOffset === 0,
            rowOffset,
            columnOffset,
          };
        }
      }
      columnIndex += cell.colSpan;
    }
  });

  return { grid, cells };
}

function computeColumnWidths(cells, columnCount, configuredWidths) {
  const widths = Array.from({ length: columnCount }, (_, index) => configuredWidths[index] || 1);
  for (const cell of cells.filter(item => item.colSpan === 1)) {
    if (configuredWidths[cell.x]) continue;
    const desired = visibleWidth(cell.content) + cell.paddingLeft + cell.paddingRight;
    widths[cell.x] = Math.max(widths[cell.x], desired);
  }
  for (const cell of cells.filter(item => item.colSpan > 1)) {
    if (Array.from({ length: cell.colSpan }, (_, offset) => configuredWidths[cell.x + offset]).every(Boolean)) continue;
    const current = widths.slice(cell.x, cell.x + cell.colSpan).reduce((sum, width) => sum + width, 0) + cell.colSpan - 1;
    const desired = visibleWidth(cell.content) + cell.paddingLeft + cell.paddingRight;
    if (desired > current) widths[cell.x + cell.colSpan - 1] += desired - current;
  }
  return widths;
}

function cellWidth(cell, columnWidths) {
  return columnWidths.slice(cell.x, cell.x + cell.colSpan).reduce((sum, width) => sum + width, 0) + cell.colSpan - 1;
}

function prepareCells(cells, columnWidths, configuredHeights, rowCount) {
  const rowHeights = Array.from({ length: rowCount }, (_, index) => configuredHeights[index] || 1);
  for (const cell of cells) {
    const innerWidth = Math.max(0, cellWidth(cell, columnWidths) - cell.paddingLeft - cell.paddingRight);
    cell.lines = splitContent(cell.content, innerWidth, cell.wordWrap, cell.truncate);
    if (cell.rowSpan === 1) rowHeights[cell.y] = Math.max(rowHeights[cell.y], cell.lines.length);
  }
  for (const cell of cells.filter(item => item.rowSpan > 1)) {
    const current = rowHeights.slice(cell.y, cell.y + cell.rowSpan).reduce((sum, height) => sum + height, 0);
    if (cell.lines.length > current) rowHeights[cell.y + cell.rowSpan - 1] += cell.lines.length - current;
  }
  return rowHeights;
}

function renderCellLine(cell, lineIndex, totalHeight, columnWidths) {
  const width = cellWidth(cell, columnWidths);
  const innerWidth = Math.max(0, width - cell.paddingLeft - cell.paddingRight);
  const verticalGap = Math.max(0, totalHeight - cell.lines.length);
  const topGap = cell.vAlign === 'bottom' ? verticalGap : cell.vAlign === 'center' ? Math.floor(verticalGap / 2) : 0;
  const content = cell.lines[lineIndex - topGap] || '';
  return repeat(' ', cell.paddingLeft)
    + pad(content, innerWidth, ' ', cell.hAlign)
    + repeat(' ', cell.paddingRight);
}

function horizontalRule(grid, boundary, columnWidths, options) {
  const chars = options.chars;
  const isTop = boundary === 0;
  const isBottom = boundary === grid.length;
  const horizontal = chars[isTop ? 'top' : isBottom ? 'bottom' : 'mid'];
  const firstCellContinues = !isTop && !isBottom && grid[boundary - 1]?.[0]?.cell === grid[boundary]?.[0]?.cell;
  const lastColumn = columnWidths.length - 1;
  const lastCellContinues = !isTop && !isBottom
    && grid[boundary - 1]?.[lastColumn]?.cell === grid[boundary]?.[lastColumn]?.cell;
  const left = firstCellContinues ? chars.left : chars[isTop ? 'top-left' : isBottom ? 'bottom-left' : 'left-mid'];
  const right = lastCellContinues ? chars.right : chars[isTop ? 'top-right' : isBottom ? 'bottom-right' : 'right-mid'];
  const middle = chars[isTop ? 'top-mid' : isBottom ? 'bottom-mid' : 'mid-mid'];
  const pieces = columnWidths.map(width => repeat(horizontal, width));

  if (!isTop && !isBottom) {
    for (let column = 0; column < columnWidths.length; column++) {
      const above = grid[boundary - 1]?.[column]?.cell;
      const below = grid[boundary]?.[column]?.cell;
      if (above && above === below) pieces[column] = repeat(' ', columnWidths[column]);
    }
  }

  let rule = left;
  for (let column = 0; column < pieces.length; column++) {
    rule += pieces[column];
    if (column === pieces.length - 1) continue;
    const aboveRow = isTop ? null : grid[boundary - 1];
    const belowRow = isBottom ? null : grid[boundary];
    const connectedAbove = Boolean(aboveRow) && aboveRow[column]?.cell === aboveRow[column + 1]?.cell;
    const connectedBelow = Boolean(belowRow) && belowRow[column]?.cell === belowRow[column + 1]?.cell;
    const continuesOnLeft = !isTop && !isBottom && aboveRow[column]?.cell === belowRow[column]?.cell;
    const continuesOnRight = !isTop && !isBottom && aboveRow[column + 1]?.cell === belowRow[column + 1]?.cell;
    if (continuesOnLeft && continuesOnRight) rule += chars.middle;
    else if (continuesOnLeft) rule += chars['left-mid'];
    else if (continuesOnRight) rule += chars['right-mid'];
    else if ((isTop && connectedBelow) || (isBottom && connectedAbove)) rule += horizontal;
    else if (connectedAbove && connectedBelow) rule += horizontal;
    else if (connectedAbove) rule += chars['top-mid'];
    else if (connectedBelow) rule += chars['bottom-mid'];
    else rule += middle;
  }
  return rule + right;
}

function renderTable(table, options) {
  const { grid, cells } = makeGrid(table, options);
  if (!grid.length) return '';
  const columnCount = Math.max(...grid.map(row => row.length));
  const columnWidths = computeColumnWidths(cells, columnCount, options.colWidths);
  const rowHeights = prepareCells(cells, columnWidths, options.rowHeights, grid.length);
  options.colWidths = columnWidths;
  options.rowHeights = rowHeights;

  const output = [horizontalRule(grid, 0, columnWidths, options)];
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (let lineIndex = 0; lineIndex < rowHeights[rowIndex]; lineIndex++) {
      let line = options.chars.left;
      let columnIndex = 0;
      while (columnIndex < columnCount) {
        const slot = grid[rowIndex][columnIndex];
        if (!slot) {
          line += repeat(' ', columnWidths[columnIndex]);
          columnIndex++;
        } else if (slot.columnOffset > 0) {
          columnIndex++;
          continue;
        } else {
          const cell = slot.cell;
          const spannedHeight = rowHeights.slice(cell.y, cell.y + cell.rowSpan).reduce((sum, height) => sum + height, 0);
          const previousHeight = rowHeights.slice(cell.y, rowIndex).reduce((sum, height) => sum + height, 0);
          line += renderCellLine(cell, previousHeight + lineIndex, spannedHeight, columnWidths);
          columnIndex += cell.colSpan;
        }
        if (columnIndex < columnCount) line += options.chars.middle;
      }
      line += options.chars.right;
      output.push(line);
    }
    if (rowIndex < grid.length - 1 && !options.style.compact) {
      output.push(horizontalRule(grid, rowIndex + 1, columnWidths, options));
    }
  }
  output.push(horizontalRule(grid, grid.length, columnWidths, options));
  return output.join('\n');
}

class Table extends Array {
  constructor(options = {}) {
    super();
    this.options = mergeOptions(options);
    if (this.options.head.length && !options.style?.head) this.options.style.head = ['red'];
    if (options.debug !== undefined) {
      const level = options.debug === true ? 1 : Number.parseInt(options.debug, 10);
      if (Number.isFinite(level)) debugState.level = level;
      else debugState.messages.push(`Debug option is expected to be boolean, number, or string. Received a ${typeof options.debug}`);
      Object.defineProperty(this, 'messages', {
        enumerable: true,
        get: () => debugState.messages,
      });
    }
  }

  toString() {
    return renderTable(this, this.options);
  }

  get width() {
    const rendered = this.toString();
    return rendered ? rendered.split('\n')[0].length : 0;
  }

  static reset() {
    debugState.level = 0;
    debugState.messages.length = 0;
  }
}

module.exports = Table;
