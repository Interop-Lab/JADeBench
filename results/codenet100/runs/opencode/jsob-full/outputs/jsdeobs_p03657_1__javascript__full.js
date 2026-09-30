'use strict';

const fs = require('fs');

function main(input) {
  const firstLine = input.split('\n')[0];
  const [firstValue, secondValue] = firstLine.split(' ');

  const isPossible =
    firstValue % 3 === 0 ||
    secondValue % 3 === 0 ||
    (firstValue + secondValue) % 3 === 0;

  console.log(isPossible ? 'Possible' : 'Impossible');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
