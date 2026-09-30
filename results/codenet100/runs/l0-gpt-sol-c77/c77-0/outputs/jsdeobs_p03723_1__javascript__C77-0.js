'use strict';

const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const tokens = input.split(/ |\n/);
let tokenIndex = 0;

function nextNumbers(count) {
    return tokens.slice(tokenIndex, tokenIndex += count).map(value => +value);
}

const deadline = +new Date() + 900;

function main() {
    let [a, b, c] = nextNumbers(3);
    let exchanges = 0;

    while (new Date() < deadline) {
        if (a % 2 || b % 2 || c % 2) {
            return exchanges;
        }

        const nextA = (b + c) >> 1;
        const nextB = (a + c) >> 1;
        const nextC = (a + b) >> 1;

        a = nextA;
        b = nextB;
        c = nextC;
        exchanges++;
    }

    return -1;
}

const output = main();
if (output !== undefined) {
    console.log(String(output));
}
