'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'UTF-8');
const lines = input.split('\n');
const length = lines[0];
const target = lines[1].split(' ').map(value => parseInt(value));
const values = lines[2].split(' ').map(value => parseInt(value));

let operationCount = 0;

while (true) {
  const largestIndex = values.indexOf(Math.max(...values));

  if (largestIndex === 0) {
    values[largestIndex] -= values[1] + values[length - 1];
  } else if (largestIndex === length - 1) {
    values[largestIndex] -= values[length - 2] + values[0];
  } else {
    values[largestIndex] -= values[largestIndex - 1] + values[largestIndex + 1];
  }

  operationCount++;

  if (JSON.stringify(values) === JSON.stringify(target)) {
    console.log(operationCount);
    break;
  }

  if (values.find(value => value < 1)) {
    console.log(-1);
    break;
  }
}
