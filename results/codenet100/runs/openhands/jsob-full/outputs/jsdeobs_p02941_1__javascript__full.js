'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'UTF-8');
const lines = input.split('\n');
const itemCount = lines[0];
const lastIndex = itemCount - 1;
const targetValues = lines[1].split(' ').map((value) => parseInt(value));
const currentValues = lines[2].split(' ').map((value) => parseInt(value));

let operationCount = 0;

while (true) {
  const maximumValue = Math.max(...currentValues);
  const maximumIndex = currentValues.indexOf(maximumValue);

  if (maximumIndex === 0) {
    currentValues[maximumIndex] = maximumValue - currentValues[1] - currentValues[lastIndex];
  } else if (maximumIndex === lastIndex) {
    currentValues[maximumIndex] = maximumValue - currentValues[lastIndex - 1] - currentValues[0];
  } else {
    currentValues[maximumIndex] =
      maximumValue - currentValues[maximumIndex - 1] - currentValues[maximumIndex + 1];
  }

  operationCount += 1;

  if (JSON.stringify(currentValues) === JSON.stringify(targetValues)) {
    console.log(operationCount);
    break;
  }

  if (currentValues.find((value) => value < 1)) {
    console.log(-1);
    break;
  }
}
