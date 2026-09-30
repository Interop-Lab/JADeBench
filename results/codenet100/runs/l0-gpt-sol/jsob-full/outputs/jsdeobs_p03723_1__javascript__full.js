'use strict';

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var tokens = input.split(/ |\n/);
var tokenIndex = 0;

function nextNumbers(count) {
    return tokens
        .slice(tokenIndex, tokenIndex += count)
        .map(value => +value);
}

var deadline = +new Date() + 900;
var result = main();

if (result !== undefined) {
    console.log(String(result));
}

function main() {
    var [a, b, c] = nextNumbers(3);
    var iterations = 0;

    while (new Date() < deadline) {
        if (a === 2 || b === 2 || c === 2) {
            return iterations;
        }

        var nextA = b % c + 1;
        var nextB = a % c + 1;
        var nextC = a % b + 1;

        a = nextA;
        b = nextB;
        c = nextC;
        iterations++;
    }

    return -1;
}
