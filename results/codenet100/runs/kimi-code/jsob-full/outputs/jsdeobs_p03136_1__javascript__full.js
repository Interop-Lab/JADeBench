'use strict';

const fs = require('fs');

const main = input => {
  const lines = input.trim().split('\n');
  const count = parseInt(lines[0].split(' ')[0]);
  const sideLengths = lines[1]
    .split(' ')
    .map(value => parseInt(value))
    .sort((left, right) => right - left);

  const longestSide = sideLengths.shift();
  const remainingTotal = sideLengths.reduce((total, length) => total + length);

  console.log(longestSide < remainingTotal ? 'Yes' : 'No');
};

main(fs.readFileSync('/dev/stdin', 'utf8'));
