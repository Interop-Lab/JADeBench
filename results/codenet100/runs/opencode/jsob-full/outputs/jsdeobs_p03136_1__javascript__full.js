'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const expectedCount = parseInt(lines[0].split(' ')[0]);

  const sideLengths = lines[1]
    .split(' ')
    .map((value) => parseInt(value))
    .sort((left, right) => right - left);

  const longestSide = sideLengths.shift();
  const otherSidesTotal = sideLengths.reduce((total, length) => total + length);

  console.log(longestSide < otherSidesTotal ? 'Yes' : 'No');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
