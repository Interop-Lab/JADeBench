'use strict';

const fs = require('fs');

const Main = (input) => {
  const lines = input.trim().split('\n');
  const size = parseInt(lines[0]);
  const values = lines[1].split(' ').map(Number);
  let monotonicCenterCount = 0;

  for (let index = 1; index <= size; index++) {
    const previous = values[index - 1];
    const current = values[index];
    const next = values[index + 1];
    const isIncreasing = previous < current && current < next;
    const isDecreasing = next < current && current < previous;

    if (isIncreasing || isDecreasing) {
      monotonicCenterCount += 1;
    }
  }

  console.log(monotonicCenterCount);
};

Main(fs.readFileSync('/dev/stdin', 'utf8'));
