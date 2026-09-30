'use strict';

const fs = require('fs');

function main(input) {
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

main(fs.readFileSync('/dev/stdin', 'utf8'));
