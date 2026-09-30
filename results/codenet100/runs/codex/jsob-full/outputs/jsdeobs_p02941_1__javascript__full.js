'use strict';

const fs = require('fs');

const inputLines = fs.readFileSync('/dev/stdin', 'UTF-8').split('\n');
const valueCount = Number(inputLines[0]);
const targetValues = inputLines[1].split(' ').map(value => parseInt(value));
const currentValues = inputLines[2].split(' ').map(value => parseInt(value));

let operationCount = 0;

while (true) {
  const maximumValue = Math.max(...currentValues);
  const maximumIndex = currentValues.indexOf(maximumValue);

  if (maximumIndex === 0) {
    currentValues[maximumIndex] =
      currentValues[maximumIndex] - currentValues[1] - currentValues[valueCount - 1];
  } else if (maximumIndex === valueCount - 1) {
    currentValues[maximumIndex] =
      currentValues[maximumIndex] - currentValues[valueCount - 2] - currentValues[0];
  } else {
    currentValues[maximumIndex] =
      currentValues[maximumIndex] -
      currentValues[maximumIndex - 1] -
      currentValues[maximumIndex + 1];
  }

  operationCount++;

  if (JSON.stringify(currentValues) === JSON.stringify(targetValues)) {
    console.log(operationCount);
    break;
  }

  const firstValueBelowOne = currentValues.find(value => value < 1);
  if (firstValueBelowOne) {
    console.log(-1);
    break;
  }
}
