const stringWidth = require('string-width');

function codeRegex(onlyFirst) {
  return onlyFirst
    ? /\u001b\[((?:\d*;){0,5}\d*)m/g
    : /\u001b\[(?:\d*;){0,5}\d*m/g;
}

function strlen(value) {
  const lines = String(value)
    .replace(codeRegex(), '')
    .split('\n');

  return lines.reduce((maximum, line) => Math.max(maximum, stringWidth(line)), 0);
}

function repeat(character, count) {
  return Array(count + 1).join(character);
}

function pad(value, length, character = ' ', position = 'right') {
  let result = String(value);
  const width = strlen(result);

  if (length <= width) {
    return result;
  }

  const padding = length - width;

  switch (position) {
    case 'left':
      return repeat(character, padding) + result;
    case 'center': {
      const left = Math.floor(padding / 2);
      const right = padding - left;
      return repeat(character, left) + result + repeat(character, right);
    }
    default:
      return result + repeat(character, padding);
  }
}

function parseAnsiSequence(sequence) {
  const match = sequence.match(/^\u001b\[([^m]*)m$/);
  if (!match) {
    return [];
  }

  return match[1] === '' ? [0] : match[1].split(';').map(Number);
}

function truncateWidthWithAnsi(value, length) {
  if (length <= 0) {
    return '';
  }

  const ansi = codeRegex();
  let result = '';
  let visibleWidth = 0;
  let lastIndex = 0;
  let match;
  let active = [];

  while ((match = ansi.exec(value))) {
    const text = value.slice(lastIndex, match.index);
    const remaining = length - visibleWidth;

    if (remaining > 0) {
      const textWidth = stringWidth(text);
      if (textWidth <= remaining) {
        result += text;
        visibleWidth += textWidth;
      } else {
        let part = '';
        for (const character of text) {
          const characterWidth = stringWidth(character);
          if (visibleWidth + characterWidth > length) {
            break;
          }
          part += character;
          visibleWidth += characterWidth;
        }
        result += part;
        return result;
      }
    }

    result += match[0];
    const codes = parseAnsiSequence(match[0]);

    if (codes.includes(0)) {
      active = [];
    }

    for (const code of codes) {
      if (code === 0) {
        continue;
      }

      if (code >= 30 && code <= 37 || code >= 90 && code <= 97 ||
          code >= 40 && code <= 47 || code >= 100 && code <= 107) {
        active = active.filter(item => {
          return !(item >= 30 && item <= 37 ||
            item >= 90 && item <= 97 ||
            item >= 40 && item <= 47 ||
            item >= 100 && item <= 107);
        });
      }

      if (code === 39 || code === 49) {
        active = active.filter(item => code === 39
          ? !(item >= 30 && item <= 37 || item >= 90 && item <= 97)
          : !(item >= 40 && item <= 47 || item >= 100 && item <= 107));
      }

      if (code === 22) {
        active = active.filter(item => item !== 1 && item !== 2);
      }

      if (code === 23) {
        active = active.filter(item => item !== 3);
      }

      if (code === 24) {
        active = active.filter(item => item !== 4);
      }

      if (code === 25) {
        active = active.filter(item => item !== 5);
      }

      if (code === 27) {
        active = active.filter(item => item !== 7);
      }

      if (code === 28) {
        active = active.filter(item => item !== 8);
      }

      if (code === 29) {
        active = active.filter(item => item !== 9);
      }

      if (code === 39 || code === 49 || code === 22 ||
          code === 23 || code === 24 || code === 25 ||
          code === 27 || code === 28 || code === 29) {
        continue;
      }

      if (!active.includes(code)) {
        active.push(code);
      }
    }

    lastIndex = ansi.lastIndex;

    if (visibleWidth >= length) {
      break;
    }
  }

  if (visibleWidth < length) {
    const tail = value.slice(lastIndex);
    let part = '';

    for (const character of tail) {
      const characterWidth = stringWidth(character);
      if (visibleWidth + characterWidth > length) {
        break;
      }
      part += character;
      visibleWidth += characterWidth;
    }

    result += part;
  }

  return result;
}

function truncateWidth(value, length) {
  const input = String(value);

  if (strlen(input) <= length) {
    return input;
  }

  return input.split('\n').map(line => {
    const plain = line.replace(codeRegex(), '');
    return plain.slice(0, length);
  }).join('\n');
}

function truncate(value, length, ellipsis = '…') {
  const input = String(value);

  if (strlen(input) <= length) {
    return input;
  }

  const suffixWidth = strlen(ellipsis);
  const available = Math.max(0, length - suffixWidth);
  let result = truncateWidthWithAnsi(input, available) + ellipsis;

  if (input.includes('\u001b[') &&
      !result.endsWith('\u001b[0m') &&
      !result.endsWith('\u001b[m')) {
    result += '\u001b[0m';
  }

  return result;
}

function readState(value) {
  const state = {};
  const matches = String(value).match(codeRegex()) || [];

  for (const sequence of matches) {
    const codes = parseAnsiSequence(sequence);

    if (codes.includes(0)) {
      for (const key of Object.keys(state)) {
        delete state[key];
      }
      continue;
    }

    for (const code of codes) {
      if (code === 39) {
        for (const key of Object.keys(state)) {
          if (key.startsWith('color')) {
            delete state[key];
          }
        }
      } else if (code === 49) {
        for (const key of Object.keys(state)) {
          if (key.startsWith('background')) {
            delete state[key];
          }
        }
      } else {
        state[code] = sequence;
      }
    }
  }

  return state;
}

function unwindState(state, value) {
  const input = String(value);
  const result = input.replace(codeRegex(), '');
  const prefix = Object.keys(state).map(key => state[key]).join('');
  return prefix + result;
}

function colorizeLines(lines) {
  const result = [];
  let state = {};

  for (const line of lines) {
    const current = String(line);
    const colored = unwindState(state, current);
    result.push(colored);
    state = readState(current);
  }

  return result;
}

function wordWrap(width, value) {
  const words = String(value).split(/(\s+)/g);
  const lines = [];
  let current = [];
  let currentWidth = 0;
  let previousWhitespace = '';

  for (const word of words) {
    const wordWidth = strlen(word);
    const candidateWidth = currentWidth + wordWidth;

    if (candidateWidth <= width) {
      current.push(word);
      currentWidth = candidateWidth;
      previousWhitespace = word;
      continue;
    }

    if (currentWidth > 0) {
      lines.push(current.join(''));
    }

    current = [word];
    currentWidth = wordWidth;
    previousWhitespace = word;
  }

  if (currentWidth > 0) {
    lines.push(current.join(''));
  }

  return lines;
}

function textWrap(width, value) {
  const lines = [];
  let current = '';

  for (const character of String(value)) {
    if (strlen(current + character) > width) {
      lines.push(current);
      current = '';
    }
    current += character;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function multiLineWordWrap(width, value, useWordWrap = true) {
  const wrapper = useWordWrap ? wordWrap : textWrap;
  return String(value)
    .split('\n')
    .flatMap(line => wrapper(width, line));
}

function hyperlink(text, url) {
  const value = text || url;
  return `\u001b]8;;${value}\u0007${url}\u001b]8;;\u0007`;
}

function parseHexValue(value) {
  const match = String(value).match(/#[0-9a-fA-F]{3,6}/);
  return match ? match[0] : '#000000';
}

function defaultOptions() {
  return {
    borderStyle: 'single',
    ellipsis: '…',
    title: '',
    titleAlignment: 'left',
    borderColor: 'white',
    borderDim: false,
    padding: 0,
    margin: 0,
    width: undefined,
    height: undefined,
    float: 'left',
    backgroundColor: 'none',
    textAlignment: 'left',
    fullscreen: false
  };
}

function mergeOptions(options, defaults) {
  const base = defaults || defaultOptions();
  const overrides = options || {};
  const result = Object.assign({}, base, overrides);

  result.borderStyle = Object.assign(
    {},
    base.borderStyle,
    overrides.borderStyle
  );

  result.padding = Object.assign(
    {},
    base.padding,
    overrides.padding
  );

  return result;
}

module.exports = {
  stringWidth,
  repeat,
  pad,
  truncate,
  mergeOptions,
  multiLineWordWrap,
  colorizeLines,
  hyperlink,
  parseHexValue
};
