'use strict';

const stringWidth = require('string-width');

const DEFAULT_CHARACTERS = {
  top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
  bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
  left: '│', 'left-mid': '├', mid: '─', 'mid-mid': '┼',
  right: '│', 'right-mid': '┤', middle: '│',
};

const DEFAULT_STYLE = {
  'padding-left': 1,
  'padding-right': 1,
  head: ['red'],
  border: ['grey'],
  compact: false,
};

const debug = { reset() {} };

function repeat(character, length) {
  return character && length > 0 ? character.repeat(length) : '';
}

function visibleWidth(value) {
  return stringWidth(String(value).replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''));
}

function truncate(value, desiredWidth, marker) {
  const text = String(value);
  if (visibleWidth(text) <= desiredWidth) return text;
  if (desiredWidth <= 0) return '';
  const suffix = visibleWidth(marker) <= desiredWidth ? marker : '';
  const targetWidth = desiredWidth - visibleWidth(suffix);
  let result = '';
  for (const character of text) {
    if (visibleWidth(result + character) > targetWidth) break;
    result += character;
  }
  return result + suffix;
}

function pad(value, width, alignment) {
  const missing = Math.max(0, width - visibleWidth(value));
  if (alignment === 'right') return repeat(' ', missing) + value;
  if (alignment === 'center') {
    const left = Math.floor(missing / 2);
    return repeat(' ', left) + value + repeat(' ', missing - left);
  }
  return value + repeat(' ', missing);
}

function splitLongWord(word, width) {
  const pieces = [];
  let piece = '';
  for (const character of word) {
    if (piece && visibleWidth(piece + character) > width) {
      pieces.push(piece);
      piece = '';
    }
    piece += character;
  }
  if (piece || pieces.length === 0) pieces.push(piece);
  return pieces;
}

function wrapLine(line, width, wordWrap) {
  if (width <= 0) return [''];
  if (!wordWrap) return splitLongWord(line, width);
  const output = [];
  let current = '';
  for (const word of line.split(/(\s+)/)) {
    if (!word) continue;
    if (visibleWidth(word) > width) {
      if (current.trimEnd()) output.push(current.trimEnd());
      const pieces = splitLongWord(word.trim(), width);
      output.push(...pieces.slice(0, -1));
      current = pieces.at(-1) || '';
    } else if (visibleWidth(current + word) > width) {
      output.push(current.trimEnd());
      current = word.trimStart();
    } else {
      current += word;
    }
  }
  output.push(current.trimEnd());
  return output;
}

function normalizeCell(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const options = { ...value };
    const content = options.content === undefined ? '' : options.content;
    delete options.content;
    return { content: String(content), options };
  }
  return { content: value == null ? '' : String(value), options: {} };
}

function mergeOptions(supplied = {}) {
  return {
    chars: { ...DEFAULT_CHARACTERS, ...(supplied.chars || {}) },
    truncate: supplied.truncate === undefined ? '…' : supplied.truncate,
    colWidths: supplied.colWidths?.slice(),
    rowHeights: supplied.rowHeights?.slice(),
    colAligns: supplied.colAligns?.slice(),
    rowAligns: supplied.rowAligns?.slice(),
    style: { ...DEFAULT_STYLE, ...(supplied.style || {}) },
    head: supplied.head?.slice(),
    wordWrap: Boolean(supplied.wordWrap),
  };
}

function rowEntries(row) {
  if (Array.isArray(row)) return row;
  if (row && typeof row === 'object') {
    return Object.entries(row).flatMap(([key, value]) => Array.isArray(value) ? [key, ...value] : [key, value]);
  }
  return [row];
}

function calculateColumnWidths(rows, configuredWidths) {
  if (configuredWidths) return configuredWidths.slice();
  const columnCount = rows.reduce((largest, row) => Math.max(largest, row.length), 0);
  return Array.from({ length: columnCount }, (_, column) => {
    const contentWidth = rows.reduce((largest, row) => {
      const cell = row[column];
      return cell ? Math.max(largest, ...cell.content.split('\n').map(visibleWidth)) : largest;
    }, 0);
    return contentWidth + 2;
  });
}

