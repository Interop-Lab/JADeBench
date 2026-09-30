'use strict';

const fs = require('fs');

function main(input) {
  const numbers = input.trim().split('\n')[0].split(' ').map(Number);
  let oddNumbersAtOddPositions = 0;

  for (let index = 0; index < numbers.length; index += 2) {
    if (numbers[index] % 2 !== 0) {
      oddNumbersAtOddPositions++;
    }
  }

  console.log(oddNumbersAtOddPositions);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
