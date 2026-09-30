'use strict';

function Main(input) {
    const characters = input.split('\n')[0].split('');
    const stack = [];

    for (const character of characters) {
        if (character === 'B') {
            stack.pop();
        } else {
            stack.push(character);
        }
    }

    console.log(stack.join(''));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
