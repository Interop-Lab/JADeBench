'use strict';

const fs = require('fs');

function main(input) {
  const numbers = input
    .trim()
    .split('\n')[1]
    .split(' ')
    .map(Number);

  let oddPositionAndValueCount = 0;

  for (let index = 0; index < numbers.length; index++) {
    const isEvenPosition = (index + 1) % 2 === 0;
    if (isEvenPosition) continue;

    const isEvenValue = numbers[index] % 2 === 0;
    if (isEvenValue) continue;

    oddPositionAndValueCount++;
  }

  console.log(oddPositionAndValueCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
