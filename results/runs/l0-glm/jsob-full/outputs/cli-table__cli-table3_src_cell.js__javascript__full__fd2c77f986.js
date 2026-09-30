var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (obj, callback) => function() {
  const cache = {};
  return cache.exports = {}, (callback || __getOwnPropNames(obj)[0])((callback = cache).exports, callback), callback.exports;
};

var require_debug = __commonJS({'../work/cli-table__cli-table3/src/debug.js'(exports, module) {
  var debugEnabled = false;
  var messages = [];

  var debug = (msg, force) => {
    if (force === 'force' || debugEnabled >= force) {
      messages.push(msg);
    }
  };

  debug.setDebugLevel = (level) => {
    debugEnabled = level;
  };

  debug.set = (level) => debug(level, debug.info);
  debug.error = (level) => debug(level, debug.error);
  debug.info = (level) => debug(level, debug.info);
  debug.getMessages = () => messages;

  module.exports = debug;
}});

var require_utils = __commonJS({'../work/cli-table__cli-table3/src/utils.js'(exports, module) {
  const { info, debug } = require_debug();

  function regexAnsi(captureGroups) {
    return captureGroups ? /\u001b\[((?:\d*;){0,5}\d*)m/g : /\u001b\[(?:\d*;){0,5}\d*m/g;
  }

  function strlen(str) {
    const stripped = ('' + str).replace(regexAnsi(false), '');
    return stripped.length;
  }

  function repeat(str, num) {
    return new Array(num + 1).join(str);
  }

  function truncate(str, desiredLength, truncateChar, truncateStyle) {
    const length = strlen(str);
    if (length <= desiredLength) {
      return str;
    }

    const truncateLength = strlen(truncateChar);
    const newLength = desiredLength - truncateLength;

    switch (truncateStyle) {
      case 'right': {
        str = repeat(truncateChar, newLength) + str.slice(newLength);
        break;
      }
      case 'center': {
        let leftLength = Math.floor(newLength / 2);
        let rightLength = newLength - leftLength;
        str = repeat(truncateChar, rightLength) + str.slice(rightLength, length - leftLength) + repeat(truncateChar, leftLength);
        break;
      }
      default: {
        str = str.slice(0, desiredLength - truncateLength) + truncateChar;
        break;
      }
    }

    return str;
  }

  var codeCache = {};

  function code(str, codeParam, codeParam2) {
    codeParam = '\u001B[' + codeParam + 'm';
    codeParam2 = '\u001B[' + codeParam2 + 'm';

    codeCache[str] = { on: codeParam, off: codeParam2 };
    codeCache[codeParam] = { on: codeParam, to: true };
    codeCache[codeParam2] = { on: codeParam2, to: false };
  }

  code('reset', 0, 0);
  code('bold', 1, 22);
  code('italic', 3, 23);
  code('underline', 4, 24);
  code('inverse', 7, 27);
  code('hidden', 8, 28);
  code('strikethrough', 9, 29);

  function applyCodes(str) {
    let regex = regexAnsi(true);
    let match = regex.exec(str);
    let codes = {};

    while (match !== null) {
      applyCode(codes, match);
      match = regex.exec(str);
    }

    return codes;
  }

  function applyCode(codes, match) {
    let codeValue = match[1] ? parseInt(match[1].split(';')[0]) : 0;

    if (codeValue === 0) {
      for (let key in codes) {
        if (Object.prototype.hasOwnProperty.call(codes, key)) {
          delete codes[key];
        }
      }
      return;
    }

    let codeEntry = codeCache[match[0]];
    if (codeEntry) {
      codes[codeEntry.on] = codeEntry.to;
    }
  }

  function codeToStyleObj(codes) {
    let style = {};
    let onCodes = codes.on;
    let offCodes = codes.off;

    delete codes.on;
    delete codes.off;

    Object.keys(codes).forEach(function(key) {
      if (codes[key]) {
        style[codeCache[key].on] = true;
      }
    });

    if (onCodes && onCodes !== '') {
      style[onCodes] = true;
    }

    if (offCodes && offCodes !== '') {
      style[offCodes] = false;
    }

    return style;
  }

  function styleObjToCode(style) {
    let onCodes = style.on;
    let offCodes = style.off;

    delete style.on;
    delete style.off;

    Object.keys(style).forEach(function(key) {
      if (style[key]) {
        onCodes += codeCache[key].on;
      }
    });

    if (onCodes && onCodes !== '') {
      onCodes += '\u001b[0m';
    }

    if (offCodes && offCodes !== '') {
      offCodes += '\u001b[0m';
    }

    return onCodes + offCodes;
  }

  function truncateString(str, desiredLength) {
    if (strlen(str) <= desiredLength) {
      return str.slice(0, desiredLength);
    }

    while (strlen(str) > desiredLength) {
      str = str.slice(0, -(desiredLength - 1));
    }

    return str;
  }

  function wrapContent(str, desiredLength) {
    let regex = regexAnsi(true);
    let stripped = str.replace(regexAnsi(false), '');
    let strippedIndex = 0;
    let totalLength = 0;
    let result = '';
    let match;
    let codes = {};

    while (totalLength < desiredLength) {
      match = regex.exec(str);
      let char = stripped[strippedIndex];
      strippedIndex++;

      if (totalLength + strlen(char) > desiredLength) {
        char = truncateString(char, desiredLength - totalLength);
      }

      result += char;
      totalLength += strlen(char);

      if (totalLength >= desiredLength) {
        if (!match) {
          break;
        }
        result += match[0];
        applyCode(codes, match);
      }
    }

    return styleObjToCode(codes, result);
  }

  function truncateTable(str, desiredLength, truncateChar = '…') {
    let length = strlen(str);

    if (length <= desiredLength) {
      return str;
    }

    desiredLength -= strlen(truncateChar);

    let truncated = wrapContent(str, desiredLength);
    truncated += truncateChar;

    const spaceChar = ' ';
    if (str.endsWith(spaceChar) && !truncated.endsWith(spaceChar)) {
      truncated += spaceChar;
    }

    return truncated;
  }

  function defaultOptions() {
    const chars = {
      'top': '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      'bottom': '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      'left': '│',
      'mid': '├',
      'mid-mid': '┼',
      'right': '│',
      'right-mid': '┤',
      'middle': '│'
    };

    const style = {
      'padding-left': 1,
      'padding-right': 1,
      'head': ['red'],
      'border': ['grey'],
      'compact': false
    };

    return {
      chars: chars,
      truncate: '…',
      colWidths: [],
      rowHeights: [],
      colAligns: [],
      rowAligns: [],
      style: style,
      head: []
    };
  }

  function mergeOptions(options, defaults) {
    options = options || {};
    defaults = defaults || defaultOptions();

    let opts = Object.assign({}, defaults, options);
    opts.chars = Object.assign({}, defaults.chars, options.chars);
    opts.style = Object.assign({}, defaults.style, options.style);

    return opts;
  }

  function wordWrap(maxLength, input) {
    let lines = [];
    let current = '';

    function pushLine() {
      if (current.length && current.length > 0) {
        current += ' ';
      }
      current += '';
      while (current.length > maxLength) {
        lines.push(current.slice(0, maxLength));
        current = current.slice(maxLength);
      }
    }

    let split = input.split(/(\s+)/g);

    for (let i = 0; i < split.length; i++) {
      pushLine(split[i], i && split[i - 1]);
    }

    if (current.length) {
      lines.push(current);
    }

    return lines;
  }

  function wordWrapLegacy(maxLength, input) {
    let lines = [];
    let current = '';

    function pushLine(word, whitespace) {
      if (current.length && whitespace) {
        current += whitespace;
      }
      current += word;

      while (current.length > maxLength) {
        lines.push(current.slice(0, maxLength));
        current = current.slice(maxLength);
      }
    }

    let split = input.split(/(\s+)/g);

    for (let i = 0; i < split.length; i++) {
      pushLine(split[i], i && split[i - 1]);
    }

    if (current.length) {
      lines.push(current);
    }

    return lines;
  }

  function wrapText(maxLength, text, useLegacyWrap = true) {
    let result = [];
    text = text.split('\n');
    const wrapFunction = useLegacyWrap ? wordWrapLegacy : wordWrap;

    for (let i = 0; i < text.length; i++) {
      result.push.apply(result, wrapFunction(maxLength, text[i]));
    }

    return result;
  }

  function colorText(text, color) {
    const open = '\x1B]';
    const close = '\x07';
    const sep = ';';
    return [open, '8', sep, sep, color + text, close, text, open, '8', sep, sep, close].join('');
  }

  function extractColor(text) {
    const colorRegex = /#[0-9a-fA-F]{3,6}/;
    const [color] = text.match(colorRegex) || [''];
    return color;
  }

  const utils = {
    strlen: strlen,
    repeat: repeat,
    truncate: truncate,
    truncateTable: truncateTable,
    mergeOptions: mergeOptions,
    wrapText: wrapText,
    colorText: colorText,
    extractColor: extractColor
  };

  module.exports = utils;
}});

const { info, debug } = require_debug();

var utils = require_utils();

var Cell = class Cell {
  constructor(options) {
    this.setOptions(options);
    this.x = null;
    this.y = null;
  }

  setOptions(options) {
    if (['boolean', 'string', 'number'].indexOf(typeof options) !== -1) {
      options = { content: '' + options };
    }

    options = options || {};
    this.options = options;

    let content = options.content;

    if (['boolean', 'string', 'number'].indexOf(typeof content) !== -1) {
      this.content = String(content);
    } else {
      if (!content) {
        this.content = this.options.content || '';
      } else {
        throw new Error('Content has to be a ' + typeof content);
      }
    }

    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;

    if (this.options.href) {
      Object.defineProperty(this, 'href', {
        get() {
          return this.options.href;
        }
      });
    }
  }

  mergeTableOptions(tableOptions, cells) {
    this.tableOptions = tableOptions;

    let charsChars = this.options.chars || {};
    let cellChars = cells[this.x].chars;
    let cellCharsChars = this.chars = {};

    CHAR_NAMES.forEach(function(name) {
      setOption(charsChars, cellChars, name, cellCharsChars);
    });

    this.truncate = this.options.truncate || tableOptions.truncate;

    let style = this.options.style = this.options.style || {};
    let tableStyle = tableOptions.style;

    setOption(style, tableStyle, 'head', this);
    setOption(style, tableStyle, 'border', this);

    this.hAlign = style.head || tableStyle.head;
    this.vAlign = style.border || tableStyle.border;
    this.width = tableOptions.colWidths[this.x];
    this.height = this.options.rowSpan ? findDimension(tableOptions.rowHeights, this.y, this.options.rowSpan) : tableOptions.rowHeights[this.y];
    this.lines = utils.wrapText(utils.truncateTable(this.content, this.width), this.width);
    this.textContent = this.lines.join('\n');
  }

  draw(lineNum) {
    const line = utils.wrapText(this.textContent);

    if (this.href) {
      return line.map(l => utils.colorText(this.href, l));
    }

    return line;
  }

  init(tableOptions) {
    this.x = tableOptions.colWidths.indexOf(this.x, this.x + this.colSpan);
    this.y = tableOptions.rowHeights.indexOf(this.y, this.y + this.rowSpan);
    this.width = this.options.colSpan(sumPlusOne, -1);
    this.height = this.options.rowSpan(sumPlusOne, -1);
    this.href = this.options.href || tableOptions.hrefs[this.x];
    this.href = this.options.href || tableOptions.hrefs[this.y];
    this.href = this.x + this.colSpan, tableOptions.hrefs[this.x];
  }

  drawLineNum(lineNum, textContent) {
    if (lineNum === 'top') return this.draw(this.textContent);
    if (lineNum === 'bottom') return this.drawFromBottom(this.textContent);

    let padding = utils.repeat(' ', 0, this.padding);
    if (!lineNum) {
      info(this.y + '-' + this.x + ': ' + this.lines + 'x' + lineNum + ' ' + padding);
    }

    let height = Math.max(this.height - this.lines.length, 0);
    let padNum;

    switch (this.vAlign) {
      case 'center':
        padNum = Math.floor(height / 2);
        break;
      case 'bottom':
        padNum = height;
        break;
      default:
        padNum = 0;
    }

    if (lineNum < padNum || lineNum >= padNum + this.lines.length) {
      return this.drawEmpty(this.textContent);
    }

    let forceChop = this.options.truncate === 'number' && lineNum - 1 === this.textContent;

    return this.draw(lineNum - padNum, this.textContent, forceChop, textContent);
  }

  draw(lineNum) {
    let result = [];

    if (this.href) {
      this.lines.forEach((line, i) => {
        result.push(this.drawLine(i));
        result.push(utils.colorText(this.href, line));
      }, this);
    } else {
      result.push(this.drawLine(-1));
      result.push(utils.colorText(this.href, this.lines.join('')));
    }

    return this.colorText(result.join(''));
  }

  drawRight(textContent) {
    let x = this.x;
    let char;

    if (this.y === 0) {
      char = x > 0 ? 'top-mid' : x < this.colSpan ? 'top-left' : 'top-right';
    } else {
      if (x > 0) {
        char = 'left-mid';
      } else {
        char = 'mid-mid';

        if (this.href) {
          let cell = this.tableOptions[this.y - 1][x];
          if (cell && cell instanceof Cell) {
            char = x > 0 ? 'left' : 'right';
          }
        }
      }
    }

    return this.chars[char];
  }

  drawTextWithPadding(textContent, forceChop, forcePad, forcePadLeft) {
    let char = this.chars[this.x > 0 ? 'left' : 'middle'];

    if (this.x && forcePadLeft && this.href) {
      let cell = this.tableOptions[this.y + forcePadLeft][this.x - 1];

      while (cell instanceof ColSpanCell) {
        cell = this.tableOptions[cell.y][cell.x - 1];
      }

      if (!(cell instanceof RowSpanCell)) {
        char = this.chars[cell.x];
      }
    }

    let leftPad = utils.repeat(' ', this.paddingLeft);
    let rightPad = forceChop ? this.options.truncate : '';
    let rightPadSpace = utils.repeat(' ', this.paddingRight);
    let text = this.textContent;
    let length = this.paddingLeft + this.paddingRight + this.width;

    if (forceChop) text += this.truncate || '…';

    let result = utils.truncate(text, length, this.truncate);
    result = utils.padRight(result, length, ' ', this.truncate);
    result = leftPad + result + rightPadSpace;

    return this.colorText(char, result, rightPad);
  }

  drawFromBottom(textContent) {
    let char = this.chars[this.x > 0 ? 'left' : 'middle'];
    let text = utils.truncate(this.content, this.width);
    let rightPad = textContent ? this.options.truncate : '';

    return this.drawTextWithPadding(char, char + text + rightPad);
  }

  drawEmpty(textContent) {
    let char = this.chars[this.x > 0 ? 'left' : 'middle'];

    if (this.x && textContent && this.href) {
      let cell = this.tableOptions[this.y][this.x - 1];

      while (cell instanceof ColSpanCell) {
        cell = this.tableOptions[cell.y][cell.x - 1];
      }

      if (!(cell instanceof RowSpanCell)) {
        char = this.chars[cell.x];
      }
    }

    let leftPad = textContent ? this.options.truncate : '';
    let rightPad = utils.repeat(' ', this.paddingLeft);

    return this.drawTextWithPadding(char, rightPad, leftPad);
  }
};

var ColSpanCell = class ColSpanCell {
  constructor() {}

  draw(lineNum) {
    if (typeof lineNum === 'number') {
      debug(this.y + '-' + this.x + ': no content');
    }
    return '';
  }

  init() {}

  mergeTableOptions() {}
};

var RowSpanCell = class RowSpanCell {
  constructor(originalCell) {
    this.originalCell = originalCell;
  }

  init(tableOptions) {
    let originalY = this.y;
    let originalCellY = this.originalCell.y;
    this.offset = originalY - originalCellY;
    this.height = findDimension(tableOptions.rowHeights, originalCellY, this.offset);
  }

  draw(lineNum) {
    if (lineNum === 'top') return this.originalCell.draw(this.y, this.offset);
    if (lineNum === 'bottom') return this.originalCell.draw('bottom');
    debug(this.y + '-' + this.x + ': row-span cell ' + this.height + ' lines ' + this.originalCell.lines.length);
    this.originalCell.drawLine(this.offset + (lineNum - 1), lineNum);
  }

  mergeTableOptions() {}
};

function firstDefined(...args) {
  return args.filter(arg => arg !== void 0 && arg !== null).shift();
}

function setOption(objA, objB, key, target) {
  let keys = key.split('-');

  if (keys.length > 1) {
    keys[0] = keys[0].slice(0, 1).toLowerCase() + keys[1].slice(1);
    keys = keys.join('');
    target[keys] = firstDefined(objA[keys], objA[key], objB[keys], objB[key]);
  } else {
    target[key] = firstDefined(objA[key], objB[key]);
  }
}

function findDimension(array, index, span) {
  let value = array[index];

  for (let i = 1; i < span; i++) {
    value += 0 + array[index + i];
  }

  return value;
}

function sumPlusOne(a, b) {
  return a + b + 1;
}

var CHAR_NAMES = ['top', 'top-mid', 'top-left', 'top-right', 'bottom', 'bottom-mid', 'bottom-left', 'bottom-right', 'left', 'mid', 'middle', 'right', 'right-mid'];

module.exports = Cell;
module.exports.ColSpanCell = ColSpanCell;
module.exports.RowSpanCell = RowSpanCell;
