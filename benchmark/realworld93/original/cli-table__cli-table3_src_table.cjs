var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/cli-table__cli-table3/src/debug.js
var require_debug = __commonJS({
  "../work/cli-table__cli-table3/src/debug.js"(exports2, module2) {
    var messages = [];
    var level = 0;
    var debug2 = (msg, min) => {
      if (level >= min) {
        messages.push(msg);
      }
    };
    debug2.WARN = 1;
    debug2.INFO = 2;
    debug2.DEBUG = 3;
    debug2.reset = () => {
      messages = [];
    };
    debug2.setDebugLevel = (v) => {
      level = v;
    };
    debug2.warn = (msg) => debug2(msg, debug2.WARN);
    debug2.info = (msg) => debug2(msg, debug2.INFO);
    debug2.debug = (msg) => debug2(msg, debug2.DEBUG);
    debug2.debugMessages = () => messages;
    module2.exports = debug2;
  }
});

// ../work/cli-table__cli-table3/src/utils.js
var require_utils = __commonJS({
  "../work/cli-table__cli-table3/src/utils.js"(exports2, module2) {
    var stringWidth = require("string-width");
    function codeRegex(capture) {
      return capture ? /\u001b\[((?:\d*;){0,5}\d*)m/g : /\u001b\[(?:\d*;){0,5}\d*m/g;
    }
    function strlen(str) {
      let code = codeRegex();
      let stripped = ("" + str).replace(code, "");
      let split = stripped.split("\n");
      return split.reduce(function(memo, s) {
        return stringWidth(s) > memo ? stringWidth(s) : memo;
      }, 0);
    }
    function repeat(str, times) {
      return Array(times + 1).join(str);
    }
    function pad(str, len, pad2, dir) {
      let length = strlen(str);
      if (len + 1 >= length) {
        let padlen = len - length;
        switch (dir) {
          case "right": {
            str = repeat(pad2, padlen) + str;
            break;
          }
          case "center": {
            let right = Math.ceil(padlen / 2);
            let left = padlen - right;
            str = repeat(pad2, left) + str + repeat(pad2, right);
            break;
          }
          default: {
            str = str + repeat(pad2, padlen);
            break;
          }
        }
      }
      return str;
    }
    var codeCache = {};
    function addToCodeCache(name, on, off) {
      on = "\x1B[" + on + "m";
      off = "\x1B[" + off + "m";
      codeCache[on] = { set: name, to: true };
      codeCache[off] = { set: name, to: false };
      codeCache[name] = { on, off };
    }
    addToCodeCache("bold", 1, 22);
    addToCodeCache("italics", 3, 23);
    addToCodeCache("underline", 4, 24);
    addToCodeCache("inverse", 7, 27);
    addToCodeCache("strikethrough", 9, 29);
    function updateState(state, controlChars) {
      let controlCode = controlChars[1] ? parseInt(controlChars[1].split(";")[0]) : 0;
      if (controlCode >= 30 && controlCode <= 39 || controlCode >= 90 && controlCode <= 97) {
        state.lastForegroundAdded = controlChars[0];
        return;
      }
      if (controlCode >= 40 && controlCode <= 49 || controlCode >= 100 && controlCode <= 107) {
        state.lastBackgroundAdded = controlChars[0];
        return;
      }
      if (controlCode === 0) {
        for (let i in state) {
          if (Object.prototype.hasOwnProperty.call(state, i)) {
            delete state[i];
          }
        }
        return;
      }
      let info = codeCache[controlChars[0]];
      if (info) {
        state[info.set] = info.to;
      }
    }
    function readState(line) {
      let code = codeRegex(true);
      let controlChars = code.exec(line);
      let state = {};
      while (controlChars !== null) {
        updateState(state, controlChars);
        controlChars = code.exec(line);
      }
      return state;
    }
    function unwindState(state, ret) {
      let lastBackgroundAdded = state.lastBackgroundAdded;
      let lastForegroundAdded = state.lastForegroundAdded;
      delete state.lastBackgroundAdded;
      delete state.lastForegroundAdded;
      Object.keys(state).forEach(function(key) {
        if (state[key]) {
          ret += codeCache[key].off;
        }
      });
      if (lastBackgroundAdded && lastBackgroundAdded != "\x1B[49m") {
        ret += "\x1B[49m";
      }
      if (lastForegroundAdded && lastForegroundAdded != "\x1B[39m") {
        ret += "\x1B[39m";
      }
      return ret;
    }
    function rewindState(state, ret) {
      let lastBackgroundAdded = state.lastBackgroundAdded;
      let lastForegroundAdded = state.lastForegroundAdded;
      delete state.lastBackgroundAdded;
      delete state.lastForegroundAdded;
      Object.keys(state).forEach(function(key) {
        if (state[key]) {
          ret = codeCache[key].on + ret;
        }
      });
      if (lastBackgroundAdded && lastBackgroundAdded != "\x1B[49m") {
        ret = lastBackgroundAdded + ret;
      }
      if (lastForegroundAdded && lastForegroundAdded != "\x1B[39m") {
        ret = lastForegroundAdded + ret;
      }
      return ret;
    }
    function truncateWidth(str, desiredLength) {
      if (str.length === strlen(str)) {
        return str.substr(0, desiredLength);
      }
      while (strlen(str) > desiredLength) {
        str = str.slice(0, -1);
      }
      return str;
    }
    function truncateWidthWithAnsi(str, desiredLength) {
      let code = codeRegex(true);
      let split = str.split(codeRegex());
      let splitIndex = 0;
      let retLen = 0;
      let ret = "";
      let myArray;
      let state = {};
      while (retLen < desiredLength) {
        myArray = code.exec(str);
        let toAdd = split[splitIndex];
        splitIndex++;
        if (retLen + strlen(toAdd) > desiredLength) {
          toAdd = truncateWidth(toAdd, desiredLength - retLen);
        }
        ret += toAdd;
        retLen += strlen(toAdd);
        if (retLen < desiredLength) {
          if (!myArray) {
            break;
          }
          ret += myArray[0];
          updateState(state, myArray);
        }
      }
      return unwindState(state, ret);
    }
    function truncate(str, desiredLength, truncateChar) {
      truncateChar = truncateChar || "\u2026";
      let lengthOfStr = strlen(str);
      if (lengthOfStr <= desiredLength) {
        return str;
      }
      desiredLength -= strlen(truncateChar);
      let ret = truncateWidthWithAnsi(str, desiredLength);
      ret += truncateChar;
      const hrefTag = "\x1B]8;;\x07";
      if (str.includes(hrefTag) && !ret.includes(hrefTag)) {
        ret += hrefTag;
      }
      return ret;
    }
    function defaultOptions() {
      return {
        chars: {
          top: "\u2500",
          "top-mid": "\u252C",
          "top-left": "\u250C",
          "top-right": "\u2510",
          bottom: "\u2500",
          "bottom-mid": "\u2534",
          "bottom-left": "\u2514",
          "bottom-right": "\u2518",
          left: "\u2502",
          "left-mid": "\u251C",
          mid: "\u2500",
          "mid-mid": "\u253C",
          right: "\u2502",
          "right-mid": "\u2524",
          middle: "\u2502"
        },
        truncate: "\u2026",
        colWidths: [],
        rowHeights: [],
        colAligns: [],
        rowAligns: [],
        style: {
          "padding-left": 1,
          "padding-right": 1,
          head: ["red"],
          border: ["grey"],
          compact: false
        },
        head: []
      };
    }
    function mergeOptions(options, defaults) {
      options = options || {};
      defaults = defaults || defaultOptions();
      let ret = Object.assign({}, defaults, options);
      ret.chars = Object.assign({}, defaults.chars, options.chars);
      ret.style = Object.assign({}, defaults.style, options.style);
      return ret;
    }
    function wordWrap(maxLength, input) {
      let lines = [];
      let split = input.split(/(\s+)/g);
      let line = [];
      let lineLength = 0;
      let whitespace;
      for (let i = 0; i < split.length; i += 2) {
        let word = split[i];
        let newLength = lineLength + strlen(word);
        if (lineLength > 0 && whitespace) {
          newLength += whitespace.length;
        }
        if (newLength > maxLength) {
          if (lineLength !== 0) {
            lines.push(line.join(""));
          }
          line = [word];
          lineLength = strlen(word);
        } else {
          line.push(whitespace || "", word);
          lineLength = newLength;
        }
        whitespace = split[i + 1];
      }
      if (lineLength) {
        lines.push(line.join(""));
      }
      return lines;
    }
    function textWrap(maxLength, input) {
      let lines = [];
      let line = "";
      function pushLine(str, ws) {
        if (line.length && ws) line += ws;
        line += str;
        while (line.length > maxLength) {
          lines.push(line.slice(0, maxLength));
          line = line.slice(maxLength);
        }
      }
      let split = input.split(/(\s+)/g);
      for (let i = 0; i < split.length; i += 2) {
        pushLine(split[i], i && split[i - 1]);
      }
      if (line.length) lines.push(line);
      return lines;
    }
    function multiLineWordWrap(maxLength, input, wrapOnWordBoundary = true) {
      let output = [];
      input = input.split("\n");
      const handler = wrapOnWordBoundary ? wordWrap : textWrap;
      for (let i = 0; i < input.length; i++) {
        output.push.apply(output, handler(maxLength, input[i]));
      }
      return output;
    }
    function colorizeLines(input) {
      let state = {};
      let output = [];
      for (let i = 0; i < input.length; i++) {
        let line = rewindState(state, input[i]);
        state = readState(line);
        let temp = Object.assign({}, state);
        output.push(unwindState(temp, line));
      }
      return output;
    }
    function hyperlink(url, text) {
      const OSC = "\x1B]";
      const BEL = "\x07";
      const SEP = ";";
      return [OSC, "8", SEP, SEP, url || text, BEL, text, OSC, "8", SEP, SEP, BEL].join("");
    }
    function parseHexValue(text) {
      const regex = /#[0-9a-fA-F]{3,6}/;
      const [value] = text.match(regex) || ["#000"];
      return value;
    }
    module2.exports = {
      strlen,
      repeat,
      pad,
      truncate,
      mergeOptions,
      wordWrap: multiLineWordWrap,
      colorizeLines,
      hyperlink,
      parseHexValue
    };
  }
});

// ../work/cli-table__cli-table3/src/cell.js
var require_cell = __commonJS({
  "../work/cli-table__cli-table3/src/cell.js"(exports2, module2) {
    var { info, debug: debug2 } = require_debug();
    var utils2 = require_utils();
    var Cell = class _Cell {
      /**
       * A representation of a cell within the table.
       * Implementations must have `init` and `draw` methods,
       * as well as `colSpan`, `rowSpan`, `desiredHeight` and `desiredWidth` properties.
       * @param options
       * @constructor
       */
      constructor(options) {
        this.setOptions(options);
        this.x = null;
        this.y = null;
      }
      setOptions(options) {
        if (["boolean", "number", "bigint", "string"].indexOf(typeof options) !== -1) {
          options = { content: "" + options };
        }
        options = options || {};
        this.options = options;
        let content = options.content;
        if (["boolean", "number", "bigint", "string"].indexOf(typeof content) !== -1) {
          this.content = String(content);
        } else if (!content) {
          this.content = this.options.href || "";
        } else {
          throw new Error("Content needs to be a primitive, got: " + typeof content);
        }
        this.colSpan = options.colSpan || 1;
        this.rowSpan = options.rowSpan || 1;
        if (this.options.href) {
          Object.defineProperty(this, "href", {
            get() {
              return this.options.href;
            }
          });
        }
      }
      mergeTableOptions(tableOptions, cells) {
        this.cells = cells;
        let optionsChars = this.options.chars || {};
        let tableChars = tableOptions.chars;
        let chars = this.chars = {};
        CHAR_NAMES.forEach(function(name) {
          setOption(optionsChars, tableChars, name, chars);
        });
        this.truncate = this.options.truncate || tableOptions.truncate;
        let style = this.options.style = this.options.style || {};
        let tableStyle = tableOptions.style;
        setOption(style, tableStyle, "padding-left", this);
        setOption(style, tableStyle, "padding-right", this);
        this.head = style.head || tableStyle.head;
        this.border = style.border || tableStyle.border;
        this.fixedWidth = tableOptions.colWidths[this.x];
        this.lines = this.computeLines(tableOptions);
        this.desiredWidth = utils2.strlen(this.content) + this.paddingLeft + this.paddingRight;
        this.desiredHeight = this.lines.length;
      }
      computeLines(tableOptions) {
        const tableWordWrap = tableOptions.wordWrap || tableOptions.textWrap;
        const { wordWrap = tableWordWrap } = this.options;
        if (this.fixedWidth && wordWrap) {
          this.fixedWidth -= this.paddingLeft + this.paddingRight;
          if (this.colSpan) {
            let i = 1;
            while (i < this.colSpan) {
              this.fixedWidth += tableOptions.colWidths[this.x + i];
              i++;
            }
          }
          const { wrapOnWordBoundary: tableWrapOnWordBoundary = true } = tableOptions;
          const { wrapOnWordBoundary = tableWrapOnWordBoundary } = this.options;
          return this.wrapLines(utils2.wordWrap(this.fixedWidth, this.content, wrapOnWordBoundary));
        }
        return this.wrapLines(this.content.split("\n"));
      }
      wrapLines(computedLines) {
        const lines = utils2.colorizeLines(computedLines);
        if (this.href) {
          return lines.map((line) => utils2.hyperlink(this.href, line));
        }
        return lines;
      }
      /**
       * Initializes the Cells data structure.
       *
       * @param tableOptions - A fully populated set of tableOptions.
       * In addition to the standard default values, tableOptions must have fully populated the
       * `colWidths` and `rowWidths` arrays. Those arrays must have lengths equal to the number
       * of columns or rows (respectively) in this table, and each array item must be a Number.
       *
       */
      init(tableOptions) {
        let x = this.x;
        let y = this.y;
        this.widths = tableOptions.colWidths.slice(x, x + this.colSpan);
        this.heights = tableOptions.rowHeights.slice(y, y + this.rowSpan);
        this.width = this.widths.reduce(sumPlusOne, -1);
        this.height = this.heights.reduce(sumPlusOne, -1);
        this.hAlign = this.options.hAlign || tableOptions.colAligns[x];
        this.vAlign = this.options.vAlign || tableOptions.rowAligns[y];
        this.drawRight = x + this.colSpan == tableOptions.colWidths.length;
      }
      /**
       * Draws the given line of the cell.
       * This default implementation defers to methods `drawTop`, `drawBottom`, `drawLine` and `drawEmpty`.
       * @param lineNum - can be `top`, `bottom` or a numerical line number.
       * @param spanningCell - will be a number if being called from a RowSpanCell, and will represent how
       * many rows below it's being called from. Otherwise it's undefined.
       * @returns {String} The representation of this line.
       */
      draw(lineNum, spanningCell) {
        if (lineNum == "top") return this.drawTop(this.drawRight);
        if (lineNum == "bottom") return this.drawBottom(this.drawRight);
        let content = utils2.truncate(this.content, 10, this.truncate);
        if (!lineNum) {
          info(`${this.y}-${this.x}: ${this.rowSpan - lineNum}x${this.colSpan} Cell ${content}`);
        } else {
        }
        let padLen = Math.max(this.height - this.lines.length, 0);
        let padTop;
        switch (this.vAlign) {
          case "center":
            padTop = Math.ceil(padLen / 2);
            break;
          case "bottom":
            padTop = padLen;
            break;
          default:
            padTop = 0;
        }
        if (lineNum < padTop || lineNum >= padTop + this.lines.length) {
          return this.drawEmpty(this.drawRight, spanningCell);
        }
        let forceTruncation = this.lines.length > this.height && lineNum + 1 >= this.height;
        return this.drawLine(lineNum - padTop, this.drawRight, forceTruncation, spanningCell);
      }
      /**
       * Renders the top line of the cell.
       * @param drawRight - true if this method should render the right edge of the cell.
       * @returns {String}
       */
      drawTop(drawRight) {
        let content = [];
        if (this.cells) {
          this.widths.forEach(function(width, index) {
            content.push(this._topLeftChar(index));
            content.push(utils2.repeat(this.chars[this.y == 0 ? "top" : "mid"], width));
          }, this);
        } else {
          content.push(this._topLeftChar(0));
          content.push(utils2.repeat(this.chars[this.y == 0 ? "top" : "mid"], this.width));
        }
        if (drawRight) {
          content.push(this.chars[this.y == 0 ? "topRight" : "rightMid"]);
        }
        return this.wrapWithStyleColors("border", content.join(""));
      }
      _topLeftChar(offset) {
        let x = this.x + offset;
        let leftChar;
        if (this.y == 0) {
          leftChar = x == 0 ? "topLeft" : offset == 0 ? "topMid" : "top";
        } else {
          if (x == 0) {
            leftChar = "leftMid";
          } else {
            leftChar = offset == 0 ? "midMid" : "bottomMid";
            if (this.cells) {
              let spanAbove = this.cells[this.y - 1][x] instanceof _Cell.ColSpanCell;
              if (spanAbove) {
                leftChar = offset == 0 ? "topMid" : "mid";
              }
              if (offset == 0) {
                let i = 1;
                while (this.cells[this.y][x - i] instanceof _Cell.ColSpanCell) {
                  i++;
                }
                if (this.cells[this.y][x - i] instanceof _Cell.RowSpanCell) {
                  leftChar = "leftMid";
                }
              }
            }
          }
        }
        return this.chars[leftChar];
      }
      wrapWithStyleColors(styleProperty, content) {
        if (this[styleProperty] && this[styleProperty].length) {
          try {
            let colors = require("ansis");
            for (let i = this[styleProperty].length - 1; i >= 0; i--) {
              let style = this[styleProperty][i];
              let isHex = style.startsWith("hex");
              let isBgHex = style.startsWith("bgHex");
              if (isHex || isBgHex) {
                let value = utils2.parseHexValue(style);
                colors = isBgHex ? colors.bgHex(value) : colors.hex(value);
              } else {
                colors = colors[style];
              }
            }
            return colors(content);
          } catch (e) {
            return content;
          }
        } else {
          return content;
        }
      }
      /**
       * Renders a line of text.
       * @param lineNum - Which line of text to render. This is not necessarily the line within the cell.
       * There may be top-padding above the first line of text.
       * @param drawRight - true if this method should render the right edge of the cell.
       * @param forceTruncationSymbol - `true` if the rendered text should end with the truncation symbol even
       * if the text fits. This is used when the cell is vertically truncated. If `false` the text should
       * only include the truncation symbol if the text will not fit horizontally within the cell width.
       * @param spanningCell - a number of if being called from a RowSpanCell. (how many rows below). otherwise undefined.
       * @returns {String}
       */
      drawLine(lineNum, drawRight, forceTruncationSymbol, spanningCell) {
        let left = this.chars[this.x == 0 ? "left" : "middle"];
        if (this.x && spanningCell && this.cells) {
          let cellLeft = this.cells[this.y + spanningCell][this.x - 1];
          while (cellLeft instanceof ColSpanCell) {
            cellLeft = this.cells[cellLeft.y][cellLeft.x - 1];
          }
          if (!(cellLeft instanceof RowSpanCell)) {
            left = this.chars["rightMid"];
          }
        }
        let leftPadding = utils2.repeat(" ", this.paddingLeft);
        let right = drawRight ? this.chars["right"] : "";
        let rightPadding = utils2.repeat(" ", this.paddingRight);
        let line = this.lines[lineNum];
        let len = this.width - (this.paddingLeft + this.paddingRight);
        if (forceTruncationSymbol) line += this.truncate || "\u2026";
        let content = utils2.truncate(line, len, this.truncate);
        content = utils2.pad(content, len, " ", this.hAlign);
        content = leftPadding + content + rightPadding;
        return this.stylizeLine(left, content, right);
      }
      stylizeLine(left, content, right) {
        left = this.wrapWithStyleColors("border", left);
        right = this.wrapWithStyleColors("border", right);
        if (this.y === 0) {
          content = this.wrapWithStyleColors("head", content);
        }
        return left + content + right;
      }
      /**
       * Renders the bottom line of the cell.
       * @param drawRight - true if this method should render the right edge of the cell.
       * @returns {String}
       */
      drawBottom(drawRight) {
        let left = this.chars[this.x == 0 ? "bottomLeft" : "bottomMid"];
        let content = utils2.repeat(this.chars.bottom, this.width);
        let right = drawRight ? this.chars["bottomRight"] : "";
        return this.wrapWithStyleColors("border", left + content + right);
      }
      /**
       * Renders a blank line of text within the cell. Used for top and/or bottom padding.
       * @param drawRight - true if this method should render the right edge of the cell.
       * @param spanningCell - a number of if being called from a RowSpanCell. (how many rows below). otherwise undefined.
       * @returns {String}
       */
      drawEmpty(drawRight, spanningCell) {
        let left = this.chars[this.x == 0 ? "left" : "middle"];
        if (this.x && spanningCell && this.cells) {
          let cellLeft = this.cells[this.y + spanningCell][this.x - 1];
          while (cellLeft instanceof ColSpanCell) {
            cellLeft = this.cells[cellLeft.y][cellLeft.x - 1];
          }
          if (!(cellLeft instanceof RowSpanCell)) {
            left = this.chars["rightMid"];
          }
        }
        let right = drawRight ? this.chars["right"] : "";
        let content = utils2.repeat(" ", this.width);
        return this.stylizeLine(left, content, right);
      }
    };
    var ColSpanCell = class {
      /**
       * A Cell that doesn't do anything. It just draws empty lines.
       * Used as a placeholder in column spanning.
       * @constructor
       */
      constructor() {
      }
      draw(lineNum) {
        if (typeof lineNum === "number") {
          debug2(`${this.y}-${this.x}: 1x1 ColSpanCell`);
        }
        return "";
      }
      init() {
      }
      mergeTableOptions() {
      }
    };
    var RowSpanCell = class {
      /**
       * A placeholder Cell for a Cell that spans multiple rows.
       * It delegates rendering to the original cell, but adds the appropriate offset.
       * @param originalCell
       * @constructor
       */
      constructor(originalCell) {
        this.originalCell = originalCell;
      }
      init(tableOptions) {
        let y = this.y;
        let originalY = this.originalCell.y;
        this.cellOffset = y - originalY;
        this.offset = findDimension(tableOptions.rowHeights, originalY, this.cellOffset);
      }
      draw(lineNum) {
        if (lineNum == "top") {
          return this.originalCell.draw(this.offset, this.cellOffset);
        }
        if (lineNum == "bottom") {
          return this.originalCell.draw("bottom");
        }
        debug2(`${this.y}-${this.x}: 1x${this.colSpan} RowSpanCell for ${this.originalCell.content}`);
        return this.originalCell.draw(this.offset + 1 + lineNum);
      }
      mergeTableOptions() {
      }
    };
    function firstDefined(...args) {
      return args.filter((v) => v !== void 0 && v !== null).shift();
    }
    function setOption(objA, objB, nameB, targetObj) {
      let nameA = nameB.split("-");
      if (nameA.length > 1) {
        nameA[1] = nameA[1].charAt(0).toUpperCase() + nameA[1].substr(1);
        nameA = nameA.join("");
        targetObj[nameA] = firstDefined(objA[nameA], objA[nameB], objB[nameA], objB[nameB]);
      } else {
        targetObj[nameB] = firstDefined(objA[nameB], objB[nameB]);
      }
    }
    function findDimension(dimensionTable, startingIndex, span) {
      let ret = dimensionTable[startingIndex];
      for (let i = 1; i < span; i++) {
        ret += 1 + dimensionTable[startingIndex + i];
      }
      return ret;
    }
    function sumPlusOne(a, b) {
      return a + b + 1;
    }
    var CHAR_NAMES = [
      "top",
      "top-mid",
      "top-left",
      "top-right",
      "bottom",
      "bottom-mid",
      "bottom-left",
      "bottom-right",
      "left",
      "left-mid",
      "mid",
      "mid-mid",
      "right",
      "right-mid",
      "middle"
    ];
    module2.exports = Cell;
    module2.exports.ColSpanCell = ColSpanCell;
    module2.exports.RowSpanCell = RowSpanCell;
  }
});

// ../work/cli-table__cli-table3/src/layout-manager.js
var require_layout_manager = __commonJS({
  "../work/cli-table__cli-table3/src/layout-manager.js"(exports2, module2) {
    var { warn, debug: debug2 } = require_debug();
    var Cell = require_cell();
    var { ColSpanCell, RowSpanCell } = Cell;
    (function() {
      function next(alloc, col) {
        if (alloc[col] > 0) {
          return next(alloc, col + 1);
        }
        return col;
      }
      function layoutTable(table) {
        let alloc = {};
        table.forEach(function(row, rowIndex) {
          let col = 0;
          row.forEach(function(cell) {
            cell.y = rowIndex;
            cell.x = rowIndex ? next(alloc, col) : col;
            const rowSpan = cell.rowSpan || 1;
            const colSpan = cell.colSpan || 1;
            if (rowSpan > 1) {
              for (let cs = 0; cs < colSpan; cs++) {
                alloc[cell.x + cs] = rowSpan;
              }
            }
            col = cell.x + colSpan;
          });
          Object.keys(alloc).forEach((idx) => {
            alloc[idx]--;
            if (alloc[idx] < 1) delete alloc[idx];
          });
        });
      }
      function maxWidth(table) {
        let mw = 0;
        table.forEach(function(row) {
          row.forEach(function(cell) {
            mw = Math.max(mw, cell.x + (cell.colSpan || 1));
          });
        });
        return mw;
      }
      function maxHeight(table) {
        return table.length;
      }
      function cellsConflict(cell1, cell2) {
        let yMin1 = cell1.y;
        let yMax1 = cell1.y - 1 + (cell1.rowSpan || 1);
        let yMin2 = cell2.y;
        let yMax2 = cell2.y - 1 + (cell2.rowSpan || 1);
        let yConflict = !(yMin1 > yMax2 || yMin2 > yMax1);
        let xMin1 = cell1.x;
        let xMax1 = cell1.x - 1 + (cell1.colSpan || 1);
        let xMin2 = cell2.x;
        let xMax2 = cell2.x - 1 + (cell2.colSpan || 1);
        let xConflict = !(xMin1 > xMax2 || xMin2 > xMax1);
        return yConflict && xConflict;
      }
      function conflictExists(rows, x, y) {
        let i_max = Math.min(rows.length - 1, y);
        let cell = { x, y };
        for (let i = 0; i <= i_max; i++) {
          let row = rows[i];
          for (let j = 0; j < row.length; j++) {
            if (cellsConflict(cell, row[j])) {
              return true;
            }
          }
        }
        return false;
      }
      function allBlank(rows, y, xMin, xMax) {
        for (let x = xMin; x < xMax; x++) {
          if (conflictExists(rows, x, y)) {
            return false;
          }
        }
        return true;
      }
      function addRowSpanCells(table) {
        table.forEach(function(row, rowIndex) {
          row.forEach(function(cell) {
            for (let i = 1; i < cell.rowSpan; i++) {
              let rowSpanCell = new RowSpanCell(cell);
              rowSpanCell.x = cell.x;
              rowSpanCell.y = cell.y + i;
              rowSpanCell.colSpan = cell.colSpan;
              insertCell(rowSpanCell, table[rowIndex + i]);
            }
          });
        });
      }
      function addColSpanCells(cellRows) {
        for (let rowIndex = cellRows.length - 1; rowIndex >= 0; rowIndex--) {
          let cellColumns = cellRows[rowIndex];
          for (let columnIndex = 0; columnIndex < cellColumns.length; columnIndex++) {
            let cell = cellColumns[columnIndex];
            for (let k = 1; k < cell.colSpan; k++) {
              let colSpanCell = new ColSpanCell();
              colSpanCell.x = cell.x + k;
              colSpanCell.y = cell.y;
              cellColumns.splice(columnIndex + 1, 0, colSpanCell);
            }
          }
        }
      }
      function insertCell(cell, row) {
        let x = 0;
        while (x < row.length && row[x].x < cell.x) {
          x++;
        }
        row.splice(x, 0, cell);
      }
      function fillInTable(table) {
        let h_max = maxHeight(table);
        let w_max = maxWidth(table);
        debug2(`Max rows: ${h_max}; Max cols: ${w_max}`);
        for (let y = 0; y < h_max; y++) {
          for (let x = 0; x < w_max; x++) {
            if (!conflictExists(table, x, y)) {
              let opts = { x, y, colSpan: 1, rowSpan: 1 };
              x++;
              while (x < w_max && !conflictExists(table, x, y)) {
                opts.colSpan++;
                x++;
              }
              let y2 = y + 1;
              while (y2 < h_max && allBlank(table, y2, opts.x, opts.x + opts.colSpan)) {
                opts.rowSpan++;
                y2++;
              }
              let cell = new Cell(opts);
              cell.x = opts.x;
              cell.y = opts.y;
              warn(`Missing cell at ${cell.y}-${cell.x}.`);
              insertCell(cell, table[y]);
            }
          }
        }
      }
      function generateCells(rows) {
        return rows.map(function(row) {
          if (!Array.isArray(row)) {
            let key = Object.keys(row)[0];
            row = row[key];
            if (Array.isArray(row)) {
              row = row.slice();
              row.unshift(key);
            } else {
              row = [key, row];
            }
          }
          return row.map(function(cell) {
            return new Cell(cell);
          });
        });
      }
      function makeTableLayout(rows) {
        let cellRows = generateCells(rows);
        layoutTable(cellRows);
        fillInTable(cellRows);
        addRowSpanCells(cellRows);
        addColSpanCells(cellRows);
        return cellRows;
      }
      module2.exports = {
        makeTableLayout,
        layoutTable,
        addRowSpanCells,
        maxWidth,
        fillInTable,
        computeWidths: makeComputeWidths("colSpan", "desiredWidth", "x", 1),
        computeHeights: makeComputeWidths("rowSpan", "desiredHeight", "y", 1)
      };
    })();
    function makeComputeWidths(colSpan, desiredWidth, x, forcedMin) {
      return function(vals, table) {
        let result = [];
        let spanners = [];
        let auto = {};
        table.forEach(function(row) {
          row.forEach(function(cell) {
            if ((cell[colSpan] || 1) > 1) {
              spanners.push(cell);
            } else {
              result[cell[x]] = Math.max(result[cell[x]] || 0, cell[desiredWidth] || 0, forcedMin);
            }
          });
        });
        vals.forEach(function(val, index) {
          if (typeof val === "number") {
            result[index] = val;
          }
        });
        for (let k = spanners.length - 1; k >= 0; k--) {
          let cell = spanners[k];
          let span = cell[colSpan];
          let col = cell[x];
          let existingWidth = result[col];
          let editableCols = typeof vals[col] === "number" ? 0 : 1;
          if (typeof existingWidth === "number") {
            for (let i = 1; i < span; i++) {
              existingWidth += 1 + result[col + i];
              if (typeof vals[col + i] !== "number") {
                editableCols++;
              }
            }
          } else {
            existingWidth = desiredWidth === "desiredWidth" ? cell.desiredWidth - 1 : 1;
            if (!auto[col] || auto[col] < existingWidth) {
              auto[col] = existingWidth;
            }
          }
          if (cell[desiredWidth] > existingWidth) {
            let i = 0;
            while (editableCols > 0 && cell[desiredWidth] > existingWidth) {
              if (typeof vals[col + i] !== "number") {
                let dif = Math.round((cell[desiredWidth] - existingWidth) / editableCols);
                existingWidth += dif;
                result[col + i] += dif;
                editableCols--;
              }
              i++;
            }
          }
        }
        Object.assign(vals, result, auto);
        for (let j = 0; j < vals.length; j++) {
          vals[j] = Math.max(forcedMin, vals[j] || 0);
        }
      };
    }
  }
});

// ../work/cli-table__cli-table3/src/table.js
var debug = require_debug();
var utils = require_utils();
var tableLayout = require_layout_manager();
var Table = class extends Array {
  constructor(opts) {
    super();
    const options = utils.mergeOptions(opts);
    Object.defineProperty(this, "options", {
      value: options,
      enumerable: options.debug
    });
    if (options.debug) {
      switch (typeof options.debug) {
        case "boolean":
          debug.setDebugLevel(debug.WARN);
          break;
        case "number":
          debug.setDebugLevel(options.debug);
          break;
        case "string":
          debug.setDebugLevel(parseInt(options.debug, 10));
          break;
        default:
          debug.setDebugLevel(debug.WARN);
          debug.warn(`Debug option is expected to be boolean, number, or string. Received a ${typeof options.debug}`);
      }
      Object.defineProperty(this, "messages", {
        get() {
          return debug.debugMessages();
        }
      });
    }
  }
  toString() {
    let array = this;
    let headersPresent = this.options.head && this.options.head.length;
    if (headersPresent) {
      array = [this.options.head];
      if (this.length) {
        array.push.apply(array, this);
      }
    } else {
      this.options.style.head = [];
    }
    let cells = tableLayout.makeTableLayout(array);
    cells.forEach(function(row) {
      row.forEach(function(cell) {
        cell.mergeTableOptions(this.options, cells);
      }, this);
    }, this);
    tableLayout.computeWidths(this.options.colWidths, cells);
    tableLayout.computeHeights(this.options.rowHeights, cells);
    cells.forEach(function(row) {
      row.forEach(function(cell) {
        cell.init(this.options);
      }, this);
    }, this);
    let result = [];
    for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
      let row = cells[rowIndex];
      let heightOfRow = this.options.rowHeights[rowIndex];
      if (rowIndex === 0 || !this.options.style.compact || rowIndex == 1 && headersPresent) {
        doDraw(row, "top", result);
      }
      for (let lineNum = 0; lineNum < heightOfRow; lineNum++) {
        doDraw(row, lineNum, result);
      }
      if (rowIndex + 1 == cells.length) {
        doDraw(row, "bottom", result);
      }
    }
    return result.join("\n");
  }
  get width() {
    let str = this.toString().split("\n");
    return str[0].length;
  }
};
Table.reset = () => debug.reset();
function doDraw(row, lineNum, result) {
  let line = [];
  row.forEach(function(cell) {
    line.push(cell.draw(lineNum));
  });
  let str = line.join("");
  if (str.length) result.push(str);
}
module.exports = Table;
