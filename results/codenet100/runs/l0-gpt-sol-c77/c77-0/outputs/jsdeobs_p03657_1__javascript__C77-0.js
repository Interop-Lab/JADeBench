'use strict';

function Main(input) {
    const firstLine = input.split('\n')[0];
    const values = firstLine.split(' ');
    const first = values[0];
    const second = values[1];

    if (
        first % 3 === 0 ||
        second % 3 === 0 ||
        (first + second) % 3 === 0
    ) {
        console.log('Possible');
    } else {
        console.log('Impossible');
    }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
