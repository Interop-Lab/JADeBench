'use strict';

const stringWidth = require('string-width');

const ANSI_PATTERN = /\x1b\[[0-?]*[ -/]*[@-~]/g;
const SGR_PATTERN = /\x1b\[([0-9;]*)m/g;

function strlen(value) {
  const lines = String(value).split('\n');
  return Math.max(...lines.map(line => stringWidth(line)));
}

function repeat(value, count) {
  return new Array(count + 1).join(value);
}

function pad(value, width, fill = ' ', alignment = 'left') {
  const padding = width - strlen(value);
  if (padding <= 0) return value;

  if (alignment === 'right') return repeat(fill, padding) + value;
  if (alignment === 'center') {
    const left = Math.floor(padding / 2);
    return repeat(fill, left) + value + repeat(fill, padding - left);
  }
  return value + repeat(fill, padding);
}

const STYLE_CODES = new Map([
  [1, 22],
  [2, 22],
  [3, 23],
  [4, 24],
  [7, 27],
  [8, 28],
  [9, 29],
]);
const STYLE_RESETS = new Set(STYLE_CODES.values());
const ANSI_STATE_ORDER = [39, 49, 1, 2, 3, 4, 7, 8, 9];

function updateAnsiState(state, sequence) {
  const parameters = sequence.slice(2, -1).split(';').map(value => Number(value || 0));
  for (let index = 0; index < parameters.length; index += 1) {
    const code = parameters[index];
    if (code === 0) {
      state.clear();
    } else if (STYLE_CODES.has(code)) {
      state.set(code, sequence);
    } else if (STYLE_RESETS.has(code)) {
      for (const [openingCode, resetCode] of STYLE_CODES) {
        if (resetCode === code) state.delete(openingCode);
      }
    } else if (code === 39 || code === 49) {
      state.delete(code);
    } else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) {
      state.set(39, sequence);
    } else if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107)) {
      state.set(49, sequence);
    } else if (code === 38 || code === 48) {
      const parameterCount = parameters[index + 1] === 2 ? 5 : 3;
      const completeSequence = `\x1b[${parameters.slice(index, index + parameterCount).join(';')}m`;
      state.set(code === 38 ? 39 : 49, completeSequence);
      index += parameterCount - 1;
    }
  }
}

function reopenAnsiState(state) {
  return ANSI_STATE_ORDER.filter(code => state.has(code)).map(code => state.get(code)).join('');
}

function closeAnsiState(state) {
  return [...ANSI_STATE_ORDER].reverse()
    .filter(code => state.has(code))
    .map(code => `\x1b[${STYLE_CODES.get(code) || code}m`)
    .join('');
}

function truncate(value, width, truncation = '…') {
  const text = String(value);
  if (strlen(text) <= width) return text;

  const availableWidth = width - strlen(truncation);
  if (availableWidth <= 0) return truncation;

  const state = new Map();
  let result = '';
  let lineWidth = 0;
  let index = 0;

  while (index < text.length) {
    if (text[index] === '\x1b') {
      ANSI_PATTERN.lastIndex = index;
      const match = ANSI_PATTERN.exec(text);
      if (match && match.index === index) {
        result += match[0];
        if (match[0].endsWith('m')) updateAnsiState(state, match[0]);
        index += match[0].length;
        continue;
      }
    }

    const character = text[index];
    const characterWidth = stringWidth(character);
    if (lineWidth + characterWidth > availableWidth) break;
    result += character;
    lineWidth = character === '\n' ? 0 : lineWidth + characterWidth;
    index += 1;
  }

  result = result.replace(/(?:\x1b\[[0-9;]*m)+$/, '');
  const visiblePrefix = result.replace(ANSI_PATTERN, '');
  state.clear();
  for (const match of result.matchAll(SGR_PATTERN)) updateAnsiState(state, match[0]);
  return visiblePrefix ? result + closeAnsiState(state) + truncation : result + truncation;
}

function defaultOptions() {
  return {
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
      middle: '│',
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
  const base = defaults === undefined ? defaultOptions() : defaults;
  const overrides = options || {};
  return {
    ...base,
    ...overrides,
    chars: { ...base.chars, ...overrides.chars },
    style: { ...base.style, ...overrides.style },
  };
}

function wordWrap(width, text) {
  const lines = [];
  for (const sourceLine of text.split('\n')) {
    if (!sourceLine.trim()) continue;

    const leadingWhitespace = sourceLine.match(/^\s*/)[0];
    const trailingWhitespace = sourceLine.match(/\s*$/)[0];
    const words = [...sourceLine.matchAll(/\S+/g)];
    let line = (leadingWhitespace.length <= width ? leadingWhitespace : '') + words[0][0];
    let previousEnd = words[0].index + words[0][0].length;
    for (const match of words.slice(1)) {
      const spacing = sourceLine.slice(previousEnd, match.index);
      const word = match[0];
      previousEnd = match.index + word.length;
      if (strlen(line) + strlen(spacing) + strlen(word) <= width) {
        line += spacing + word;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (strlen(line) + strlen(trailingWhitespace) <= width) line += trailingWhitespace;
    lines.push(line);
  }
  return lines;
}

function colorizeLines(lines) {
  const state = new Map();
  return lines.map(line => {
    const prefix = reopenAnsiState(state);
    SGR_PATTERN.lastIndex = 0;
    for (const match of line.matchAll(SGR_PATTERN)) updateAnsiState(state, match[0]);
    return prefix + line + closeAnsiState(state);
  });
}

function hyperlink(url, text) {
  return `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`;
}

function parseHexValue(value) {
  const match = value.match(/#[\da-f]{3,6}/i);
  return match ? match[0] : '#000';
}

module.exports = {
  strlen,
  repeat,
  pad,
  truncate,
  mergeOptions,
  wordWrap,
  colorizeLines,
  hyperlink,
  parseHexValue,
};
