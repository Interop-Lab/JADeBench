'use strict';

const fs = require('fs');

function reconstructValues(input) {
  const lines = input.trim().split('\n');
  const valueCount = parseInt(lines[0]);
  const adjacentSums = lines[1]
    .split(' ')
    .map((value) => parseInt(2 * value));

  let alternatingSum = 0;
  for (let index = 0; index < valueCount; index++) {
    alternatingSum = adjacentSums[index] - alternatingSum;
  }

  let currentValue = alternatingSum / 2;
  const reconstructedValues = [];

  for (let index = 0; index < valueCount; index++) {
    reconstructedValues.push(currentValue);
    currentValue = adjacentSums[index] - currentValue;
  }

  console.log(reconstructedValues.join(' '));
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
reconstructValues(input);
