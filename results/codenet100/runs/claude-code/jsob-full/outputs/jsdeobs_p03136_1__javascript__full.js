'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const values = lines[1]
    .split(' ')
    .map((value) => parseInt(value))
    .sort((left, right) => right - left);

  const maximum = values.shift();
  const sumOfRemainingValues = values.reduce(
    (total, value) => total + value,
  );

  console.log(maximum < sumOfRemainingValues ? 'Yes' : 'No');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
