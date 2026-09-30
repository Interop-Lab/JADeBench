'use strict';

const stringWidth = require('string-width');

const RESET = '\u001b[0m';
const ANSI_PATTERN = /\u001b\[(?:\d*;){0,5}\d*m/g;
const ANSI_CAPTURE_PATTERN = /\u001b\[((?:\d*;){0,5}\d*)m/g;

const codeCache = Object.create(null);

function addToCodeCache(name, onCode, offCode) {
  const on = `\u001b[${onCode}m`;
  const off = `\u001b[${offCode}m`;
  codeCache[on] = { name, to: true };
  codeCache[off] = { name, to: false };
  codeCache[name] = { on, off };
}

addToCodeCache('bold', 1, 22);
addToCodeCache('italics', 3, 23);
addToCodeCache('underline', 4, 24);
addToCodeCache('inverse', 7, 27);
addToCodeCache('strikethrough', 9, 29);

function codeRegex(captureCodes) {
  return captureCodes ? ANSI_CAPTURE_PATTERN : ANSI_PATTERN;
}

function strlen(value) {
  const plainText = ('' + value).replace(codeRegex(), '');
  return plainText
    .split('\n')
    .reduce((maximum, line) => Math.max(stringWidth(line), maximum), 0);
}

function repeat(value, count) {
  return Array(count + 1).join(value);
}

function pad(value, length, fill, direction) {
  const valueWidth = strlen(value);
  fill = fill || ' ';

  if (length + 1 <= valueWidth) return value;

  const paddingWidth = length - valueWidth;
  switch (direction) {
    case 'left':
      return repeat(fill, paddingWidth) + value;
    case 'center': {
      const rightWidth = Math.ceil(paddingWidth / 2);
      const leftWidth = paddingWidth - rightWidth;
      return repeat(fill, leftWidth) + value + repeat(fill, rightWidth);
    }
    default:
      return value + repeat(fill, paddingWidth);
  }
}

function updateState(state, match) {
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

  const cached = codeCache[match[0]];
  if (cached) state[cached.name] = cached.to;
}

function readState(value) {
  const regex = codeRegex(true);
  const state = {};
  let match = regex.exec(value);
  while (match !== null) {
    updateState(state, match);
    match = regex.exec(value);
  }
  return state;
}

function unwindState(state, value) {
  const foreground = state.lastForegroundAdded;
  const background = state.lastBackgroundAdded;
  delete state.lastForegroundAdded;
  delete state.lastBackgroundAdded;

  Object.keys(state).forEach(name => {
    if (state[name]) value += codeCache[name].off;
  });
  if (foreground && foreground !== '\u001b[39m') value += '\u001b[39m';
  if (background && background !== '\u001b[49m') value += '\u001b[49m';
  return value;
}

function rewindState(state, value) {
  const foreground = state.lastForegroundAdded;
  const background = state.lastBackgroundAdded;
  delete state.lastForegroundAdded;
  delete state.lastBackgroundAdded;

  Object.keys(state).forEach(name => {
    if (state[name]) value = codeCache[name].on + value;
  });
  if (foreground && foreground !== '\u001b[39m') value = foreground + value;
  if (background && background !== '\u001b[49m') value = background + value;
  return value;
}

function truncateWidth(value, desiredLength) {
  if (value.length > strlen(value)) return value.substr(0, desiredLength);
  while (strlen(value) > desiredLength) value = value.slice(0, -1);
  return value;
}

function truncateWidthWithAnsi(value, desiredLength) {
  const ansiRegex = codeRegex(true);
  const plainSegments = value.split(codeRegex());
  let segmentIndex = 0;
  let visibleWidth = 0;
  let result = '';
  let match;
  const state = {};

  while (visibleWidth < desiredLength) {
    match = ansiRegex.exec(value);
    let segment = plainSegments[segmentIndex++];
    if (visibleWidth + strlen(segment) > desiredLength) {
      segment = truncateWidth(segment, desiredLength - visibleWidth);
    }
    result += segment;
    visibleWidth += strlen(segment);

    if (visibleWidth >= desiredLength && !match) break;
    if (match) {
      result += match[0];
      updateState(state, match);
    }
  }
  return unwindState(state, result);
}

function truncate(value, desiredLength, truncationMarker) {
  truncationMarker = truncationMarker || '…';
  if (strlen(value) <= desiredLength) return value;

  const contentWidth = desiredLength - strlen(truncationMarker);
  let result = truncateWidthWithAnsi(value, contentWidth) + truncationMarker;
  if (value.startsWith(RESET) && !result.endsWith(RESET)) result += RESET;
  return result;
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
  options = options || {};
  defaults = defaults || defaultOptions();
  const merged = Object.assign({}, defaults, options);
  merged.chars = Object.assign({}, defaults.chars, options.chars);
  merged.style = Object.assign({}, defaults.style, options.style);
  return merged;
}

function wordWrap(maxLength, input) {
  const parts = input.split(/(\s+)/g);
  const lines = [];
  let line = [];
  let lineLength = 0;
  let separator;

  for (let index = 0; index < parts.length; index += 2) {
    const word = parts[index];
    let newLength = lineLength + strlen(word);
    if (lineLength > 0 && separator) newLength += separator.length;

    if (newLength > maxLength) {
      if (lineLength !== 0) lines.push(line.join(''));
      line = [word];
      lineLength = strlen(word);
    } else {
      line.push(separator || '', word);
      lineLength = newLength;
    }
    separator = parts[index + 1];
  }
  if (lineLength) lines.push(line.join(''));
  return lines;
}

function textWrap(maxLength, input) {
  const lines = [];
  let currentLine = '';

  function add(part, separator) {
    if (currentLine.length && separator) currentLine += separator;
    currentLine += part;
    while (currentLine.length > maxLength) {
      lines.push(currentLine.slice(0, maxLength));
      currentLine = currentLine.slice(maxLength);
    }
  }

  const parts = input.split(/(\s+)/g);
  for (let index = 0; index < parts.length; index += 2) {
    add(parts[index], index && parts[index - 1]);
  }
  if (currentLine.length) lines.push(currentLine);
  return lines;
}

function multiLineWordWrap(maxLength, input, wrapOnWordBoundary = true) {
  const lines = [];
  const wrap = wrapOnWordBoundary ? wordWrap : textWrap;
  input = input.split('\n');
  for (let index = 0; index < input.length; index += 1) {
    lines.push.apply(lines, wrap(maxLength, input[index]));
  }
  return lines;
}

function colorizeLines(lines) {
  let state = {};
  const colorized = [];
  for (const line of lines) {
    const rewoundLine = rewindState(state, line);
    state = readState(rewoundLine);
    colorized.push(unwindState(Object.assign({}, state), rewoundLine));
  }
  return colorized;
}

function hyperlink(url, text) {
  const osc = '\u001b]';
  const bell = '\u0007';
  return [osc, '8', ';', ';', url || text, bell, text, osc, '8', ';', ';', bell].join('');
}

function parseHexValue(value) {
  const [hex] = value.match(/#[0-9a-fA-F]{3,6}/) || ['#000'];
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
