'use strict';

const fs = require('fs');

function isPossible(input) {
  const firstLine = input.split('\n')[0];
  const values = firstLine.split(' ');
  const firstValue = values[0];
  const secondValue = values[1];

  return (
    firstValue % 3 === 0 ||
    secondValue % 3 === 0 ||
    (firstValue + secondValue) % 3 === 0
  );
}

function main(input) {
  console.log(isPossible(input) ? 'Possible' : 'Impossible');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
