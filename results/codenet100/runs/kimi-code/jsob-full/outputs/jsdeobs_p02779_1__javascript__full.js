'use strict';

const fs = require('fs');

function Main(input) {
  const lines = input.trim().split('\n');
  const count = Number(lines[0].trim());
  const values = lines[1].trim().split(' ').map(Number);

  let answer = 'YES';
  for (let index = 0; index < count; index++) {
    const laterValues = values.slice(index + 1);
    if (laterValues.indexOf(values[index]) !== -1) {
      answer = 'NO';
      break;
    }
  }

  console.log(answer);
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
