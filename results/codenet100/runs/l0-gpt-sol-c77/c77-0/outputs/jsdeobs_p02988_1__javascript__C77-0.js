'use strict';

const fs = require('fs');

const Main = input => {
    const lines = input.trim().split('\n');
    const n = parseInt(lines[0]);
    const values = lines[1].split(' ').map(Number);

    let count = 0;

    for (let i = 1; i - 1 < n; i++) {
        const previous = values[i - 1];
        const current = values[i];
        const next = values[i + 1];

        if (
            (previous < current && current < next) ||
            (next < current && current < previous)
        ) {
            count++;
        }
    }

    console.log(count);
};

Main(fs.readFileSync('/dev/stdin', 'utf8'));
