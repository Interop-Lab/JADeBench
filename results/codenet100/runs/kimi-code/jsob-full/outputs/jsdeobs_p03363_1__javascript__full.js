'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const valueCount = Number(lines[0]) - 1;
  const values = lines[1].split(' ').map(Number);

  const prefixSums = new Array(valueCount).fill(0);
  for (let index = 0; index < valueCount; index++) {
    prefixSums[index] = (prefixSums[index - 1] || 0) + values[index];
  }

  const frequencyBySum = { 0: 1 };
  for (const prefixSum of prefixSums) {
    frequencyBySum[prefixSum] = (frequencyBySum[prefixSum] || 0) + 1;
  }

  let zeroSumRangeCount = 0;
  for (const frequency of Object.values(frequencyBySum)) {
    zeroSumRangeCount += frequency * (frequency - 1) / 2;
  }

  console.log(zeroSumRangeCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
