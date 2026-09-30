'use strict';

const fs = require('fs');

function getPowerOfTwoComplement(value) {
  const invertedBits = value
    .toString(2)
    .split('')
    .map((bit) => (bit === '1' ? '0' : '1'))
    .join('');

  return parseInt(invertedBits, 2) + 1;
}

function main(input) {
  const lines = input.split('\n').filter((line) => line !== '');
  const numbers = lines[1].split(' ').map(Number);
  const remaining = numbers.sort((left, right) => right - left);
  let pairCount = 0;

  while (remaining.length > 0) {
    const largest = remaining[0];
    remaining.splice(0, 1);

    const complement = getPowerOfTwoComplement(largest);
    const complementIndex = remaining.findIndex((value) => value === complement);
    if (complementIndex >= 0) {
      remaining.splice(complementIndex, 1);
      pairCount++;
    }
  }

  console.log(pairCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
