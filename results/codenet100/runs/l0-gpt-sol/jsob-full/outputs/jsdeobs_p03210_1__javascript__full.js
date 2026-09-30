'use strict';

function Main(input) {
    const value = input.split('\n')[0];

    if (value == 7 || value == 5 || value == 3) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
