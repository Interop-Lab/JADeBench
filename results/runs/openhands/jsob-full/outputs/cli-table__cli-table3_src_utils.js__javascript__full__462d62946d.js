const stringWidth = require('string-width');

function codeRegex(captureCodes) {
  return captureCodes
    ? /\u001b\[((?:\d*;){0,5}\d*)m/g
    : /\u001b\[(?:\d*;){0,5}\d*m/g;
}

function strlen(value) {
  const plainText = ('' + value).replace(codeRegex(), '');
  return plainText
    .split('\n')
    .reduce((maximum, line) => Math.max(maximum, stringWidth(line)), 0);
}

function repeat(value, count) {
  return Array(count + 1).join(value);
}

function pad(value, width, fill, alignment) {
  const valueWidth = strlen(value);

  if (width + 1 >= valueWidth) {
    const paddingWidth = width - valueWidth;

    switch (alignment) {
      case 'right':
        value = repeat(fill, paddingWidth) + value;
        break;
      case 'center': {
        const rightPadding = Math.ceil(paddingWidth / 2);
        const leftPadding = paddingWidth - rightPadding;
        value = repeat(fill, leftPadding) + value + repeat(fill, rightPadding);
        break;
      }
      default:
        value += repeat(fill, paddingWidth);
        break;
    }
  }

  return value;
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
    for (const key in state) {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        delete state[key];
      }
    }
    return;
  }

  const cachedCode = codeCache[match[0]];
  if (cachedCode) {
    state[cachedCode.set] = cachedCode.to;
  }
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

  Object.keys(state).forEach((name) => {
    if (state[name]) {
      value += codeCache[name].off;
    }
  });

  if (lastBackgroundAdded && lastBackgroundAdded != '\u001b[49m') {
    value += '\u001b[49m';
  }
  if (lastForegroundAdded && lastForegroundAdded != '\u001b[39m') {
    value += '\u001b[39m';
  }

  return value;
}

function rewindState(state, value) {
  const lastBackgroundAdded = state.lastBackgroundAdded;
  const lastForegroundAdded = state.lastForegroundAdded;

  delete state.lastBackgroundAdded;
  delete state.lastForegroundAdded;

  Object.keys(state).forEach((name) => {
    if (state[name]) {
      value = codeCache[name].on + value;
    }
  });

  if (lastBackgroundAdded && lastBackgroundAdded != '\u001b[49m') {
    value = lastBackgroundAdded + value;
  }
  if (lastForegroundAdded && lastForegroundAdded != '\u001b[39m') {
    value = lastForegroundAdded + value;
  }

  return value;
}

function truncateWidth(value, width) {
  if (value.length === strlen(value)) {
    return value.substr(0, width);
  }

  while (strlen(value) > width) {
    value = value.slice(0, -1);
  }

  return value;
}

function truncateWidthWithAnsi(value, width) {
  const ansiRegex = codeRegex(true);
  const plainSegments = value.split(codeRegex());
  const state = {};
  let segmentIndex = 0;
  let currentWidth = 0;
  let result = '';

  while (currentWidth < width) {
    const match = ansiRegex.exec(value);
    let segment = plainSegments[segmentIndex];
    segmentIndex++;

    if (currentWidth + strlen(segment) > width) {
      segment = truncateWidth(segment, width - currentWidth);
    }

    result += segment;
    currentWidth += strlen(segment);

    if (currentWidth < width) {
      if (!match) {
        break;
      }
      result += match[0];
      updateState(state, match);
    }
  }

  return unwindState(state, result);
}

function truncate(value, width, omission) {
  omission = omission || '\u2026';

  if (strlen(value) <= width) {
    return value;
  }

  width -= strlen(omission);
  let result = truncateWidthWithAnsi(value, width) + omission;
  const closeHyperlink = '\u001b]8;;\u0007';

  if (value.includes(closeHyperlink) && !result.includes(closeHyperlink)) {
    result += closeHyperlink;
  }

  return result;
}

function defaultOptions() {
  return {
    chars: {
      top: '\u2500',
      'top-mid': '\u252c',
      'top-left': '\u250c',
      'top-right': '\u2510',
      bottom: '\u2500',
      'bottom-mid': '\u2534',
      'bottom-left': '\u2514',
      'bottom-right': '\u2518',
      left: '\u2502',
      'left-mid': '\u251c',
      mid: '\u2500',
      'mid-mid': '\u253c',
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

function wordWrap(width, value) {
  const lines = [];
  const tokens = value.split(/(\s+)/g);
  let line = [];
  let lineWidth = 0;
  let separator;

  for (let index = 0; index < tokens.length; index += 2) {
    const word = tokens[index];
    let nextWidth = lineWidth + strlen(word);

    if (lineWidth > 0 && separator) {
      nextWidth += separator.length;
    }

    if (nextWidth > width) {
      if (lineWidth !== 0) {
        lines.push(line.join(''));
      }
      line = [word];
      lineWidth = strlen(word);
    } else {
      line.push(separator || '', word);
      lineWidth = nextWidth;
    }

    separator = tokens[index + 1];
  }

  if (lineWidth) {
    lines.push(line.join(''));
  }

  return lines;
}

function textWrap(width, value) {
  const lines = [];
  let line = '';

  function append(word, separator) {
    if (line.length && separator) {
      line += separator;
    }
    line += word;

    while (line.length > width) {
      lines.push(line.slice(0, width));
      line = line.slice(width);
    }
  }

  const tokens = value.split(/(\s+)/g);
  for (let index = 0; index < tokens.length; index += 2) {
    append(tokens[index], index && tokens[index - 1]);
  }

  if (line.length) {
    lines.push(line);
  }

  return lines;
}

function multiLineWordWrap(width, value, preserveWords = true) {
  const lines = [];
  const wrap = preserveWords ? wordWrap : textWrap;

  value = value.split('\n');
  for (let index = 0; index < value.length; index++) {
    lines.push.apply(lines, wrap(width, value[index]));
  }

  return lines;
}

function colorizeLines(lines) {
  let state = {};
  const colorized = [];

  for (let index = 0; index < lines.length; index++) {
    const line = rewindState(state, lines[index]);
    state = readState(line);
    colorized.push(unwindState(Object.assign({}, state), line));
  }

  return colorized;
}

function hyperlink(url, text) {
  const escape = '\u001b]';
  const bell = '\u0007';
  const separator = ';';

  return [
    escape,
    '8',
    separator,
    separator,
    url || text,
    bell,
    text,
    escape,
    '8',
    separator,
    separator,
    bell,
  ].join('');
}

function parseHexValue(value) {
  const hexPattern = /#[0-9a-fA-F]{3,6}/;
  const [hexValue] = value.match(hexPattern) || ['#000'];
  return hexValue;
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
