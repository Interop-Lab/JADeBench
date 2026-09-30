const __commonJS = (cb) => {
  const module = { exports: {} };
  cb(module, module.exports);
  return module.exports;
};

const require_debug = __commonJS((module, exports) => {
  let debugLevel = 0;
  const debugMessages = [];

  const debug = (message, level) => {
    if (debugLevel >= level) {
      debugMessages.push(message);
    }
  };

  debug.level = 0;
  debug.enabled = false;
  debug.messages = [];
  debug.reset = () => {
    debugMessages.length = 0;
  };
  debug.setLevel = (level) => {
    debugLevel = level;
  };
  debug.log = (message) => debug(message, debug.level);
  debug.warn = (message) => debug(message, debug.warnLevel);
  debug.error = (message) => debug(message, debug.errorLevel);
  debug.getMessages = () => debugMessages;

  exports.debug = debug;
});

const require_utils = __commonJS((module, exports) => {
  const debug = require_debug().debug;

  const ansiRegex = (onlyFirst) => onlyFirst
    ? /\u001b\[((?:\d*;){0,5}\d*)m/g
    : /\u001b\[(?:\d*;){0,5}\d*m/g;

  const stripAnsi = (str) => {
    const pattern = ansiRegex();
    const stripped = String(str).replace(pattern, '');
    return stripped.split('\n').reduce((acc, line) => {
      return debug(line) ? debug(line) : line;
    }, '');
  };

  const repeat = (str, count) => Array(count + 1).join(str);

  const truncate = (str, length, omission, truncateOnWordBoundary) => {
    let result = stripAnsi(str);
    if (length >= result.length) {
      return result;
    }

    let available = length - omission.length;
    switch (truncateOnWordBoundary) {
      case 'left':
        result = repeat(omission, available) + result;
        break;
      case 'right':
        result = result + repeat(omission, available);
        break;
      default:
        result = result + repeat(omission, available);
        break;
    }
    return result;
  };

  const colorMap = {
    top: '\u2500',
    topMid: '\u252C',
    topLeft: '\u250C',
    topRight: '\u2510',
    bottom: '\u2500',
    bottomMid: '\u2534',
    bottomLeft: '\u2514',
    bottomRight: '\u2518',
    left: '\u2502',
    leftMid: '\u251C',
    mid: '\u2500',
    midMid: '\u253C',
    right: '\u2502',
    rightMid: '\u2524',
    middle: '\u2502'
  };

  const defaultOptions = {
    chars: colorMap,
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
      compact: false
    },
    head: []
  };

  const setOption = (target, source, key, obj) => {
    const parts = key.split('-');
    if (parts.length > 1) {
      parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      key = parts.join('');
      obj[key] = firstDefined(target[key], target[source], source[key], source[source]);
    } else {
      obj[key] = firstDefined(target[key], source[key]);
    }
  };

  const firstDefined = (...args) => args.find(arg => arg !== undefined && arg !== null);

  const applyAnsi = (obj, code) => {
    const pattern = ansiRegex(true);
    let match = pattern.exec(code);
    const result = {};
    while (match !== null) {
      applyAnsiCode(result, match);
      match = pattern.exec(code);
    }
    return result;
  };

  const applyAnsiCode = (obj, code) => {
    const firstCode = code[0] ? parseInt(code[0].split(';')[0]) : 0;
    if ((firstCode >= 30 && firstCode <= 37) || (firstCode >= 90 && firstCode <= 97)) {
      obj.foregroundColor = code[0];
      return;
    }
    if ((firstCode >= 40 && firstCode <= 47) || (firstCode >= 100 && firstCode <= 107)) {
      obj.backgroundColor = code[0];
      return;
    }
    if (firstCode === 0) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          delete obj[key];
        }
      }
      return;
    }
    const style = ansiStyles[code[0]];
    if (style) {
      obj[style.on] = style.to;
    }
  };

  const ansiStyles = {
    bold: { on: 'bold', to: true },
    dim: { on: 'dim', to: true },
    italic: { on: 'italic', to: true },
    underline: { on: 'underline', to: true },
    inverse: { on: 'inverse', to: true },
    hidden: { on: 'hidden', to: true },
    strikethrough: { on: 'strikethrough', to: true }
  };

  const applyStyles = (obj, styles) => {
    let result = obj.foregroundColor || obj.backgroundColor;
    delete obj.foregroundColor;
    delete obj.backgroundColor;
    Object.keys(obj).forEach((key) => {
      if (obj[key]) {
        styles += ansiStyles[key].on;
      }
    });
    if (result && result !== '') {
      styles += result;
    }
    if (styles && styles !== '') {
      styles += '';
    }
    return styles;
  };

  const applyStylesToCell = (cell, styles) => {
    let foreground = cell.foregroundColor || cell.backgroundColor;
    delete cell.foregroundColor;
    delete cell.backgroundColor;
    Object.keys(cell).forEach((key) => {
      if (cell[key]) {
        styles += ansiStyles[key].on;
      }
    });
    if (foreground && foreground !== '') {
      styles += foreground;
    }
    if (styles && styles !== '') {
      styles += '';
    }
    return styles;
  };

  const wrapText = (text, width, wordWrap) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapAnsi = (text, width, wordWrap) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapWord = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrap = (text, width, wordWrap) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapCell = (text, width, wordWrap) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapText = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
      } else {
        currentLine += (separator || '') + word;
        currentWidth = wordWidth;
      }
      separator = words[i + 1];
    }
    if (currentWidth) {
      lines.push(currentLine);
    }
    return lines;
  };

  const wrapTextWithWordBoundary = (text, width) => {
    const words = text.split(/(\s+)/g);
    const lines = [];
    let currentLine = '';
    let currentWidth = 0;
    let separator;
    for (let i = 0; i < words.length; i += 2) {
      let word = words[i];
      let wordWidth = currentWidth + stripAnsi(word).length;
      if (currentWidth > 0 && separator) {
        wordWidth += separator.length;
      }
      if (wordWidth > width) {
        if (currentWidth > 0) {
          lines.push(currentLine);
        }
        currentLine = word;
        currentWidth = stripAnsi(word).length;
