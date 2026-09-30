const stringWidth = require('string-width');

function codeRegex(capture) {
  return capture ? /\u001b\[((?:\d*;){0,5}\d*)m/g : /\u001b\[(?:\d*;){0,5}\d*m/g;
}

function strlen(str) {
  const ansiRegex = codeRegex();
  const stripped = String(str).replace(ansiRegex, '');
  const lines = stripped.split('\n');
  return lines.reduce(function (max, line) {
    return stringWidth(line) > max ? stringWidth(line) : max;
  }, 0);
}

function repeat(str, count) {
  return Array(count + 1).join(str);
}

function pad(str, length, char, alignment) {
  const currentLength = strlen(str);
  if (length - currentLength <= 0) {
    return str;
  }

  const padding = length - currentLength;

  switch (alignment) {
    case 'left': {
      str = repeat(char, padding) + str;
      break;
    }
    case 'center': {
      const left = Math.floor(padding / 2);
      const right = padding - left;
      str = repeat(char, left) + str + repeat(char, right);
      break;
    }
    default: {
      str = str + repeat(char, padding);
      break;
    }
  }

  return str;
}

const codeCache = {};

function addToCodeCache(name, on, to) {
  on = '\u001B[' + on + 'm';
  to = '\u001B[' + to + 'm';
  codeCache[name] = { on, to };
}

addToCodeCache('reset', 0, 0);
addToCodeCache('bold', 1, 22);
addToCodeCache('dim', 2, 22);
addToCodeCache('italic', 3, 23);
addToCodeCache('underline', 4, 24);
addToCodeCache('inverse', 7, 27);
addToCodeCache('hidden', 8, 28);
addToCodeCache('strikethrough', 9, 29);

function updateState(state, match) {
  const code = match[0] ? parseInt(match[0].split(';')[0]) : 0;

  if ((code >= 0 && code <= 9) || (code >= 30 && code <= 37)) {
    state.foreground = match[0];
    return;
  }

  if ((code >= 40 && code <= 47) || (code >= 90 && code <= 97)) {
    state.background = match[0];
    return;
  }

  if (code === 39) {
    for (const key in state) {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        delete state[key];
      }
    }
    return;
  }

  const cacheEntry = codeCache[match[0]];
  if (cacheEntry) {
    state[cacheEntry.on] = cacheEntry.to;
  }
}

function readState(str) {
  const ansiRegex = codeRegex(true);
  let match = ansiRegex.exec(str);
  const state = {};

  while (match !== null) {
    updateState(state, match);
    match = ansiRegex.exec(str);
  }

  return state;
}

function unwindState(state, str) {
  let foreground = state.foreground;
  let background = state.background;

  delete state.foreground;
  delete state.background;

  Object.keys(state).forEach(function (key) {
    if (state[key]) {
      str += codeCache[key].on;
    }
  });

  if (foreground && foreground !== '39') {
    str += foreground;
  }

  if (background && background !== '49') {
    str += background;
  }

  return str;
}

function rewindState(state, str) {
  let foreground = state.foreground;
  let background = state.background;

  delete state.foreground;
  delete state.background;

  Object.keys(state).forEach(function (key) {
    if (state[key]) {
      str = codeCache[key].on + str;
    }
  });

  if (foreground && foreground !== '39') {
    str = foreground + str;
  }

  if (background && background !== '49') {
    str = background + str;
  }

  return str;
}

function truncateWidth(str, desiredLength) {
  if (str.length <= strlen(str)) {
    return str.slice(0, desiredLength);
  }

  while (strlen(str) > desiredLength) {
    str = str.slice(0, -1);
  }

  return str;
}

function truncateWidthWithAnsi(str, desiredLength) {
  const ansiRegex = codeRegex(true);
  const stripped = str.replace(codeRegex());
  let index = 0;
  let width = 0;
  let output = '';
  let match;
  let state = {};

  while (width < desiredLength) {
    match = ansiRegex.exec(str);
    const chunk = stripped[index];
    index++;

    if (width + strlen(chunk) > desiredLength) {
      chunk = truncateWidth(chunk, desiredLength - width);
    }

    output += chunk;
    width += strlen(chunk);

    if (width >= desiredLength) {
      if (!match) {
        break;
      }
    }

    output += match[0];
    updateState(state, match);
  }

  return unwindState(state, output);
}

function truncate(str, length, omission) {
  omission = omission || '\u2026';
  const currentLength = strlen(str);

  if (currentLength <= length) {
    return str;
  }

  length -= strlen(omission);
  let result = truncateWidthWithAnsi(str, length);
  result += omission;

  const newline = '\n';
  if (str.includes(newline) && !result.includes(newline)) {
    result += newline;
  }

  return result;
}

function defaultOptions() {
  const colors = {
    reset: '\u001B[0m',
    bold: '\u001B[1m'
  };

  const chars = {
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
    middle: '\u2502'
  };

  const styles = {
    'padding-left': 1,
    'padding-right': 1,
    head: [colors.reset],
    border: [colors.reset],
    compact: false
  };

  const options = {};
  options.chars = chars;
  options.omission = '\u2026';
  options.rows = [];
  options.columns = [];
  options.headers = [];
  options.footers = [];
  options.styles = styles;
  options.borders = [];

  return options;
}

function mergeOptions(defaults, options) {
  defaults = defaults || {};
  options = options || defaultOptions();

  const merged = Object.assign({}, options, defaults);
  merged.chars = Object.assign({}, options.chars, defaults.chars);
  merged.styles = Object.assign({}, options.styles, defaults.styles);

  return merged;
}

function wordWrap(width, input) {
  const lines = [];
  const chunks = input.split(/(\s+)/g);
  let line = [];
  let lineLength = 0;
  let previousChunk;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    let newLength = lineLength + strlen(chunk);

    if (lineLength > 0 && previousChunk) {
      newLength += previousChunk.length;
    }

    if (newLength > width) {
      if (lineLength > 0) {
        lines.push(line.join(''));
      }
      line = [chunk];
      lineLength = strlen(chunk);
    } else {
      line.push(previousChunk || '', chunk);
      lineLength = newLength;
    }

    previousChunk = chunks[i + 1];
  }

  if (lineLength) {
    lines.push(line.join(''));
  }

  return lines;
}

