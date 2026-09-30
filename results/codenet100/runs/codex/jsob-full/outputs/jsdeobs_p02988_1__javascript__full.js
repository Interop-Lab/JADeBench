'use strict';

const fs = require('fs');

const main = (input) => {
  const lines = input.trim().split('\n');
  const interiorPointCount = parseInt(lines[0]);
  const values = lines[1].split(' ').map(Number);

  let monotonicPointCount = 0;

  for (let index = 1; index - 1 < interiorPointCount; index++) {
    const previousValue = values[index - 1];
    const currentValue = values[index];
    const nextValue = values[index + 1];

    const isStrictlyIncreasing =
      previousValue < currentValue && currentValue < nextValue;
    const isStrictlyDecreasing =
      previousValue > currentValue && currentValue > nextValue;

    if (isStrictlyIncreasing || isStrictlyDecreasing) {
      monotonicPointCount += 1;
    }
  }

  console.log(monotonicPointCount);
};

main(fs.readFileSync('/dev/stdin', 'utf8'));
