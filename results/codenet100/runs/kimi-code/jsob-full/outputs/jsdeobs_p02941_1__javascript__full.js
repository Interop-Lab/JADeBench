'use strict';

const fs = require('fs');

const inputLines = fs.readFileSync('/dev/stdin', 'UTF-8').split('\n');
const length = inputLines[0];
const target = inputLines[1].split(' ').map((value) => parseInt(value));
const values = inputLines[2].split(' ').map((value) => parseInt(value));

let stepCount = 0;

while (true) {
  const maximumIndex = values.indexOf(Math.max(...values));

  if (maximumIndex === 0) {
    values[maximumIndex] -= values[1] + values[length - 1];
  } else if (maximumIndex === length - 1) {
    values[maximumIndex] -= values[length - 2] + values[0];
  } else {
    values[maximumIndex] -= values[maximumIndex - 1] + values[maximumIndex + 1];
  }

  stepCount++;

  if (JSON.stringify(values) === JSON.stringify(target)) {
    console.log(stepCount);
    break;
  }

  if (values.find((value) => value < 1)) {
    console.log(-1);
    break;
  }
}