function textWrap(width, input) {
  const lines = [];
  let line = '';

  function addChunk(chunk, separator) {
    if (line.length && separator) {
      line += separator;
    }
    line += chunk;

    while (line.length > width) {
      lines.push(line.slice(0, width));
      line = line.slice(width);
    }
  }

  const chunks = input.split(/(\s+)/g);

  for (let i = 0; i < chunks.length; i++) {
    addChunk(chunks[i], i && chunks[i - 1]);
  }

  if (line.length) {
    lines.push(line);
  }

  return lines;
}

function multiLineWordWrap(width, input, wrapByWord = true) {
  const lines = [];
  input = input.split('\n');
  const wrapper = wrapByWord ? wordWrap : textWrap;

  for (let i = 0; i < input.length; i++) {
    lines.push(...wrapper(width, input[i]));
  }

  return lines;
}

function colorizeLines(input) {
  let state = {};
  const output = [];

  for (let i = 0; i < input.length; i++) {
    const line = rewindState(state, input[i]);
    state = readState(line);
    const copy = Object.assign({}, state);
    output.push(unwindState(copy, line));
  }

  return output;
}

function hyperlink(url, text) {
  const OSC = '\u001B]';
  const BEL = '\u0007';
  const SEP = ';';

  return [OSC, '8', SEP, SEP, url || text, BEL, text, OSC, '8', SEP, SEP, BEL].join('');
}

function parseHexValue(value) {
  const hexRegex = /#[0-9a-fA-F]{3,6}/;
  const [match] = value.match(hexRegex) || ['#000000'];
  return match;
}

module.exports = {
  strlen,
  repeat,
  pad,
  truncate,
  mergeOptions,
  multiLineWordWrap,
  colorizeLines,
  hyperlink,
  parseHexValue
};
