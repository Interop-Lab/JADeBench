'use strict';

const fs = require('fs');

const main = input => {
    const lines = input.trim().split('\n');
    const count = parseInt(lines[0]);
    const doubledSums = lines[1]
        .split(' ')
        .map(value => parseInt(2 * value));

    let alternatingDifference = 0;
    for (let i = 0; i < count; i++) {
        alternatingDifference = doubledSums[i] - alternatingDifference;
    }

    let currentValue = alternatingDifference / 2;
    const values = [];

    for (let i = 0; i < count; i++) {
        values.push(currentValue);
        currentValue = doubledSums[i] - currentValue;
    }

    console.log(values.join(' '));
};

main(fs.readFileSync('/dev/stdin', 'utf8'));
