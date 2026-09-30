'use strict';

const fs = require('fs');

function reconstructValues(input) {
  const lines = input.trim().split('\n');
  const count = parseInt(lines[0]);
  const adjacentTotals = lines[1]
    .split(' ')
    .map(average => parseInt(2 * average));

  let alternatingTotal = 0;
  for (let index = 0; index < count; index++) {
    alternatingTotal = adjacentTotals[index] - alternatingTotal;
  }

  const values = [];
  let currentValue = alternatingTotal / 2;

  for (let index = 0; index < count; index++) {
    values.push(currentValue);
    currentValue = adjacentTotals[index] - currentValue;
  }

  return values.join(' ');
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(reconstructValues(input));
