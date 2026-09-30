'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.split('\n');

const n = lines[0];
const target = lines[1].split(' ').map(value => parseInt(value));
const current = lines[2].split(' ').map(value => parseInt(value));

let count = 0;

while (true) {
    const maxIndex = current.indexOf(Math.max(...current));

    if (maxIndex == 0) {
        current[maxIndex] =
            current[maxIndex] - current[1] - current[n - 1];
    } else if (maxIndex == n - 1) {
        current[maxIndex] =
            current[maxIndex] - current[n - 2] - current[0];
    } else {
        current[maxIndex] =
            current[maxIndex] -
            current[maxIndex - 1] -
            current[maxIndex + 1];
    }

    count++;

    if (JSON.stringify(current) == JSON.stringify(target)) {
        console.log(count);
        break;
    }

    if (current.some(value => value < 1)) {
        console.log(-1);
        break;
    }
}
