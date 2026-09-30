'use strict';

const fs = require('fs');

function getBinaryComplementPair(number) {
  const invertedBinary = number
    .toString(2)
    .split('')
    .map((bit) => (bit === '1' ? '0' : '1'))
    .join('');

  return parseInt(invertedBinary, 2) + 1;
}

function main(input) {
  const lines = input.split('\n').filter((line) => line !== '');
  const numbers = lines[1]
    .split(' ')
    .map(Number)
    .sort((left, right) => right - left);

  let pairCount = 0;

  while (numbers.length > 0) {
    const number = numbers.shift();
    const desiredPair = getBinaryComplementPair(number);
    const pairIndex = numbers.findIndex((candidate) => candidate === desiredPair);

    if (pairIndex >= 0) {
      numbers.splice(pairIndex, 1);
      pairCount++;
    }
  }

  console.log(pairCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
