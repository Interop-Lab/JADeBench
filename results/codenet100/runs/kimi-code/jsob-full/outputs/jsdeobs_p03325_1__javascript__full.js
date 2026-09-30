'use strict';

const fs = require('fs');

function main(input) {
  const numbers = input
    .split('\n')[1]
    .split(' ')
    .map((value) => Number(value));

  let divisionCount = 0;

  for (let number of numbers) {
    while (number % 2 === 0) {
      number /= 2;
      divisionCount += 1;
    }
  }

  console.log(divisionCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
