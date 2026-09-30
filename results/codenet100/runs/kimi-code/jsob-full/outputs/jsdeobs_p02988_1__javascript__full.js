'use strict';

const fs = require('fs');

function countMonotonicCenters(input) {
  const lines = input.trim().split('\n');
  const centerCount = parseInt(lines[0]);
  const values = lines[1].split(' ').map(Number);
  let monotonicCenters = 0;

  for (let index = 1; index - 1 < centerCount; index++) {
    const previous = values[index - 1];
    const current = values[index];
    const next = values[index + 1];

    if (
      (previous < current && current < next) ||
      (next < current && current < previous)
    ) {
      monotonicCenters++;
    }
  }

  console.log(monotonicCenters);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
countMonotonicCenters(input);
