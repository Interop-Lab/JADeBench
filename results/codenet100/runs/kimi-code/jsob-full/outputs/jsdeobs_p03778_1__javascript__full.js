'use strict';

const fs = require('fs');

function calculateGap(input) {
  const [length, firstStart, secondStart] = input
    .split(' ')
    .map((value) => parseInt(value));

  const firstEnd = firstStart + length;
  const secondEnd = secondStart + length;
  const orderedEndpoints = firstStart <= secondStart
    ? [firstStart, firstEnd, secondStart, secondEnd]
    : [secondStart, secondEnd, firstStart, firstEnd];

  if (orderedEndpoints[1] < orderedEndpoints[2]) {
    console.log(orderedEndpoints[2] - orderedEndpoints[1]);
  } else {
    console.log(0);
  }
}

calculateGap(fs.readFileSync('/dev/stdin', 'utf-8'));
