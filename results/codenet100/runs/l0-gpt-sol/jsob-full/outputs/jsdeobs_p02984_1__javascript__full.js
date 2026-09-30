'use strict';

function main(input) {
    const lines = input.trim().split('\n');
    const count = parseInt(lines[0]);
    const values = lines[1].split(' ').map(value => parseInt(2 * value));

    let alternatingSum = 0;
    for (let i = 0; i < count; i++) {
        alternatingSum = values[i] - alternatingSum;
    }

    let current = alternatingSum / 2;
    const result = [];

    for (let i = 0; i < count; i++) {
        result.push(current);
        current = values[i] - current;
    }

    console.log(result.join(' '));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