function renderBorder(widths, left, middle, right, horizontal) {
  if (!left && !middle && !right && !horizontal) return '';
  return left + widths.map((width) => repeat(horizontal, width)).join(middle) + right;
}

function prepareCell(cell, column, row, options, widths) {
  const paddingLeft = cell.options['padding-left'] ?? options.style['padding-left'];
  const paddingRight = cell.options['padding-right'] ?? options.style['padding-right'];
  const span = Math.max(1, Number(cell.options.colSpan) || 1);
  const totalWidth = widths.slice(column, column + span).reduce((sum, width) => sum + width, 0) + span - 1;
  const innerWidth = Math.max(0, totalWidth - paddingLeft - paddingRight);
  const alignment = cell.options.hAlign || options.colAligns?.[column] || 'left';
  const lines = cell.content.split('\n').flatMap((line) => wrapLine(line, innerWidth, options.wordWrap));
  return {
    span,
    options: cell.options,
    width: totalWidth,
    lines: lines.map((line) => repeat(' ', paddingLeft) + pad(truncate(line, innerWidth, options.truncate), innerWidth, alignment) + repeat(' ', paddingRight)),
    row,
  };
}

function renderRow(row, rowIndex, options, widths) {
  const prepared = [];
  let column = 0;
  for (const cell of row) {
    const rendered = prepareCell(cell, column, rowIndex, options, widths);
    prepared.push(rendered);
    column += rendered.span;
  }
  let height = prepared.reduce((largest, cell) => Math.max(largest, cell.lines.length), 1);
  if (options.rowHeights?.[rowIndex]) height = Math.max(height, options.rowHeights[rowIndex]);
  return Array.from({ length: height }, (_, lineIndex) => {
    const parts = prepared.map((cell) => {
      const verticalAlignment = cell.options.vAlign || options.rowAligns?.[rowIndex] || 'top';
      let contentIndex = lineIndex;
      if (verticalAlignment === 'bottom') contentIndex -= height - cell.lines.length;
      if (verticalAlignment === 'center') contentIndex -= Math.floor((height - cell.lines.length) / 2);
      return contentIndex >= 0 && contentIndex < cell.lines.length ? cell.lines[contentIndex] : repeat(' ', cell.width);
    });
    return options.chars.left + parts.join(options.chars.middle) + options.chars.right;
  });
}

function doDraw(table) {
  const { options } = table;
  const rows = [];
  if (options.head) rows.push(options.head.map(normalizeCell));
  rows.push(...table.map((row) => rowEntries(row).map(normalizeCell)));
  if (rows.length === 0) return '';
  const widths = calculateColumnWidths(rows, options.colWidths);
  table.options.colWidths = widths;
  const output = [];
  const top = renderBorder(widths, options.chars['top-left'], options.chars['top-mid'], options.chars['top-right'], options.chars.top);
  if (top) output.push(top);
  rows.forEach((row, index) => {
    if (index > 0) {
      const separator = renderBorder(widths, options.chars['left-mid'], options.chars['mid-mid'], options.chars['right-mid'], options.chars.mid);
      if (separator && (!options.style.compact || (index === 1 && options.head))) output.push(separator);
    }
    output.push(...renderRow(row, index, options, widths));
  });
  const bottom = renderBorder(widths, options.chars['bottom-left'], options.chars['bottom-mid'], options.chars['bottom-right'], options.chars.bottom);
  if (bottom) output.push(bottom);
  return output.join('\n');
}

class Table extends Array {
  constructor(options) {
    super();
    this.options = mergeOptions(options);
  }

  toString() {
    return doDraw(this);
  }

  get width() {
    const widths = this.options.colWidths;
    return widths ? widths.reduce((total, width) => total + width, 0) + widths.length + 1 : visibleWidth(this.toString().split('\n')[0] || '');
  }
}

Table.prototype[Symbol.for('nodejs.util.inspect.custom')] = () => debug.reset();
module.exports = Table;
