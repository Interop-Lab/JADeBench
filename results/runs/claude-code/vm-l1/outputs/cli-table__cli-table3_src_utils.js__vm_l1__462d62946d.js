'use strict';

const stringWidth = require('string-width');

const ANSI_PATTERN = /\u001b\[(?:\d*;){0,5}\d*m/g;
const ANSI_TOKEN_PATTERN = /(\u001b\[(?:\d*;){0,5}\d*m)/g;
const STYLE_CODES = {
  1: { group: 'bold', close: 22 },
  3: { group: 'italics', close: 23 },
  4: { group: 'underline', close: 24 },
  7: { group: 'inverse', close: 27 },
  9: { group: 'strikethrough', close: 29 },
};
const CLOSING_STYLE_CODES = new Map([
  [22, 'bold'],
  [23, 'italics'],
  [24, 'underline'],
  [27, 'inverse'],
  [29, 'strikethrough'],
]);

function ansiCodes(sequence) {
  const codes = sequence.slice(2, -1);
  return codes === '' ? [0] : codes.split(';').map(Number);
}

function updateStyles(activeStyles, sequence) {
  for (const code of ansiCodes(sequence)) {
    if (code === 0) {
      activeStyles.clear();
    } else if (STYLE_CODES[code]) {
      activeStyles.set(STYLE_CODES[code].group, code);
    } else if (CLOSING_STYLE_CODES.has(code)) {
      activeStyles.delete(CLOSING_STYLE_CODES.get(code));
    }
  }
}

function activeStylePrefix(activeStyles) {
  return [...activeStyles.values()].map((code) => `\u001b[${code}m`).join('');
}

function activeStyleSuffix(activeStyles) {
  return [...activeStyles.values()]
    .reverse()
    .map((code) => `\u001b[${STYLE_CODES[code].close}m`)
    .join('');
}

function strlen(value) {
  const lines = String(value).replace(ANSI_PATTERN, '').split('\n');
  return lines.reduce((longest, line) => Math.max(longest, stringWidth(line)), 0);
}

function repeat(value, count) {
  return Array(count + 1).join(value);
}

function pad(value, length, padding, direction) {
  const text = String(value);
  const missing = length - strlen(text);
  if (missing <= 0) return text;

  if (direction === 'left') return repeat(padding, missing) + text;
  if (direction === 'both') {
    const right = Math.ceil(missing / 2);
    return repeat(padding, missing - right) + text + repeat(padding, right);
  }
  return text + repeat(padding, missing);
}

function truncatePlainText(text, width) {
  let result = '';
  for (const character of text) {
    if (strlen(result + character) > width) break;
    result += character;
  }
  return result;
}

function truncateStyledText(text, width) {
  const parts = text.split(ANSI_TOKEN_PATTERN);
  let result = '';
  let visibleWidth = 0;
  let hasAnsi = false;

  for (const part of parts) {
    if (ANSI_PATTERN.test(part)) {
      ANSI_PATTERN.lastIndex = 0;
      hasAnsi = true;
      result += part;
      continue;
    }
    ANSI_PATTERN.lastIndex = 0;

    for (const character of part) {
      const characterWidth = stringWidth(character);
      if (visibleWidth + characterWidth > width) {
        return result + (hasAnsi ? '\u001b[0m' : '');
      }
      result += character;
      visibleWidth += characterWidth;
    }
  }
  return result;
}

function truncate(value, desiredLength, truncationMarker) {
  const text = String(value);
  const marker = truncationMarker === undefined ? '…' : String(truncationMarker);
  if (strlen(text) <= desiredLength) return text;

  const contentWidth = Math.max(0, desiredLength - strlen(marker));
  const truncated = ANSI_PATTERN.test(text)
    ? truncateStyledText(text, contentWidth)
    : truncatePlainText(text, contentWidth);
  ANSI_PATTERN.lastIndex = 0;
  return truncated + truncatePlainText(marker, desiredLength);
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
  const result = options || {};
  const fallback = defaults || defaultOptions();

  for (const name of Object.keys(fallback)) {
    if (result[name] === undefined) result[name] = fallback[name];
  }
  for (const name of ['chars', 'style']) {
    for (const property of Object.keys(fallback[name])) {
      if (result[name][property] === undefined) {
        result[name][property] = fallback[name][property];
      }
    }
  }
  return result;
}

function wordWrap(maxLength, input) {
  const lines = [];
  const words = String(input).split(/(\s+)/);
  let line = '';

  for (let word of words) {
    if (strlen(word) > maxLength) {
      if (line) {
        lines.push(line);
        line = '';
      }
      while (strlen(word) > maxLength) {
        const chunk = truncate(word, maxLength, '');
        lines.push(chunk);
        word = word.slice(chunk.length);
      }
    }

    if (strlen(line) + strlen(word) > maxLength) {
      lines.push(line);
      line = '';
    }
    line += word;
  }

  if (line) lines.push(line);
  return lines;
}

function textWrap(maxLength, input) {
  return String(input)
    .split('\n')
    .flatMap((line) => wordWrap(maxLength, line));
}

function multiLineWordWrap(maxLength, input) {
  return colorizeLines(textWrap(maxLength, input));
}

function colorizeLines(lines) {
  const activeStyles = new Map();
  return lines.map((line) => {
    const prefix = activeStylePrefix(activeStyles);
    for (const sequence of line.match(ANSI_PATTERN) || []) {
      updateStyles(activeStyles, sequence);
    }
    return prefix + line + activeStyleSuffix(activeStyles);
  });
}

function hyperlink(url, text) {
  return '\u001b]8;;' + url + '\u0007' + text + '\u001b]8;;\u0007';
}

function parseHexValue(value) {
  return parseInt(value, 16);
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
