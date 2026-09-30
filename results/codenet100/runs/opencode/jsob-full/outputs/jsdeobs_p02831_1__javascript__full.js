'use strict';

const fs = require('fs');

function printLeastCommonMultiple(input) {
  const numbers = input
    .trim()
    .split(' ')
    .map((value) => parseInt(value, 10));

  let first = numbers[0];
  let second = numbers[1];
  const originalFirst = first;
  const originalSecond = second;
  let greatestCommonDivisor;

  if (first >= second) {
    while (second > 0) {
      const remainder = first % second;
      first = second;
      second = remainder;
    }
    greatestCommonDivisor = first;
  } else {
    while (first > 0) {
      const remainder = second % first;
      second = first;
      first = remainder;
    }
    greatestCommonDivisor = second;
  }

  const leastCommonMultiple =
    (originalFirst * originalSecond) / greatestCommonDivisor;
  console.log(leastCommonMultiple);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
printLeastCommonMultiple(input);
