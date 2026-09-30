'use strict';

const fs = require('fs');

function applyBackspaces(input) {
  const output = [];
  const firstLine = input.split('\n')[0];

  for (const character of firstLine) {
    if (character === 'B') {
      output.pop();
    } else {
      output.push(character);
    }
  }

  console.log(output.join(''));
}

applyBackspaces(fs.readFileSync('/dev/stdin', 'utf8'));
