'use strict';

const fs = require('fs');

function countOddValuesAtEvenIndexes(input) {
  const numbers = input.trim().split('\n')[0].split(' ').map(Number);
  let count = 0;

  for (let index = 0; index < numbers.length; index += 2) {
    if (numbers[index] % 2 !== 0) {
      count++;
    }
  }

  return count;
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(countOddValuesAtEvenIndexes(input));
