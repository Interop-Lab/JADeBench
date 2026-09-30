'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const itemCount = parseInt(lines[0].split(' ')[0]);
  const values = lines[1]
    .split(' ')
    .map((value) => parseInt(value))
    .sort((left, right) => right - left);

  const largestValue = values.shift();
  const remainingSum = values.reduce((sum, value) => sum + value);

  console.log(largestValue < remainingSum ? 'Yes' : 'No');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
