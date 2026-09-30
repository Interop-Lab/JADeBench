const createCommonJsModule = (modules, module) => () => {
  if (!module) {
    module = {
      exports: {
      }
    };
    const initialize = modules[Object.keys(modules)[0]];
    initialize(module.exports, module);
  }
  return module.exports;
};
const requireDebug = createCommonJsModule({
  '../work/cli-table__cli-table3/src/debug.js'(unused, module) {
    let messages = [];
    let debugLevel = 0;

    const debug = (message, level) => {
      if (debugLevel >= level) messages.push(message);
    };

    debug.WARN = 1;
    debug.INFO = 2;
    debug.DEBUG = 3;
    debug.reset = () => {
      messages = [];
    };
    debug.setDebugLevel = (level) => {
      debugLevel = level;
    };
    debug.warn = (message) => debug(message, debug.WARN);
    debug.info = (message) => debug(message, debug.INFO);
    debug.debug = (message) => debug(message, debug.DEBUG);
    debug.debugMessages = () => messages;
    module.exports = debug;
  }
});

const requireUtils = createCommonJsModule({
  '../work/cli-table__cli-table3/src/utils.js'(unused, module) {
    const visibleWidth = require('string-width');
    const ansiPattern = (global = false) => global
      ? /\u001b\[((?:\d*;){0,5}\d*)m/g
      : /\u001b\[(?:\d*;){0,5}\d*m/g;

    function stringWidth(value) {
      const plainLines = String(value).replace(ansiPattern(), '').split('\n');
      return plainLines.reduce((widest, line) => Math.max(widest, visibleWidth(line)), 0);
    }

    function repeat(value, count) {
      return Array(count + 1).join(value);
    }

    function pad(value, width, character, alignment) {
      const currentWidth = stringWidth(value);
      if (width + 1 < currentWidth) return value;
      const remaining = width - currentWidth;
      if (alignment === 'right') return repeat(character, remaining) + value;
      if (alignment === 'center') {
        const right = Math.ceil(remaining / 2);
        return repeat(character, remaining - right) + value + repeat(character, right);
      }
      return value + repeat(character, remaining);
    }

    const ansiStyles = {};
    function defineAnsiStyle(name, onCode, offCode) {
      const on = '\u001b[' + onCode + 'm';
      const off = '\u001b[' + offCode + 'm';
      ansiStyles[on] = { set: name, to: true };
      ansiStyles[off] = { set: name, to: false };
      ansiStyles[name] = { on, off };
    }
    defineAnsiStyle('bold', 1, 22);
    defineAnsiStyle('italics', 3, 23);
    defineAnsiStyle('underline', 4, 24);
    defineAnsiStyle('inverse', 7, 27);
    defineAnsiStyle('strikethrough', 9, 29);

    function updateAnsiState(state, match) {
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
        for (const key in state) {
          if (Object.prototype.hasOwnProperty.call(state, key)) delete state[key];
        }
        return;
      }
      const style = ansiStyles[match[0]];
      if (style) state[style.set] = style.to;
    }

    function readAnsiState(value) {
      const pattern = ansiPattern(true);
      const state = {};
      let match = pattern.exec(value);
      while (match !== null) {
        updateAnsiState(state, match);
        match = pattern.exec(value);
      }
      return state;
    }

    function closeAnsiStyles(state, value) {
      const background = state.lastBackgroundAdded;
      const foreground = state.lastForegroundAdded;
      delete state.lastBackgroundAdded;
      delete state.lastForegroundAdded;
      Object.keys(state).forEach((name) => {
        if (state[name]) value += ansiStyles[name].off;
      });
      if (background && background !== '\u001b[49m') value += '\u001b[49m';
      if (foreground && foreground !== '\u001b[39m') value += '\u001b[39m';
      return value;
    }

    function openAnsiStyles(state, value) {
      const background = state.lastBackgroundAdded;
      const foreground = state.lastForegroundAdded;
      delete state.lastBackgroundAdded;
      delete state.lastForegroundAdded;
      Object.keys(state).forEach((name) => {
        if (state[name]) value = ansiStyles[name].on + value;
      });
      if (background && background !== '\u001b[49m') value = background + value;
      if (foreground && foreground !== '\u001b[39m') value = foreground + value;
      return value;
    }

    function truncatePlainText(value, width) {
      if (value.length === stringWidth(value)) return value.substr(0, width);
      while (stringWidth(value) > width) value = value.slice(0, -1);
      return value;
    }

    function truncateWithAnsi(value, width) {
      const pattern = ansiPattern(true);
      const chunks = value.split(ansiPattern());
      const state = {};
      let result = '';
      let resultWidth = 0;
      let match;
      let chunkIndex = 0;
      while (resultWidth < width) {
        match = pattern.exec(value);
        let chunk = chunks[chunkIndex++];
        if (resultWidth + stringWidth(chunk) > width) {
          chunk = truncatePlainText(chunk, width - resultWidth);
        }
        result += chunk;
        resultWidth += stringWidth(chunk);
        if (resultWidth < width) {
          if (!match) break;
          result += match[0];
          updateAnsiState(state, match);
        }
      }
      return closeAnsiStyles(state, result);
    }

    function truncate(value, width, suffix = '…') {
      if (stringWidth(value) <= width) return value;
      width -= stringWidth(suffix);
      let result = truncateWithAnsi(value, width) + suffix;
      const hyperlinkClose = '\u001b]8;;\u0007';
      if (value.includes(hyperlinkClose) && !result.includes(hyperlinkClose)) result += hyperlinkClose;
      return result;
    }

    function defaultOptions() {
      return {
        chars: {
          top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
          bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
          left: '│', 'left-mid': '├', mid: '─', 'mid-mid': '┼',
          right: '│', 'right-mid': '┤', middle: '│'
        },
        truncate: '…',
        colWidths: [], rowHeights: [], colAligns: [], rowAligns: [],
        style: { 'padding-left': 1, 'padding-right': 1, head: ['red'], border: ['grey'], compact: false },
        head: []
      };
    }

    function mergeOptions(options = {}, defaults = defaultOptions()) {
      return Object.assign({}, defaults, options, {
        chars: Object.assign({}, defaults.chars, options.chars),
        style: Object.assign({}, defaults.style, options.style)
      });
    }

    function wrapWords(width, value) {
      const lines = [];
      const parts = value.split(/(\s+)/g);
      let lineParts = [];
      let lineWidth = 0;
      let whitespace;
      for (let index = 0; index < parts.length; index += 2) {
        const word = parts[index];
        let nextWidth = lineWidth + stringWidth(word);
        if (lineWidth > 0 && whitespace) nextWidth += whitespace.length;
        if (nextWidth > width) {
          if (lineWidth !== 0) lines.push(lineParts.join(''));
          lineParts = [word];
          lineWidth = stringWidth(word);
        } else {
          lineParts.push(whitespace || '', word);
          lineWidth = nextWidth;
        }
        whitespace = parts[index + 1];
      }
      if (lineWidth) lines.push(lineParts.join(''));
      return lines;
    }

    function wrapCharacters(width, value) {
      const lines = [];
      let line = '';
      function append(word, whitespace) {
        if (line.length && whitespace) line += whitespace;
        line += word;
        while (line.length > width) {
          lines.push(line.slice(0, width));
          line = line.slice(width);
        }
      }
      const parts = value.split(/(\s+)/g);
      for (let index = 0; index < parts.length; index += 2) {
        append(parts[index], index && parts[index - 1]);
      }
      if (line.length) lines.push(line);
      return lines;
    }

    function wordWrap(width, value, wrapOnWordBoundary = true) {
      const wrapLine = wrapOnWordBoundary ? wrapWords : wrapCharacters;
      const output = [];
      for (const line of value.split('\n')) output.push(...wrapLine(width, line));
      return output;
    }

    function colorizeLines(lines) {
      let state = {};
      const output = [];
      for (const line of lines) {
        const coloredLine = openAnsiStyles(state, line);
        state = readAnsiState(coloredLine);
        output.push(closeAnsiStyles({ ...state }, coloredLine));
      }
      return output;
    }

    function hyperlink(url, text) {
      return ['\u001b]', '8', ';', ';', url || text, '\u0007', text, '\u001b]', '8', ';', ';', '\u0007'].join('');
    }

    function parseHexValue(style) {
      return (style.match(/#[0-9a-fA-F]{3,6}/) || ['#000'])[0];
    }

    module.exports = { strlen: stringWidth, repeat, pad, truncate, mergeOptions, wordWrap, colorizeLines, hyperlink, parseHexValue };
  }
});

const requireCell = createCommonJsModule({
  '../work/cli-table__cli-table3/src/cell.js'(unused, module) {
    const { info: logInfo, debug: logDebug } = requireDebug();
    const utils = requireUtils();
    const characterNames = [
      'top', 'top-mid', 'top-left', 'top-right', 'bottom', 'bottom-mid',
      'bottom-left', 'bottom-right', 'left', 'left-mid', 'mid', 'mid-mid',
      'right', 'right-mid', 'middle'
    ];

    function firstDefined(...values) {
      return values.find((value) => value !== undefined);
    }

    function mergeProperty(cellOptions, tableOptions, property, destination) {
      const parts = property.split('-');
      const camelName = parts.length > 1
        ? parts[0] + parts[1][0].toUpperCase() + parts[1].slice(1)
        : property;
      destination[camelName] = firstDefined(
        cellOptions[camelName], cellOptions[property],
        tableOptions[camelName], tableOptions[property]
      );
    }

    function sumDimensions(values, start, count) {
      let total = values[start];
      for (let offset = 1; offset < count; offset += 1) total += 1 + values[start + offset];
      return total;
    }

    function addBorderWidth(total, value) {
      return total + value + 1;
    }

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
        options ||= {};
        this.options = options;
        const content = options.content;
        if (['boolean', 'number', 'bigint', 'string'].includes(typeof content)) {
          this.content = String(content);
        } else if (!content) {
          this.content = options.href || '';
        } else {
          throw new Error('Content needs to be a primitive, got ' + typeof content);
        }
        this.colSpan = options.colSpan || 1;
        this.rowSpan = options.rowSpan || 1;
        if (options.href) Object.defineProperty(this, 'href', { get: () => this.options.href });
      }

      mergeTableOptions(tableOptions, cells) {
        this.cells = cells;
        const cellChars = this.options.chars || {};
        this.chars = {};
        characterNames.forEach((name) => mergeProperty(cellChars, tableOptions.chars, name, this.chars));
        this.truncate = this.options.truncate || tableOptions.truncate;
        const cellStyle = this.options.style ||= {};
        mergeProperty(cellStyle, tableOptions.style, 'padding-left', this);
        mergeProperty(cellStyle, tableOptions.style, 'padding-right', this);
        this.head = cellStyle.head || tableOptions.style.head;
        this.border = cellStyle.border || tableOptions.style.border;
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
          for (let offset = 1; offset < this.colSpan; offset += 1) {
            this.fixedWidth += tableOptions.colWidths[this.x + offset];
          }
          const { wrapOnWordBoundary: tableBoundary = true } = tableOptions;
          const { wrapOnWordBoundary = tableBoundary } = this.options;
          return this.wrapLines(utils.wordWrap(this.fixedWidth, this.content, wrapOnWordBoundary));
        }
        return this.wrapLines(this.content.split('\n'));
      }

      wrapLines(lines) {
        const coloredLines = utils.colorizeLines(lines);
        return this.href
          ? coloredLines.map((line) => utils.hyperlink(this.href, line))
          : coloredLines;
      }

      init(tableOptions) {
        const column = this.x;
        const row = this.y;
        this.widths = tableOptions.colWidths.slice(column, column + this.colSpan);
        this.heights = tableOptions.rowHeights.slice(row, row + this.rowSpan);
        this.width = this.widths.reduce(addBorderWidth, -1);
        this.height = this.heights.reduce(addBorderWidth, -1);
        this.hAlign = this.options.hAlign || tableOptions.colAligns[column];
        this.vAlign = this.options.vAlign || tableOptions.rowAligns[row];
        this.drawRight = column + this.colSpan === tableOptions.colWidths.length;
      }

      draw(line, spanningCellOffset) {
        if (line === 'top') return this.drawTop(this.drawRight);
        if (line === 'bottom') return this.drawBottom(this.drawRight);
        if (!line) {
          const preview = utils.truncate(this.content, 10, this.truncate);
          logInfo(this.y + '-' + this.x + ': ' + (this.rowSpan - line) + 'x' + this.colSpan + ' Cell ' + preview);
        }
        const emptyLines = Math.max(this.height - this.lines.length, 0);
        let topPadding = 0;
        if (this.vAlign === 'center') topPadding = Math.ceil(emptyLines / 2);
        else if (this.vAlign === 'bottom') topPadding = emptyLines;
        if (line < topPadding || line >= topPadding + this.lines.length) {
          return this.drawEmpty(this.drawRight, spanningCellOffset);
        }
        const truncate = this.lines.length > this.height && line + 1 >= this.height;
        return this.drawLine(line - topPadding, this.drawRight, truncate, spanningCellOffset);
      }

      drawTop(drawRight) {
        const parts = [];
        if (this.widths) {
          this.widths.forEach((width, offset) => {
            parts.push(this._topLeftChar(offset));
            parts.push(utils.repeat(this.chars[this.y === 0 ? 'top' : 'mid'], width));
          });
        } else {
          parts.push(this._topLeftChar(0));
          parts.push(utils.repeat(this.chars[this.y === 0 ? 'top' : 'mid'], this.width));
        }
        if (drawRight) parts.push(this.chars[this.y === 0 ? 'topRight' : 'rightMid']);
        return this.wrapWithStyleColors('border', parts.join(''));
      }

      _topLeftChar(offset) {
        const column = this.x + offset;
        let character;
        if (this.y === 0) {
          character = column === 0 ? 'topLeft' : offset === 0 ? 'topMid' : 'top';
        } else if (column === 0) {
          character = 'leftMid';
        } else {
          character = offset === 0 ? 'midMid' : 'bottomMid';
          if (this.cells) {
            const aboveIsColSpan = this.cells[this.y - 1][column] instanceof Cell.ColSpanCell;
            if (aboveIsColSpan) character = 'mid';
            if (offset === 0) {
              let distance = 1;
              while (this.cells[this.y][column - distance] instanceof Cell.ColSpanCell) distance += 1;
              if (this.cells[this.y][column - distance] instanceof Cell.RowSpanCell) character = 'leftMid';
            }
          }
        }
        return this.chars[character];
      }

      wrapWithStyleColors(styleName, value) {
        if (!this[styleName] || !this[styleName].length) return value;
        try {
          let style = require('ansis');
          for (let index = this[styleName].length - 1; index >= 0; index -= 1) {
            const name = this[styleName][index];
            const foregroundHex = name.startsWith('hex');
            const backgroundHex = name.startsWith('bgHex');
            if (foregroundHex || backgroundHex) {
              const color = utils.parseHexValue(name);
              style = backgroundHex ? style.bgHex(color) : style.hex(color);
            } else {
              style = style[name];
            }
          }
          return style(value);
        } catch {
          return value;
        }
      }

      drawLine(lineIndex, drawRight, shouldTruncate, spanningCellOffset) {
        let left = this.chars[this.x === 0 ? 'left' : 'middle'];
        if (this.x && spanningCellOffset && this.cells) {
          let leftCell = this.cells[this.y + spanningCellOffset][this.x - 1];
          while (leftCell instanceof ColSpanCell) leftCell = this.cells[leftCell.y][leftCell.x - 1];
          if (!(leftCell instanceof RowSpanCell)) left = this.chars.rightMid;
        }
        const leftPadding = utils.repeat(' ', this.paddingLeft);
        const right = drawRight ? this.chars.right : '';
        const rightPadding = utils.repeat(' ', this.paddingRight);
        const contentWidth = this.width - this.paddingLeft - this.paddingRight;
        let line = this.lines[lineIndex];
        if (shouldTruncate) line += this.truncate || '…';
        line = utils.truncate(line, contentWidth, this.truncate);
        line = utils.pad(line, contentWidth, ' ', this.hAlign);
        return this.stylizeLine(left, leftPadding + line + rightPadding, right);
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
          let leftCell = this.cells[this.y + spanningCellOffset][this.x - 1];
          while (leftCell instanceof ColSpanCell) leftCell = this.cells[leftCell.y][leftCell.x - 1];
          if (!(leftCell instanceof RowSpanCell)) left = this.chars.rightMid;
        }
        const right = drawRight ? this.chars.right : '';
        return this.stylizeLine(left, utils.repeat(' ', this.width), right);
      }
    }

    class ColSpanCell {
      draw() {
        logDebug(this.y + '-' + this.x + ': 1x1 ColSpanCell');
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
        this.offset = sumDimensions(tableOptions.rowHeights, this.originalCell.y, this.cellOffset);
      }
      draw(line) {
        if (line === 'top') return this.originalCell.draw(this.offset, this.cellOffset);
        if (line === 'bottom') return this.originalCell.draw('bottom');
        logDebug(this.y + '-' + this.x + ': 1x' + this.colSpan + ' RowSpanCell for ' + this.originalCell.content);
        return this.originalCell.draw(this.offset + 1 + line);
      }
      mergeTableOptions() {}
    }

    Cell.ColSpanCell = ColSpanCell;
    Cell.RowSpanCell = RowSpanCell;
    module.exports = Cell;
  }
});

