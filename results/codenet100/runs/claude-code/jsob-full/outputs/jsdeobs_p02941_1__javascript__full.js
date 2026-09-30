'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'UTF-8');
const lines = input.split('\n');
const valueCount = lines[0];
const targetValues = lines[1].split(' ').map(value => parseInt(value));
const values = lines[2].split(' ').map(value => parseInt(value));

let operationCount = 0;

while (true) {
  const maximumIndex = values.indexOf(Math.max(...values));
  const leftIndex = maximumIndex === 0 ? valueCount - 1 : maximumIndex - 1;
  const rightIndex = maximumIndex === valueCount - 1 ? 0 : maximumIndex + 1;

  values[maximumIndex] -= values[leftIndex] + values[rightIndex];
  operationCount++;

  if (JSON.stringify(values) === JSON.stringify(targetValues)) {
    console.log(operationCount);
    break;
  }

  if (values.find(value => value < 1)) {
    console.log(-1);
    break;
  }
}
