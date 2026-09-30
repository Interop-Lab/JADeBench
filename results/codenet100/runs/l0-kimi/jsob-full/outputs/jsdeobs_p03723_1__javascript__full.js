'use strict';
var input = require('fs').readFileSync('stdin', 'utf8');
var cin = input.split(/ |\n/);
var cid = 0;

function next() {
    return +cin[cid++];
}

function nextstr() {
    return cin[cid++];
}

function nextbig() {
    return BigInt(cin[cid++]);
}

function nexts(n, asNumbers) {
    return asNumbers
        ? cin.slice(cid, cid += n).map(x => +x)
        : cin.slice(cid, cid += n);
}

function nextm(rows, cols, asNumbers) {
    var result = [];
    var i = 0;
    if (asNumbers) {
        for (; i < rows; i++) {
            result.push(cin.slice(cid, cid += cols).map(x => +x));
        }
    } else {
        for (; i < rows; i++) {
            result.push(cin.slice(cid, cid += cols));
        }
    }
    return result;
}

function xArray(dimensions) {
    var args = arguments;
    var size = args[dimensions];
    var code = 'new Array(' + --size + ')';
    while (--size) {
        code = 'new Array(' + size + ').fill(' + code + ')';
    }
    return eval(code);
}

var tm = +new Date() + 2000;
var myOut = main();
if (myOut !== undefined) {
    console.log(String(myOut));
}

function main() {
    var [a, b, c] = nexts(3);
    var count = 0;
    while (new Date() < tm) {
        if (a % 2 === 0 || b % 2 === 0 || c % 2 === 0) {
            return -1;
        }
        var newA = (b + c) >> 1;
        var newB = (a + c) >> 1;
        var newC = (a + b) >> 1;
        a = newA;
        b = newB;
        c = newC;
        count++;
    }
    return -1;
}