function makeDimensionComputer(spanProperty, desiredProperty, positionProperty, minimum) {
  return function computeDimensions(dimensions, rows) {
    const cells = rows.flat();
    for (const cell of cells) {
      const span = cell[spanProperty] || 1;
      const position = cell[positionProperty];
      if (span === 1 && dimensions[position] === undefined) {
        dimensions[position] = Math.max(cell[desiredProperty] || 0, minimum);
      }
    }
    for (const cell of cells) {
      const span = cell[spanProperty] || 1;
      if (span === 1) continue;
      const position = cell[positionProperty];
      const adjustableOffsets = [];
      for (let offset = 0; offset < span; offset += 1) {
        if (dimensions[position + offset] === undefined) adjustableOffsets.push(offset);
      }
      if (adjustableOffsets.length === 0) continue;
      let current = span - 1;
      for (let offset = 0; offset < span; offset += 1) {
        current += dimensions[position + offset] || minimum;
      }
      let deficit = (cell[desiredProperty] || 0) - current;
      for (let index = 0; index < adjustableOffsets.length; index += 1) {
        const offset = adjustableOffsets[index];
        const addition = Math.max(0, Math.ceil(deficit / (adjustableOffsets.length - index)));
        dimensions[position + offset] = minimum + addition;
        deficit -= addition;
      }
    }
    for (let index = 0; index < dimensions.length; index += 1) {
      dimensions[index] = Math.max(minimum, dimensions[index] || 0);
    }
  };
}

