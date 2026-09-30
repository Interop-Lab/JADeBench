'use strict';

const fs = require('fs');

function greatestCommonDivisor(left, right) {
  if (left >= right) {
    while (right > 0) {
      const remainder = left % right;
      left = right;
      right = remainder;
    }
    return left;
  }

  while (left > 0) {
    const remainder = right % left;
    right = left;
    left = remainder;
  }
  return right;
}

function main(input) {
  const [left, right] = input
    .trim()
    .split(' ')
    .map((value) => parseInt(value, 10));

  const divisor = greatestCommonDivisor(left, right);
  const leastCommonMultiple = (left * right) / divisor;
  console.log(leastCommonMultiple);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
