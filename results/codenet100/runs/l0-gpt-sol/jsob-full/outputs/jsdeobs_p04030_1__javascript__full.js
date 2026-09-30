'use strict';

function Main(input) {
  const characters = input.split('\n')[0].split('');
  const result = [];

  for (const character of characters) {
    if (character === 'B') {
      result.pop();
    } else {
      result.push(character);
    }
  }

  console.log(result.join(''));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
