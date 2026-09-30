const fs = require('fs');

const candidates = [];
const flags = [];

for (let i = 0; i < 300000; i++) {
    flags[i] = true;
}

let i = 1;

while (true) {
    const lower = 7 * i - 1;
    const upper = 7 * i + 1;

    if (lower > 300000) {
        break;
    }

    i++;

    if (flags[lower]) {
        candidates.push(lower);
    }

    if (flags[upper]) {
        candidates.push(upper);
    }

    let multiplier = 2;

    while (true) {
        if (lower * multiplier > 300000) {
            break;
        }

        flags[lower * multiplier] = false;
        flags[upper * multiplier] = false;
        multiplier++;
    }
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

while (true) {
    const number = lines.shift() - 0;

    if (number == 1) {
        break;
    }

    const divisors = [];

    candidates.some(function (candidate) {
        if (number % candidate == 0) {
            divisors.push(candidate);
        }

        return number < candidate;
    });

    console.log(number + ': ' + divisors.join(' '));
}
