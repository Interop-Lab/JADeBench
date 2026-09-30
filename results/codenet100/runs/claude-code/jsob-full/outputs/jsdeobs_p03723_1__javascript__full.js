'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const values = input.split(/ |\n/).slice(0, 3).map(Number);
const deadline = Number(new Date()) + 900;

function countStepsUntilTwo(initialValues) {
  let [first, second, third] = initialValues;
  let steps = 0;

  while (new Date() < deadline) {
    if (first === 2 || second === 2 || third === 2) {
      return steps;
    }

    const nextFirst = ((second % third) + 1) >> 1;
    const nextSecond = ((first % third) + 1) >> 1;
    const nextThird = (first + second) >> 1;

    first = nextFirst;
    second = nextSecond;
    third = nextThird;
    steps++;
  }

  return -1;
}

const result = countStepsUntilTwo(values);
if (result !== undefined) {
  console.log(String(result));
}
