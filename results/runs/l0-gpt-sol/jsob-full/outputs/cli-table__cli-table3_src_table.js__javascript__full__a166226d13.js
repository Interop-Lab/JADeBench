'use strict';

const ANSI_RE = /\u001b\[((?:\d*;){0,5}\d*)m/g;
const ANSI_STRIP_RE = /\u001b\[(?:\d*;){0,5}\d*m/g;

function strlen(value) {
  return String(value).replace(ANSI_STRIP_RE, '').length;
}

function repeat(value, count) {
  return count > 0 ? value.repeat(count) : '';
}

function pad(value, width, align) {
  const text = String(value);
  const missing = Math.max(0, width - strlen(text));
  if (align === 'right') return repeat(' ', missing) + text;
  if (align === 'center') {
    const left = Math.floor(missing / 2);
    return repeat(' ', left) + text + repeat(' ', missing - left);
  }
  return text + repeat(' ', missing);
}

function wrap(value, width, wrapOnWordBoundary) {
  const text = String(value);
  if (width <= 0) return [''];
  const result = [];
  let remaining = text;

  while (strlen(remaining) > width) {
    let cut = width;
    if (wrapOnWordBoundary) {
      const part = remaining.slice(0, width + 1);
      const boundary = part.lastIndexOf(' ');
      if (boundary > 0) cut = boundary;
    }
    result.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
    if (remaining[0] === ' ') remaining = remaining.slice(1);
  }

  result.push(remaining);
  return result;
}

function normalizeCell(cell) {
  if (cell && typeof cell === 'object' && !Array.isArray(cell)) return cell;
  return { content: cell == null ? '' : String(cell) };
}

class Cell {
  constructor(options) {
    options = normalizeCell(options);
    this.options = options;
    this.content = options.content == null ? '' : String(options.content);
    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;
    this.hAlign = options.hAlign || options.colAlign || 'left';
    this.vAlign = options.vAlign || options.rowAlign || 'top';
    this.desiredWidth = options.desiredWidth;
    this.desiredHeight = options.desiredHeight;
    this.head = !!options.head;
    this.x = null;
    this.y = null;
  }

  lines(width, wrapOnWordBoundary) {
    return this.content
      .split('\n')
      .reduce((result, line) => result.concat(wrap(line, width, wrapOnWordBoundary)), []);
  }

  draw(width, height, wrapOnWordBoundary) {
    const lines = this.lines(width, wrapOnWordBoundary);
    const result = [];
    for (let i = 0; i < height; i++) {
      const line = lines[i] || '';
      result.push(pad(line, width, this.hAlign));
    }
    return result;
  }
}

class Table extends Array {
  constructor(options) {
    super();

    if (Array.isArray(options)) {
      options = { data: options };
    }
    options = options || {};

    this.options = options;
    this.options.chars = Object.assign({
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
      middle: '│'
    }, options.chars);

    this.options.colWidths = options.colWidths;
    this.options.rowHeights = options.rowHeights;
    this.options.colAligns = options.colAligns || [];
    this.options.rowAligns = options.rowAligns || [];
    this.options.style = Object.assign({
      'padding-left': ' ',
      'padding-right': ' ',
      head: ['red'],
      border: ['grey'],
      compact: false
    }, options.style);

    if (options.head) {
      this.push(options.head);
    }
    if (options.data) {
      for (const row of options.data) this.push(row);
    }
  }

  toString() {
    if (!this.length) return '';

    const rows = this.map(row => Array.isArray(row) ? row : [row]);
    const cells = rows.map((row, y) => row.map((value, x) => {
      const cell = new Cell(value);
      cell.x = x;
      cell.y = y;
      if (!cell.options.hAlign && this.options.colAligns[x]) {
        cell.hAlign = this.options.colAligns[x];
      }
      if (!cell.options.vAlign && this.options.rowAligns[y]) {
        cell.vAlign = this.options.rowAligns[y];
      }
      return cell;
    }));

    const columnCount = cells.reduce((max, row) => Math.max(max, row.length), 0);
    const widths = this.options.colWidths
      ? this.options.colWidths.slice()
      : Array(columnCount).fill(0);

    for (const row of cells) {
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        const left = this.options.style['padding-left'].length;
        const right = this.options.style['padding-right'].length;
        const contentWidth = cell.content
          .split('\n')
          .reduce((max, line) => Math.max(max, strlen(line)), 0);
        if (widths[x] == null) widths[x] = 0;
        if (!this.options.colWidths) {
          widths[x] = Math.max(widths[x], contentWidth + left + right);
        }
      }
    }

    for (let x = 0; x < widths.length; x++) {
      widths[x] = Math.max(1, widths[x] || 1);
    }

    const chars = this.options.chars;
    const lines = [];
    const border = value => String(value);

    const horizontal = (left, middle, right, fill) =>
      border(left) +
      widths.map(width => repeat(fill, width)).join(border(middle)) +
      border(right);

    lines.push(horizontal(chars['top-left'], chars['top-mid'], chars['top-right'], chars.top));

    for (let y = 0; y < cells.length; y++) {
      const row = cells[y];
      const height = this.options.rowHeights && this.options.rowHeights[y]
        ? this.options.rowHeights[y]
        : row.reduce((max, cell, x) => {
            const width = Math.max(1, widths[x] - this.options.style['padding-left'].length - this.options.style['padding-right'].length);
            return Math.max(max, cell.lines(width, !!this.options.wordWrap).length);
          }, 1);

      const rendered = row.map((cell, x) => {
        const width = Math.max(1, widths[x] - this.options.style['padding-left'].length - this.options.style['padding-right'].length);
        return cell.draw(width, height, !!this.options.wordWrap);
      });

      for (let line = 0; line < height; line++) {
        let output = chars.left;
        for (let x = 0; x < widths.length; x++) {
          const cell = rendered[x];
          const content = cell ? cell[line] || repeat(' ', widths[x]) : repeat(' ', widths[x]);
          output += this.options.style['padding-left'] + content +
            this.options.style['padding-right'];
          output += x === widths.length - 1 ? chars.right : chars.middle;
        }
        lines.push(output);
      }

      if (y < cells.length - 1) {
        lines.push(horizontal(chars['left-mid'], chars['mid-mid'], chars['right-mid'], chars.mid));
      }
    }

    lines.push(horizontal(chars['bottom-left'], chars['bottom-mid'], chars['bottom-right'], chars.bottom));
    return lines.join('\n');
  }

  get width() {
    return this.toString().split('\n')[0].length;
  }
}

Table.Cell = Cell;
Table.prototype.options = {};

module.exports = Table;
