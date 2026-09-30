'use strict';

const fs = require('fs');

function determineDivisibility(input) {
  const firstLine = input.split('\n')[0];
  const numbers = firstLine.split(' ');

  const firstIsDivisibleByThree = numbers[0] % 3 === 0;
  const secondIsDivisibleByThree = numbers[1] % 3 === 0;
  const sumIsDivisibleByThree = (numbers[0] + numbers[1]) % 3 === 0;

  if (firstIsDivisibleByThree || secondIsDivisibleByThree || sumIsDivisibleByThree) {
    console.log('Possible');
  } else {
    console.log('Impossible');
  }
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
determineDivisibility(input);
