'use strict';

const stringWidthModule = require('string-width');
const stringWidth = stringWidthModule.default || stringWidthModule;
const ansiPattern = /\x1b\[[0-?]*[ -/]*[@-~]/g;

const DEFAULT_CHARS = {
  top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
  bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
  left: '│', 'left-mid': '├', mid: '─', 'mid-mid': '┼',
  right: '│', 'right-mid': '┤', middle: '│'
};

const DEFAULT_STYLE = {
  'padding-left': 1,
  'padding-right': 1,
  head: ['red'],
  border: ['grey'],
  compact: false
};

let debugLevel = 0;
let debugMessages = [];

const ANSI_STYLES = {
  reset: [0, 0], bold: [1, 22], dim: [2, 22], italic: [3, 23], underline: [4, 24],
  inverse: [7, 27], hidden: [8, 28], strikethrough: [9, 29],
  black: [30, 39], red: [31, 39], green: [32, 39], yellow: [33, 39],
  blue: [34, 39], magenta: [35, 39], cyan: [36, 39], white: [37, 39],
  gray: [90, 39], grey: [90, 39],
  blackBright: [90, 39], redBright: [91, 39], greenBright: [92, 39],
  yellowBright: [93, 39], blueBright: [94, 39], magentaBright: [95, 39],
  cyanBright: [96, 39], whiteBright: [97, 39]
};

function visibleWidth(value) {
  return stringWidth(String(value));
}

function repeat(character, count) {
  return count > 0 ? character.repeat(count) : '';
}

function applyStyles(value, styles) {
  if (!Array.isArray(styles) || styles.length === 0 || !process.stdout.isTTY || process.env.NO_COLOR) {
    return value;
  }
  let opening = '';
  let closing = '';
  for (const style of styles) {
    const codes = ANSI_STYLES[style];
    if (codes) {
      opening += `\x1b[${codes[0]}m`;
      closing = `\x1b[${codes[1]}m${closing}`;
    }
  }
  return opening + value + closing;
}

function takeWidth(value, width) {
  if (width <= 0) return ['', String(value)];
  const source = String(value);
  let result = '';
  let index = 0;
  let used = 0;
  while (index < source.length) {
    if (source[index] === '\x1b') {
      const match = source.slice(index).match(/^\x1b\[[0-?]*[ -/]*[@-~]/);
      if (match) {
        result += match[0];
        index += match[0].length;
        continue;
      }
    }
    const codePoint = source.codePointAt(index);
    const character = String.fromCodePoint(codePoint);
    const characterWidth = visibleWidth(character);
    if (used + characterWidth > width) break;
    result += character;
    used += characterWidth;
    index += character.length;
  }
  return [result, source.slice(index)];
}

function truncate(value, width, marker) {
  const source = String(value);
  if (visibleWidth(source) <= width) return source;
  const suffix = String(marker ?? '…');
  const available = Math.max(0, width - visibleWidth(suffix));
  return takeWidth(source, available)[0] + (width > 0 ? takeWidth(suffix, width)[0] : '');
}

function wrapLine(value, width, wordWrap, wrapOnWordBoundary) {
  if (width <= 0) return [''];
  let remaining = String(value);
  const lines = [];
  while (visibleWidth(remaining) > width) {
    let [line, rest] = takeWidth(remaining, width);
    if (wordWrap && wrapOnWordBoundary !== false) {
      const plain = line.replace(ansiPattern, '');
      const breakAt = Math.max(plain.lastIndexOf(' '), plain.lastIndexOf('\t'));
      if (breakAt > 0) {
        const removed = plain.length - breakAt - 1;
        const split = takeWidth(line, visibleWidth(plain.slice(0, breakAt)));
        line = split[0];
        rest = remaining.slice(remaining.length - rest.length - removed).trimStart();
      }
    }
    lines.push(line);
    if (rest === remaining) break;
    remaining = rest;
  }
  lines.push(remaining);
  return lines;
}

function wrap(value, width, wordWrap, wrapOnWordBoundary) {
  const result = [];
  for (const line of String(value ?? '').split('\n')) {
    result.push(...wrapLine(line, width, wordWrap, wrapOnWordBoundary));
  }
  return result.length ? result : [''];
}

function align(value, width, alignment) {
  const gap = Math.max(0, width - visibleWidth(value));
  if (alignment === 'right') return repeat(' ', gap) + value;
  if (alignment === 'center') {
    const left = Math.floor(gap / 2);
    return repeat(' ', left) + value + repeat(' ', gap - left);
  }
  return value + repeat(' ', gap);
}

function normalizeCell(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const known = ['content', 'colSpan', 'rowSpan', 'hAlign', 'vAlign', 'style'];
    if (known.some(key => Object.prototype.hasOwnProperty.call(value, key))) {
      return {
        content: value.content == null ? '' : String(value.content),
        colSpan: Math.max(1, Number(value.colSpan) || 1),
        rowSpan: Math.max(1, Number(value.rowSpan) || 1),
        hAlign: value.hAlign,
        vAlign: value.vAlign,
        style: value.style || {}
      };
    }
  }
  return { content: value == null ? '' : String(value), colSpan: 1, rowSpan: 1, style: {} };
}

function normalizeRows(rows) {
  const normalized = [];
  for (const row of rows) {
    if (Array.isArray(row)) {
      normalized.push(row.map(normalizeCell));
      continue;
    }
    if (row && typeof row === 'object') {
      const entries = Object.entries(row);
      if (entries.length === 1) {
        const [key, value] = entries[0];
        if (Array.isArray(value)) normalized.push([normalizeCell(key), ...value.map(normalizeCell)]);
        else normalized.push([normalizeCell(key), normalizeCell(value)]);
      } else {
        for (const [key, value] of entries) normalized.push([normalizeCell(key), normalizeCell(value)]);
      }
      continue;
    }
    normalized.push([normalizeCell(row)]);
  }
  return normalized;
}

function columnCount(rows) {
  return rows.reduce((maximum, row) => Math.max(maximum, row.reduce((sum, cell) => sum + cell.colSpan, 0)), 0);
}

function naturalWidths(rows, count, options) {
  const widths = Array(count).fill(1);
  rows.forEach((row, rowIndex) => {
    let column = 0;
    for (const cell of row) {
      const left = Number(cell.style['padding-left'] ?? options.style['padding-left']);
      const right = Number(cell.style['padding-right'] ?? options.style['padding-right']);
      if (cell.colSpan === 1) {
        const longest = Math.max(...cell.content.split('\n').map(visibleWidth), 0);
        widths[column] = Math.max(widths[column], longest + left + right);
      }
      column += cell.colSpan;
    }
  });
  if (options.head) {
    options.head.forEach((heading, column) => {
      if (column < widths.length) {
        widths[column] = Math.max(widths[column], visibleWidth(heading) + options.style['padding-left'] + options.style['padding-right']);
      }
    });
  }
  for (const row of rows) {
    let column = 0;
    for (const cell of row) {
      if (cell.colSpan > 1) {
        const required = Math.max(...cell.content.split('\n').map(visibleWidth), 0) +
          Number(cell.style['padding-left'] ?? options.style['padding-left']) +
          Number(cell.style['padding-right'] ?? options.style['padding-right']);
        const current = widths.slice(column, column + cell.colSpan).reduce((sum, width) => sum + width, 0) + cell.colSpan - 1;
        if (required > current) widths[column + cell.colSpan - 1] += required - current;
      }
      column += cell.colSpan;
    }
  }
  return widths;
}

function makeGrid(rows, count) {
  const grid = [];
  const active = Array(count).fill(null);
  rows.forEach((row, rowIndex) => {
    grid[rowIndex] = Array(count).fill(null);
    for (let column = 0; column < count; column++) {
      if (active[column] && active[column].until >= rowIndex) grid[rowIndex][column] = active[column].entry;
    }
    let column = 0;
    for (const cell of row) {
      while (column < count && grid[rowIndex][column]) column++;
      const entry = { cell, row: rowIndex, column };
      for (let offset = 0; offset < cell.colSpan && column + offset < count; offset++) {
        grid[rowIndex][column + offset] = entry;
        if (cell.rowSpan > 1) active[column + offset] = { entry, until: rowIndex + cell.rowSpan - 1 };
      }
      column += cell.colSpan;
    }
  });
  return grid;
}

class Table extends Array {
  constructor(options) {
    super();
    options ||= {};
    this.options = { ...options };
    this.options.chars = { ...DEFAULT_CHARS, ...(options.chars || {}) };
    this.options.style = { ...DEFAULT_STYLE, ...(options.style || {}) };
    this.options.truncate = options.truncate ?? '…';
    this.options.head = options.head ? Array.from(options.head) : [];
    this.options.colWidths = options.colWidths ? Array.from(options.colWidths, Number) : [];
    this.options.rowHeights = options.rowHeights ? Array.from(options.rowHeights, Number) : [];
    this.options.colAligns = options.colAligns ? Array.from(options.colAligns) : [];
    this.options.rowAligns = options.rowAligns ? Array.from(options.rowAligns) : [];
    Object.defineProperty(this, 'options', {
      value: this.options,
      enumerable: Boolean(this.options.debug)
    });

    if (this.options.debug) {
      if (typeof this.options.debug === 'boolean') debugLevel = 1;
      else if (typeof this.options.debug === 'number') debugLevel = this.options.debug;
      else if (typeof this.options.debug === 'string') debugLevel = parseInt(this.options.debug, 10);
      else debugMessages.push(`Debug option is expected to be boolean, number, or string. Received a ${typeof this.options.debug}`);
      Object.defineProperty(this, 'messages', { get: () => debugMessages });
    }
  }

  toString() {
    const options = this.options;
    const sourceRows = options.head.length ? [options.head, ...this] : Array.from(this);
    const rows = normalizeRows(sourceRows);
    if (rows.length === 0) return '';
    const count = columnCount(rows);
    if (count === 0) return '';
    const widths = options.colWidths.length ? options.colWidths.slice() : naturalWidths(rows, count, options);
    while (widths.length < count) widths.push(1);
    const grid = makeGrid(rows, count);
    const chars = options.chars;
    const border = value => applyStyles(value, options.style.border);
    const renderedRows = [];

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const entries = [...new Set(grid[rowIndex].filter(Boolean))];
      const prepared = entries.map(entry => {
        const { cell, column } = entry;
        const totalWidth = widths.slice(column, column + cell.colSpan).reduce((sum, width) => sum + width, 0) + cell.colSpan - 1;
        const left = Number(cell.style['padding-left'] ?? options.style['padding-left']);
        const right = Number(cell.style['padding-right'] ?? options.style['padding-right']);
        const contentWidth = Math.max(0, totalWidth - left - right);
        let lines;
        if (options.wordWrap || cell.style.wordWrap) {
          lines = wrap(cell.content, contentWidth, true, options.wrapOnWordBoundary);
        } else {
          lines = cell.content.split('\n').map(line => truncate(line, contentWidth, options.truncate));
        }
        return { entry, totalWidth, left, right, contentWidth, lines };
      });
      const ownItems = prepared.filter(item => item.entry.row === rowIndex);
      let height = options.rowHeights?.[rowIndex] || Math.max(1, ...ownItems.map(item => item.lines.length));
      const output = [];
      for (let lineIndex = 0; lineIndex < height; lineIndex++) {
        let line = border(chars.left);
        let expectedColumn = 0;
        for (const item of prepared) {
          while (expectedColumn < item.entry.column) {
            line += repeat(' ', widths[expectedColumn]) + border(chars.middle);
            expectedColumn++;
          }
          if (item.entry.row < rowIndex) {
            line += repeat(' ', item.totalWidth);
          } else {
            const vertical = item.entry.cell.vAlign || options.rowAligns[item.entry.row] || 'top';
            const offset = vertical === 'bottom' ? height - item.lines.length : vertical === 'center' ? Math.floor((height - item.lines.length) / 2) : 0;
            const content = item.lines[lineIndex - offset] || '';
            const horizontal = item.entry.cell.hAlign || options.colAligns[item.entry.column] || 'left';
            let styled = align(content, item.contentWidth, horizontal);
            const cellStyles = item.entry.cell.style.head || (item.entry.row === 0 && options.head.length ? options.style.head : []);
            styled = applyStyles(styled, cellStyles);
            line += repeat(' ', item.left) + styled + repeat(' ', item.right);
          }
          expectedColumn = item.entry.column + item.entry.cell.colSpan;
          line += border(expectedColumn >= count ? chars.right : chars.middle);
        }
        output.push(line);
      }
      renderedRows.push(output);
    }

    const outerSeparator = (row, horizontal, left, middle, right) => {
      let line = border(chars[left]);
      for (let column = 0; column < count; column++) {
        const entry = grid[row][column];
        line += border(repeat(chars[horizontal], widths[column]));
        if (column === count - 1) {
          line += border(chars[right]);
        } else if (entry && entry === grid[row][column + 1]) {
          line += border(chars[horizontal]);
        } else {
          line += border(chars[middle]);
        }
      }
      return line;
    };

    const rowSeparator = row => {
      let line = border(chars['left-mid']);
      for (let column = 0; column < count; column++) {
        const above = grid[row][column];
        const below = grid[row + 1][column];
        line += above && above === below
          ? repeat(' ', widths[column])
          : border(repeat(chars.mid, widths[column]));
        if (column === count - 1) {
          line += border(chars['right-mid']);
        } else {
          const aboveContinues = above && above === grid[row][column + 1];
          const belowContinues = below && below === grid[row + 1][column + 1];
          line += border(aboveContinues && belowContinues ? chars.mid : chars['mid-mid']);
        }
      }
      return line;
    };

    const output = [outerSeparator(0, 'top', 'top-left', 'top-mid', 'top-right')];
    renderedRows.forEach((lines, rowIndex) => {
      output.push(...lines);
      if (rowIndex < renderedRows.length - 1) {
        const compact = options.style.compact || chars.mid === '';
        if (!compact || (options.head.length && rowIndex === 0)) output.push(rowSeparator(rowIndex));
      }
    });
    output.push(outerSeparator(rows.length - 1, 'bottom', 'bottom-left', 'bottom-mid', 'bottom-right'));
    return output.join('\n');
  }

  get width() {
    return this.toString().split('\n')[0].length;
  }
}

Table.reset = () => {
  debugLevel = 0;
  debugMessages = [];
};

module.exports = Table;
