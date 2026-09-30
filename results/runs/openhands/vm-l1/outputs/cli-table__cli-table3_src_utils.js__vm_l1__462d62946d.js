const stringWidth = require('string-width');

function codeRegex(captureCodes) {
  return captureCodes
    ? /\u001b\[((?:\d*;){0,5}\d*)m/g
    : /\u001b\[(?:\d*;){0,5}\d*m/g;
}

function strlen(value) {
  return value
    .replace(codeRegex(), '')
    .split('\n')
    .reduce((maximum, line) => Math.max(maximum, stringWidth(line)), 0);
}

function repeat(value, count) {
  return Array(count + 1).join(value);
}

function pad(value, width, character, alignment) {
  const valueWidth = strlen(value);
  if (width < valueWidth) return value;

  const remaining = width - valueWidth;
  if (alignment === 'right') {
    return repeat(character, remaining) + value;
  }
  if (alignment === 'center') {
    const right = Math.ceil(remaining / 2);
    const left = remaining - right;
    return repeat(character, left) + value + repeat(character, right);
  }
  return value + repeat(character, remaining);
}

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
    for (const key of Object.keys(state)) delete state[key];
    return;
  }

  const change = codeCache[match[0]];
  if (change) state[change.set] = change.to;
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
  const lastBackgroundAdded = state.lastBackgroundAdded;
  const lastForegroundAdded = state.lastForegroundAdded;
  delete state.lastBackgroundAdded;
  delete state.lastForegroundAdded;

  for (const key of Object.keys(state)) {
    if (state[key]) value += codeCache[key].off;
  }
  if (lastBackgroundAdded && lastBackgroundAdded !== '\u001b[49m') {
    value += '\u001b[49m';
  }
  if (lastForegroundAdded && lastForegroundAdded !== '\u001b[39m') {
    value += '\u001b[39m';
  }
  return value;
}

function rewindState(state, value) {
  const lastBackgroundAdded = state.lastBackgroundAdded;
  const lastForegroundAdded = state.lastForegroundAdded;
  delete state.lastBackgroundAdded;
  delete state.lastForegroundAdded;

  for (const key of Object.keys(state)) {
    if (state[key]) value = codeCache[key].on + value;
  }
  if (lastBackgroundAdded && lastBackgroundAdded !== '\u001b[49m') {
    value = lastBackgroundAdded + value;
  }
  if (lastForegroundAdded && lastForegroundAdded !== '\u001b[39m') {
    value = lastForegroundAdded + value;
  }
  return value;
}

function truncateWidth(value, width) {
  if (value.length === strlen(value)) return value.substr(0, width);
  while (strlen(value) > width) value = value.slice(0, -1);
  return value;
}

function truncateWidthWithAnsi(value, width) {
  const regex = codeRegex(true);
  const chunks = value.split(codeRegex());
  let chunkIndex = 0;
  let visibleWidth = 0;
  let result = '';
  let state = {};

  while (visibleWidth < width) {
    const match = regex.exec(value);
    let chunk = chunks[chunkIndex++];
    if (visibleWidth + strlen(chunk) > width) {
      chunk = truncateWidth(chunk, width - visibleWidth);
    }
    result += chunk;
    visibleWidth += strlen(chunk);

    if (visibleWidth < width) {
      if (!match) break;
      result += match[0];
      updateState(state, match);
    }
  }

  return unwindState(state, result);
}

function truncate(value, width, truncationCharacter) {
  truncationCharacter = truncationCharacter || '…';
  if (strlen(value) <= width) return value;

  const contentWidth = width - strlen(truncationCharacter);
  let result = truncateWidthWithAnsi(value, contentWidth) + truncationCharacter;
  const hyperlinkClose = '\u001b]8;;\u0007';
  if (value.includes(hyperlinkClose) && !result.includes(hyperlinkClose)) {
    result += hyperlinkClose;
  }
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
  const result = Object.assign({}, defaults, options);
  result.chars = Object.assign({}, defaults.chars, options.chars);
  result.style = Object.assign({}, defaults.style, options.style);
  return result;
}

function wordWrap(maxLength, input) {
  const lines = [];
  const words = input.split(/(\s+)/g);
  let line = [];
  let lineLength = 0;
  let whitespace;

  for (let index = 0; index < words.length; index += 2) {
    const word = words[index];
    let nextLength = lineLength + strlen(word);
    if (lineLength > 0 && whitespace) nextLength += whitespace.length;

    if (nextLength > maxLength) {
      if (lineLength !== 0) lines.push(line.join(''));
      line = [word];
      lineLength = strlen(word);
    } else {
      line.push(whitespace || '', word);
      lineLength = nextLength;
    }

    whitespace = words[index + 1];
  }

  if (lineLength) lines.push(line.join(''));
  return lines;
}

function textWrap(maxLength, input) {
  const lines = [];
  let line = '';

  function addWord(word, whitespace) {
    if (line.length || whitespace) line += whitespace;
    line += word;
    while (line.length > maxLength) {
      lines.push(line.slice(0, maxLength));
      line = line.slice(maxLength);
    }
  }

  const words = input.split(/(\s+)/g);
  for (let index = 0; index < words.length; index += 2) {
    addWord(words[index], index && words[index - 1]);
  }
  if (line.length) lines.push(line);
  return lines;
}

function multiLineWordWrap(maxLength, input, wrapOnWordBoundary) {
  if (wrapOnWordBoundary === undefined) wrapOnWordBoundary = true;
  const lines = [];
  const inputLines = input.split('\n');
  const wrap = wrapOnWordBoundary ? wordWrap : textWrap;
  for (const line of inputLines) lines.push(...wrap(maxLength, line));
  return lines;
}

function colorizeLines(lines) {
  let state = {};
  const result = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = rewindState(state, lines[index]);
    state = readState(line);
    result.push(unwindState(Object.assign({}, state), line));
  }
  return result;
}

function hyperlink(url, text) {
  return `\u001b]8;;${url || text}\u0007${text}\u001b]8;;\u0007`;
}

function parseHexValue(value) {
  return (value.match(/#[0-9a-fA-F]{3,6}/) || ['#000'])[0];
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
