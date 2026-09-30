'use strict';

const fs = require('fs');

function main(input) {
  const numbers = input.split(' ').map((value) => parseInt(value));
  const intervalLength = numbers[0];
  const firstStart = numbers[1];
  const secondStart = numbers[2];

  const firstEnd = firstStart + intervalLength;
  const secondEnd = secondStart + intervalLength;
  const orderedEndpoints = firstStart <= secondStart
    ? [firstStart, firstEnd, secondStart, secondEnd]
    : [secondStart, secondEnd, firstStart, firstEnd];

  const earlierEnd = orderedEndpoints[1];
  const laterStart = orderedEndpoints[2];

  console.log(earlierEnd < laterStart ? laterStart - earlierEnd : 0);
}

main(fs.readFileSync('/dev/stdin', 'utf-8'));
