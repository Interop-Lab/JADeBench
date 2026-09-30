'use strict';

function main(input) {
  const lines = input.trim().split('\n');
  const numbers = lines[1]
    .split(' ')
    .map((number) => parseInt(number))
    .sort((left, right) => right - left);

  const largestNumber = numbers.shift();
  const sumOfRemainingNumbers = numbers.reduce((sum, number) => sum + number);

  console.log(largestNumber < sumOfRemainingNumbers ? 'Yes' : 'No');
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
