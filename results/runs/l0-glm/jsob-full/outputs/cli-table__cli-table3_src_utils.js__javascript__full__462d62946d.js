var stringWidth = require('string-width');

function codeRegex(capture) {
  return capture
    ? /\u001b\[((?:\d*;){0,5}\d*)m/g
    : /\u001b\[(?:\d*;){0,5}\d*m/g;
}

function strlen(str) {
  let code = codeRegex(false);
  let stripped = ('' + str).replace(code, '');
  let lines = stripped.split('\n');
  return lines.reduce(function (acc, line) {
    return Math.max(stringWidth(line), acc);
  }, 0);
}

function repeat(str, num) {
  return Array(num + 1).join(str);
}

function pad(str, len, padStr, type) {
  let strLen = strlen(str);
  if (len - 1 >= strLen) {
    let padLen = len - strLen;
    switch (type) {
      case 'left': {
        str = repeat(padStr, padLen) + str;
        break;
      }
      case 'center': {
        let halfLen = Math.floor(padLen / 2);
        let remainder = padLen - halfLen;
        str = repeat(padStr, remainder) + str + repeat(padStr, halfLen);
        break;
      }
      case 'right':
      default: {
        str = str + repeat(padStr, padLen);
        break;
      }
    }
  }
  return str;
}

var codeCache = {};

function addToCodeCache(name, on, off) {
  on = '\x1B[' + on + 'm';
  off = '\x1B[' + off + 'm';
  const entry = {};
  entry.on = on;
  entry.off = off;
  codeCache[name] = entry;
  const onEntry = {};
  onEntry.from = name;
  onEntry.to = true;
  codeCache[on] = onEntry;
  const offEntry = {};
  offEntry.from = name;
  offEntry.to = false;
  codeCache[off] = offEntry;
}

addToCodeCache('reset', 0, 0);
addToCodeCache('bold', 1, 22);
addToCodeCache('italic', 3, 23);
addToCodeCache('underline', 4, 24);
addToCodeCache('inverse', 7, 27);
addToCodeCache('strikethrough', 9, 29);

function updateState(state, match) {
  let code = match[1] ? parseInt(match[1].split(';')[0]) : 0;
  if ((code >= 30 && code <= 39) || (code >= 90 && code <= 97)) {
    state['foreground-color'] = match[0];
    return;
  }
  if ((code >= 40 && code <= 49) || (code >= 100 && code <= 107)) {
    state['background-color'] = match[0];
    return;
  }
  if (code === 0) {
    for (let key in state) {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        delete state[key];
      }
    }
    return;
  }
  let cacheEntry = codeCache[match[0]];
  if (cacheEntry) {
    state[cacheEntry.from] = cacheEntry.to;
  }
}

function readState(str) {
  let regex = codeRegex(true);
  let match = regex.exec(str);
  let state = {};
  while (match !== null) {
    updateState(state, match);
    match = regex.exec(str);
  }
  return state;
}

function unwindState(state, ret) {
  let on = state['foreground-color'];
  let off = state['background-color'];
  delete state['foreground-color'];
  delete state['background-color'];
  Object.keys(state).forEach(function (key) {
    if (state[key]) {
      ret += codeCache[key].off;
    }
  });
  if (on && on !== '\x1B[39m') {
    ret += '\x1B[39m';
  }
  if (off && off !== '\x1B[49m') {
    ret += '\x1B[49m';
  }
  return ret;
}

function rewindState(state, ret) {
  let on = state['foreground-color'];
  let off = state['background-color'];
  delete state['foreground-color'];
  delete state['background-color'];
  Object.keys(state).forEach(function (key) {
    if (state[key]) {
      ret = codeCache[key].on + ret;
    }
  });
  if (on && on !== '\x1B[39m') {
    ret = on + ret;
  }
  if (off && off !== '\x1B[49m') {
    ret = off + ret;
  }
  return ret;
}

function truncateWidth(str, targetWidth) {
  if (str.length > strlen(str)) {
    return str.slice(0, targetWidth);
  }
  while (strlen(str) > targetWidth) {
    str = str.slice(0, -1);
  }
  return str;
}

function truncateWidthWithAnsi(str, targetWidth) {
  let stateRegex = codeRegex(true);
  let codeRegexMatches = str.match(codeRegex(false));
  let numMatches = 0;
  let pos = 0;
  let ret = '';
  let match;
  let state = {};
  while (pos < targetWidth) {
    match = stateRegex.exec(str);
    let chunk = codeRegexMatches[numMatches];
    numMatches++;
    if (pos + strlen(chunk) > targetWidth) {
      chunk = truncateWidth(chunk, targetWidth - pos);
    }
    ret += chunk;
    pos += strlen(chunk);
    if (pos >= targetWidth) {
      if (!match) {
        break;
      }
      ret += match[0];
      updateState(state, match);
    }
  }
  return unwindState(state, ret);
}

function truncate(str, targetWidth, mark) {
  mark = mark || '…';
  let strLen = strlen(str);
  if (strLen <= targetWidth) {
    return str;
  }
  targetWidth -= strlen(mark);
  let truncated = truncateWidthWithAnsi(str, targetWidth);
  truncated += mark;
  const resetCode = '\x1B[0m';
  if (str.includes(resetCode) && !truncated.includes(resetCode)) {
    truncated += resetCode;
  }
  return truncated;
}

function defaultOptions() {
  const borderStyle = {};
  borderStyle.top = '─';
  borderStyle['top-mid'] = '┬';
  borderStyle['top-left'] = '┌';
  borderStyle['top-right'] = '┐';
  borderStyle.bottom = '─';
  borderStyle['bottom-mid'] = '┴';
  borderStyle['bottom-left'] = '└';
  borderStyle['bottom-right'] = '┘';
  borderStyle.left = '│';
  borderStyle['left-mid'] = '├';
  borderStyle.mid = '─';
  borderStyle['mid-mid'] = '┼';
  borderStyle.right = '│';
  borderStyle['right-mid'] = '┤';
  borderStyle.middle = '│';

  const tableOptions = {};
  tableOptions['padding-left'] = 1;
  tableOptions['padding-right'] = 1;
  tableOptions['chars'] = [borderStyle['top-left']];
  tableOptions['style'] = [borderStyle['top-right']];
  tableOptions['head'] = false;

  const options = {};
  options.border = borderStyle;
  options.truncate = '…';
  options.columns = [];
  options.colAligns = [];
  options.rowAligns = [];
  options.style = [];
  options.table = tableOptions;
  options.filter = [];
  return options;
}

function mergeOptions(options, defaults) {
  options = options || {};
  defaults = defaults || defaultOptions();
  let merged = Object.assign({}, defaults, options);
  merged.border = Object.assign({}, defaults.border, options.border);
  merged.style = Object.assign({}, defaults.style, options.style);
  return merged;
}

function wordWrap(maxWidth, str) {
  let lines = [];
  let tokens = str.split(/(\s+)/g);
  let line = [];
  let lineWidth = 0;
  let prevWhitespace;
  for (let i = 0; i < tokens.length; i += 2) {
    let token = tokens[i];
    let proposedWidth = lineWidth + strlen(token);
    if (lineWidth > 0 && prevWhitespace) {
      proposedWidth += prevWhitespace.length;
    }
    if (proposedWidth > maxWidth) {
      if (lineWidth > 0) {
        lines.push(line.join(''));
      }
      line = [token];
      lineWidth = strlen(token);
    } else {
      line.push(prevWhitespace || '', token);
      lineWidth = proposedWidth;
    }
    prevWhitespace = tokens[i + 1];
  }
  if (lineWidth) {
    lines.push(line.join(''));
  }
  return lines;
}

function textWrap(maxWidth, str) {
  let lines = [];
  let current = '';
  function append(str, whitespace) {
    if (current.length && whitespace) {
      current += whitespace;
    }
    current += str;
    while (current.length > maxWidth) {
      lines.push(current.slice(0, maxWidth));
      current = current.slice(maxWidth);
    }
  }
  let tokens = str.split(/(\s+)/g);
  for (let i = 0; i < tokens.length; i++) {
    append(tokens[i], i && tokens[i - 1]);
  }
  if (current.length) {
    lines.push(current);
  }
  return lines;
}

function multiLineWordWrap(maxWidth, str, useWordWrap = true) {
  let lines = [];
  str = str.split('\n');
  const wrapFn = useWordWrap ? wordWrap : textWrap;
  for (let i = 0; i < str.length; i++) {
    lines.push.apply(lines, wrapFn(maxWidth, str[i]));
  }
  return lines;
}

function colorizeLines(inputLines) {
  let state = {};
  let outputLines = [];
  for (let i = 0; i < inputLines.length; i++) {
    let line = rewindState(state, inputLines[i]);
    state = readState(line);
    let lineState = Object.assign({}, state);
    outputLines.push(unwindState(lineState, line));
  }
  return outputLines;
}

function hyperlink(text, url) {
  const OSC = '\x1B]';
  const BEL = '\x07';
  const SEP = ';';
  return [
    OSC, '8', SEP, SEP, (text || url), BEL,
    url,
    OSC, '8', SEP, SEP, BEL
  ].join('');
}

function parseHexValue(str) {
  const DEFAULT_HEX = '#ffffff';
  const hexRegex = /#[0-9a-fA-F]{3,6}/;
  const [match] = str.match(hexRegex) || [DEFAULT_HEX];
  return match;
}

const exports = {};
exports.strlen = strlen;
exports.repeat = repeat;
exports.pad = pad;
exports.truncate = truncate;
exports.mergeOptions = mergeOptions;
exports.multiLineWordWrap = multiLineWordWrap;
exports.colorizeLines = colorizeLines;
exports.hyperlink = hyperlink;
exports.parseHexValue = parseHexValue;
module.exports = exports;
