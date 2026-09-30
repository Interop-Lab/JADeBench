const stringWidth = require('string-width');

const codeRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

function strlen(str) {
    return stringWidth(str);
}

function repeat(char, count) {
    return char.repeat(count);
}

function pad(str, length, char = ' ', align = 'left') {
    const strLen = strlen(str);
    if (strLen >= length) return str;
    const padding = length - strLen;
    const leftPad = align === 'center' ? Math.floor(padding / 2) : align === 'right' ? padding : 0;
    const rightPad = padding - leftPad;
    return repeat(char, leftPad) + str + repeat(char, rightPad);
}

const codeCache = {};

function addToCodeCache(name, code, index) {
    codeCache[name] = { code, index };
}

addToCodeCache('reset', 0, 0);
addToCodeCache('bold', 1, 1);
addToCodeCache('dim', 2, 2);
addToCodeCache('italic', 3, 3);
addToCodeCache('underline', 4, 4);
addToCodeCache('blink', 5, 5);
addToCodeCache('inverse', 7, 7);
addToCodeCache('hidden', 8, 8);
addToCodeCache('strikethrough', 9, 9);

function updateState(state, code) {
    if (code === 0) {
        state.bold = false;
        state.dim = false;
        state.italic = false;
        state.underline = false;
        state.blink = false;
        state.inverse = false;
        state.hidden = false;
        state.strikethrough = false;
    } else if (code === 1) {
        state.bold = true;
    } else if (code === 2) {
        state.dim = true;
    } else if (code === 3) {
        state.italic = true;
    } else if (code === 4) {
        state.underline = true;
    } else if (code === 5) {
        state.blink = true;
    } else if (code === 7) {
        state.inverse = true;
    } else if (code === 8) {
        state.hidden = true;
    } else if (code === 9) {
        state.strikethrough = true;
    } else if (code === 22) {
        state.bold = false;
        state.dim = false;
    } else if (code === 23) {
        state.italic = false;
    } else if (code === 24) {
        state.underline = false;
    } else if (code === 25) {
        state.blink = false;
    } else if (code === 27) {
        state.inverse = false;
    } else if (code === 28) {
        state.hidden = false;
    } else if (code === 29) {
        state.strikethrough = false;
    }
}

function readState(state) {
    const codes = [];
    if (state.bold) codes.push(1);
    if (state.dim) codes.push(2);
    if (state.italic) codes.push(3);
    if (state.underline) codes.push(4);
    if (state.blink) codes.push(5);
    if (state.inverse) codes.push(7);
    if (state.hidden) codes.push(8);
    if (state.strikethrough) codes.push(9);
    return codes;
}

function unwindState(currentState, targetState) {
    const codes = [];
    if (currentState.bold && !targetState.bold) codes.push(22);
    if (currentState.dim && !targetState.dim) codes.push(22);
    if (currentState.italic && !targetState.italic) codes.push(23);
    if (currentState.underline && !targetState.underline) codes.push(24);
    if (currentState.blink && !targetState.blink) codes.push(25);
    if (currentState.inverse && !targetState.inverse) codes.push(27);
    if (currentState.hidden && !targetState.hidden) codes.push(28);
    if (currentState.strikethrough && !targetState.strikethrough) codes.push(29);
    return codes;
}

function rewindState(currentState, targetState) {
    const codes = [];
    if (!currentState.bold && targetState.bold) codes.push(1);
    if (!currentState.dim && targetState.dim) codes.push(2);
    if (!currentState.italic && targetState.italic) codes.push(3);
    if (!currentState.underline && targetState.underline) codes.push(4);
    if (!currentState.blink && targetState.blink) codes.push(5);
    if (!currentState.inverse && targetState.inverse) codes.push(7);
    if (!currentState.hidden && targetState.hidden) codes.push(8);
    if (!currentState.strikethrough && targetState.strikethrough) codes.push(9);
    return codes;
}

function truncateWidth(str, width) {
    if (width <= 0) return '';
    let result = '';
    let currentWidth = 0;
    for (const char of str) {
        const charWidth = stringWidth(char);
        if (currentWidth + charWidth > width) break;
        result += char;
        currentWidth += charWidth;
    }
    return result;
}

function truncateWidthWithAnsi(str, width) {
    if (width <= 0) return '';
    const codes = str.match(codeRegex) || [];
    const visibleStr = str.replace(codeRegex, '');
    let result = '';
    let currentWidth = 0;
    let codeIndex = 0;
    let visibleIndex = 0;
    
    for (let i = 0; i < str.length; i++) {
        if (codeIndex < codes.length && str.substring(i).startsWith(codes[codeIndex])) {
            result += codes[codeIndex];
            i += codes[codeIndex].length - 1;
            codeIndex++;
            continue;
        }
        const char = str[i];
        const charWidth = stringWidth(char);
        if (currentWidth + charWidth > width) break;
        result += char;
        currentWidth += charWidth;
        visibleIndex++;
    }
    return result;
}

