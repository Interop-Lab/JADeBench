'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const count = parseInt(lines[0]);
  const doubledValues = lines[1].split(' ').map(value => parseInt(2 * value));

  let alternatingSum = 0;
  for (let index = 0; index < count; index++) {
    alternatingSum = doubledValues[index] - alternatingSum;
  }

  let currentValue = alternatingSum / 2;
  const restoredValues = [];

  for (let index = 0; index < count; index++) {
    restoredValues.push(currentValue);
    currentValue = doubledValues[index] - currentValue;
  }

  console.log(restoredValues.join(' '));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
