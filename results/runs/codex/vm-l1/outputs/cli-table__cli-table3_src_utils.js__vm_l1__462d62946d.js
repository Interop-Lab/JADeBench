'use strict';

const stringWidth = require('string-width');

const ANSI_CODE_PATTERN = /\u001b\[((?:\d*;){0,5}\d*)m/g;
const ANSI_OR_HYPERLINK_PATTERN = /(\u001b\[((?:\d*;){0,5}\d*)m|\u001b]8;;[^\u0007]*\u0007)/g;

function codeRegex() {
  return new RegExp(ANSI_CODE_PATTERN.source, 'g');
}

function strlen(value) {
  return value
    .replace(codeRegex(), '')
    .split('\n')
    .reduce((longest, line) => Math.max(longest, stringWidth(line)), 0);
}

function repeat(value, times) {
  return Array(times + 1).join(value);
}

function pad(value, width, padding, direction) {
  const missingWidth = width - strlen(value);
  if (missingWidth <= 0) return value;

  if (direction === 'right') return repeat(padding, missingWidth) + value;
  if (direction === 'center') {
    const leftWidth = Math.floor(missingWidth / 2);
    return repeat(padding, leftWidth) + value + repeat(padding, missingWidth - leftWidth);
  }
  return value + repeat(padding, missingWidth);
}

function updateAnsiState(state, controlSequence) {
  const codes = controlSequence === '' ? [0] : controlSequence.split(';').map(Number);

  for (let index = 0; index < codes.length; index += 1) {
    const code = codes[index];
    if (code === 0) {
      state.foreground = null;
      state.background = null;
      state.styles.clear();
    } else if (code === 39) {
      state.foreground = null;
    } else if (code === 49) {
      state.background = null;
    } else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) {
      state.foreground = String(code);
    } else if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107)) {
      state.background = String(code);
    } else if (code === 38 || code === 48) {
      const colorLength = codes[index + 1] === 5 ? 2 : codes[index + 1] === 2 ? 4 : 0;
      const color = codes.slice(index, index + colorLength + 1).join(';');
      if (code === 38) state.foreground = color;
      else state.background = color;
      index += colorLength;
    } else if ([1, 3, 4, 7, 9].includes(code)) {
      state.styles.set(code, code === 1 ? 22 : code === 3 ? 23 : code === 4 ? 24 : code === 7 ? 27 : 29);
    } else if (code === 22) {
      state.styles.delete(1);
    } else if (code === 23) {
      state.styles.delete(3);
    } else if (code === 24) {
      state.styles.delete(4);
    } else if (code === 27) {
      state.styles.delete(7);
    } else if (code === 29) {
      state.styles.delete(9);
    }
  }
}

function closeAnsiState(state, includeStyles = true) {
  let result = '';
  if (state.background) result += '\u001b[49m';
  if (state.foreground) result += '\u001b[39m';
  if (includeStyles) {
    for (const offCode of [...state.styles.values()].reverse()) result += `\u001b[${offCode}m`;
  }
  return result;
}

function openAnsiState(state, includeStyles = true) {
  let result = '';
  if (includeStyles) {
    for (const onCode of state.styles.keys()) result += `\u001b[${onCode}m`;
  }
  if (state.foreground) result += `\u001b[${state.foreground}m`;
  if (state.background) result += `\u001b[${state.background}m`;
  return result;
}

function truncateWidth(value, desiredWidth) {
  let result = '';
  let currentWidth = 0;

  for (const character of value) {
    const characterWidth = stringWidth(character);
    if (currentWidth + characterWidth > desiredWidth) break;
    result += character;
    currentWidth += characterWidth;
  }
  return result;
}

function truncateWidthWithAnsi(value, desiredWidth) {
  const state = { foreground: null, background: null, styles: new Map() };
  let hyperlinkOpen = false;
  let result = '';
  let visibleWidth = 0;
  let lastIndex = 0;

  for (const match of value.matchAll(ANSI_OR_HYPERLINK_PATTERN)) {
    const plainText = value.slice(lastIndex, match.index);
    const remainingWidth = desiredWidth - visibleWidth;
    const keptText = truncateWidth(plainText, remainingWidth);
    result += keptText;
    visibleWidth += stringWidth(keptText);
    if (keptText.length < plainText.length || visibleWidth >= desiredWidth) break;

    const sequence = match[0];
    result += sequence;
    if (sequence.startsWith('\u001b]8;;')) hyperlinkOpen = sequence !== '\u001b]8;;\u0007';
    else updateAnsiState(state, match[2]);
    lastIndex = match.index + sequence.length;
  }

  if (visibleWidth < desiredWidth) {
    result += truncateWidth(value.slice(lastIndex), desiredWidth - visibleWidth);
  }
  result += closeAnsiState(state, false);
  return { value: result, hyperlinkOpen };
}

function truncate(value, desiredWidth, truncationMarker) {
  const marker = truncationMarker || '…';
  if (strlen(value) <= desiredWidth) return value;
  if (strlen(marker) >= desiredWidth) return marker;

  const truncated = truncateWidthWithAnsi(value, desiredWidth - strlen(marker));
  return truncated.value + marker + (truncated.hyperlinkOpen ? '\u001b]8;;\u0007' : '');
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
  const suppliedOptions = options || {};
  const baseOptions = defaults || defaultOptions();
  return Object.assign({}, baseOptions, suppliedOptions, {
    chars: Object.assign({}, baseOptions.chars, suppliedOptions.chars),
    style: Object.assign({}, baseOptions.style, suppliedOptions.style),
  });
}

function wordWrap(maxLength, input) {
  if (/^\s/.test(input)) return [input];

  const chunks = input.split(/(\s+)/g);
  const lines = [];
  let line = '';

  for (const chunk of chunks) {
    if (!chunk) continue;
    if (/^\s+$/.test(chunk)) {
      if (line && strlen(line + chunk) <= maxLength) line += chunk;
      continue;
    }

    if (line && strlen(line + chunk) > maxLength) {
      lines.push(line.trimEnd());
      line = chunk;
    } else {
      line += chunk;
    }
  }

  if (line || lines.length === 0) lines.push(line.trimEnd());
  return lines;
}

function textWrap(maxLength, input) {
  return strlen(input) > maxLength ? wordWrap(maxLength, input) : [input];
}

function multiLineWordWrap(maxLength, input) {
  const lines = [];
  for (const line of input.split('\n')) lines.push(...textWrap(maxLength, line));
  return lines;
}

function colorizeLines(lines) {
  const state = { foreground: null, background: null, styles: new Map() };
  return lines.map((line) => {
    let coloredLine = openAnsiState(state, false) + line;
    for (const match of line.matchAll(codeRegex())) {
      const control = match[1];
      const code = parseInt(control, 10) || 0;
      if (code === 0) {
        state.foreground = null;
        state.background = null;
      } else if (code === 39) {
        state.foreground = null;
      } else if (code === 49) {
        state.background = null;
      } else if ((code >= 30 && code <= 38) || (code >= 90 && code <= 97)) {
        state.foreground = control;
      } else if ((code >= 40 && code <= 48) || (code >= 100 && code <= 107)) {
        state.background = control;
      }
    }
    coloredLine += closeAnsiState(state, false);
    return coloredLine;
  });
}

function hyperlink(url, text) {
  const target = url || text;
  return `\u001b]8;;${target || ''}\u0007${text || ''}\u001b]8;;\u0007`;
}

function parseHexValue(value) {
  const match = value.match(/#[0-9a-fA-F]{3,6}/);
  return match ? match[0] : '#000';
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
