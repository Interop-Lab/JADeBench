'use strict';

function getPair(number) {
    const invertedBinary = number
        .toString(2)
        .split('')
        .map(bit => bit === '1' ? '0' : '1')
        .reduce((result, bit) => result + bit, '');

    return parseInt(invertedBinary, 2) + 1;
}

function main(input) {
    const lines = input.split('\n').filter(line => line !== '');
    const numbers = lines[1]
        .split(' ')
        .map(Number)
        .sort((a, b) => b - a);

    let pairCount = 0;

    while (numbers.length > 0) {
        const number = numbers[0];
        numbers.splice(0, 1);

        const pair = getPair(number);
        const pairIndex = numbers.findIndex(candidate => candidate === pair);

        if (pairIndex >= 0) {
            numbers.splice(pairIndex, 1);
            pairCount++;
        }
    }

    console.log(pairCount);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
