'use strict';

const fs = require('fs');

function main(input) {
  const numbers = input
    .trim()
    .split(' ')
    .map(value => parseInt(value, 10));

  let firstNumber = numbers[0];
  let secondNumber = numbers[1];
  const originalFirstNumber = firstNumber;
  const originalSecondNumber = secondNumber;
  let greatestCommonDivisor;

  if (firstNumber >= secondNumber) {
    while (secondNumber > 0) {
      const remainder = firstNumber % secondNumber;
      firstNumber = secondNumber;
      secondNumber = remainder;
    }
    greatestCommonDivisor = firstNumber;
  } else {
    while (firstNumber > 0) {
      const remainder = secondNumber % firstNumber;
      secondNumber = firstNumber;
      firstNumber = remainder;
    }
    greatestCommonDivisor = secondNumber;
  }

  const leastCommonMultiple =
    (originalFirstNumber * originalSecondNumber) / greatestCommonDivisor;
  console.log(leastCommonMultiple);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
