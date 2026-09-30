'use strict';

const fs = require('fs');

function getPair(value) {
  const invertedDigits = value
    .toString()
    .split('')
    .map((digit) => (digit === '1' ? '0' : '1'))
    .join('');

  return parseInt(invertedDigits, 2) + 1;
}

function main(input) {
  const lines = input.split('\n').filter((line) => line !== '');
  const numbers = lines[0].split(' ').map(Number);
  const remaining = numbers.sort((left, right) => right - left);
  let pairCount = 0;

  while (remaining.length > 0) {
    const [largest] = remaining.splice(0, 1);
    const pair = getPair(largest);
    const pairIndex = remaining.findIndex((value) => value === pair);

    if (pairIndex >= 0) {
      remaining.splice(pairIndex, 1);
      pairCount++;
    }
  }

  console.log(pairCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
