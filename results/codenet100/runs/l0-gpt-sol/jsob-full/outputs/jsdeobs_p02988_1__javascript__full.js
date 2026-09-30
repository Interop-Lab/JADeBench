'use strict';

const Main = input => {
    const lines = input.trim().split('\n');
    const n = parseInt(lines[0]);
    const numbers = lines[1].split(' ').map(Number);

    let count = 0;

    for (let i = 1; i + 1 < n; i++) {
        if (
            (numbers[i - 1] < numbers[i] && numbers[i] < numbers[i + 1]) ||
            (numbers[i + 1] < numbers[i] && numbers[i] < numbers[i - 1])
        ) {
            count++;
        }
    }

    console.log(count);
};

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
