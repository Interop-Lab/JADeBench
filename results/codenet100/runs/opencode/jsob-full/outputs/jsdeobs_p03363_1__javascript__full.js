'use strict';

function main(input) {
  const lines = input.trim().split('\n');
  const valueCount = lines[0] - 1;
  const values = lines[1].split(' ').map((value) => value * 1);

  const prefixSums = new Array(valueCount).fill(0);
  for (let index = 0; index < valueCount; index += 1) {
    prefixSums[index] += (prefixSums[index - 1] || 0) + values[index];
  }

  const frequencies = { 0: 1 };
  for (const sum of prefixSums) {
    frequencies[sum] = (frequencies[sum] || 0) + 1;
  }

  let zeroSumRangeCount = 0;
  Object.keys(frequencies).forEach((sum) => {
    const frequency = frequencies[sum];
    zeroSumRangeCount += (frequency * (frequency - 1)) / 2;
  });

  console.log(zeroSumRangeCount);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
