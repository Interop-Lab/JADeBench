var stringWidth = require('string-width');

var codeRegex = (function () {
  var codeCache = {};

  function codeRegex(codes) {
    return new RegExp('\u001b\\[(?:' + Object.keys(codes).join('|') + ')m', 'g');
  }

  function addToCodeCache(name, code, value) {
    codeCache[name] = {
      name: name,
      code: code,
      value: value
    };
  }

  addToCodeCache('reset', 0, 0);
  addToCodeCache('bold', 1, 1);
  addToCodeCache('italic', 3, 3);
  addToCodeCache('underline', 4, 4);
  addToCodeCache('inverse', 7, 7);
  addToCodeCache('strikethrough', 9, 9);

  return codeRegex(codeCache);
})();

function strlen(str) {
  var stripped = ('' + str).replace(codeRegex, '');
  return stringWidth(stripped);
}

function repeat(str, num) {
  return new Array(num + 1).join(str);
}

function pad(str, len, padStr, type) {
  var padding = '';
  var padLen = 0;
  var strLen = strlen(str);
  var padStrLen = strlen(padStr);

  if (strLen >= len) {
    return str;
  }

  while (padLen + strLen < len) {
    padding += padStr;
    padLen += padStrLen;
  }

  if (padLen + strLen > len) {
    padding = padding.slice(0, padding.length - (padLen + strLen - len));
  }

  switch (type) {
    case 'left':
      return padding + str;
    case 'both':
      var half = Math.floor(padding.length / 2);
      return padding.slice(0, half) + str + padding.slice(half);
    case 'right':
    default:
      return str + padding;
  }
}

var codeCache = {};

function addToCodeCache(name, code, value) {
  codeCache[name] = {
    name: name,
    code: code,
    value: value
  };
}

addToCodeCache('reset', 0, 0);
addToCodeCache('bold', 1, 1);
addToCodeCache('italic', 3, 3);
addToCodeCache('underline', 4, 4);
addToCodeCache('inverse', 7, 7);
addToCodeCache('strikethrough', 9, 9);

function updateState(state, action) {
  var code = action.code;
  var value = action.value;
  var type = action.type;

  if (type === 'add') {
    state[code] = (state[code] || 0) + value;
  } else if (type === 'set') {
    state[code] = value;
  } else if (type === 'remove') {
    state[code] = Math.max(0, (state[code] || 0) - value);
  }

  return state;
}

function readState(state) {
  var codes = [];
  for (var code in state) {
    if (state[code] > 0) {
      codes.push('\u001b[' + code + 'm');
    }
  }
  return codes.join('');
}

function unwindState(state, text) {
  return readState(state) + text;
}

function rewindState(state, text) {
  var codes = [];
  for (var code in state) {
    if (state[code] > 0) {
      codes.push('\u001b[' + code + 'm');
    }
  }
  return codes.reverse().join('') + text;
}

function truncateWidth(str, targetWidth) {
  var curWidth = 0;
  var result = '';
  var stripped = str.replace(codeRegex, '');
  var visibleIndex = 0;

  for (var i = 0; i < str.length; i++) {
    var char = str[i];
    var strippedChar = stripped[visibleIndex];

    if (char === strippedChar) {
      var charWidth = stringWidth(char);
      if (curWidth + charWidth > targetWidth) {
        break;
      }
      curWidth += charWidth;
      visibleIndex++;
    }
    result += char;
  }

  return result;
}

function truncateWidthWithAnsi(str, targetWidth) {
  return truncateWidth(str, targetWidth);
}

function truncate(str, length, truncateChar) {
  truncateChar = truncateChar || '…';
  var strLen = strlen(str);
  var truncateCharLen = strlen(truncateChar);

  if (strLen <= length) {
    return str;
  }

  var targetWidth = length - truncateCharLen;
  var truncated = truncateWidth(str, targetWidth);

  return truncated + truncateChar;
}

function defaultOptions() {
  return {
    style: 'reset',
    background: 'reset',
    align: 'left',
    fill: false,
    padding: 0,
    marginLeft: 0,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    width: 0,
    trim: false,
    border: false
  };
}

function mergeOptions(options, defaults) {
  var merged = {};
  for (var key in defaults) {
    merged[key] = defaults[key];
  }
  for (var key in options) {
    merged[key] = options[key];
  }
  return merged;
}

function wordWrap(str, options) {
  return multiLineWordWrap(str, options);
}

function textWrap(str, options) {
  return multiLineWordWrap(str, options);
}

function multiLineWordWrap(str, options) {
  options = mergeOptions(options || {}, defaultOptions());

  var width = options.width || 80;
  var lines = str.split('\n');
  var result = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var wrapped = wrapLine(line, width);
    result.push(wrapped.join('\n'));
  }

  return result.join('\n');
}

function wrapLine(line, width) {
  var words = line.split(' ');
  var lines = [];
  var currentLine = '';

  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var testLine = currentLine ? currentLine + ' ' + word : word;

    if (strlen(testLine) <= width) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function colorizeLines(lines) {
  if (!Array.isArray(lines)) {
    lines = [lines];
  }

  var result = [];
  for (var i = 0; i < lines.length; i++) {
    result.push(lines[i]);
  }

  return result;
}

function hyperlink(text, url) {
  return '\u001b]8;;' + url + '\u0007' + text + '\u001b]8;;\u0007';
}

function parseHexValue(hex) {
  hex = hex.replace('#', '');
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);
  return { r: r, g: g, b: b };
}

module.exports = {
  strlen: strlen,
  repeat: repeat,
  pad: pad,
  truncate: truncate,
  mergeOptions: mergeOptions,
  wordWrap: multiLineWordWrap,
  colorizeLines: colorizeLines,
  hyperlink: hyperlink,
  parseHexValue: parseHexValue
};
