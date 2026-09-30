'use strict';

const fs = require('fs');

function getPair(value) {
    const invertedBinary = value
        .toString(2)
        .split('')
        .map(bit => bit === '1' ? '0' : '1')
        .join('');

    return parseInt(invertedBinary, 2) + 1;
}

function main(input) {
    const lines = input.split('\n').filter(line => line !== '');
    const numbers = lines[1].split(' ').map(Number);
    const remaining = numbers.sort((a, b) => b - a);

    let pairCount = 0;

    while (remaining.length > 0) {
        const value = remaining[0];
        remaining.splice(0, 1);

        const pair = getPair(value);
        const pairIndex = remaining.findIndex(candidate => candidate === pair);

        if (pairIndex >= 0) {
            remaining.splice(pairIndex, 1);
            pairCount++;
        }
    }

    console.log(pairCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
