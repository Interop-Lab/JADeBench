'use strict';

const fs = require('fs');

function reconstructValues(input) {
  const lines = input.trim().split('\n');
  const valueCount = parseInt(lines[0]);
  const doubledPairAverages = lines[1]
    .split(' ')
    .map((value) => parseInt(2 * value));

  let alternatingSum = 0;
  for (let index = 0; index < valueCount; index += 1) {
    alternatingSum = doubledPairAverages[index] - alternatingSum;
  }

  let currentValue = alternatingSum / 2;
  const reconstructedValues = [];
  for (let index = 0; index < valueCount; index += 1) {
    reconstructedValues.push(currentValue);
    currentValue = doubledPairAverages[index] - currentValue;
  }

  console.log(reconstructedValues.join(' '));
}

reconstructValues(fs.readFileSync('/dev/stdin', 'utf8'));
