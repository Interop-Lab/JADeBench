'use strict';

const fs = require('fs');

function processBackspaces(input) {
  const firstLine = input.split('\n')[0];
  const output = [];

  for (const character of firstLine.split('')) {
    if (character === 'B') {
      output.pop();
    } else {
      output.push(character);
    }
  }

  console.log(output.join(''));
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
processBackspaces(input);