const requireLayoutManager = createCommonJsModule({
  '../work/cli-table__cli-table3/src/layout-manager.js'(unused, module) {
    const { warn, debug } = requireDebug();
    const Cell = requireCell();
    const { ColSpanCell, RowSpanCell } = Cell;

    function findOpenColumn(rowSpans, column) {
      return rowSpans[column] > 0 ? findOpenColumn(rowSpans, column + 1) : column;
    }

    function layoutTable(rows) {
      const rowSpans = {};
      rows.forEach((row, rowIndex) => {
        let column = 0;
        row.forEach((cell) => {
          cell.y = rowIndex;
          cell.x = rowIndex ? findOpenColumn(rowSpans, column) : column;
          const rowSpan = cell.rowSpan || 1;
          const colSpan = cell.colSpan || 1;
          if (rowSpan > 1) {
            for (let offset = 0; offset < colSpan; offset += 1) rowSpans[cell.x + offset] = rowSpan;
          }
          column = cell.x + colSpan;
        });
        Object.keys(rowSpans).forEach((key) => {
          rowSpans[key] -= 1;
          if (rowSpans[key] < 1) delete rowSpans[key];
        });
      });
    }

    function maxWidth(rows) {
      let width = 0;
      rows.forEach((row) => row.forEach((cell) => {
        width = Math.max(width, cell.x + (cell.colSpan || 1));
      }));
      return width;
    }

    function cellsConflict(left, right) {
      const vertical = !(left.y > right.y - 1 + (right.rowSpan || 1) || right.y > left.y - 1 + (left.rowSpan || 1));
      const horizontal = !(left.x > right.x - 1 + (right.colSpan || 1) || right.x > left.x - 1 + (left.colSpan || 1));
      return vertical && horizontal;
    }

    function cellExists(rows, x, y) {
      const lastRow = Math.min(rows.length - 1, y);
      const target = { x, y };
      for (let rowIndex = 0; rowIndex <= lastRow; rowIndex += 1) {
        for (const cell of rows[rowIndex]) if (cellsConflict(target, cell)) return true;
      }
      return false;
    }

    function regionIsEmpty(rows, y, left, right) {
      for (let x = left; x < right; x += 1) if (cellExists(rows, x, y)) return false;
      return true;
    }

    function insertByColumn(cell, row) {
      let index = 0;
      while (index < row.length && row[index].x < cell.x) index += 1;
      row.splice(index, 0, cell);
    }

    function addRowSpanCells(rows) {
      rows.forEach((row, rowIndex) => row.forEach((cell) => {
        for (let offset = 1; offset < cell.rowSpan; offset += 1) {
          const continuation = new RowSpanCell(cell);
          continuation.x = cell.x;
          continuation.y = cell.y + offset;
          continuation.colSpan = cell.colSpan;
          insertByColumn(continuation, rows[rowIndex + offset]);
        }
      }));
    }

    function addColSpanCells(rows) {
      for (let rowIndex = rows.length - 1; rowIndex >= 0; rowIndex -= 1) {
        const row = rows[rowIndex];
        for (let index = 0; index < row.length; index += 1) {
          const cell = row[index];
          for (let offset = 1; offset < cell.colSpan; offset += 1) {
            const continuation = new ColSpanCell();
            continuation.x = cell.x + offset;
            continuation.y = cell.y;
            row.splice(index + 1, 0, continuation);
          }
        }
      }
    }

    function fillInTable(rows) {
      const height = rows.length;
      const width = maxWidth(rows);
      debug('Max rows: ' + height + '; Max cols: ' + width);
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (cellExists(rows, x, y)) continue;
          const missing = { x, y, colSpan: 1, rowSpan: 1 };
          x += 1;
          while (x < width && !cellExists(rows, x, y)) { missing.colSpan += 1; x += 1; }
          let nextRow = y + 1;
          while (nextRow < height && regionIsEmpty(rows, nextRow, missing.x, missing.x + missing.colSpan)) {
            missing.rowSpan += 1;
            nextRow += 1;
          }
          const cell = new Cell(missing);
          cell.x = missing.x;
          cell.y = missing.y;
          warn('Missing cell at ' + cell.y + '-' + cell.x + '.');
          insertByColumn(cell, rows[y]);
        }
      }
    }

    function createCells(inputRows) {
      return inputRows.map((inputRow) => {
        let row = inputRow;
        if (!Array.isArray(row)) {
          const key = Object.keys(row)[0];
          row = row[key];
          row = Array.isArray(row) ? [key, ...row] : [key, row];
        }
        return row.map((value) => new Cell(value));
      });
    }

    function makeTableLayout(inputRows) {
      const rows = createCells(inputRows);
      layoutTable(rows);
      fillInTable(rows);
      addRowSpanCells(rows);
      addColSpanCells(rows);
      return rows;
    }

    module.exports = {
      makeTableLayout, layoutTable, addRowSpanCells, maxWidth, fillInTable,
      computeWidths: makeDimensionComputer('colSpan', 'desiredWidth', 'x', 1),
      computeHeights: makeDimensionComputer('rowSpan', 'desiredHeight', 'y', 1)
    };
  }
});

