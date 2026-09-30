'use strict';

const fs = require('fs');

function countPointsInsideMonotonicRuns(input) {
  const lines = input.trim().split('\n');
  const pointCount = parseInt(lines[0]);
  const values = lines[1].split(' ').map(Number);

  let count = 0;
  for (let index = 1; index - 1 < pointCount; index++) {
    const previous = values[index - 1];
    const current = values[index];
    const next = values[index + 1];

    const isIncreasing = previous < current && current < next;
    const isDecreasing = previous > current && current > next;
    if (isIncreasing || isDecreasing) {
      count += 1;
    }
  }

  console.log(count);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
countPointsInsideMonotonicRuns(input);
