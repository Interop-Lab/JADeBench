'use strict';

const fs = require('fs');

const main = input => {
    const values = input.split(' ').map(value => parseInt(value));
    const distance = values[0];
    const firstPosition = values[1];
    const secondPosition = values[2];

    const firstEnd = firstPosition + distance;
    const secondEnd = secondPosition + distance;

    let earlierEnd;
    let laterStart;

    if (firstPosition <= secondPosition) {
        earlierEnd = firstEnd;
        laterStart = secondPosition;
    } else {
        earlierEnd = secondEnd;
        laterStart = firstPosition;
    }

    if (earlierEnd < laterStart) {
        console.log(laterStart - earlierEnd);
    } else {
        console.log(0);
    }
};

main(fs.readFileSync('/dev/stdin', 'utf-8'));
