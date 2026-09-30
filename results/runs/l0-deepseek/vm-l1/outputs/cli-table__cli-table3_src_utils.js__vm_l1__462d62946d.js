const stringWidth = require('string-width');

function codeRegex() {
  return /[\u001b\u009b][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;
}

function strlen(str) {
  return stringWidth(str);
}

function repeat(str, count) {
  return str.repeat(count);
}

function pad(str, width, char = ' ') {
  const len = strlen(str);
  if (len >= width) return str;
  const padLen = width - len;
  return str + repeat(char, padLen);
}

const codeCache = {};

function addToCodeCache(name, on, off) {
  codeCache[name] = { on, off };
}

addToCodeCache('bold', 1, 22);
addToCodeCache('dim', 2, 22);
addToCodeCache('italic', 3, 23);
addToCodeCache('underline', 4, 24);
addToCodeCache('inverse', 7, 27);
addToCodeCache('hidden', 8, 28);
addToCodeCache('strikethrough', 9, 29);

function updateState(state, escapeCode) {
  const code = escapeCode.slice(2, -1);
  const parts = code.split(';');
  const first = parseInt(parts[0], 10);
  if (first === 0) {
    return {};
  }
  if (first === 39) {
    delete state.foreground;
    return state;
  }
  if (first === 49) {
    delete state.background;
    return state;
  }
  if (first >= 30 && first <= 37) {
    state.foreground = first - 30;
    return state;
  }
  if (first >= 40 && first <= 47) {
    state.background = first - 40;
    return state;
  }
  if (first >= 90 && first <= 97) {
    state.foreground = first - 90 + 8;
    return state;
  }
  if (first >= 100 && first <= 107) {
    state.background = first - 100 + 8;
    return state;
  }
  if (first === 38 || first === 48) {
    const target = first === 38 ? 'foreground' : 'background';
    if (parts[1] === '5') {
      state[target] = parseInt(parts[2], 10);
    } else if (parts[1] === '2') {
      state[target] = {
        r: parseInt(parts[2], 10),
        g: parseInt(parts[3], 10),
        b: parseInt(parts[4], 10)
      };
    }
    return state;
  }
  return state;
}

function readState(state) {
  return state;
}

function unwindState(state, escapeCode) {
  const code = escapeCode.slice(2, -1);
  const parts = code.split(';');
  const first = parseInt(parts[0], 10);
  if (first === 0) {
    return {};
  }
  if (first === 39) {
    delete state.foreground;
    return state;
  }
  if (first === 49) {
    delete state.background;
    return state;
  }
  if (first >= 30 && first <= 37) {
    delete state.foreground;
    return state;
  }
  if (first >= 40 && first <= 47) {
    delete state.background;
    return state;
  }
  if (first >= 90 && first <= 97) {
    delete state.foreground;
    return state;
  }
  if (first >= 100 && first <= 107) {
    delete state.background;
    return state;
  }
  if (first === 38 || first === 48) {
    const target = first === 38 ? 'foreground' : 'background';
    delete state[target];
    return state;
  }
  return state;
}

function rewindState(state, escapeCode) {
  return unwindState(state, escapeCode);
}

function truncateWidth(str, width) {
  if (strlen(str) <= width) return str;
  let result = '';
  let currentWidth = 0;
  const regex = codeRegex();
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const before = str.slice(lastIndex, match.index);
    const beforeWidth = strlen(before);
    if (currentWidth + beforeWidth > width) {
      result += truncateWidthWithAnsi(before, width - currentWidth);
      return result;
    }
    result += before + match[0];
    currentWidth += beforeWidth;
    lastIndex = regex.lastIndex;
  }
  const rest = str.slice(lastIndex);
  if (currentWidth + strlen(rest) > width) {
    result += truncateWidthWithAnsi(rest, width - currentWidth);
  } else {
    result += rest;
  }
  return result;
}

function truncateWidthWithAnsi(str, width) {
  if (strlen(str) <= width) return str;
  let result = '';
  let currentWidth = 0;
  const regex = codeRegex();
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const before = str.slice(lastIndex, match.index);
    const beforeWidth = strlen(before);
    if (currentWidth + beforeWidth > width) {
      result += before.slice(0, width - currentWidth);
      return result;
    }
    result += before + match[0];
    currentWidth += beforeWidth;
    lastIndex = regex.lastIndex;
  }
  const rest = str.slice(lastIndex);
  if (currentWidth + strlen(rest) > width) {
    result += rest.slice(0, width - currentWidth);
  } else {
    result += rest;
  }
  return result;
}

