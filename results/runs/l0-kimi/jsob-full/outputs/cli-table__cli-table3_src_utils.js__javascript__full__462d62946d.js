var stringWidth = require('string-width');

function codeRegex(capture) {
    return capture ? /\u001b\[((?:\d*;){0,5}\d*)m/g : /\u001b\[(?:\d*;){0,5}\d*m/g;
}

function strlen(str) {
    let regex = codeRegex();
    let stripped = String(str).replace(regex, '');
    let lines = stripped.split('\n');
    return lines.reduce(function(max, line) {
        return stringWidth(line) > max ? stringWidth(line) : max;
    }, 0);
}

function repeat(char, count) {
    return Array(count + 1).join(char);
}

function pad(str, width, char, align) {
    let len = strlen(str);
    if (width <= len) return str;
    let diff = width - len;
    switch (align) {
        case 'left':
            str = repeat(char, diff) + str;
            break;
        case 'center':
            let left = Math.floor(diff / 2);
            let right = diff - left;
            str = repeat(char, right) + str + repeat(char, left);
            break;
        default:
            str = str + repeat(char, diff);
    }
    return str;
}

var codeCache = {};

function addToCodeCache(name, from, to) {
    from = '\x1B[' + from + 'm';
    to = '\x1B[' + to + 'm';
    codeCache[name] = { on: from, off: to };
    codeCache[from] = { to: true, name: name };
    codeCache[to] = { to: false, name: name };
}

addToCodeCache('bold', 1, 22);
addToCodeCache('italic', 3, 23);
addToCodeCache('underline', 4, 24);
addToCodeCache('inverse', 7, 27);

function updateState(state, match) {
    let code = match[1] ? parseInt(match[1].split(';')[0]) : 0;
    if (code >= 30 && code <= 37 || code >= 90 && code <= 97) {
        state.foreground = match[0];
        return;
    }
    if (code >= 40 && code <= 47 || code >= 100 && code <= 107) {
        state.background = match[0];
        return;
    }
    if (code === 0) {
        for (let key in state) {
            Object.prototype.hasOwnProperty.call(state, key) && delete state[key];
        }
        return;
    }
    let cached = codeCache[match[0]];
    cached && (state[cached.name] = cached.to);
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

function unwindState(state, str) {
    let foreground = state.foreground;
    let background = state.background;
    delete state.foreground;
    delete state.background;
    Object.keys(state).forEach(function(key) {
        state[key] && (str += codeCache[key].off);
    });
    if (foreground && foreground !== codeCache.bold.off) str += codeCache.bold.off;
    if (background && background !== codeCache.bold.off) str += codeCache.bold.off;
    return str;
}

function rewindState(state, str) {
    let foreground = state.foreground;
    let background = state.background;
    delete state.foreground;
    delete state.background;
    Object.keys(state).forEach(function(key) {
        state[key] && (str = codeCache[key].on + str);
    });
    foreground && foreground !== codeCache.bold.off && (str = foreground + str);
    background && background !== codeCache.bold.off && (str = background + str);
    return str;
}

function truncateWidth(str, width) {
    if (strlen(str) <= width) return str;
    while (strlen(str) > width) {
        str = str.slice(0, -1);
    }
    return str;
}

function truncateWidthWithAnsi(str, width) {
    let regex = codeRegex(true);
    let matches = str.match(codeRegex()) || [];
    let matchIndex = 0;
    let currentWidth = 0;
    let result = '';
    let state = {};
    while (currentWidth < width) {
        let match = regex.exec(str);
        let segment = matches[matchIndex];
        matchIndex++;
        let segmentWidth = currentWidth + strlen(segment);
        segmentWidth > width && (segment = truncateWidth(segment, width - currentWidth));
        result += segment;
        currentWidth += strlen(segment);
        if (currentWidth < width) {
            if (!match) break;
            result += match[0];
            updateState(state, match);
        }
    }
    return unwindState(state, result);
}

function truncate(str, width, ellipsis) {
    ellipsis = ellipsis || '\u2026';
    let len = strlen(str);
    if (len <= width) return str;
    width -= strlen(ellipsis);
    let result = truncateWidthWithAnsi(str, width);
    result += ellipsis;
    const trailingNewline = /\n$/;
    str.match(trailingNewline) && !result.match(trailingNewline) && (result += trailingNewline);
    return result;
}

function defaultOptions() {
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
    const style = {
        'padding-left': 1,
        'padding-right': 1,
        head: [chars['top']],
        border: [chars['bottom']],
        compact: false
    };
    return {
        chars: chars,
        truncate: '\u2026',
        colors: [],
        styles: [],
        align: [],
        valign: [],
        wordWrap: style,
        wrapOnWordBoundary: []
    };
}

function mergeOptions(options, defaults) {
    options = options || {};
    defaults = defaults || defaultOptions();
    let result = Object.assign({}, defaults, options);
    result.chars = Object.assign({}, defaults.chars, options.chars);
    result.style = Object.assign({}, defaults.style, options.style);
    return result;
}

function wordWrap(maxWidth, text) {
    let lines = [];
    let words = text.split(/(\s+)/g);
    let currentLine = [];
    let currentWidth = 0;
    let lastWasSpace;
    for (let i = 0; i < words.length; i += 2) {
        let word = words[i];
        let wordWidth = currentWidth + strlen(word);
        currentWidth > 0 && lastWasSpace && (wordWidth += lastWasSpace.length);
        if (wordWidth > maxWidth) {
            currentWidth > 0 && lines.push(currentLine.join(''));
            currentLine = [word];
            currentWidth = strlen(word);
        } else {
            currentLine.push(lastWasSpace || '', word);
            currentWidth = wordWidth;
        }
        lastWasSpace = words[i + 1];
    }
    currentWidth && lines.push(currentLine.join(''));
    return lines;
}

function textWrap(maxWidth, text) {
    let lines = [];
    let currentLine = '';
    function addSegment(segment, separator) {
        if (currentLine.length && separator) currentLine += separator;
        currentLine += segment;
        while (currentLine.length > maxWidth) {
            lines.push(currentLine.slice(0, maxWidth));
            currentLine = currentLine.slice(maxWidth);
        }
    }
    let segments = text.split(/(\s+)/g);
    for (let i = 0; i < segments.length; i++) {
        addSegment(segments[i], i && segments[i - 1]);
    }
    currentLine.length && lines.push(currentLine);
    return lines;
}

function multiLineWordWrap(maxWidth, text, wrapOnWordBoundary) {
    let lines = [];
    text = text.split('\n');
    const wrapFunc = wrapOnWordBoundary ? wordWrap : textWrap;
    for (let i = 0; i < text.length; i++) {
        lines.push.apply(lines, wrapFunc(maxWidth, text[i]));
    }
    return lines;
}

function colorizeLines(lines) {
    let state = {};
    let result = [];
    for (let i = 0; i < lines.length; i++) {
        let line = rewindState(state, lines[i]);
        state = readState(line);
        let copy = Object.assign({}, state);
        result.push(unwindState(copy, line));
    }
    return result;
}

function hyperlink(url, text) {
    const fallback = function(url, text) {
        return url || text;
    };
    const OSC = '\x1B]';
    const BEL = '\x07';
    const SEP = ';';
    return [OSC, '8', SEP, SEP, fallback(url, text), BEL, text, OSC, '8', SEP, SEP, BEL].join('');
}

function parseHexValue(str) {
    const fallback = '#000000';
    const hexRegex = /#[0-9a-fA-F]{3,6}/;
    let [match] = str.match(hexRegex) || [fallback];
    return match;
}

const exports = {};
exports.strlen = strlen;
exports.repeat = repeat;
exports.pad = pad;
exports.truncate = truncate;
exports.mergeOptions = mergeOptions;
exports.wordWrap = multiLineWordWrap;
exports.colorizeLines = colorizeLines;
exports.hyperlink = hyperlink;
exports.parseHexValue = parseHexValue;
module.exports = exports;
