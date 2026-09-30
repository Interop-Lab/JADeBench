'use strict';

const fs = require('fs');

function main(input) {
  const [intervalLength, firstStart, secondStart] = input
    .split(' ')
    .map((token) => parseInt(token));

  const firstEnd = firstStart + intervalLength;
  const secondEnd = secondStart + intervalLength;

  let earlierEnd;
  let laterStart;
  if (firstStart <= secondStart) {
    earlierEnd = firstEnd;
    laterStart = secondStart;
  } else {
    earlierEnd = secondEnd;
    laterStart = firstStart;
  }

  console.log(earlierEnd < laterStart ? laterStart - earlierEnd : 0);
}

main(fs.readFileSync('/dev/stdin', 'utf-8'));
