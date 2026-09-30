'use strict';

const main = input => {
    const lines = input.trim().split('\n');
    const count = parseInt(lines[0].split(' ')[0]);

    const lengths = lines[1]
        .split(' ')
        .map(value => parseInt(value))
        .sort((a, b) => b - a);

    const longest = lengths.shift();
    const remainingTotal = lengths.reduce((sum, value) => sum + value);

    console.log(longest < remainingTotal ? 'Yes' : 'No');
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
