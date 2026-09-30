'use strict';

const fs = require('fs');

function greatestCommonDivisor(firstNumber, secondNumber) {
  if (firstNumber >= secondNumber) {
    while (secondNumber > 0) {
      const remainder = firstNumber % secondNumber;
      firstNumber = secondNumber;
      secondNumber = remainder;
    }
    return firstNumber;
  }

  while (firstNumber > 0) {
    const remainder = secondNumber % firstNumber;
    secondNumber = firstNumber;
    firstNumber = remainder;
  }
  return secondNumber;
}

function printLeastCommonMultiple(input) {
  const numbers = input
    .trim()
    .split(' ')
    .map((value) => Number.parseInt(value, 10));
  const firstNumber = numbers[0];
  const secondNumber = numbers[1];
  const divisor = greatestCommonDivisor(firstNumber, secondNumber);
  const leastCommonMultiple = (firstNumber * secondNumber) / divisor;

  console.log(leastCommonMultiple);
}

printLeastCommonMultiple(fs.readFileSync('/dev/stdin', 'utf8'));
