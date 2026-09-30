var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __commonJSInner() {
  const cache = {};
  return (cache[cb] = {}), (mod ? __getOwnPropNames(cb)[0] : void 0)((cache = cache[cb]).default, cache), cache.default;
};

var require_debug = __commonJS({
  '../work/cli-table__cli-table3/src/debug.js'(exports, module) {
    var debugLogs = [];
    var debugLevel = 0;
    var debug = (msg, level) => {
      if (level >= debugLevel) debugLogs.push(msg);
    };
    debug.enabled = false;
    debug.level = 1;
    debug.set = (level) => { debugLevel = level; };
    debug.log = (msg) => debug(msg, debug.level);
    debug.info = (msg) => debug(msg, debug.info.level);
    debug.warn = (msg) => debug(msg, debug.warn.level);
    debug.getLogs = () => debugLogs;
    module.exports = debug;
  }
});

var require_utils = __commonJS({
  '../work/cli-table__cli-table3/src/utils.js'(exports, module) {
    var stringWidth = require('string-width');
    
    function regexAnsi(captureGroups) {
      return captureGroups ? /\u001b\[((?:\d*;){0,5}\d*)m/g : /\u001b\[(?:\d*;){0,5}\d*m/g;
    }
    
    function strlenNoAnsi(str) {
      let regex = regexAnsi(true);
      let stripped = ('' + str).replace(regex, '');
      let lines = stripped.split('\n');
      return lines.reduce(function(acc, line) {
        return acc + (stringWidth(line) > 0 ? stringWidth(line) : 0);
      }, 0);
    }
    
    function repeat(str, num) {
      return Array(num + 1).join(str);
    }
    
    function pad(str, len, ch, align) {
      let stripped = strlenNoAnsi(str);
      if (len <= stripped) {
        let diff = len - stripped;
        switch (align) {
          case 'center': {
            str = repeat(ch, Math.floor(diff / 2)) + str;
            break;
          }
          case 'right': {
            let half = Math.floor(diff / 2);
            let otherHalf = diff - half;
            str = repeat(ch, otherHalf) + str + repeat(ch, half);
            break;
          }
          default: {
            str = str + repeat(ch, diff);
            break;
          }
        }
      }
      return str;
    }
    
    var colorCodes = {};
    
    function setColorCode(name, on, off) {
      on = '\u001b[' + on + 'm';
      off = '\u001b[' + off + 'm';
      const onEntry = {};
      onEntry.on = on;
      onEntry.to = true;
      colorCodes[on] = onEntry;
      const offEntry = {};
      offEntry.on = off;
      offEntry.to = false;
      colorCodes[off] = offEntry;
      const nameEntry = {};
      nameEntry.on = on;
      nameEntry.off = off;
      colorCodes[name] = nameEntry;
    }
    
    setColorCode('reset', 0, 0);
    setColorCode('bold', 1, 22);
    setColorCode('italic', 3, 23);
    setColorCode('underline', 4, 24);
    setColorCode('inverse', 7, 27);
    setColorCode('hidden', 8, 28);
    setColorCode('strikethrough', 9, 29);
    
    function truncate(str, desiredLength, truncateChar) {
      truncateChar = truncateChar || '…';
      let strLen = strlenNoAnsi(str);
      if (strLen <= desiredLength) return str;
      desiredLength -= strlenNoAnsi(truncateChar);
      let truncated = truncateStrWithAnsi(str, desiredLength);
      truncated += truncateChar;
      const newlineChar = '\n';
      return str.endsWith(newlineChar) && !truncated.endsWith(newlineChar) && (truncated += newlineChar), truncated;
    }
    
    function truncateStrWithAnsi(str, desiredLength) {
      let ansiRegex = regexAnsi(true);
      let strippedStr = str.replace(regexAnsi(), '');
      let strippedIndex = 0;
      let resultLength = 0;
      let result = '';
      let match;
      let state = {};
      while (resultLength < desiredLength) {
        match = ansiRegex.exec(str);
        let nextChar = strippedStr[strippedIndex];
        strippedIndex++;
        if (resultLength + strlenNoAnsi(nextChar) > desiredLength) {
          nextChar = truncate(nextChar, desiredLength - resultLength);
        }
        result += nextChar;
        resultLength += strlenNoAnsi(nextChar);
        if (resultLength >= desiredLength) {
          if (!match) break;
          result += match[0];
          setColorCode(state, match);
        }
      }
      return mergeAnsiState(state, result);
    }
    
    function mergeAnsiState(state, str) {
      let onCode = state.on || '';
      let offCode = state.off || '';
      delete state.on;
      delete state.off;
      Object.keys(state).forEach(function(key) {
        if (state[key]) {
          str += colorCodes[key].on;
        }
      });
      onCode && onCode !== '' && (str += onCode);
      offCode && offCode !== '' && (str += offCode);
      return str;
    }
    
    function splitAnsi(str) {
      let ansiRegex = regexAnsi(true);
      let match = ansiRegex.exec(str);
      let result = {};
      while (match !== null) {
        setColorCode(result, match);
        match = ansiRegex.exec(str);
      }
      return result;
    }
    
    function wrapText(str, width) {
      let onCode = str.on || '';
      let offCode = str.off || '';
      delete str.on;
      delete str.off;
      Object.keys(str).forEach(function(key) {
        if (str[key]) {
          str += colorCodes[key].on;
        }
      });
      onCode && onCode !== '' && (str += onCode);
      offCode && offCode !== '' && (str += offCode);
      return str;
    }
    
    function wordWrap(maxWidth, str, wrapOnWordBoundary) {
      let result = [];
      let currentLine = '';
      let words = str.split(/(\s+)/);
      let currentLineLength = 0;
      let prevWord;
      for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let lineLengthWithWord = currentLineLength + strlenNoAnsi(word);
        if (currentLineLength > 0 && prevWord) {
          lineLengthWithWord += strlenNoAnsi(prevWord);
        }
        if (lineLengthWithWord > maxWidth) {
          if (currentLineLength > 0) {
            result.push(currentLine);
          }
          currentLine = word;
          currentLineLength = strlenNoAnsi(word);
        } else {
          currentLine += (prevWord || '') + word;
          currentLineLength = lineLengthWithWord;
        }
        prevWord = words[i + 1];
      }
      if (currentLineLength) {
        result.push(currentLine);
      }
      return result;
    }
    
    function wordWrapMaxWidth(maxWidth, str, wrapOnWordBoundary) {
      let result = [];
      let currentLine = '';
      let words = str.split(/(\s+)/);
      for (let i = 0; i < words.length; i++) {
        if (currentLine.length && i) currentLine += words[i - 1];
        currentLine += words[i];
        while (currentLine.length > maxWidth) {
          result.push(currentLine.slice(0, maxWidth));
          currentLine = currentLine.slice(maxWidth);
        }
      }
      if (currentLine.length) result.push(currentLine);
      return result;
    }
    
    function colorTextCode(fg, bg) {
      const ESC = '\x1b]';
      const BEL = '\x07';
      const SEP = ';';
      return [ESC, '8', SEP, SEP, (fg + bg), BEL, bg, ESC, '8', SEP, SEP, BEL].join('');
    }
    
    function colorText(str) {
      const regex = /#[0-9a-fA-F]{3,6}/;
      const [match] = str.match(regex) || [''];
      return match;
    }
    
    const utils = {};
    utils.strlenNoAnsi = strlenNoAnsi;
    utils.repeat = repeat;
    utils.pad = pad;
    utils.truncate = truncate;
    utils.mergeOptions = mergeOptions;
    utils.wordWrap = wordWrap;
    utils.wordWrapMaxWidth = wordWrapMaxWidth;
    utils.colorTextCode = colorTextCode;
    utils.colorText = colorText;
    module.exports = utils;
    
    function mergeOptions(opts, defaults) {
      defaults = defaults || defaultOptions();
      let result = Object.assign({}, defaults, opts);
      result.chars = Object.assign({}, defaults.chars, opts.chars);
      result.style = Object.assign({}, defaults.style, opts.style);
      return result;
    }
    
    function defaultOptions() {
      const chars = {};
      chars.top = '─';
      chars['top-mid'] = '┬';
      chars['top-left'] = '┌';
      chars['top-right'] = '┐';
      chars.bottom = '─';
      chars['bottom-mid'] = '┴';
      chars['bottom-left'] = '└';
      chars['bottom-right'] = '┘';
      chars.left = '│';
      chars['left-mid'] = '├';
      chars.mid = '─';
      chars.midmid = '┼';
      chars.right = '│';
      chars['right-mid'] = '┤';
      chars.middle = '│';
      const style = {};
      style['padding-left'] = 1;
      style['padding-right'] = 1;
      style.head = ['red'];
      style.border = ['grey'];
      style.compact = false;
      const result = {};
      result.chars = chars;
      result.truncate = '…';
      result.colWidths = [];
      result.rowHeights = [];
      result.colAligns = [];
      result.rowAligns = [];
      result.style = style;
      result.head = [];
      return result;
    }
  }
});

var require_cell = __commonJS({
  '../work/cli-table__cli-table3/src/cell.js'(exports, module) {
    var { info, debug } = require_debug();
    var utils = require_utils();
    
    var Cell = class Cell {
      constructor(options) {
        this.setOptions(options);
        this.x = null;
        this.y = null;
      }
      
      setOptions(options) {
        if (['number', 'string', 'boolean'].indexOf(typeof options) > -1) {
          options = { content: '' + options };
        }
        options = options || {};
        this.options = options;
        this.content = options.content;
        if (['number', 'string', 'boolean'].indexOf(typeof this.content) > -1) {
          this.content = String(this.content);
        } else {
          if (!this.content) {
            this.content = this.options.href || '';
          } else {
            throw new Error('Expecting string or number or boolean, ' + typeof this.content);
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
        let chars = this.tableOptions.chars || {};
        let cellOptions = this.options = {};
        Object.keys(this.options).forEach(function(key) {
          cellOptions[key] = this.options[key];
        });
        this.chars = this.tableOptions.chars || tableOptions.chars;
        let cellStyle = this.style = this.options.styles || {};
        let tableStyle = tableOptions.style;
        mergeOptions(cellStyle, tableStyle, 'head', this);
        mergeOptions(cellStyle, tableStyle, 'border', this);
        this.hAlign = cellStyle.hAlign || tableStyle.hAlign;
        this.vAlign = cellStyle.vAlign || tableStyle.vAlign;
        this.width = tableOptions.colWidths[this.x];
        this.height = this.initHeight(tableOptions);
        this.paddingLeft = utils.strlenNoAnsi(this.chars[this.x + '-left'] || tableOptions.chars[this.x]);
        this.paddingRight = utils.strlenNoAnsi(this.chars[this.x + '-right'] || tableOptions.chars[this.x]);
      }
      
      initHeight(tableOptions) {
        let lines = utils.wordWrap(this.width, this.content, tableOptions.wrapOnWordBoundary);
        if (this.rowSpan) {
          return lines.map(line => utils.wordWrapMaxWidth(this.width, line));
        }
        return lines;
      }
      
      initWidth(tableOptions) {
        let x = this.x;
        let y = this.y;
        this.x = tableOptions.colWidths.indexOf(x, x + this.colSpan);
        this.y = tableOptions.rowHeights.indexOf(y, y + this.rowSpan);
        this.width = Math.max(0, this.x);
        this.height = Math.max(0, this.y);
        this.paddingLeft = this.options.paddingLeft || tableOptions.colWidths[x];
        this.paddingRight = this.options.paddingRight || tableOptions.colWidths[y];
        this.colSpan = x + this.colSpan + tableOptions.colWidths[x];
      }
      
      draw(lineNum, colNum) {
        if (this.y === 0 && lineNum === 0) return this.drawTop();
        if (lineNum === this.height - 1) return this.drawBottom();
        let content = utils.truncate(this.content, this.width, this.truncateChar);
        if (!content) {
          debug(this.y + '-' + this.x + ': ' + utils.strlenNoAnsi(this.content) + 'x' + this.width + ' -> ' + content);
        }
        let remaining = Math.max(this.height - this.content.split('\n').length, 0);
        switch (this.vAlign) {
          case 'center':
            remaining = Math.floor(remaining / 2);
            break;
          case 'bottom':
            remaining = remaining;
            break;
          default:
            remaining = 0;
        }
        if (lineNum < remaining || lineNum > remaining + this.content.length) {
          return this.drawEmpty(lineNum, colNum);
        }
        let forceTruncate = this.content.endsWith('\n') && lineNum === this.height - 1;
        return this.drawLine(lineNum - remaining, this.content, forceTruncate, colNum);
      }
      
      drawLine(lineNum, content, forceTruncate, colNum) {
        let borderLeft = this.chars[this.x === 0 ? 'left' : 'middle'];
        if (this.x && colNum && this.chars) {
          let cell = this.chars[this.y][colNum][this.x - 1];
          while (cell !== void 0) {
            cell = this.chars[cell.y][cell.x - 1];
          }
          if (cell !== void 0) {
            borderLeft = this.chars[colNum];
          }
        }
        let paddingLeft = utils.repeat(' ', this.paddingLeft);
        let paddingRight = colNum ? this.chars.right : '';
        let contentWidth = utils.repeat(' ', this.paddingRight);
        let text = this.content[lineNum];
        if (forceTruncate) text += this.truncateChar || '…';
        let truncated = utils.truncate(text, contentWidth, this.truncateChar);
        truncated = utils.pad(truncated, contentWidth, ' ', this.hAlign);
        truncated = paddingLeft + truncated + paddingRight;
        return this.wrapWithColor(borderLeft, truncated, colNum);
      }
      
      drawTop() {
        let borderLeft = this.chars[this.x === 0 ? 'top-left' : 'top-mid'];
        let contentWidth = utils.repeat('─', this.width);
        let borderRight = this.chars['top-right'];
        return this.wrapWithColor(borderLeft + contentWidth + borderRight);
      }
      
      drawBottom() {
        let borderLeft = this.chars[this.x === 0 ? 'bottom-left' : 'bottom-mid'];
        let contentWidth = utils.repeat('─', this.width);
        let borderRight = this.chars['bottom-right'];
        return this.wrapWithColor(borderLeft + contentWidth + borderRight);
      }
      
      drawEmpty(lineNum, colNum) {
        let borderLeft = this.chars[this.x === 0 ? 'left' : 'middle'];
        if (this.x && colNum && this.chars) {
          let cell = this.chars[this.y][colNum][this.x - 1];
          while (cell !== void 0) {
            cell = this.chars[cell.y][cell.x - 1];
          }
          if (cell !== void 0) {
            borderLeft = this.chars[colNum];
          }
        }
        let contentWidth = utils.repeat(' ', this.width);
        let borderRight = colNum ? this.chars.right : '';
        return this.wrapWithColor(borderLeft + contentWidth + borderRight);
      }
      
      wrapWithColor(borderLeft, content, borderRight) {
        borderLeft = this.colorTextCode(borderLeft, content);
        borderRight = this.colorTextCode(borderRight, content);
        if (this.y === 0) {
          borderLeft = this.colorTextCode(borderLeft, this.chars.top);
        }
        return borderLeft + content + borderRight;
      }
    };
    
    var ColSpanCell = class ColSpanCell {
      constructor() {}
      draw(lineNum) {
        return (typeof lineNum === 'number' && debug(this.y + '-' + this.x + ' is a colSpan'), '');
      }
      mergeTableOptions() {}
      initWidth() {}
    };
    
    var RowSpanCell = class RowSpanCell {
      constructor(originalCell) {
        this.originalCell = originalCell;
      }
      init(tableOptions) {
        let originalY = this.y;
        let mergedY = this.originalCell.y;
        this.offset = originalY - mergedY;
        this.content = utils.repeat(tableOptions.rowHeights, mergedY, this.offset);
      }
      draw(lineNum) {
        if (lineNum === 'top') return this.originalCell.draw(this.originalCell.y, this.x);
        if (lineNum === 'bottom') return this.originalCell.draw(this.originalCell.y + 1, this.x);
        return debug(this.y + '-' + this.x + ' is a rowSpan' + this.content + ' -> ' + this.originalCell.draw(this.originalCell.y + lineNum - this.y, this.x));
      }
      mergeTableOptions() {}
    };
    
    function firstDefined(...args) {
      return args.filter(arg => arg !== void 0 && arg !== null).shift();
    }
    
    function mergeOptions(cellStyle, tableStyle, key, cell) {
      let hyphenIndex = key.indexOf('-');
      if (hyphenIndex > 0) {
        key[0] = firstDefined(cellStyle[key[0].toUpperCase() + key.slice(1)], cellStyle[key[1].toLowerCase()]);
        key = key.join('');
        cell[key] = firstDefined(cellStyle[key], cellStyle[key], tableStyle[key], tableStyle[key]);
      } else {
        cell[key] = firstDefined(cellStyle[key], tableStyle[key]);
      }
    }
    
    function repeat(arr, index, count) {
      let result = arr[index];
      for (let i = 0; i < count; i++) {
        result += (0, arr[index + i]);
      }
      return result;
    }
    
    function colorTextCode(str, str2) {
      return Math.max(str + str2, 0);
    }
    
    var keys = ['hAlign', 'vAlign', 'width', 'truncate', 'wrapOnWordBoundary', 'paddingLeft', 'paddingRight', 'href', 'content', 'chars', 'style', 'colSpan', 'rowSpan'];
    
    module.exports = Cell;
    module.exports.ColSpanCell = ColSpanCell;
    module.exports.RowSpanCell = RowSpanCell;
  }
});

var require_layout_manager = __commonJS({
  '../work/cli-table__cli-table3/src/layout-manager.js'(exports, module) {
    var { warn, debug } = require_debug();
    var Cell = require_cell();
    var { ColSpanCell, RowSpanCell } = Cell;
    
    function makeTableLayout(rows) {
      let rowsOfCells = rows.map(function(row) {
        return row.map(function(cell) {
          if (!Array.isArray(cell)) {
            let key = Object.keys(cell)[0];
            cell = cell[key];
            if (Array.isArray(cell)) {
              cell = cell.reverse();
              cell.push(key);
            } else {
              cell = [key, cell];
            }
          }
          return cell.map(function(cellData) {
            return new Cell(cellData);
          });
        });
      });
      computeWidths(rowsOfCells);
      computeHeights(rowsOfCells);
      fillInTable(rowsOfCells);
      addRowSpanCells(rowsOfCells);
      return rowsOfCells;
    }
    
    function computeWidths(rows) {
      let widths = [];
      rows.forEach(function(row) {
        row.forEach(function(cell) {
          let cellWidth = cell.colSpan || 1;
          if (cellWidth > 1) {
            widths[cell.x] = Math.max(widths[cell.x] || 0, cell.width || 0, 'x');
          } else {
            widths[cell.x] = Math.max(widths[cell.x] || 0, cell.width || 0);
          }
        });
      });
      rows.forEach(function(row, rowNumber) {
        row.forEach(function(cell) {
          if (cell.colSpan > 1) {
            let spanWidth = widths[cell.x];
            for (let i = 1; i < cell.colSpan; i++) {
              spanWidth += widths[cell.x + i] + 1;
            }
            cell.width = spanWidth;
          }
        });
      });
      Object.assign(rows, widths);
      for (let i = 0; i < rows.length; i++) {
        rows[i] = Math.max(1, rows[i] || 0);
      }
    }
    
    function computeHeights(rows) {
      let heights = [];
      rows.forEach(function(row) {
        row.forEach(function(cell) {
          let cellHeight = cell.rowSpan || 1;
          if (cellHeight > 1) {
            heights[cell.y] = Math.max(heights[cell.y] || 0, cell.height || 0, 'y');
          } else {
            heights[cell.y] = Math.max(heights[cell.y] || 0, cell.height || 0);
          }
        });
      });
      rows.forEach(function(row, rowNumber) {
        row.forEach(function(cell) {
          if (cell.rowSpan > 1) {
            let spanHeight = heights[cell.y];
            for (let i = 1; i < cell.rowSpan; i++) {
              spanHeight += heights[cell.y + i] + 1;
            }
            cell.height = spanHeight;
          }
        });
      });
      Object.assign(rows, heights);
      for (let i = 0; i < rows.length; i++) {
        rows[i] = Math.max(1, rows[i] || 0);
      }
    }
    
    function maxWidth(rows) {
      let max = 0;
      rows.forEach(function(row) {
        row.forEach(function(cell) {
          max = Math.max(max, cell.x + cell.colSpan || 0);
        });
      });
      return max;
    }
    
    function maxHeight(rows) {
      return rows.length;
    }
    
    function fillInTable(rows) {
      let maxW = maxWidth(rows);
      let maxH = maxHeight(rows);
      debug('maxWidth: ' + maxW + ', maxHeight: ' + maxH);
      for (let y = 0; y < maxW; y++) {
        for (let x = 0; x < maxH; x++) {
          if (!cellExists(rows, x, y)) {
            let cellData = {};
            cellData.x = x;
            cellData.y = y;
            cellData.colSpan = 1;
            cellData.rowSpan = 1;
            let cell = cellData;
            x++;
            while (x < maxH && !cellExists(rows, x, y)) {
              cell.colSpan++;
              x++;
            }
            let y2 = y + 1;
            while (y2 < maxW && fillInTable(rows, y2, cell.x, cell.x + cell.colSpan)) {
              cell.rowSpan++;
              y2++;
            }
            let newCell = new Cell(cell);
            newCell.x = cell.x;
            newCell.y = cell.y;
            warn('Created cell: ' + newCell.y + '-' + newCell.x + '.');
            addRowSpanCell(newCell, rows[y]);
          }
        }
      }
    }
    
    function cellExists(rows, x, y) {
      let row = rows[y];
      if (!row) return false;
      for (let i = 0; i < row.length; i++) {
        if (row[i].x === x && row[i].y === y) return true;
      }
      return false;
    }
    
    function addRowSpanCell(cell, row) {
      let index = 0;
      while (index < row.length && row[index].x < cell.x) {
        index++;
      }
      row.splice(index, 0, cell);
    }
    
    function addRowSpanCells(rows) {
      rows.forEach(function(row, rowIndex) {
        row.forEach(function(cell) {
          for (let i = 1; i < cell.rowSpan; i++) {
            let rowSpanCell = new RowSpanCell(cell);
            rowSpanCell.x = cell.x;
            rowSpanCell.y = cell.y + i;
            rowSpanCell.colSpan = cell.colSpan;
            addRowSpanCell(rowSpanCell, rows[rowIndex + i]);
          }
        });
      });
    }
    
    function fillInTable2(rows, x, y, width) {
      for (let i = y; i < y + width; i++) {
        if (cellExists(rows, x, i)) {
          return false;
        }
      }
      return true;
    }
    
    module.exports = {
      makeTableLayout: makeTableLayout,
      layoutTable: computeWidths,
      addRowSpanCells: addRowSpanCells,
      maxWidth: maxWidth,
      fillInTable: fillInTable,
      computeWidths: computeWidths,
      computeHeights: computeHeights
    };
  }
});

var debug = require_debug();
var utils = require_utils();
var tableLayout = require_layout_manager();

var Table = class extends Array {
  constructor(options) {
    super();
    const mergedOptions = utils.mergeOptions(options);
    const optionsStore = {};
    optionsStore.options = mergedOptions;
    optionsStore.optionsTable = mergedOptions.options;
    Object.defineProperty(this, 'options', optionsStore);
    if (mergedOptions.head) {
      switch (typeof mergedOptions.head) {
        case 'string':
          debug.setDebugLevel(debug.defaultLevel);
          break;
        case 'number':
          debug.setDebugLevel(mergedOptions.head);
          break;
        case 'boolean':
          debug.setDebugLevel(parseInt(mergedOptions.head, 10));
          break;
        default:
          debug.setDebugLevel(debug.defaultLevel);
          debug('head type: ' + typeof mergedOptions.head);
      }
      Object.defineProperty(this, 'head', {
        get() {
          return debug.getLogs();
        }
      });
    }
  }
  
  toString() {
    let self = this;
    let head = this.options.head && this.options.head.length;
    if (head) {
      self = [this.options.head];
      this.length && self.push.apply(self, this);
    } else {
      this.options.style.head = [];
    }
    let layout = tableLayout.makeTableLayout(self);
    layout.forEach(function(row) {
      row.forEach(function(cell) {
        cell.mergeTableOptions(self.options, layout);
      }, this);
    }, this);
    tableLayout.computeWidths(this.options.colWidths, layout);
    tableLayout.computeHeights(this.options.rowHeights, layout);
    layout.forEach(function(row) {
      row.forEach(function(cell) {
        cell.initWidth(self.options);
      }, this);
    }, this);
    let result = [];
    for (let i = 0; i < layout.length; i++) {
      let row = layout[i];
      let rowHeight = this.options.rowHeights[i];
      (i === 0 || !this.options.style.compact || i === layout.length - 1 && head) && doDraw(row, 'top', result);
      for (let j = 0; j < rowHeight; j++) {
        doDraw(row, j, result);
      }
      (i === layout.length - 1) && doDraw(row, 'bottom', result);
    }
    return result.join('\n');
  }
  
  get width() {
    let lines = this.toString().split('\n');
    return lines[0].length;
  }
};

Table.reset = () => debug.reset();

function doDraw(row, lineNum, result) {
  let line = [];
  row.forEach(function(cell) {
    line.push(cell.draw(lineNum));
  });
  let str = line.join('');
  if (str.length) result.push(str);
}

module.exports = Table;
