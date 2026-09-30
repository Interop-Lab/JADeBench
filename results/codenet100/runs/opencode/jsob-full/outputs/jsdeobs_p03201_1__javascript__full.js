'use strict';

const fs = require('fs');

/**
 * Return the positive integer that completes `value` to the next power of two.
 *
 * The original algorithm derives this by complementing every digit in the
 * value's binary representation and adding one.
 */
function getPair(value) {
  const complementedBinary = value
    .toString(2)
    .split('')
    .map((digit) => (digit === '1' ? '0' : '1'))
    .reduce((result, digit) => result + digit, '');

  return parseInt(complementedBinary, 2) + 1;
}

function main(input) {
  const lines = input.split('\n').filter((line) => line !== '');
  const numbers = lines[1]
    .split(' ')
    .map(Number)
    .sort((left, right) => right - left);

  let pairCount = 0;

  while (numbers.length > 0) {
    const value = numbers[0];
    numbers.splice(0, 1);

    const partner = getPair(value);
    const partnerIndex = numbers.findIndex((candidate) => candidate === partner);

    if (partnerIndex >= 0) {
      numbers.splice(partnerIndex, 1);
      pairCount++;
    }
  }

  console.log(pairCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
