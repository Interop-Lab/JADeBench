'use strict';

const fs = require('fs');

function countFactorsOfTwo(input) {
  const numbers = input
    .split('\n')[1]
    .split(' ')
    .map((value) => Number(value));

  let factorCount = 0;

  for (let number of numbers) {
    while (number % 2 === 0) {
      number /= 2;
      factorCount += 1;
    }
  }

  console.log(factorCount);
}

countFactorsOfTwo(fs.readFileSync('/dev/stdin', 'utf8'));
