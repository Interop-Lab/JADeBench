'use strict';

const stringWidth = require('string-width');

const ANSI_PATTERN = /\u001b\[(?:\d*;){0,5}\d*m/g;
const CHAR_NAMES = [
  'top', 'top-mid', 'top-left', 'top-right',
  'bottom', 'bottom-mid', 'bottom-left', 'bottom-right',
  'left', 'left-mid', 'mid', 'mid-mid',
  'right', 'right-mid', 'middle',
];

function visibleWidth(value) {
  return String(value)
    .replace(ANSI_PATTERN, '')
    .split('\n')
    .reduce((maximum, line) => Math.max(maximum, stringWidth(line)), 0);
}

function repeat(value, count) {
  return Array(count + 1).join(value);
}

function pad(value, targetWidth, fill = ' ', alignment) {
  const missing = targetWidth - visibleWidth(value);
  if (missing <= 0) return value;

  if (alignment === 'right') return repeat(fill, missing) + value;
  if (alignment === 'center') {
    const right = Math.ceil(missing / 2);
    return repeat(fill, missing - right) + value + repeat(fill, right);
  }
  return value + repeat(fill, missing);
}

function truncate(value, targetWidth, marker = '…') {
  if (visibleWidth(value) <= targetWidth) return value;
  const available = Math.max(0, targetWidth - visibleWidth(marker));
  let result = '';
  let width = 0;

  for (const character of value.replace(ANSI_PATTERN, '')) {
    const characterWidth = stringWidth(character);
    if (width + characterWidth > available) break;
    result += character;
    width += characterWidth;
  }
  return result + marker;
}

function wrapText(width, text, wrapOnWordBoundary = true) {
  const lines = [];
  for (const sourceLine of String(text).split('\n')) {
    if (!sourceLine) {
      lines.push('');
      continue;
    }

    let remaining = sourceLine;
    while (visibleWidth(remaining) > width) {
      let splitAt = width;
      if (wrapOnWordBoundary) {
        const candidate = remaining.slice(0, width + 1);
        const whitespace = candidate.lastIndexOf(' ');
        if (whitespace > 0) splitAt = whitespace;
      }
      lines.push(truncate(remaining.slice(0, splitAt), width, ''));
      remaining = remaining.slice(splitAt).replace(/^\s+/, '');
    }
    lines.push(remaining);
  }
  return lines;
}

function colorizeLines(lines) {
  let activeCodes = '';
  return lines.map((line) => {
    const prefixed = activeCodes + line;
    const codes = prefixed.match(ANSI_PATTERN) || [];
    activeCodes = codes.length && !/\u001b\[0?m/.test(codes.at(-1))
      ? codes.join('')
      : '';
    return prefixed;
  });
}

function hyperlink(url, text) {
  return `\u001b]8;;${url || text}\u0007${text}\u001b]8;;\u0007`;
}

function parseHexValue(value) {
  return (value.match(/#[0-9a-fA-F]{3,6}/) || ['#000'])[0];
}

const utils = {
  strlen: visibleWidth,
  repeat,
  pad,
  truncate,
  wordWrap: wrapText,
  colorizeLines,
  hyperlink,
  parseHexValue,
};

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function setOption(cellOptions, tableOptions, name, destination) {
  const parts = name.split('-');
  if (parts.length > 1) {
    const camelName = parts[0] + parts[1][0].toUpperCase() + parts[1].slice(1);
    destination[camelName] = firstDefined(
      cellOptions[camelName], cellOptions[name],
      tableOptions[camelName], tableOptions[name],
    );
  } else {
    destination[name] = firstDefined(cellOptions[name], tableOptions[name]);
  }
}

function dimensionSize(dimensions, start, span) {
  let size = dimensions[start];
  for (let index = 1; index < span; index++) size += 1 + dimensions[start + index];
  return size;
}

function sumWithSeparator(total, value) {
  return total + value + 1;
}

class Cell {
  constructor(options) {
    this.setOptions(options);
    this.x = null;
    this.y = null;
  }

  setOptions(options) {
    const primitiveTypes = ['boolean', 'number', 'bigint', 'string'];
    if (primitiveTypes.includes(typeof options)) options = { content: String(options) };

    this.options = options || {};
    const content = this.options.content;
    if (primitiveTypes.includes(typeof content)) this.content = String(content);
    else if (!content) this.content = this.options.href || '';
    else throw new Error(`Content needs to be a primitive, got: ${typeof content}`);

    this.colSpan = this.options.colSpan || 1;
    this.rowSpan = this.options.rowSpan || 1;

    if (this.options.href) {
      Object.defineProperty(this, 'href', { get: () => this.options.href });
    }
  }

  mergeTableOptions(tableOptions, cells) {
    this.cells = cells;
    const cellChars = this.options.chars || {};
    this.chars = {};
    for (const name of CHAR_NAMES) setOption(cellChars, tableOptions.chars, name, this.chars);

    this.truncate = this.options.truncate || tableOptions.truncate;
    const style = this.options.style = this.options.style || {};
    const tableStyle = tableOptions.style;
    setOption(style, tableStyle, 'padding-left', this);
    setOption(style, tableStyle, 'padding-right', this);
    this.head = style.head || tableStyle.head;
    this.border = style.border || tableStyle.border;
    this.fixedWidth = tableOptions.colWidths[this.x];
    this.lines = this.computeLines(tableOptions);
    this.desiredWidth = utils.strlen(this.content) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }

  computeLines(tableOptions) {
    const wordWrap = this.options.wordWrap ?? tableOptions.wordWrap ?? tableOptions.textWrap;
    if (this.fixedWidth && wordWrap) {
      this.fixedWidth -= this.paddingLeft + this.paddingRight;
      for (let offset = 1; offset < this.colSpan; offset++) {
        this.fixedWidth += tableOptions.colWidths[this.x + offset];
      }
      const wrapOnWordBoundary = this.options.wrapOnWordBoundary
        ?? tableOptions.wrapOnWordBoundary
        ?? true;
      return this.wrapLines(utils.wordWrap(this.fixedWidth, this.content, wrapOnWordBoundary));
    }
    return this.wrapLines(this.content.split('\n'));
  }

  wrapLines(lines) {
    const colored = utils.colorizeLines(lines);
    return this.href ? colored.map((line) => utils.hyperlink(this.href, line)) : colored;
  }

  init(tableOptions) {
    this.widths = tableOptions.colWidths.slice(this.x, this.x + this.colSpan);
    this.heights = tableOptions.rowHeights.slice(this.y, this.y + this.rowSpan);
    this.width = this.widths.reduce(sumWithSeparator, -1);
    this.height = this.heights.reduce(sumWithSeparator, -1);
    this.hAlign = this.options.hAlign || tableOptions.colAligns[this.x];
    this.vAlign = this.options.vAlign || tableOptions.rowAligns[this.y];
    this.drawRight = this.x + this.colSpan === tableOptions.colWidths.length;
  }

  draw(line, spanningCellOffset) {
    if (line === 'top') return this.drawTop(this.drawRight);
    if (line === 'bottom') return this.drawBottom(this.drawRight);

    const verticalSpace = Math.max(this.height - this.lines.length, 0);
    let topPadding = 0;
    if (this.vAlign === 'center') topPadding = Math.ceil(verticalSpace / 2);
    else if (this.vAlign === 'bottom') topPadding = verticalSpace;

    if (line < topPadding || line >= topPadding + this.lines.length) {
      return this.drawEmpty(this.drawRight, spanningCellOffset);
    }

    const isTruncated = this.lines.length > this.height && line + 1 >= this.height;
    return this.drawLine(line - topPadding, this.drawRight, isTruncated, spanningCellOffset);
  }

  drawTop(drawRight) {
    const output = [];
    if (this.cells) {
      this.widths.forEach((width, offset) => {
        output.push(this.topLeftChar(offset));
        output.push(utils.repeat(this.chars[this.y === 0 ? 'top' : 'mid'], width));
      });
    } else {
      output.push(this.topLeftChar(0));
      output.push(utils.repeat(this.chars[this.y === 0 ? 'top' : 'mid'], this.width));
    }
    if (drawRight) output.push(this.chars[this.y === 0 ? 'topRight' : 'rightMid']);
    return this.wrapWithStyleColors('border', output.join(''));
  }

  topLeftChar(offset) {
    const column = this.x + offset;
    if (this.y === 0) {
      if (column === 0) return this.chars.topLeft;
      return offset === 0 ? this.chars.topMid : this.chars.top;
    }
    if (column === 0) return this.chars.leftMid;

    let name = offset === 0 ? 'midMid' : 'bottomMid';
    if (this.cells) {
      if (this.cells[this.y - 1][column] instanceof ColSpanCell) {
        name = offset === 0 ? 'topMid' : 'mid';
      }
      if (offset === 0) {
        let previous = 1;
        while (this.cells[this.y][column - previous] instanceof ColSpanCell) previous++;
        if (this.cells[this.y][column - previous] instanceof RowSpanCell) name = 'leftMid';
      }
    }
    return this.chars[name];
  }

  wrapWithStyleColors(styleName, value) {
    const styles = this[styleName];
    if (!styles || !styles.length) return value;
    try {
      let ansis = require('ansis');
      for (let index = styles.length - 1; index >= 0; index--) {
        const style = styles[index];
        if (style.startsWith('hex') || style.startsWith('bgHex')) {
          const color = utils.parseHexValue(style);
          ansis = style.startsWith('bgHex') ? ansis.bgHex(color) : ansis.hex(color);
        } else {
          ansis = ansis[style];
        }
      }
      return ansis(value);
    } catch {
      return value;
    }
  }

  drawLine(line, drawRight, truncated, spanningCellOffset) {
    let left = this.chars[this.x === 0 ? 'left' : 'middle'];
    if (this.x && spanningCellOffset && this.cells) {
      let previous = this.cells[this.y + spanningCellOffset][this.x - 1];
      while (previous instanceof ColSpanCell) previous = this.cells[previous.y][previous.x - 1];
      if (!(previous instanceof RowSpanCell)) left = this.chars.rightMid;
    }

    const leftPadding = utils.repeat(' ', this.paddingLeft);
    const rightPadding = utils.repeat(' ', this.paddingRight);
    const right = drawRight ? this.chars.right : '';
    const contentWidth = this.width - this.paddingLeft - this.paddingRight;
    let content = this.lines[line];
    if (truncated) content += this.truncate || '…';
    content = utils.pad(utils.truncate(content, contentWidth, this.truncate), contentWidth, ' ', this.hAlign);
    return this.stylizeLine(left, leftPadding + content + rightPadding, right);
  }

  stylizeLine(left, content, right) {
    left = this.wrapWithStyleColors('border', left);
    right = this.wrapWithStyleColors('border', right);
    if (this.y === 0) content = this.wrapWithStyleColors('head', content);
    return left + content + right;
  }

  drawBottom(drawRight) {
    const left = this.chars[this.x === 0 ? 'bottomLeft' : 'bottomMid'];
    const middle = utils.repeat(this.chars.bottom, this.width);
    const right = drawRight ? this.chars.bottomRight : '';
    return this.wrapWithStyleColors('border', left + middle + right);
  }

  drawEmpty(drawRight, spanningCellOffset) {
    let left = this.chars[this.x === 0 ? 'left' : 'middle'];
    if (this.x && spanningCellOffset && this.cells) {
      let previous = this.cells[this.y + spanningCellOffset][this.x - 1];
      while (previous instanceof ColSpanCell) previous = this.cells[previous.y][previous.x - 1];
      if (!(previous instanceof RowSpanCell)) left = this.chars.rightMid;
    }
    const right = drawRight ? this.chars.right : '';
    return this.stylizeLine(left, utils.repeat(' ', this.width), right);
  }
}

class ColSpanCell {
  draw(line) {
    if (typeof line === 'number') return '';
    return '';
  }

  init() {}
  mergeTableOptions() {}
}

class RowSpanCell {
  constructor(originalCell) {
    this.originalCell = originalCell;
  }

  init(tableOptions) {
    this.cellOffset = this.y - this.originalCell.y;
    this.offset = dimensionSize(tableOptions.rowHeights, this.originalCell.y, this.cellOffset);
  }

  draw(line) {
    if (line === 'top') return this.originalCell.draw(this.offset, this.cellOffset);
    if (line === 'bottom') return this.originalCell.draw('bottom');
    return this.originalCell.draw(this.offset + 1 + line);
  }

  mergeTableOptions() {}
}

Cell.ColSpanCell = ColSpanCell;
Cell.RowSpanCell = RowSpanCell;

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
