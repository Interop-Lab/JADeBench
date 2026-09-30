'use strict';
var fs = require('fs');
var input = fs.readFileSync('stdin', 'utf8');
var cin = input.split(/ |\n/);
var cid = 0;

function next(isString) {
    return isString ? cin[cid++] : +cin[cid++];
}

function nexts(count, asStrings) {
    return asStrings ? cin.slice(cid, cid += count) : cin.slice(cid, cid += count).map(s => +s);
}

function nextm(rows, cols, asStrings) {
    var result = [];
    for (var i = 0; i < rows; i++) {
        if (asStrings) {
            result.push(cin.slice(cid, cid += cols));
        } else {
            result.push(cin.slice(cid, cid += cols).map(s => +s));
        }
    }
    return result;
}

function xArray(code) {
    var args = arguments;
    var n = args.length;
    var result = 'var xArray = [' + --n + ']; while(--' + n + ') xArray[' + n + '] = arguments[' + n + ']; return eval(' + code + ')';
    while (--n) {
        result = 'var xArray = [' + n + ']; while(--' + n + ') xArray[' + n + '] = arguments[' + n + ']; return eval(' + result + ')';
    }
    return eval(result);
}

function main() {
    var arr = nexts(5);
    var result = arr[0] * arr[1] * arr[2] * arr[3] * arr[4];
    
    switch ((arr[0] | arr[1]) + (arr[2] | arr[3]) + (arr[4] | 0)) {
        case 0:
            result += 1;
            break;
        case 1:
            if ((arr[0] + arr[1]) === arr[2]) {
                result += 2;
            }
            break;
    }
    
    return result;
}

var myOut = main();
if (myOut !== undefined) console.log(myOut);
