const stringWidth = require('string-width');

const ANSI_PATTERN = /\u001b\[(?:\d*;){0,5}\d*m/g;
const ANSI_CAPTURE_PATTERN = /\u001b\[((?:\d*;){0,5}\d*)m/g;
const DEFAULT_FOREGROUND = '\u001b[39m';
const DEFAULT_BACKGROUND = '\u001b[49m';
const HYPERLINK_END = '\u001b]8;;\u0007';

const codeCache = {};

function addToCodeCache(name, onCode, offCode) {
  const on = `\u001b[${onCode}m`;
  const off = `\u001b[${offCode}m`;
  codeCache[on] = { set: name, to: true };
  codeCache[off] = { set: name, to: false };
  codeCache[name] = { on, off };
}

addToCodeCache('bold', 1, 22);
addToCodeCache('italics', 3, 23);
addToCodeCache('underline', 4, 24);
addToCodeCache('inverse', 7, 27);
addToCodeCache('strikethrough', 9, 29);

function strlen(value) {
  const plainText = String(value).replace(ANSI_PATTERN, '');
  return plainText.split('\n').reduce((maximum, line) => {
    return Math.max(maximum, stringWidth(line));
  }, 0);
}

function repeat(value, count) {
  return Array(count + 1).join(value);
}

function pad(value, length, fill, alignment) {
  const currentLength = strlen(value);
  if (length < currentLength) return value;

  const remaining = length - currentLength;
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

function updateState(state, match) {
  const code = match[1] ? parseInt(match[1].split(';')[0], 10) : 0;

  if ((code >= 30 && code <= 39) || (code >= 90 && code <= 97)) {
    state.lastForegroundAdded = match[0];
    return;
  }
  if ((code >= 40 && code <= 49) || (code >= 100 && code <= 107)) {
    state.lastBackgroundAdded = match[0];
    return;
  }
  if (code === 0) {
    for (const key of Object.keys(state)) delete state[key];
    return;
  }

  const cachedCode = codeCache[match[0]];
  if (cachedCode) state[cachedCode.set] = cachedCode.to;
}

function readState(value) {
  const state = {};
  const pattern = new RegExp(ANSI_CAPTURE_PATTERN.source, 'g');
  let match = pattern.exec(value);
  while (match !== null) {
    updateState(state, match);
    match = pattern.exec(value);
  }
  return state;
}

function unwindState(state, value) {
  const background = state.lastBackgroundAdded;
  const foreground = state.lastForegroundAdded;
  delete state.lastBackgroundAdded;
  delete state.lastForegroundAdded;

  for (const key of Object.keys(state)) {
    if (state[key]) value += codeCache[key].off;
  }
  if (background && background !== DEFAULT_BACKGROUND) value += DEFAULT_BACKGROUND;
  if (foreground && foreground !== DEFAULT_FOREGROUND) value += DEFAULT_FOREGROUND;
  return value;
}

function rewindState(state, value) {
  const background = state.lastBackgroundAdded;
  const foreground = state.lastForegroundAdded;
  delete state.lastBackgroundAdded;
  delete state.lastForegroundAdded;

  for (const key of Object.keys(state)) {
    if (state[key]) value = codeCache[key].on + value;
  }
  if (background && background !== DEFAULT_BACKGROUND) value = background + value;
  if (foreground && foreground !== DEFAULT_FOREGROUND) value = foreground + value;
  return value;
}

function truncateWidth(value, desiredLength) {
  if (value.length === strlen(value)) return value.substr(0, desiredLength);
  while (strlen(value) > desiredLength) value = value.slice(0, -1);
  return value;
}

function truncateWidthWithAnsi(value, desiredLength) {
  const ansiPattern = new RegExp(ANSI_CAPTURE_PATTERN.source, 'g');
  const textSegments = value.split(ANSI_PATTERN);
  const state = {};
  let segmentIndex = 0;
  let visibleLength = 0;
  let result = '';

  while (visibleLength < desiredLength) {
    const ansiMatch = ansiPattern.exec(value);
    let segment = textSegments[segmentIndex++];
    if (visibleLength + strlen(segment) > desiredLength) {
      segment = truncateWidth(segment, desiredLength - visibleLength);
    }
    result += segment;
    visibleLength += strlen(segment);

    if (visibleLength < desiredLength) {
      if (!ansiMatch) break;
      result += ansiMatch[0];
      updateState(state, ansiMatch);
    }
  }

  return unwindState(state, result);
}

function truncate(value, desiredLength, truncationMarker) {
  const marker = truncationMarker || '\u2026';
  if (strlen(value) <= desiredLength) return value;

  let result = truncateWidthWithAnsi(value, desiredLength - strlen(marker)) + marker;
  if (value.includes(HYPERLINK_END) && !result.includes(HYPERLINK_END)) {
    result += HYPERLINK_END;
  }
  return result;
}

function defaultOptions() {
  return {
    chars: {
      top: '\u2500',
      'top-mid': '\u252C',
      'top-left': '\u250C',
      'top-right': '\u2510',
      bottom: '\u2500',
      'bottom-mid': '\u2534',
      'bottom-left': '\u2514',
      'bottom-right': '\u2518',
      left: '\u2502',
      'left-mid': '\u251C',
      mid: '\u2500',
      'mid-mid': '\u253C',
      right: '\u2502',
      'right-mid': '\u2524',
      middle: '\u2502',
    },
    truncate: '\u2026',
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

function wordWrap(width, input) {
  const lines = [];
  const tokens = input.split(/(\s+)/g);
  let currentLine = [];
  let currentLength = 0;
  let whitespace;

  for (let index = 0; index < tokens.length; index += 2) {
    const word = tokens[index];
    let nextLength = currentLength + strlen(word);
    if (currentLength > 0 && whitespace) nextLength += whitespace.length;

    if (nextLength > width) {
      if (currentLength !== 0) lines.push(currentLine.join(''));
      currentLine = [word];
      currentLength = strlen(word);
    } else {
      currentLine.push(whitespace || '', word);
      currentLength = nextLength;
    }
    whitespace = tokens[index + 1];
  }

  if (currentLength) lines.push(currentLine.join(''));
  return lines;
}

function textWrap(width, input) {
  const lines = [];
  let currentLine = '';

  function append(word, whitespace) {
    if (currentLine.length && whitespace) currentLine += whitespace;
    currentLine += word;
    while (currentLine.length > width) {
      lines.push(currentLine.slice(0, width));
      currentLine = currentLine.slice(width);
    }
  }

  const tokens = input.split(/(\s+)/g);
  for (let index = 0; index < tokens.length; index += 2) {
    append(tokens[index], index && tokens[index - 1]);
  }
  if (currentLine.length) lines.push(currentLine);
  return lines;
}

function multiLineWordWrap(width, input, wrapOnWords = true) {
  const lines = [];
  const wrap = wrapOnWords ? wordWrap : textWrap;
  for (const sourceLine of input.split('\n')) {
    lines.push(...wrap(width, sourceLine));
  }
  return lines;
}

function colorizeLines(lines) {
  let state = {};
  const result = [];
  for (const line of lines) {
    const rewoundLine = rewindState(state, line);
    state = readState(rewoundLine);
    result.push(unwindState({ ...state }, rewoundLine));
  }
  return result;
}

function hyperlink(url, text) {
  const escape = '\u001b]';
  const separator = ';';
  const bell = '\u0007';
  return [escape, '8', separator, separator, url || text, bell, text, escape, '8', separator, separator, bell].join('');
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
