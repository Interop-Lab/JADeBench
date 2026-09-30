'use strict';

const fs = require('fs');

function solve(input) {
  const lines = input.trim().split('\n');
  const tripletCount = parseInt(lines[0]);
  const values = lines[1].split(' ').map(Number);
  let monotonicTriples = 0;

  for (let startIndex = 0; startIndex < tripletCount; startIndex++) {
    const first = values[startIndex];
    const middle = values[startIndex + 1];
    const last = values[startIndex + 2];

    if (
      (first < middle && middle < last) ||
      (first > middle && middle > last)
    ) {
      monotonicTriples += 1;
    }
  }

  console.log(monotonicTriples);
}

solve(fs.readFileSync('/dev/stdin', 'utf8'));
