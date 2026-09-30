'use strict';

const debug = (() => {
  let messages = [];
  let level = 0;
  function log(message, messageLevel) {
    if (level >= messageLevel) messages.push(message);
  }
  return {
    WARN: 1, INFO: 2, DEBUG: 3,
    reset() { messages = []; },
    setDebugLevel(nextLevel) { level = nextLevel; },
    warn(message) { return log(message, this.WARN); },
    info(message) { return log(message, this.INFO); },
    debug(message) { return log(message, this.DEBUG); },
    debugMessages() { return messages; },
  };
})();

const utils = (() => {
  const stringWidthModule = require('string-width');
  const stringWidth = stringWidthModule.default || stringWidthModule;
  const ansiStyles = Object.create(null);
  const ansiPattern = (capture = false) => capture
    ? /\u001b\[((?:\d*;){0,5}\d*)m/g
    : /\u001b\[(?:\d*;){0,5}\d*m/g;

  function strlen(value) {
    const plain = `${value}`.replace(ansiPattern(), '');
    return plain.split('\n').reduce((maximum, line) => Math.max(maximum, stringWidth(line)), 0);
  }
  const repeat = (character, count) => Array(count + 1).join(character);
  function pad(value, width, fill = ' ', alignment) {
    const remaining = width - strlen(value);
    if (width + 1 < strlen(value)) return value;
    if (alignment === 'right') return repeat(fill, remaining) + value;
    if (alignment === 'center') {
      const right = Math.ceil(remaining / 2);
      return repeat(fill, remaining - right) + value + repeat(fill, right);
    }
    return value + repeat(fill, remaining);
  }
  function registerStyle(name, onCode, offCode) {
    const on = `\u001b[${onCode}m`;
    const off = `\u001b[${offCode}m`;
    ansiStyles[on] = { set: name, to: true };
    ansiStyles[off] = { set: name, to: false };
    ansiStyles[name] = { on, off };
  }
  registerStyle('bold', 1, 22);
  registerStyle('italics', 3, 23);
  registerStyle('underline', 4, 24);
  registerStyle('inverse', 7, 27);
  registerStyle('strikethrough', 9, 29);

  function updateStyleState(state, match) {
    const code = match[1] ? parseInt(match[1].split(';')[0]) : 0;
    if ((code >= 30 && code <= 39) || (code >= 90 && code <= 97)) {
      state.lastForegroundAdded = match[0]; return;
    }
    if ((code >= 40 && code <= 49) || (code >= 100 && code <= 107)) {
      state.lastBackgroundAdded = match[0]; return;
    }
    if (code === 0) {
      for (const key of Object.keys(state)) {
        if (Object.prototype.hasOwnProperty.call(state, key)) delete state[key];
      }
      return;
    }
    const transition = ansiStyles[match[0]];
    if (transition) state[transition.set] = transition.to;
  }
  function parseStyles(line) {
    const regex = ansiPattern(true);
    const state = {};
    for (let match = regex.exec(line); match; match = regex.exec(line)) updateStyleState(state, match);
    return state;
  }
  function closeStyles(state, line) {
    const background = state.lastBackgroundAdded;
    const foreground = state.lastForegroundAdded;
    delete state.lastBackgroundAdded;
    delete state.lastForegroundAdded;
    for (const key of Object.keys(state)) if (state[key]) line += ansiStyles[key].off;
    if (background && background !== '\u001b[49m') line += '\u001b[49m';
    if (foreground && foreground !== '\u001b[39m') line += '\u001b[39m';
    return line;
  }
  function reopenStyles(state, line) {
    const background = state.lastBackgroundAdded;
    const foreground = state.lastForegroundAdded;
    delete state.lastBackgroundAdded;
    delete state.lastForegroundAdded;
    for (const key of Object.keys(state)) if (state[key]) line = ansiStyles[key].on + line;
    if (background && background !== '\u001b[49m') line = background + line;
    if (foreground && foreground !== '\u001b[39m') line = foreground + line;
    return line;
  }
  function sliceByWidth(value, width) {
    if (value.length === strlen(value)) return value.substr(0, width);
    while (strlen(value) > width) value = value.slice(0, -1);
    return value;
  }
  function truncateAnsi(value, width) {
    const regex = ansiPattern(true);
    const pieces = value.split(ansiPattern());
    const state = {};
    let pieceIndex = 0, visibleWidth = 0, output = '';
    while (visibleWidth < width) {
      const match = regex.exec(value);
      let piece = pieces[pieceIndex++];
      if (piece === undefined) break;
      if (visibleWidth + strlen(piece) > width) piece = sliceByWidth(piece, width - visibleWidth);
      output += piece;
      visibleWidth += strlen(piece);
      if (visibleWidth < width) {
        if (!match) break;
        output += match[0];
        updateStyleState(state, match);
      }
    }
    return closeStyles(state, output);
  }
  function truncate(value, width, marker = '…') {
    if (strlen(value) <= width) return value;
    width -= strlen(marker);
    let result = truncateAnsi(value, width) + marker;
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
        right: '│', 'right-mid': '┤', middle: '│',
      },
      truncate: '…', colWidths: [], rowHeights: [], colAligns: [], rowAligns: [],
      style: {
        'padding-left': 1, 'padding-right': 1,
        head: ['red'], border: ['grey'], compact: false,
      },
      head: [],
    };
  }
  function mergeOptions(options = {}, defaults = defaultOptions()) {
    const merged = Object.assign({}, defaults, options);
    merged.chars = Object.assign({}, defaults.chars, options.chars);
    merged.style = Object.assign({}, defaults.style, options.style);
    return merged;
  }
  function wrapWords(maxLength, input) {
    const lines = [], chunks = input.split(/(\s+)/g);
    let line = [], lineLength = 0, separator;
    for (let index = 0; index < chunks.length; index += 2) {
      const word = chunks[index];
      let nextLength = lineLength + strlen(word);
      if (lineLength > 0 && separator) nextLength += separator.length;
      if (nextLength > maxLength) {
        if (lineLength !== 0) lines.push(line.join(''));
        line = [word]; lineLength = strlen(word);
      } else {
        line.push(separator || '', word); lineLength = nextLength;
      }
      separator = chunks[index + 1];
    }
    if (lineLength) lines.push(line.join(''));
    return lines;
  }
  function wrapCharacters(maxLength, input) {
    const lines = [];
    let remaining = '';
    const chunks = input.split(/(\s+)/g);
    for (let index = 0; index < chunks.length; index += 2) {
      if (remaining.length && chunks[index - 1]) remaining += chunks[index - 1];
      remaining += chunks[index];
      while (remaining.length > maxLength) {
        lines.push(remaining.slice(0, maxLength));
        remaining = remaining.slice(maxLength);
      }
    }
    if (remaining.length) lines.push(remaining);
    return lines;
  }
  function wordWrap(maxLength, input, wrapOnWordBoundary = true) {
    const result = [], wrap = wrapOnWordBoundary ? wrapWords : wrapCharacters;
    for (const line of input.split('\n')) result.push(...wrap(maxLength, line));
    return result;
  }
  function colorizeLines(lines) {
    let state = {};
    return lines.map((original) => {
      const line = reopenStyles(state, original);
      state = parseStyles(line);
      return closeStyles(Object.assign({}, state), line);
    });
  }
  function hyperlink(url, text) {
    const osc = '\u001b]', bell = '\u0007', separator = ';';
    return [osc, '8', separator, separator, url || text, bell, text,
      osc, '8', separator, separator, bell].join('');
  }
  const parseHexValue = (value) => (value.match(/#[0-9a-fA-F]{3,6}/) || ['#000'])[0];
  return { strlen, repeat, pad, truncate, mergeOptions, wordWrap, colorizeLines, hyperlink, parseHexValue };
})();

const cellModule = (() => {
  const characterNames = [
    'top', 'top-mid', 'top-left', 'top-right',
    'bottom', 'bottom-mid', 'bottom-left', 'bottom-right',
    'left', 'left-mid', 'mid', 'mid-mid', 'right', 'right-mid', 'middle',
  ];
  const firstDefined = (...values) => values
    .filter((value) => value !== undefined && value !== null).shift();
  function camelCase(name) {
    const parts = name.split('-');
    if (parts.length > 1) {
      parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].substr(1);
      return parts.join('');
    }
    return name;
  }
  function copyOption(overrides, defaults, name, destination) {
    const camelName = camelCase(name);
    destination[camelName] = firstDefined(
      overrides[camelName], overrides[name], defaults[camelName], defaults[name],
    );
  }
  function sumSpan(values, start, span) {
    let total = values[start];
    for (let offset = 1; offset < span; offset++) total += 1 + values[start + offset];
    return total;
  }
  const sumWithBorder = (total, value) => total + value + 1;

  class Cell {
    constructor(options) {
      this.setOptions(options);
      this.x = null;
      this.y = null;
    }
    setOptions(options) {
      const primitiveTypes = ['boolean', 'number', 'bigint', 'string'];
      if (primitiveTypes.indexOf(typeof options) !== -1) options = { content: `${options}` };
      options = options || {};
      this.options = options;
      const content = options.content;
      if (primitiveTypes.indexOf(typeof content) !== -1) this.content = String(content);
      else if (!content) this.content = options.href || '';
      else throw new Error(`Content needs to be a primitive, got: ${typeof content}`);
      this.colSpan = options.colSpan || 1;
      this.rowSpan = options.rowSpan || 1;
      if (options.href) {
        Object.defineProperty(this, 'href', { get() { return this.options.href; } });
      }
    }
    mergeTableOptions(tableOptions, cells) {
      this.cells = cells;
      const ownChars = this.options.chars || {};
      const tableChars = tableOptions.chars;
      this.chars = {};
      characterNames.forEach((name) => copyOption(ownChars, tableChars, name, this.chars));
      this.truncate = this.options.truncate || tableOptions.truncate;
      const ownStyle = this.options.style || (this.options.style = {});
      const tableStyle = tableOptions.style;
      copyOption(ownStyle, tableStyle, 'padding-left', this);
      copyOption(ownStyle, tableStyle, 'padding-right', this);
      this.head = ownStyle.head || tableStyle.head;
      this.border = ownStyle.border || tableStyle.border;
      this.fixedWidth = tableOptions.colWidths[this.x];
      this.lines = this.computeLines(tableOptions);
      this.desiredWidth = utils.strlen(this.content) + this.paddingLeft + this.paddingRight;
      this.desiredHeight = this.lines.length;
    }
    computeLines(tableOptions) {
      const tableWrap = tableOptions.wordWrap || tableOptions.textWrap;
      const shouldWrap = this.options.wordWrap === undefined ? tableWrap : this.options.wordWrap;
      if (this.fixedWidth && shouldWrap) {
        this.fixedWidth -= this.paddingLeft + this.paddingRight;
        if (this.colSpan) {
          for (let offset = 1; offset < this.colSpan; offset++) {
            this.fixedWidth += tableOptions.colWidths[this.x + offset];
          }
        }
        const tableBoundary = tableOptions.wrapOnWordBoundary === undefined
          ? true : tableOptions.wrapOnWordBoundary;
        const boundary = this.options.wrapOnWordBoundary === undefined
          ? tableBoundary : this.options.wrapOnWordBoundary;
        return this.wrapLines(utils.wordWrap(this.fixedWidth, this.content, boundary));
      }
      return this.wrapLines(this.content.split('\n'));
    }
    wrapLines(lines) {
      const result = utils.colorizeLines(lines);
      return this.href ? result.map((line) => utils.hyperlink(this.href, line)) : result;
    }
    init(tableOptions) {
      const { x, y } = this;
      this.widths = tableOptions.colWidths.slice(x, x + this.colSpan);
      this.heights = tableOptions.rowHeights.slice(y, y + this.rowSpan);
      this.width = this.widths.reduce(sumWithBorder, -1);
      this.height = this.heights.reduce(sumWithBorder, -1);
      this.hAlign = this.options.hAlign || tableOptions.colAligns[x];
      this.vAlign = this.options.vAlign || tableOptions.rowAligns[y];
      this.drawRight = x + this.colSpan == tableOptions.colWidths.length;
    }
    draw(lineNumber, spanningCell) {
      if (lineNumber == 'top') return this.drawTop(this.drawRight);
      if (lineNumber == 'bottom') return this.drawBottom(this.drawRight);
      const preview = utils.truncate(this.content, 10, this.truncate);
      if (!lineNumber) {
        debug.info(`${this.y}-${this.x}: ${this.rowSpan - lineNumber}x${this.colSpan} Cell ${preview}`);
      }
      const available = Math.max(0, this.height - this.lines.length);
      let topPadding = 0;
      if (this.vAlign === 'center') topPadding = Math.ceil(available / 2);
      else if (this.vAlign === 'bottom') topPadding = available;
      if (lineNumber < topPadding || lineNumber >= topPadding + this.lines.length) {
        return this.drawEmpty(this.drawRight, spanningCell);
      }
      const lastLine = this.lines.length > this.height && lineNumber + 1 >= this.height;
      return this.drawLine(lineNumber - topPadding, this.drawRight, lastLine, spanningCell);
    }
    drawTop(drawRight) {
      const pieces = [];
      if (this.cells) {
        this.widths.forEach((width, offset) => {
          pieces.push(this._topLeftChar(offset));
          pieces.push(utils.repeat(this.chars[this.y == 0 ? 'top' : 'mid'], width));
        });
      } else {
        pieces.push(this._topLeftChar(0));
        pieces.push(utils.repeat(this.chars[this.y == 0 ? 'top' : 'mid'], this.width));
      }
      if (drawRight) pieces.push(this.chars[this.y == 0 ? 'topRight' : 'rightMid']);
      return this.wrapWithStyleColors('border', pieces.join(''));
    }
    _topLeftChar(offset) {
      const x = this.x + offset;
      let name;
      if (this.y == 0) {
        if (x == 0) name = 'topLeft';
        else if (offset == 0) name = 'topMid';
        else name = 'top';
      } else if (x == 0) name = 'leftMid';
      else {
        name = offset == 0 ? 'midMid' : 'bottomMid';
        if (this.cells) {
          if (this.cells[this.y - 1][x] instanceof ColSpanCell) {
            name = offset == 0 ? 'topMid' : 'mid';
          }
          if (offset == 0) {
            let leftOffset = 1;
            while (this.cells[this.y][x - leftOffset] instanceof ColSpanCell) leftOffset++;
            if (this.cells[this.y][x - leftOffset] instanceof RowSpanCell) name = 'leftMid';
          }
        }
      }
      return this.chars[name];
    }
    wrapWithStyleColors(styleName, text) {
      if (!this[styleName] || !this[styleName].length) return text;
      try {
        let style = require('ansis');
        for (let index = this[styleName].length - 1; index >= 0; index--) {
          const name = this[styleName][index];
          if (name.startsWith('hex') || name.startsWith('bgHex')) {
            const color = utils.parseHexValue(name);
            style = name.startsWith('bgHex') ? style.bgHex(color) : style.hex(color);
          } else style = style[name];
        }
        return style(text);
      } catch (error) {
        return text;
      }
    }
    drawLine(lineNumber, drawRight, forceTruncate, spanningCell = 0) {
      let left = this.chars[this.x == 0 ? 'left' : 'middle'];
      if (this.x && spanningCell && this.cells) {
        let leftCell = this.cells[this.y + spanningCell][this.x - 1];
        while (leftCell instanceof ColSpanCell) leftCell = this.cells[leftCell.y][leftCell.x - 1];
        if (!(leftCell instanceof RowSpanCell)) left = this.chars.rightMid;
      }
      const leftPadding = utils.repeat(' ', this.paddingLeft);
      const right = drawRight ? this.chars.right : '';
      const rightPadding = utils.repeat(' ', this.paddingRight);
      let line = this.lines[lineNumber];
      const innerWidth = this.width - this.paddingLeft - this.paddingRight;
      if (forceTruncate) line += this.truncate || '…';
      line = utils.truncate(line, innerWidth, this.truncate);
      line = utils.pad(line, innerWidth, ' ', this.hAlign);
      return this.stylizeLine(left, leftPadding + line + rightPadding, right);
    }
    stylizeLine(left, content, right) {
      left = this.wrapWithStyleColors('border', left);
      right = this.wrapWithStyleColors('border', right);
      if (this.y === 0) content = this.wrapWithStyleColors('head', content);
      return left + content + right;
    }
    drawBottom(drawRight) {
      const left = this.chars[this.x == 0 ? 'bottomLeft' : 'bottomMid'];
      const middle = utils.repeat(this.chars.bottom, this.width);
      const right = drawRight ? this.chars.bottomRight : '';
      return this.wrapWithStyleColors('border', left + middle + right);
    }
    drawEmpty(drawRight, spanningCell = 0) {
      let left = this.chars[this.x == 0 ? 'left' : 'middle'];
      if (this.x && spanningCell && this.cells) {
        let leftCell = this.cells[this.y + spanningCell][this.x - 1];
        while (leftCell instanceof ColSpanCell) leftCell = this.cells[leftCell.y][leftCell.x - 1];
        if (!(leftCell instanceof RowSpanCell)) left = this.chars.rightMid;
      }
      const right = drawRight ? this.chars.right : '';
      return this.stylizeLine(left, utils.repeat(' ', this.width), right);
    }
  }

  class ColSpanCell {
    draw(lineNumber) {
      if (typeof lineNumber === 'number') debug.info(`${this.y}-${this.x}: 1x1 ColSpanCell`);
      return '';
    }
    init() {}
    mergeTableOptions() {}
  }
  class RowSpanCell {
    constructor(originalCell) { this.originalCell = originalCell; }
    init(tableOptions) {
      this.cellOffset = this.y - this.originalCell.y;
      this.offset = sumSpan(tableOptions.rowHeights, this.originalCell.y, this.cellOffset);
    }
    draw(lineNumber) {
      if (lineNumber == 'top') return this.originalCell.draw(this.offset, this.cellOffset);
      if (lineNumber == 'bottom') return this.originalCell.draw('bottom');
      debug.info(`${this.y}-${this.x}: 1x${this.colSpan} RowSpanCell for ${this.originalCell.content}`);
      return this.originalCell.draw(this.offset + 1 + lineNumber);
    }
    mergeTableOptions() {}
  }
  Cell.ColSpanCell = ColSpanCell;
  Cell.RowSpanCell = RowSpanCell;
  return Cell;
})();

const Cell = cellModule;
const { ColSpanCell, RowSpanCell } = Cell;

const tableLayout = (() => {
  function nextAvailableColumn(activeRowSpans, column) {
    return activeRowSpans[column] > 0
      ? nextAvailableColumn(activeRowSpans, column + 1) : column;
  }
  function layoutTable(rows) {
    const activeRowSpans = {};
    rows.forEach((row, y) => {
      let x = 0;
      row.forEach((cell) => {
        cell.y = y;
        cell.x = y ? nextAvailableColumn(activeRowSpans, x) : x;
        const rowSpan = cell.rowSpan || 1;
        const colSpan = cell.colSpan || 1;
        if (rowSpan > 1) {
          for (let offset = 0; offset < colSpan; offset++) activeRowSpans[cell.x + offset] = rowSpan;
        }
        x = cell.x + colSpan;
      });
      Object.keys(activeRowSpans).forEach((column) => {
        activeRowSpans[column]--;
        if (activeRowSpans[column] < 1) delete activeRowSpans[column];
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
  function rectanglesOverlap(first, second) {
    const firstBottom = first.y - 1 + (first.rowSpan || 1);
    const secondBottom = second.y - 1 + (second.rowSpan || 1);
    if (first.y > secondBottom || second.y > firstBottom) return false;
    const firstRight = first.x - 1 + (first.colSpan || 1);
    const secondRight = second.x - 1 + (second.colSpan || 1);
    return !(first.x > secondRight || second.x > firstRight);
  }
  function cellExists(rows, x, y) {
    const point = { x, y };
    for (let row = 0; row <= Math.min(rows.length - 1, y); row++) {
      for (const cell of rows[row]) if (rectanglesOverlap(point, cell)) return true;
    }
    return false;
  }
  function areaIsEmpty(rows, y, startX, endX) {
    for (let x = startX; x < endX; x++) if (cellExists(rows, x, y)) return false;
    return true;
  }
  function insertByColumn(cell, row) {
    let index = 0;
    while (index < row.length && row[index].x < cell.x) index++;
    row.splice(index, 0, cell);
  }
  function fillInTable(rows) {
    const rowCount = rows.length;
    const columnCount = maxWidth(rows);
    debug.debug(`Max rows: ${rowCount}; Max cols: ${columnCount}`);
    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < columnCount; x++) {
        if (cellExists(rows, x, y)) continue;
        const missing = { x, y, colSpan: 1, rowSpan: 1 };
        x++;
        while (x < columnCount && !cellExists(rows, x, y)) {
          missing.colSpan++;
          x++;
        }
        for (let nextY = y + 1;
          nextY < rowCount && areaIsEmpty(rows, nextY, missing.x, missing.x + missing.colSpan);
          nextY++) missing.rowSpan++;
        const cell = new Cell(missing);
        cell.x = missing.x;
        cell.y = missing.y;
        debug.warn(`Missing cell at ${cell.y}-${cell.x}.`);
        insertByColumn(cell, rows[y]);
      }
    }
  }
  function addRowSpanCells(rows) {
    rows.forEach((row) => row.forEach((cell) => {
      for (let offset = 1; offset < cell.rowSpan; offset++) {
        const placeholder = new RowSpanCell(cell);
        placeholder.x = cell.x;
        placeholder.y = cell.y + offset;
        placeholder.colSpan = cell.colSpan;
        insertByColumn(placeholder, rows[cell.y + offset]);
      }
    }));
  }
  function addColSpanCells(rows) {
    for (let y = rows.length - 1; y >= 0; y--) {
      const row = rows[y];
      for (let index = 0; index < row.length; index++) {
        const cell = row[index];
        for (let offset = 1; offset < cell.colSpan; offset++) {
          const placeholder = new ColSpanCell();
          placeholder.x = cell.x + offset;
          placeholder.y = cell.y;
          row.splice(index + 1, 0, placeholder);
        }
      }
    }
  }
  function normalizeRow(row) {
    if (!Array.isArray(row)) {
      const key = Object.keys(row)[0];
      row = row[key];
      if (Array.isArray(row)) {
        row = row.slice();
        row.unshift(key);
      } else row = [key, row];
    }
    return row.map((value) => new Cell(value));
  }
  function makeTableLayout(rows) {
    const cells = rows.map(normalizeRow);
    layoutTable(cells);
    fillInTable(cells);
    addRowSpanCells(cells);
    addColSpanCells(cells);
    return cells;
  }
  function computeDimension(spanName, desiredName, positionName, minimum) {
    return function computeDimensionValues(values, rows) {
      const calculated = [], spanningCells = [], maximums = {};
      rows.forEach((row) => row.forEach((cell) => {
        const span = cell[spanName] || 1;
        if (span > 1) spanningCells.push(cell);
        else {
          const position = cell[positionName];
          calculated[position] = Math.max(calculated[position] || 0, cell[desiredName] || 0);
        }
      }));
      values.forEach((value, index) => {
        if (typeof value === 'number') calculated[index] = value;
      });
      for (let index = spanningCells.length - 1; index >= 0; index--) {
        const cell = spanningCells[index];
        const span = cell[spanName];
        const position = cell[positionName];
        let existing = calculated[position];
        let flexible = typeof values[position] === 'number' ? 0 : 1;
        if (typeof existing === 'number') {
          for (let offset = 1; offset < span; offset++) {
            existing += 1 + calculated[position + offset];
            if (typeof values[position + offset] !== 'number') flexible++;
          }
        } else {
          existing = desiredName === 'desiredWidth' ? cell.desiredWidth - 1 : 1;
          if (!maximums[position] || maximums[position] < existing) maximums[position] = existing;
        }
        if (cell[desiredName] > existing) {
          let offset = 0;
          while (flexible > 0 && cell[desiredName] > existing) {
            if (typeof values[position + offset] !== 'number') {
              const addition = Math.round((cell[desiredName] - existing) / flexible);
              existing += addition;
              calculated[position + offset] = (calculated[position + offset] || 0) + addition;
              flexible--;
            }
            offset++;
          }
        }
      }
      Object.assign(values, calculated, maximums);
      for (let index = 0; index < values.length; index++) {
        values[index] = Math.max(minimum, values[index] || 0);
      }
    };
  }
  return {
    makeTableLayout, layoutTable, addRowSpanCells, maxWidth, fillInTable,
    computeWidths: computeDimension('colSpan', 'desiredWidth', 'x', 1),
    computeHeights: computeDimension('rowSpan', 'desiredHeight', 'y', 1),
  };
})();

function configureDebug(options) {
  if (!options.debug) return;
  switch (typeof options.debug) {
    case 'boolean': debug.setDebugLevel(debug.WARN); break;
    case 'number': debug.setDebugLevel(options.debug); break;
    case 'string': debug.setDebugLevel(parseInt(options.debug, 10)); break;
    default:
      debug.setDebugLevel(debug.WARN);
      debug.warn(`Debug option is expected to be boolean, number, or string. Received a ${typeof options.debug}`);
  }
}
function doDraw(row, line, output) {
  const pieces = [];
  row.forEach((cell) => pieces.push(cell.draw(line)));
  const rendered = pieces.join('');
  if (rendered.length) output.push(rendered);
}

class Table extends Array {
  constructor(options) {
    super();
    const mergedOptions = utils.mergeOptions(options);
    Object.defineProperty(this, 'options', {
      value: mergedOptions,
      enumerable: mergedOptions.debug,
    });
    if (mergedOptions.debug) {
      configureDebug(mergedOptions);
      Object.defineProperty(this, 'messages', {
        get() { return debug.debugMessages(); },
      });
    }
  }
  toString() {
    let rows = this;
    const hasHeader = this.options.head && this.options.head.length;
    if (hasHeader) {
      rows = [this.options.head];
      if (this.length) rows.push.apply(rows, this);
    } else this.options.style.head = [];

    const cells = tableLayout.makeTableLayout(rows);
    cells.forEach((row) => row.forEach((cell) => cell.mergeTableOptions(this.options, cells)));
    tableLayout.computeWidths(this.options.colWidths, cells);
    tableLayout.computeHeights(this.options.rowHeights, cells);
    cells.forEach((row) => row.forEach((cell) => cell.init(this.options)));

    const output = [];
    for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
      const row = cells[rowIndex];
      const rowHeight = this.options.rowHeights[rowIndex];
      if (rowIndex === 0 || !this.options.style.compact || (rowIndex == 1 && hasHeader)) {
        doDraw(row, 'top', output);
      }
      for (let line = 0; line < rowHeight; line++) doDraw(row, line, output);
      if (rowIndex + 1 == cells.length) doDraw(row, 'bottom', output);
    }
    return output.join('\n');
  }
  get width() {
    return this.toString().split('\n')[0].length;
  }
}

Table.reset = () => debug.reset();
module.exports = Table;
