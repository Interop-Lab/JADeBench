'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const valueCount = Number(lines[0]);
  const values = lines[1].split(' ').map(Number);

  const prefixSums = new Array(valueCount).fill(0);
  for (let index = 0; index < valueCount; index += 1) {
    prefixSums[index] += (prefixSums[index - 1] || 0) + values[index];
  }

  const prefixSumCounts = { 0: 1 };
  for (let index = 0; index < valueCount; index += 1) {
    const prefixSum = prefixSums[index];
    prefixSumCounts[prefixSum] = (prefixSumCounts[prefixSum] || 0) + 1;
  }

  let zeroSumRangeCount = 0;
  Object.keys(prefixSumCounts).forEach((prefixSum) => {
    const occurrenceCount = prefixSumCounts[prefixSum];
    zeroSumRangeCount += occurrenceCount * (occurrenceCount - 1) / 2;
  });

  console.log(zeroSumRangeCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
