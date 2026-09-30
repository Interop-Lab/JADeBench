'use strict';

function Main(input) {
    const firstLine = input.split('\n')[0];

    if (firstLine == 7 || firstLine == 5 || firstLine == 3) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
