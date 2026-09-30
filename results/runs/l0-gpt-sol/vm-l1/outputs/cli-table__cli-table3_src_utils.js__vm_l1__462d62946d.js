'use strict';

const stringWidthModule = require('string-width');
const stringWidth =
  typeof stringWidthModule === 'function'
    ? stringWidthModule
    : stringWidthModule.default;

const ANSI_PATTERN =
  '[\\u001B\\u009B](?:\\][^\\u0007]*(?:\\u0007|\\u001B\\\\)|' +
  '[[\\]()#;?]*(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d/#&.:=?%@~_]+)*)?' +
  '\\u0007|(?:(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~])))';

function codeRegex(capture) {
  return new RegExp(capture ? `(${ANSI_PATTERN})` : ANSI_PATTERN, 'g');
}

function stripAnsi(value) {
  return String(value).replace(codeRegex(false), '');
}

function strlen(value) {
  return stringWidth(stripAnsi(value));
}

function repeat(value, count) {
  count = Math.max(0, Number(count) || 0);
  return String(value).repeat(count);
}

function pad(value, width, padding, alignment) {
  let text = String(value);
  const missing = Math.max(0, Number(width) - strlen(text));

  if (!missing) {
    return text;
  }

  padding = padding == null ? ' ' : String(padding);
  if (!padding) {
    padding = ' ';
  }

  const makePadding = length => {
    let result = '';
    while (strlen(result) < length) {
      result += padding;
    }
    return truncateWidth(result, length);
  };

  switch (alignment) {
    case 'left':
      return text + makePadding(missing);

    case 'center':
    case 'centre': {
      const left = Math.floor(missing / 2);
      const right = missing - left;
      return makePadding(left) + text + makePadding(right);
    }

    case 'right':
    default:
      return makePadding(missing) + text;
  }
}

const codeCache = Object.create(null);

function addToCodeCache(name, open, close) {
  codeCache[name] = {
    open,
    close,
    openCode: `\u001b[${open}m`,
    closeCode: `\u001b[${close}m`
  };
}

addToCodeCache('bold', 1, 22);
addToCodeCache('italics', 3, 23);
addToCodeCache('underline', 4, 24);
addToCodeCache('inverse', 7, 27);
addToCodeCache('strikethrough', 9, 29);

function updateState(state, sequence) {
  state = Array.isArray(state) ? state.slice() : [];

  const match = /^\u001b\[([\d;:]*)m$/.exec(sequence);
  if (!match) {
    return state;
  }

  const codes = match[1] === ''
    ? [0]
    : match[1].split(/[;:]/).map(value => Number(value) || 0);

  for (let index = 0; index < codes.length; index++) {
    const code = codes[index];

    if (code === 0) {
      state.length = 0;
      continue;
    }

    let closeCode;

    if (code === 1 || code === 2) closeCode = 22;
    else if (code === 3) closeCode = 23;
    else if (code === 4) closeCode = 24;
    else if (code === 5 || code === 6) closeCode = 25;
    else if (code === 7) closeCode = 27;
    else if (code === 8) closeCode = 28;
    else if (code === 9) closeCode = 29;
    else if (code >= 30 && code <= 37) closeCode = 39;
    else if (code >= 40 && code <= 47) closeCode = 49;
    else if (code >= 90 && code <= 97) closeCode = 39;
    else if (code >= 100 && code <= 107) closeCode = 49;

    if (
      (code === 38 || code === 48) &&
      (codes[index + 1] === 2 || codes[index + 1] === 5)
    ) {
      const mode = codes[index + 1];
      const count = mode === 2 ? 5 : 3;
      const colorCodes = codes.slice(index, index + count);
      state = state.filter(item => item.close !== (code === 38 ? 39 : 49));
      state.push({
        open: colorCodes.join(';'),
        close: code === 38 ? 39 : 49
      });
      index += count - 1;
      continue;
    }

    const closes = new Set([0, 22, 23, 24, 25, 27, 28, 29, 39, 49]);
    if (closes.has(code)) {
      if (code === 22) {
        state = state.filter(item => item.open !== '1' && item.open !== '2');
      } else {
        state = state.filter(item => item.close !== code);
      }
      continue;
    }

    if (closeCode !== undefined) {
      state = state.filter(item => item.close !== closeCode);
      state.push({ open: String(code), close: closeCode });
    }
  }

  return state;
}

function readState(state) {
  if (!Array.isArray(state)) {
    return '';
  }

  return state.map(item => `\u001b[${item.open}m`).join('');
}

function unwindState(state, text) {
  if (!Array.isArray(state) || state.length === 0) {
    return text == null ? '' : String(text);
  }

  const suffix = state
    .slice()
    .reverse()
    .map(item => `\u001b[${item.close}m`)
    .join('');

  return (text == null ? '' : String(text)) + suffix;
}

function rewindState(state, text) {
  return readState(state) + (text == null ? '' : String(text));
}

function tokenizeAnsi(text) {
  const tokens = [];
  const regex = codeRegex(true);
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ ansi: false, value: text.slice(lastIndex, match.index) });
    }

    tokens.push({ ansi: true, value: match[0] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ ansi: false, value: text.slice(lastIndex) });
  }

  return tokens;
}

