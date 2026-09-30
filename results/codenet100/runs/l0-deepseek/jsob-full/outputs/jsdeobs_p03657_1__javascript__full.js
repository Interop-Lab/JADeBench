'use strict';

function Main(input) {
    const lines = input.split('\n');
    const parts = lines[0].split(' ');
    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);
    const c = parseInt(parts[2], 10);
    if (a % 2 === 0 || b % 2 === 0 || (a + b + c) % 3 === 0) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}

Main(require('fs').readFileSync('input.txt', 'utf8'));