function truncate(str, width, options = {}) {
  const { ellipsis = '…', position = 'end' } = options;
  if (strlen(str) <= width) return str;
  const ellipsisWidth = strlen(ellipsis);
  if (width <= ellipsisWidth) return ellipsis.slice(0, width);
  const remaining = width - ellipsisWidth;
  if (position === 'start') {
    return ellipsis + truncateWidthWithAnsi(str.slice(-remaining), remaining);
  }
  if (position === 'middle') {
    const left = Math.ceil(remaining / 2);
    const right = Math.floor(remaining / 2);
    return truncateWidthWithAnsi(str.slice(0, left), left) + ellipsis + truncateWidthWithAnsi(str.slice(-right), right);
  }
  return truncateWidthWithAnsi(str.slice(0, remaining), remaining) + ellipsis;
}

function defaultOptions() {
  return {
    width: 80,
    indent: 0,
    newline: '\n',
    trim: true,
    cut: false,
    wordWrap: true
  };
}

function mergeOptions(options, defaults) {
  return { ...defaults, ...options };
}

function wordWrap(str, options = {}) {
  const opts = mergeOptions(options, defaultOptions());
  const { width, indent, newline, trim, cut } = opts;
  const lines = str.split(/\r?\n/);
  const result = [];
  for (let line of lines) {
    if (trim) line = line.trim();
    if (strlen(line) <= width) {
      result.push(line);
      continue;
    }
    let current = '';
    let currentWidth = 0;
    const words = line.split(/\s+/);
    for (const word of words) {
      const wordWidth = strlen(word);
      if (currentWidth === 0) {
        current = word;
        currentWidth = wordWidth;
      } else if (currentWidth + 1 + wordWidth <= width) {
        current += ' ' + word;
        currentWidth += 1 + wordWidth;
      } else {
        result.push(current);
        current = word;
        currentWidth = wordWidth;
      }
      if (cut && currentWidth > width) {
        const chunks = [];
        let chunk = '';
        let chunkWidth = 0;
        for (const char of current) {
          const charWidth = strlen(char);
          if (chunkWidth + charWidth > width) {
            chunks.push(chunk);
            chunk = char;
            chunkWidth = charWidth;
          } else {
            chunk += char;
            chunkWidth += charWidth;
          }
        }
        if (chunk) chunks.push(chunk);
        result.push(...chunks.slice(0, -1));
        current = chunks[chunks.length - 1] || '';
        currentWidth = strlen(current);
      }
    }
    if (current) result.push(current);
  }
  return result.join(newline);
}

function textWrap(str, options = {}) {
  const opts = mergeOptions(options, defaultOptions());
  const { width, indent, newline, trim, cut } = opts;
  const lines = str.split(/\r?\n/);
  const result = [];
  for (let line of lines) {
    if (trim) line = line.trim();
    if (strlen(line) <= width) {
      result.push(line);
      continue;
    }
    let current = '';
    let currentWidth = 0;
    for (const char of line) {
      const charWidth = strlen(char);
      if (currentWidth + charWidth > width) {
        result.push(current);
        current = char;
        currentWidth = charWidth;
      } else {
        current += char;
        currentWidth += charWidth;
      }
    }
    if (current) result.push(current);
  }
  return result.join(newline);
}

function multiLineWordWrap(str, options = {}) {
  const opts = mergeOptions(options, defaultOptions());
  const { width, indent, newline, trim, cut } = opts;
  const lines = str.split(/\r?\n/);
  const result = [];
  for (let line of lines) {
    if (trim) line = line.trim();
    if (strlen(line) <= width) {
      result.push(line);
      continue;
    }
    let current = '';
    let currentWidth = 0;
    const words = line.split(/\s+/);
    for (const word of words) {
      const wordWidth = strlen(word);
      if (currentWidth === 0) {
        current = word;
        currentWidth = wordWidth;
      } else if (currentWidth + 1 + wordWidth <= width) {
        current += ' ' + word;
        currentWidth += 1 + wordWidth;
      } else {
        result.push(current);
        current = word;
        currentWidth = wordWidth;
      }
      if (cut && currentWidth > width) {
        const chunks = [];
        let chunk = '';
        let chunkWidth = 0;
        for (const char of current) {
          const charWidth = strlen(char);
          if (chunkWidth + charWidth > width) {
            chunks.push(chunk);
            chunk = char;
            chunkWidth = charWidth;
          } else {
            chunk += char;
            chunkWidth += charWidth;
          }
        }
        if (chunk) chunks.push(chunk);
        result.push(...chunks.slice(0, -1));
        current = chunks[chunks.length - 1] || '';
        currentWidth = strlen(current);
      }
    }
    if (current) result.push(current);
  }
  return result.join(newline);
}

function colorizeLines(str) {
  return str;
}

function hyperlink(url, text) {
  return `\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007`;
}

function parseHexValue(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return value;
  const match = value.match(/^#?([0-9a-fA-F]{6})$/);
  if (match) {
    return {
      r: parseInt(match[1].slice(0, 2), 16),
      g: parseInt(match[1].slice(2, 4), 16),
      b: parseInt(match[1].slice(4, 6), 16)
    };
  }
  return value;
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
