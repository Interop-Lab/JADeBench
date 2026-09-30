'use strict';

const fs = require('fs');

const main = input => {
    const values = input.split(' ').map(value => parseInt(value));
    const length = values[0];
    const firstStart = values[1];
    const secondStart = values[2];

    const firstEnd = firstStart + length;
    const secondEnd = secondStart + length;

    const points = firstStart < secondStart
        ? [firstStart, firstEnd, secondStart, secondEnd]
        : [secondStart, secondEnd, firstStart, firstEnd];

    if (points[1] <= points[2]) {
        console.log(points[2] - points[1]);
    } else {
        console.log(0);
    }
};

main(fs.readFileSync('/dev/stdin', 'utf8'));
