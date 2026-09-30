'use strict';

const fs = require('fs');

function countZeroSumSubarrays(input) {
  const lines = input.trim().split('\n');
  const valueCount = lines[0] * 1;
  const values = lines[1].split(' ').map(value => value * 1);

  const prefixSums = new Array(valueCount).fill(0);
  for (let index = 0; index < valueCount; index++) {
    prefixSums[index] = (prefixSums[index - 1] || 0) + values[index];
  }

  const prefixSumFrequencies = { 0: 1 };
  for (let index = 0; index < valueCount; index++) {
    const prefixSum = prefixSums[index];
    prefixSumFrequencies[prefixSum] = (prefixSumFrequencies[prefixSum] || 0) + 1;
  }

  let zeroSumSubarrayCount = 0;
  Object.keys(prefixSumFrequencies).forEach(prefixSum => {
    const frequency = prefixSumFrequencies[prefixSum];
    zeroSumSubarrayCount += frequency * (frequency - 1) / 2;
  });

  console.log(zeroSumSubarrayCount);
}

countZeroSumSubarrays(fs.readFileSync('/dev/stdin', 'utf8'));
