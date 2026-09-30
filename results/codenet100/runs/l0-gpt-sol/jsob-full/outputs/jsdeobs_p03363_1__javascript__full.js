'use strict';

const fs = require('fs');

const main = input => {
    const lines = input.trim().split('\n');
    const count = lines[0] / 1;
    const values = lines[1].split(' ').map(value => value * 1);

    const prefixSums = new Array(count).fill(0);
    for (let i = 0; i < count; i++) {
        prefixSums[i] += (prefixSums[i - 1] || 0) + values[i];
    }

    const frequencies = { 0: 1 };
    for (let i = 0; i < count; i++) {
        const sum = prefixSums[i];
        frequencies[sum] = (frequencies[sum] || 0) + 1;
    }

    let result = 0;
    Object.keys(frequencies).forEach(sum => {
        const frequency = frequencies[sum];
        result += frequency * (frequency - 1) / 2;
    });

    console.log(result);
};

main(fs.readFileSync('./input.in', 'utf8'));