const debug = requireDebug();
const utils = requireUtils();
const tableLayout = requireLayoutManager();

class Table extends Array {
  constructor(options) {
    super();
    const mergedOptions = utils.mergeOptions(options);
    Object.defineProperty(this, 'options', { value: mergedOptions, enumerable: mergedOptions.debug });
    if (mergedOptions.debug) {
      switch (typeof mergedOptions.debug) {
        case 'boolean': debug.setDebugLevel(debug.WARN); break;
        case 'number': debug.setDebugLevel(mergedOptions.debug); break;
        case 'string': debug.setDebugLevel(parseInt(mergedOptions.debug, 10)); break;
        default:
          debug.setDebugLevel(debug.WARN);
          debug.warn('Debug option is expected to be boolean, number, or string. Received a ' + typeof mergedOptions.debug);
      }
      Object.defineProperty(this, 'messages', { get: () => debug.debugMessages() });
    }
  }

  toString() {
    let inputRows = this;
    const hasHeading = this.options.head && this.options.head.length;
    if (hasHeading) {
      inputRows = [this.options.head];
      if (this.length) inputRows.push(...this);
    } else {
      this.options.style.head = [];
    }

    const rows = tableLayout.makeTableLayout(inputRows);
    rows.forEach((row) => row.forEach((cell) => cell.mergeTableOptions(this.options, rows)));
    tableLayout.computeWidths(this.options.colWidths, rows);
    tableLayout.computeHeights(this.options.rowHeights, rows);
    rows.forEach((row) => row.forEach((cell) => cell.init(this.options)));

    const output = [];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      const height = this.options.rowHeights[rowIndex];
      if (rowIndex === 0 || !this.options.style.compact || (rowIndex === 1 && hasHeading)) drawRow(row, 'top', output);
      for (let line = 0; line < height; line += 1) drawRow(row, line, output);
      if (rowIndex + 1 === rows.length) drawRow(row, 'bottom', output);
    }
    return output.join('\n');
  }

  get width() {
    return this.toString().split('\n')[0].length;
  }
}

Table.reset = () => debug.reset();

function drawRow(row, line, output) {
  const rendered = row.map((cell) => cell.draw(line)).join('');
  if (rendered.length) output.push(rendered);
}

module.exports = Table;
