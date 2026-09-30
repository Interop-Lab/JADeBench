'use strict';

const fs = require('fs');

function main(input) {
  const numbers = input.trim().split('\n')[1].split(' ').map(Number);
  let oddValuesAtEvenIndices = 0;

  for (let index = 0; index < numbers.length; index++) {
    if (index % 2 !== 0) continue;
    if (numbers[index] % 2 === 0) continue;

    oddValuesAtEvenIndices++;
  }

  console.log(oddValuesAtEvenIndices);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