function truncateWidth(value, width) {
  const text = String(value);
  width = Math.max(0, Number(width) || 0);

  if (strlen(text) <= width) {
    return text;
  }

  let result = '';
  let used = 0;

  for (const character of text) {
    const characterWidth = stringWidth(character);
    if (used + characterWidth > width) {
      break;
    }

    result += character;
    used += characterWidth;
  }

  return result;
}

function truncateWidthWithAnsi(value, width) {
  const text = String(value);
  width = Math.max(0, Number(width) || 0);

  if (strlen(text) <= width) {
    return text;
  }

  let result = '';
  let used = 0;
  let state = [];

  outer:
  for (const token of tokenizeAnsi(text)) {
    if (token.ansi) {
      result += token.value;
      state = updateState(state, token.value);
      continue;
    }

    for (const character of token.value) {
      const characterWidth = stringWidth(character);
      if (used + characterWidth > width) {
        break outer;
      }

      result += character;
      used += characterWidth;
    }
  }

  return unwindState(state, result);
}

function truncate(value, width, truncation) {
  const text = String(value);
  width = Math.max(0, Number(width) || 0);
  truncation = truncation == null ? '…' : String(truncation);

  if (strlen(text) <= width) {
    return text;
  }

  const marker = truncateWidthWithAnsi(truncation, width);
  const available = Math.max(0, width - strlen(marker));
  return truncateWidthWithAnsi(text, available) + marker;
}

function defaultOptions() {
  return {
    hard: false,
    minWidth: 1,
    trim: true,
    breakword: false
  };
}

function mergeOptions(options, defaults) {
  if (arguments.length < 2) {
    defaults = defaultOptions();
  }

  return Object.assign({}, defaults || {}, options || {});
}

function normalizeWrapArguments(first, second) {
  if (typeof first === 'number') {
    return {
      text: second == null ? '' : String(second),
      width: first,
      options: {}
    };
  }

  const text = first == null ? '' : String(first);

  if (typeof second === 'number') {
    return { text, width: second, options: {} };
  }

  const options = mergeOptions(second, defaultOptions());
  return {
    text,
    width: Number(options.width || options.maxLength || options.columns || 80),
    options
  };
}

function wordWrap(first, second) {
  const { text, width, options } = normalizeWrapArguments(first, second);
  const maximum = Math.max(1, Number(width) || 1);

  if (strlen(text) <= maximum) {
    return [options.trim === false ? text : text.trim()];
  }

  const words = text.split(/(\s+)/);
  const lines = [];
  let line = '';

  const pushLine = () => {
    lines.push(options.trim === false ? line : line.trim());
    line = '';
  };

  for (let part of words) {
    if (!part) {
      continue;
    }

    if (/^\s+$/.test(part)) {
      if (line && options.trim === false) {
        line += part;
      } else if (line) {
        line += ' ';
      }
      continue;
    }

    if (strlen(line + part) <= maximum) {
      line += part;
      continue;
    }

    if (line.trim()) {
      pushLine();
    }

    while (strlen(part) > maximum && (options.hard || options.breakword)) {
      lines.push(truncateWidthWithAnsi(part, maximum));
      const consumed = lines[lines.length - 1];
      part = part.slice(consumed.length);
    }

    line = part;
  }

  if (line || lines.length === 0) {
    pushLine();
  }

  return lines;
}

function textWrap(first, second) {
  const lines = wordWrap(first, second);
  return Array.isArray(lines) ? lines.join('\n') : lines;
}

function multiLineWordWrap(first, second) {
  const { text, width, options } = normalizeWrapArguments(first, second);
  const lines = [];

  for (const sourceLine of text.split(/\r?\n/)) {
    lines.push(...wordWrap(sourceLine, Object.assign({}, options, { width })));
  }

  return lines.join('\n');
}

function colorizeLines(value) {
  const isArray = Array.isArray(value);
  const lines = isArray ? value.map(String) : String(value).split(/\r?\n/);
  const output = [];
  let state = [];

  for (const line of lines) {
    const prefix = readState(state);
    let currentState = state;

    for (const token of tokenizeAnsi(line)) {
      if (token.ansi) {
        currentState = updateState(currentState, token.value);
      }
    }

    output.push(unwindState(currentState, prefix + line));
    state = currentState;
  }

  return isArray ? output : output.join('\n');
}

function hyperlink(text, url) {
  text = String(text);
  url = String(url);
  return `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;
}

function parseHexValue(value) {
  let hex = String(value).trim().replace(/^#/, '');

  if (/^[0-9a-f]{3}$/i.test(hex)) {
    hex = hex.replace(/./g, character => character + character);
  } else if (/^[0-9a-f]{4}$/i.test(hex)) {
    hex = hex
      .split('')
      .map(character => character + character)
      .join('');
  }

  if (!/^[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(hex)) {
    return NaN;
  }

  return parseInt(hex, 16);
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
  parseHexValue
};
