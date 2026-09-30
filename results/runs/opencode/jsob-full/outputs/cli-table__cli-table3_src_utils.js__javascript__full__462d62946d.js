'use strict';

const stringWidth = require('string-width');

const ANSI_PATTERN = /\u001b\[(?:\d*;){0,5}\d*m/g;
const ANSI_CAPTURE_PATTERN = /\u001b\[((?:\d*;){0,5}\d*)m/g;

function strlen(value) {
  const plainLines = String(value).replace(ANSI_PATTERN, '').split('\n');
  return plainLines.reduce((widest, line) => Math.max(widest, stringWidth(line)), 0);
}

function repeat(value, count) {
  return Array(count + 1).join(value);
}

function pad(value, length, fill = ' ', direction) {
  value = String(value);
  fill = fill || ' ';
  const missing = length - strlen(value);
  if (missing <= 0) return value;

  if (direction === 'left') return repeat(fill, missing) + value;
  if (direction === 'center') {
    const right = Math.floor(missing / 2);
    return repeat(fill, missing - right) + value + repeat(fill, right);
  }
  return value + repeat(fill, missing);
}

const styles = [
  ['bold', 1, 22],
  ['dim', 2, 22],
  ['italics', 3, 23],
  ['underline', 4, 24],
  ['inverse', 7, 27],
  ['strikethrough', 9, 29],
];

function updateState(state, match) {
  const codes = (match[1] || '0').split(';').map(Number);
  for (const code of codes) {
    if (code === 0) {
      for (const key of Object.keys(state)) delete state[key];
    } else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97) || code === 38) {
      state.foreground = match[0];
    } else if (code === 39) {
      delete state.foreground;
    } else if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107) || code === 48) {
      state.background = match[0];
    } else if (code === 49) {
      delete state.background;
    } else {
      for (const [name, on, off] of styles) {
        if (code === on) state[name] = true;
        if (code === off) state[name] = false;
      }
    }
  }
}

function readState(text) {
  const state = {};
  const regex = new RegExp(ANSI_CAPTURE_PATTERN.source, 'g');
  let match;
  while ((match = regex.exec(text)) !== null) updateState(state, match);
  return state;
}

function openingCodes(state) {
  let result = '';
  if (state.foreground) result += state.foreground;
  if (state.background) result += state.background;
  for (const [name, on] of styles) if (state[name]) result += `\u001b[${on}m`;
  return result;
}

function closingCodes(state) {
  let result = '';
  for (const [name, , off] of styles) if (state[name]) result += `\u001b[${off}m`;
  if (state.foreground) result += '\u001b[39m';
  if (state.background) result += '\u001b[49m';
  return result;
}

function rewindState(state, text) {
  return openingCodes(state) + text;
}

function unwindState(state, text) {
  return text + closingCodes(state);
}

function truncateWidth(text, desiredWidth) {
  let result = '';
  let width = 0;
  for (const character of text) {
    const characterWidth = stringWidth(character);
    if (width + characterWidth > desiredWidth) break;
    result += character;
    width += characterWidth;
  }
  return result;
}

function truncateWidthWithAnsi(text, desiredWidth) {
  const state = {};
  let result = '';
  let width = 0;
  let cursor = 0;
  const regex = new RegExp(ANSI_CAPTURE_PATTERN.source, 'g');
  let match;

  while ((match = regex.exec(text)) !== null) {
    const plain = text.slice(cursor, match.index);
    const available = desiredWidth - width;
    const piece = truncateWidth(plain, available);
    result += piece;
    width += strlen(piece);
    if (piece.length < plain.length || width >= desiredWidth) break;
    result += match[0];
    updateState(state, match);
    cursor = regex.lastIndex;
  }

  if (width < desiredWidth && cursor < text.length) {
    result += truncateWidth(text.slice(cursor), desiredWidth - width);
  }
  return unwindState(state, result);
}

function truncate(text, desiredWidth, truncation = '…') {
  if (strlen(text) <= desiredWidth) return text;
  return truncateWidthWithAnsi(text, desiredWidth - strlen(truncation)) + truncation;
}

function defaultOptions() {
  return {
    chars: {
      top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
      bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
      left: '│', 'left-mid': '├', mid: '─', 'mid-mid': '┼',
      right: '│', 'right-mid': '┤', middle: '│',
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
      compact: false,
    },
    head: [],
  };
}

function mergeOptions(options, defaults) {
  options = options || {};
  defaults = defaults || defaultOptions();
  return {
    ...defaults,
    ...options,
    chars: { ...defaults.chars, ...options.chars },
    style: { ...defaults.style, ...options.style },
  };
}

function wordWrap(maxLength, input) {
  const lines = [];
  const tokens = input.split(/(\s+)/g);
  let parts = [];
  let lineLength = 0;
  let separator;

  for (let index = 0; index < tokens.length; index += 2) {
    const word = tokens[index];
    let nextLength = lineLength + strlen(word);
    if (lineLength > 0 && separator) nextLength += separator.length;

    if (nextLength > maxLength) {
      if (lineLength > 0) lines.push(parts.join(''));
      parts = [word];
      lineLength = strlen(word);
    } else {
      parts.push(separator || '', word);
      lineLength = nextLength;
    }
    separator = tokens[index + 1];
  }
  if (lineLength) lines.push(parts.join(''));
  return lines;
}

function textWrap(maxLength, input) {
  const lines = [];
  let current = '';
  const tokens = input.split(/(\s+)/g);

  for (let index = 0; index < tokens.length; index += 2) {
    if (current.length && index) current += tokens[index - 1];
    current += tokens[index];
    while (current.length > maxLength) {
      lines.push(current.substring(0, maxLength));
      current = current.substring(maxLength);
    }
  }
  if (current.length) lines.push(current);
  return lines;
}

function multiLineWordWrap(maxLength, input, wrapOnWords = true) {
  const wrap = wrapOnWords ? wordWrap : textWrap;
  const output = [];
  for (const line of input.split('\n')) output.push(...wrap(maxLength, line));
  return output;
}

function colorizeLines(lines) {
  let state = {};
  const output = [];
  for (const line of lines) {
    const coloredLine = rewindState(state, line);
    state = readState(coloredLine);
    output.push(unwindState({ ...state }, coloredLine));
  }
  return output;
}

function hyperlink(url, text) {
  return `\u001b]8;;${url || text}\u0007${text}\u001b]8;;\u0007`;
}

function parseHexValue(value) {
  const [hex] = value.match(/#[0-9a-fA-F]{3,6}/) || ['#FFFFFF'];
  return hex;
}

module.exports = {
  strlen,
  repeat,
  pad,
  truncate,
  mergeOptions,
  wordWrap: multiLineWordWrap,
  colorizeLines,
  hyperlink,
  parseHexValue,
};
