var stringWidth = require('string-width');

let debugMessages = [];
let debugLevel = 0;

function logDebugMessage(message, level) {
  if (debugLevel >= level) debugMessages.push(message);
}

logDebugMessage.WARN = 1;
logDebugMessage.INFO = 2;
logDebugMessage.DEBUG = 3;
logDebugMessage.reset = () => {
  debugMessages = [];
};
logDebugMessage.setDebugLevel = level => {
  debugLevel = level;
};
logDebugMessage.warn = message => logDebugMessage(message, logDebugMessage.WARN);
logDebugMessage.info = message => logDebugMessage(message, logDebugMessage.INFO);
logDebugMessage.debug = message => logDebugMessage(message, logDebugMessage.DEBUG);
logDebugMessage.debugMessages = () => debugMessages;

const { info, debug } = logDebugMessage;

function ansiRegex(capture) {
  return capture
    ? /\u001b\[((?:\d*;){0,5}\d*)m/g
    : /\u001b\[(?:\d*;){0,5}\d*m/g;
}

function visibleWidth(value) {
  const plainText = String(value).replace(ansiRegex(), '');
  return plainText.split('\n').reduce((maximum, line) => {
    const width = stringWidth(line);
    return width > maximum ? stringWidth(line) : maximum;
  }, 0);
}

function repeat(value, count) {
  return Array(count + 1).join(value);
}

const styleCodes = {};

function registerStyle(name, onCode, offCode) {
  const on = `\u001b[${onCode}m`;
  const off = `\u001b[${offCode}m`;
  styleCodes[off] = { set: name, to: false };
  styleCodes[on] = { set: name, to: true };
  styleCodes[name] = { on, off };
}

function updateStyleState(state, match) {
  const code = match[1] ? parseInt(match[1].split(';')[0]) : 0;
  if ((code >= 30 && code <= 39) || (code >= 90 && code <= 97)) {
    state.lastForegroundAdded = match[0];
    return;
  }
  if ((code >= 40 && code <= 49) || (code >= 100 && code <= 107)) {
    state.lastBackgroundAdded = match[0];
    return;
  }
  if (code === 0) {
    for (const name in state) {
      if (Object.prototype.hasOwnProperty.call(state, name)) delete state[name];
    }
    return;
  }
  const style = styleCodes[match[0]];
  if (style) state[style.set] = style.to;
}

function readStyleState(value) {
  const regex = ansiRegex(true);
  const state = {};
  let match = regex.exec(value);
  while (match !== null) {
    updateStyleState(state, match);
    match = regex.exec(value);
  }
  return state;
}

function closeStyles(state, value) {
  const background = state.lastBackgroundAdded;
  const foreground = state.lastForegroundAdded;
  delete state.lastBackgroundAdded;
  delete state.lastForegroundAdded;
  Object.keys(state).forEach(name => {
    if (state[name]) value += styleCodes[name].off;
  });
  if (background && background !== '\u001b[49m') value += '\u001b[49m';
  if (foreground && foreground !== '\u001b[39m') value += '\u001b[39m';
  return value;
}

function openStyles(state, value) {
  const background = state.lastBackgroundAdded;
  const foreground = state.lastForegroundAdded;
  delete state.lastBackgroundAdded;
  delete state.lastForegroundAdded;
  Object.keys(state).forEach(name => {
    if (state[name]) value = styleCodes[name].on + value;
  });
  if (background && background !== '\u001b[49m') value = background + value;
  if (foreground && foreground !== '\u001b[39m') value = foreground + value;
  return value;
}

function truncatePlainSegment(value, width) {
  if (value.length === visibleWidth(value)) return value.substr(0, width);
  while (visibleWidth(value) > width) value = value.slice(0, -1);
  return value;
}

function wordWrapOnBoundary(width, value) {
  let whitespace;
  const lines = [];
  const parts = value.split(/(\s+)/g);
  let currentLine = [];
  let currentWidth = 0;
  for (let index = 0; index < parts.length; index += 2) {
    const word = parts[index];
    let nextWidth = currentWidth + visibleWidth(word);
    if (currentWidth > 0 && whitespace) nextWidth += whitespace.length;
    if (nextWidth > width) {
      if (currentWidth !== 0) lines.push(currentLine.join(''));
      currentLine = [word];
      currentWidth = visibleWidth(word);
    } else {
      currentLine.push(whitespace || '', word);
      currentWidth = nextWidth;
    }
    whitespace = parts[index + 1];
  }
  if (currentWidth) lines.push(currentLine.join(''));
  return lines;
}

function hardWrap(width, value) {
  const lines = [];
  let currentLine = '';
  function append(word, whitespace) {
    if (currentLine.length && whitespace) currentLine += whitespace;
    currentLine += word;
    while (currentLine.length > width) {
      lines.push(currentLine.slice(0, width));
      currentLine = currentLine.slice(width);
    }
  }
  const parts = value.split(/(\s+)/g);
  for (let index = 0; index < parts.length; index += 2) {
    append(parts[index], index && parts[index - 1]);
  }
  if (currentLine.length) lines.push(currentLine);
  return lines;
}

registerStyle('bold', 1, 22);
registerStyle('italics', 3, 23);
registerStyle('underline', 4, 24);
registerStyle('inverse', 7, 27);
registerStyle('strikethrough', 9, 29);

const utils = {
  strlen: visibleWidth,
  repeat,

  pad(value, targetWidth, padCharacter, alignment) {
    const width = visibleWidth(value);
    if (targetWidth + 1 >= width) {
      const padding = targetWidth - width;
      switch (alignment) {
        case 'right':
          value = repeat(padCharacter, padding) + value;
          break;
        case 'center': {
          const rightPadding = Math.ceil(padding / 2);
          value = repeat(padCharacter, padding - rightPadding) + value + repeat(padCharacter, rightPadding);
          break;
        }
        default:
          value += repeat(padCharacter, padding);
      }
    }
    return value;
  },

  truncate(value, width, marker) {
    marker = marker || '…';
    if (visibleWidth(value) <= width) return value;

    function truncateToWidth(input, targetWidth) {
      const regex = ansiRegex(true);
      const plainSegments = input.split(ansiRegex());
      let segmentIndex = 0;
      let resultWidth = 0;
      let result = '';
      const state = {};
      while (resultWidth < targetWidth) {
        const match = regex.exec(input);
        let segment = plainSegments[segmentIndex++];
        if (resultWidth + visibleWidth(segment) > targetWidth) {
          segment = truncatePlainSegment(segment, targetWidth - resultWidth);
        }
        result += segment;
        resultWidth += visibleWidth(segment);
        if (resultWidth < targetWidth) {
          if (!match) break;
          result += match[0];
          updateStyleState(state, match);
        }
      }
      return closeStyles(state, result);
    }

    let result = truncateToWidth(value, width - visibleWidth(marker));
    result += marker;
    const hyperlinkClose = '\u001b]8;;\u0007';
    if (value.includes(hyperlinkClose) && !result.includes(hyperlinkClose)) result += hyperlinkClose;
    return result;
  },

  mergeOptions(options, defaults) {
    options = options || {};
    defaults = defaults || {
      chars: {
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
      },
      truncate: '…',
      colWidths: [],
      rowHeights: [],
      colAligns: [],
      rowAligns: [],
      style: {
        'padding-left': 1,
        'padding-right': 1,
        head: ['red'],
        border: ['grey'],
        compact: false
      },
      head: []
    };
    const merged = Object.assign({}, defaults, options);
    merged.chars = Object.assign({}, defaults.chars, options.chars);
    merged.style = Object.assign({}, defaults.style, options.style);
    return merged;
  },

  wordWrap(width, value, wrapOnWordBoundary = true) {
    const lines = [];
    const inputLines = value.split('\n');
    const wrap = wrapOnWordBoundary ? wordWrapOnBoundary : hardWrap;
    for (let index = 0; index < inputLines.length; index++) {
      lines.push.apply(lines, wrap(width, inputLines[index]));
    }
    return lines;
  },

  colorizeLines(lines) {
    let state = {};
    const colorized = [];
    for (let index = 0; index < lines.length; index++) {
      const line = openStyles(state, lines[index]);
      state = readStyleState(line);
      colorized.push(closeStyles(Object.assign({}, state), line));
    }
    return colorized;
  },

  hyperlink(url, text) {
    const operatingSystemCommand = '\u001b]';
    const bell = '\u0007';
    const separator = ';';
    return [operatingSystemCommand, '8', separator, separator, url || text, bell, text,
      operatingSystemCommand, '8', separator, separator, bell].join('');
  },

  parseHexValue(value) {
    const [hex] = value.match(/#[0-9a-fA-F]{3,6}/) || ['#000'];
    return hex;
  }
};

const CHAR_NAMES = [
  'top', 'top-mid', 'top-left', 'top-right', 'bottom', 'bottom-mid', 'bottom-left',
  'bottom-right', 'left', 'left-mid', 'mid', 'mid-mid', 'right', 'right-mid', 'middle'
];

class Cell {
  constructor(options) {
    this.setOptions(options);
    this.x = null;
    this.y = null;
  }

  setOptions(options) {
    if (['boolean', 'number', 'bigint', 'string'].includes(typeof options)) {
      options = { content: String(options) };
    }
    options = options || {};
    this.options = options;
    const content = options.content;
    if (['boolean', 'number', 'bigint', 'string'].includes(typeof content)) {
      this.content = String(content);
    } else if (content) {
      throw new Error(`Content needs to be a primitive, got: ${typeof content}`);
    } else {
      this.content = options.href || '';
    }
    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;
    if (options.href) {
      Object.defineProperty(this, 'href', {
        get() {
          return this.options.href;
        }
      });
    }
  }

  mergeTableOptions(tableOptions, cells) {
    this.cells = cells;
    const cellChars = this.options.chars || {};
    this.chars = {};
    CHAR_NAMES.forEach(name => setOption(cellChars, tableOptions.chars, name, this.chars));
    this.truncate = this.options.truncate || tableOptions.truncate;
    const cellStyle = this.options.style = this.options.style || {};
    const tableStyle = tableOptions.style;
    setOption(cellStyle, tableStyle, 'padding-left', this);
    setOption(cellStyle, tableStyle, 'padding-right', this);
    this.head = cellStyle.head || tableStyle.head;
    this.border = cellStyle.border || tableStyle.border;
    this.fixedWidth = tableOptions.colWidths[this.x];
    this.lines = this.computeLines(tableOptions);
    this.desiredWidth = utils.strlen(this.content) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }

  computeLines(tableOptions) {
    const tableWordWrap = tableOptions.wordWrap || tableOptions.textWrap;
    const { wordWrap = tableWordWrap } = this.options;
    if (this.fixedWidth && wordWrap) {
      this.fixedWidth -= this.paddingLeft + this.paddingRight;
      if (this.colSpan) {
        let columnOffset = 1;
        while (columnOffset < this.colSpan) {
          this.fixedWidth += tableOptions.colWidths[this.x + columnOffset];
          columnOffset++;
        }
      }
      const { wrapOnWordBoundary: tableBoundary = true } = tableOptions;
      const { wrapOnWordBoundary = tableBoundary } = this.options;
      return this.wrapLines(utils.wordWrap(this.fixedWidth, this.content, wrapOnWordBoundary));
    }
    return this.wrapLines(this.content.split('\n'));
  }

  wrapLines(lines) {
    const colorizedLines = utils.colorizeLines(lines);
    return this.href ? colorizedLines.map(line => utils.hyperlink(this.href, line)) : colorizedLines;
  }

  init(tableOptions) {
    this.widths = tableOptions.colWidths.slice(this.x, this.x + this.colSpan);
    this.heights = tableOptions.rowHeights.slice(this.y, this.y + this.rowSpan);
    this.width = this.widths.reduce(sumPlusOne, -1);
    this.height = this.heights.reduce(sumPlusOne, -1);
    this.hAlign = this.options.hAlign || tableOptions.colAligns[this.x];
    this.vAlign = this.options.vAlign || tableOptions.rowAligns[this.y];
    this.drawRight = this.x + this.colSpan == tableOptions.colWidths.length;
  }

  draw(line, rowOffset) {
    if (line == 'top') return this.drawTop(this.drawRight);
    if (line == 'bottom') return this.drawBottom(this.drawRight);
    const preview = utils.truncate(this.content, 10, this.truncate);
    if (!line) info(`${this.y}-${this.x}: ${this.rowSpan - line}x${this.colSpan} Cell ${preview}`);
    const spareLines = Math.max(this.height - this.lines.length, 0);
    let topPadding;
    switch (this.vAlign) {
      case 'center':
        topPadding = Math.ceil(spareLines / 2);
        break;
      case 'bottom':
        topPadding = spareLines;
        break;
      default:
        topPadding = 0;
    }
    if (line < topPadding || line >= topPadding + this.lines.length) {
      return this.drawEmpty(this.drawRight, rowOffset);
    }
    const isLastVisibleLine = this.lines.length > this.height && line + 1 >= this.height;
    return this.drawLine(line - topPadding, this.drawRight, isLastVisibleLine, rowOffset);
  }

  drawTop(drawRight) {
    const output = [];
    if (this.cells) {
      this.widths.forEach((width, index) => {
        output.push(this._topLeftChar(index));
        output.push(utils.repeat(this.chars[this.y == 0 ? 'top' : 'mid'], width));
      });
    } else {
      output.push(this._topLeftChar(0));
      output.push(utils.repeat(this.chars[this.y == 0 ? 'top' : 'mid'], this.width));
    }
    if (drawRight) output.push(this.chars[this.y == 0 ? 'topRight' : 'rightMid']);
    return this.wrapWithStyleColors('border', output.join(''));
  }

  _topLeftChar(columnOffset) {
    const column = this.x + columnOffset;
    let charName;
    if (this.y == 0) {
      charName = column == 0 ? 'topLeft' : columnOffset == 0 ? 'topMid' : 'top';
    } else if (column == 0) {
      charName = 'leftMid';
    } else {
      charName = columnOffset == 0 ? 'midMid' : 'bottomMid';
      if (this.cells) {
        if (this.cells[this.y - 1][column] instanceof Cell.ColSpanCell) {
          charName = columnOffset == 0 ? 'topMid' : 'mid';
        }
        if (columnOffset == 0) {
          let spanWidth = 1;
          while (this.cells[this.y][column - spanWidth] instanceof Cell.ColSpanCell) spanWidth++;
          if (this.cells[this.y][column - spanWidth] instanceof Cell.RowSpanCell) charName = 'leftMid';
        }
      }
    }
    return this.chars[charName];
  }

  wrapWithStyleColors(styleName, value) {
    const styles = this[styleName];
    if (!styles || !styles.length) return value;
    try {
      let style = require('ansis');
      for (let index = styles.length - 1; index >= 0; index--) {
        const name = styles[index];
        const isHex = name.startsWith('hex');
        const isBackgroundHex = name.startsWith('bgHex');
        if (isHex || isBackgroundHex) {
          const hex = utils.parseHexValue(name);
          style = isBackgroundHex ? style.bgHex(hex) : style.hex(hex);
        } else {
          style = style[name];
        }
      }
      return style(value);
    } catch (error) {
      return value;
    }
  }

  drawLine(lineIndex, drawRight, truncateLine, rowOffset) {
    let left = this.chars[this.x == 0 ? 'left' : 'middle'];
    if (this.x && rowOffset && this.cells) {
      let leftCell = this.cells[this.y + rowOffset][this.x - 1];
      while (leftCell instanceof ColSpanCell) leftCell = this.cells[leftCell.y][leftCell.x - 1];
      if (!(leftCell instanceof RowSpanCell)) left = this.chars.rightMid;
    }
    const leftPadding = utils.repeat(' ', this.paddingLeft);
    const right = drawRight ? this.chars.right : '';
    const rightPadding = utils.repeat(' ', this.paddingRight);
    let content = this.lines[lineIndex];
    const contentWidth = this.width - (this.paddingLeft + this.paddingRight);
    if (truncateLine) content += this.truncate || '…';
    content = utils.truncate(content, contentWidth, this.truncate);
    content = utils.pad(content, contentWidth, ' ', this.hAlign);
    return this.stylizeLine(left, leftPadding + content + rightPadding, right);
  }

  stylizeLine(left, content, right) {
    left = this.wrapWithStyleColors('border', left);
    right = this.wrapWithStyleColors('border', right);
    if (this.y === 0) content = this.wrapWithStyleColors('head', content);
    return left + content + right;
  }

  drawBottom(drawRight) {
    const left = this.chars[this.x == 0 ? 'bottomLeft' : 'bottomMid'];
    const line = utils.repeat(this.chars.bottom, this.width);
    const right = drawRight ? this.chars.bottomRight : '';
    return this.wrapWithStyleColors('border', left + line + right);
  }

  drawEmpty(drawRight, rowOffset) {
    let left = this.chars[this.x == 0 ? 'left' : 'middle'];
    if (this.x && rowOffset && this.cells) {
      let leftCell = this.cells[this.y + rowOffset][this.x - 1];
      while (leftCell instanceof ColSpanCell) leftCell = this.cells[leftCell.y][leftCell.x - 1];
      if (!(leftCell instanceof RowSpanCell)) left = this.chars.rightMid;
    }
    const right = drawRight ? this.chars.right : '';
    const content = utils.repeat(' ', this.width);
    return this.stylizeLine(left, content, right);
  }
}

class ColSpanCell {
  draw(line) {
    if (typeof line === 'number') debug(`${this.y}-${this.x}: 1x1 ColSpanCell`);
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
    this.offset = findDimension(tableOptions.rowHeights, this.originalCell.y, this.cellOffset);
  }
  draw(line) {
    if (line == 'top') return this.originalCell.draw(this.offset, this.cellOffset);
    if (line == 'bottom') return this.originalCell.draw('bottom');
    debug(`${this.y}-${this.x}: 1x${this.colSpan} RowSpanCell for ${this.originalCell.content}`);
    return this.originalCell.draw(this.offset + 1 + line);
  }
  mergeTableOptions() {}
}

function firstDefined(...values) {
  return values.filter(value => value != null).shift();
}

function setOption(cellOptions, tableOptions, name, target) {
  const parts = name.split('-');
  if (parts.length > 1) {
    parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].substr(1);
    const camelName = parts.join('');
    target[camelName] = firstDefined(
      cellOptions[camelName], cellOptions[name], tableOptions[camelName], tableOptions[name]
    );
  } else {
    target[name] = firstDefined(cellOptions[name], tableOptions[name]);
  }
}

function findDimension(dimensions, start, offset) {
  let total = dimensions[start];
  for (let index = 1; index < offset; index++) total += 1 + dimensions[start + index];
  return total;
}

function sumPlusOne(total, value) {
  return total + value + 1;
}

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
