'use strict';

const stringWidth = require('string-width');

function codeRegex(captureCodes) {
  return captureCodes
    ? /\u001b\[((?:\d*;){0,5}\d*)m/g
    : /\u001b\[(?:\d*;){0,5}\d*m/g;
}

function strlen(value) {
  const plainText = String(value).replace(codeRegex(), '');
  return plainText
    .split('\n')
    .reduce((longest, line) => Math.max(longest, stringWidth(line)), 0);
}

function repeat(value, count) {
  return Array(count + 1).join(value);
}

function pad(value, width, fill, alignment) {
  const valueWidth = strlen(value);
  if (width <= valueWidth) return value;

  const remaining = width - valueWidth;
  switch (alignment) {
    case 'right':
      return repeat(fill, remaining) + value;
    case 'center': {
      const right = Math.ceil(remaining / 2);
      const left = remaining - right;
      return repeat(fill, left) + value + repeat(fill, right);
    }
    default:
      return value + repeat(fill, remaining);
  }
}

const codeCache = {};

function addToCodeCache(name, onCode, offCode) {
  const on = `\u001b[${onCode}m`;
  const off = `\u001b[${offCode}m`;
  codeCache[name] = { on, off };
  codeCache[on] = { name, to: true };
  codeCache[off] = { name, to: false };
}

addToCodeCache('bold', 1, 22);
addToCodeCache('italic', 3, 23);
addToCodeCache('underline', 4, 24);
addToCodeCache('inverse', 7, 27);
addToCodeCache('strikethrough', 9, 29);

const FOREGROUND = 'foreground-color';
const BACKGROUND = 'background-color';

function updateState(state, match) {
  const code = match[1] ? parseInt(match[1].split(';')[0], 10) : 0;

  if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) {
    state[FOREGROUND] = match[0];
    return;
  }
  if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107)) {
    state[BACKGROUND] = match[0];
    return;
  }
  if (code === 0) {
    for (const name of Object.keys(state)) delete state[name];
    return;
  }

  const transition = codeCache[match[0]];
  if (transition) state[transition.name] = transition.to;
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
  const foreground = state[FOREGROUND];
  const background = state[BACKGROUND];
  delete state[FOREGROUND];
  delete state[BACKGROUND];

  for (const name of Object.keys(state)) {
    if (state[name]) value += codeCache[name].off;
  }
  if (foreground && foreground !== '\u001b[39m') value += '\u001b[39m';
  if (background && background !== '\u001b[49m') value += '\u001b[49m';
  return value;
}

function rewindState(state, value) {
  const foreground = state[FOREGROUND];
  const background = state[BACKGROUND];
  delete state[FOREGROUND];
  delete state[BACKGROUND];

  for (const name of Object.keys(state)) {
    if (state[name]) value = codeCache[name].on + value;
  }
  if (foreground && foreground !== '\u001b[39m') value = foreground + value;
  if (background && background !== '\u001b[49m') value = background + value;
  return value;
}

function truncateWidth(value, desiredWidth) {
  while (strlen(value) > desiredWidth) value = value.slice(0, -1);
  return value;
}

function truncateWidthWithAnsi(value, desiredWidth) {
  const ansiRegex = codeRegex(true);
  const textSegments = value.split(codeRegex());
  const state = {};
  let segmentIndex = 0;
  let currentWidth = 0;
  let result = '';

  while (currentWidth < desiredWidth) {
    const match = ansiRegex.exec(value);
    let segment = textSegments[segmentIndex++];
    if (currentWidth + strlen(segment) > desiredWidth) {
      segment = truncateWidth(segment, desiredWidth - currentWidth);
    }
    result += segment;
    currentWidth += strlen(segment);

    if (currentWidth >= desiredWidth || !match) break;
    result += match[0];
    updateState(state, match);
  }

  return unwindState(state, result);
}

function truncate(value, desiredWidth, truncationMarker) {
  truncationMarker = truncationMarker || '…';
  if (strlen(value) <= desiredWidth) return value;

  const contentWidth = desiredWidth - strlen(truncationMarker);
  let result = truncateWidthWithAnsi(value, contentWidth) + truncationMarker;
  const reset = '\u001b[0m';
  if (value.includes(reset) && !result.includes(reset)) result += reset;
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
  const lines = [];
  const parts = input.split(/(\s+)/g);
  let line = [];
  let lineLength = 0;
  let whitespace;

  for (let index = 0; index < parts.length; index += 2) {
    const word = parts[index];
    let newLength = lineLength + strlen(word);
    if (lineLength > 0 && whitespace) newLength += whitespace.length;

    if (newLength > maxLength) {
      if (lineLength > 0) lines.push(line.join(''));
      line = [word];
      lineLength = strlen(word);
    } else {
      line.push(whitespace || '', word);
      lineLength = newLength;
    }
    whitespace = parts[index + 1];
  }

  if (lineLength) lines.push(line.join(''));
  return lines;
}

function textWrap(maxLength, input) {
  const lines = [];
  let line = '';

  function append(text, whitespace) {
    if (line.length && whitespace) line += whitespace;
    line += text;
    while (line.length > maxLength) {
      lines.push(line.slice(0, maxLength));
      line = line.slice(maxLength);
    }
  }

  const parts = input.split(/(\s+)/g);
  for (let index = 0; index < parts.length; index += 2) {
    append(parts[index], index ? parts[index - 1] : undefined);
  }
  if (line.length) lines.push(line);
  return lines;
}

function multiLineWordWrap(maxLength, input, wrapOnWordBoundary = true) {
  const lines = [];
  const wrap = wrapOnWordBoundary ? wordWrap : textWrap;
  for (const sourceLine of input.split('\n')) {
    lines.push(...wrap(maxLength, sourceLine));
  }
  return lines;
}

function colorizeLines(lines) {
  let state = {};
  const result = [];
  for (const line of lines) {
    const continuedLine = rewindState(state, line);
    state = readState(continuedLine);
    result.push(unwindState(Object.assign({}, state), continuedLine));
  }
  return result;
}

function hyperlink(url, text) {
  const escape = '\u001b]';
  const bell = '\u0007';
  return [escape, '8', ';', ';', url || text, bell, text, escape, '8', ';', ';', bell].join('');
}

function parseHexValue(value) {
  const [hex] = value.match(/#[0-9a-fA-F]{3,6}/) || ['#000000'];
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