function truncate(str, width, options = {}) {
    const { position = 'end', ellipsis = '…', preferAnsi = true } = options;
    if (width <= 0) return '';
    const ellipsisWidth = stringWidth(ellipsis);
    if (width < ellipsisWidth) return '';
    
    const truncateFn = preferAnsi ? truncateWidthWithAnsi : truncateWidth;
    
    if (position === 'end') {
        const truncated = truncateFn(str, width - ellipsisWidth);
        return truncated + (strlen(truncated) < strlen(str) ? ellipsis : '');
    } else if (position === 'start') {
        const totalWidth = strlen(str);
        if (totalWidth <= width) return str;
        const startWidth = totalWidth - width + ellipsisWidth;
        let skippedWidth = 0;
        let startIndex = 0;
        for (let i = 0; i < str.length; i++) {
            const charWidth = stringWidth(str[i]);
            if (skippedWidth + charWidth > startWidth) {
                startIndex = i;
                break;
            }
            skippedWidth += charWidth;
        }
        return ellipsis + str.substring(startIndex);
    } else if (position === 'middle') {
        const totalWidth = strlen(str);
        if (totalWidth <= width) return str;
        const halfWidth = Math.floor((width - ellipsisWidth) / 2);
        const leftPart = truncateFn(str, halfWidth);
        const rightPartWidth = width - ellipsisWidth - strlen(leftPart);
        const rightPart = truncateFn(reverseString(str), rightPartWidth);
        return leftPart + ellipsis + reverseString(rightPart);
    }
    return str;
}

function reverseString(str) {
    return str.split('').reverse().join('');
}

function defaultOptions() {
    return {
        width: 80,
        wordWrap: true,
        trim: true,
        hard: false,
        ansi: true
    };
}

function mergeOptions(options) {
    return { ...defaultOptions(), ...options };
}

function wordWrap(text, options = {}) {
    const opts = mergeOptions(options);
    const { width, hard, trim, ansi } = opts;
    
    if (!text) return '';
    
    const lines = text.split('\n');
    const result = [];
    
    for (const line of lines) {
        if (!line) {
            result.push('');
            continue;
        }
        
        let currentLine = '';
        let currentWidth = 0;
        const words = line.split(/\s+/);
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const wordWidth = ansi ? strlen(word.replace(codeRegex, '')) : strlen(word);
            
            if (wordWidth > width) {
                if (currentLine) {
                    result.push(trim ? currentLine.trim() : currentLine);
                    currentLine = '';
                    currentWidth = 0;
                }
                
                if (hard) {
                    let remaining = word;
                    while (strlen(remaining.replace(codeRegex, '')) > width) {
                        const chunk = truncateWidthWithAnsi(remaining, width);
                        result.push(chunk);
                        remaining = remaining.substring(chunk.length);
                    }
                    if (remaining) {
                        currentLine = remaining;
                        currentWidth = strlen(remaining.replace(codeRegex, ''));
                    }
                } else {
                    result.push(word);
                }
                continue;
            }
            
            const spaceWidth = currentLine ? 1 : 0;
            if (currentWidth + spaceWidth + wordWidth > width) {
                result.push(trim ? currentLine.trim() : currentLine);
                currentLine = word;
                currentWidth = wordWidth;
            } else {
                currentLine = currentLine ? currentLine + ' ' + word : word;
                currentWidth += spaceWidth + wordWidth;
            }
        }
        
        if (currentLine) {
            result.push(trim ? currentLine.trim() : currentLine);
        }
    }
    
    return result.join('\n');
}

function textWrap(text, options = {}) {
    return wordWrap(text, options);
}

function multiLineWordWrap(text, options = {}) {
    return wordWrap(text, options);
}

function colorizeLines(lines, colorFn) {
    if (!Array.isArray(lines)) return [];
    return lines.map((line, index) => colorFn(line, index));
}

function hyperlink(text, url) {
    return `\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007`;
}

function parseHexValue(hex) {
    if (!hex) return null;
    const cleanHex = hex.replace(/^#/, '');
    if (cleanHex.length === 3) {
        return {
            r: parseInt(cleanHex[0] + cleanHex[0], 16),
            g: parseInt(cleanHex[1] + cleanHex[1], 16),
            b: parseInt(cleanHex[2] + cleanHex[2], 16)
        };
    } else if (cleanHex.length === 6) {
        return {
            r: parseInt(cleanHex.substring(0, 2), 16),
            g: parseInt(cleanHex.substring(2, 4), 16),
            b: parseInt(cleanHex.substring(4, 6), 16)
        };
    }
    return null;
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
