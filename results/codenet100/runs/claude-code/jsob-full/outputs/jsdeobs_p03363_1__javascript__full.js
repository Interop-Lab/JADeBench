'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const valueCount = Number(lines[0]) - 1;
  const values = lines[1].split(' ').map(Number);

  const prefixSums = new Array(valueCount).fill(0);
  for (let index = 0; index < valueCount; index += 1) {
    prefixSums[index] += (prefixSums[index - 1] || 0) + values[index];
  }

  const frequencyBySum = { 0: 1 };
  for (let index = 0; index < valueCount; index += 1) {
    const sum = prefixSums[index];
    frequencyBySum[sum] = (frequencyBySum[sum] || 0) + 1;
  }

  let pairCount = 0;
  Object.keys(frequencyBySum).forEach((sum) => {
    const frequency = frequencyBySum[sum];
    pairCount += (frequency * (frequency - 1)) / 2;
  });

  console.log(pairCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
