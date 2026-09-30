const fs = require('fs');

const LIMIT = 300000;
const available = [];

for (let value = 0; value < LIMIT; value++) {
    available[value] = true;
}

const candidates = [];

for (let index = 1; ; index++) {
    const lower = 7 * index - 1;
    const upper = 7 * index + 1;

    if (lower > LIMIT) {
        break;
    }

    if (available[lower]) {
        candidates.push(lower);
    }

    if (available[upper]) {
        candidates.push(upper);
    }

    for (let multiplier = 2; lower * multiplier <= LIMIT; multiplier++) {
        available[lower * multiplier] = false;
        available[upper * multiplier] = false;
    }
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

while (true) {
    const number = lines.shift() - 0;

    if (number === 1) {
        break;
    }

    const factors = [];

    candidates.some(function (candidate) {
        if (number % candidate === 0) {
            factors.push(candidate);
        }

        return number < candidate;
    });

    console.log(number + ': ' + factors.join(' '));
}
