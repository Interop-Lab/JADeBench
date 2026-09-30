'use strict';

function getPair(number) {
  const invertedBinary = number
    .toString(2)
    .split('')
    .map((bit) => (bit === '1' ? '0' : '1'))
    .join('');

  return parseInt(invertedBinary, 2) + 1;
}

function main(input) {
  const lines = input.split('\n').filter((line) => line !== '');
  const numbers = lines[1].split(' ').map(Number);
  const remainingNumbers = numbers.sort((left, right) => right - left);
  let pairCount = 0;

  while (remainingNumbers.length > 0) {
    const largestNumber = remainingNumbers.shift();
    const pair = getPair(largestNumber);
    const pairIndex = remainingNumbers.findIndex((number) => number === pair);

    if (pairIndex >= 0) {
      remainingNumbers.splice(pairIndex, 1);
      pairCount += 1;
    }
  }

  console.log(pairCount);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
