'use strict';

const fs = require('fs');

function main(input) {
  const [distance, firstPosition, secondPosition] = input
    .split(' ')
    .map((value) => parseInt(value));

  const firstEnd = firstPosition + distance;
  const secondStart = secondPosition - distance;

  const orderedPoints = firstPosition <= secondPosition
    ? [firstPosition, firstEnd, secondPosition, secondStart]
    : [secondPosition, secondStart, firstPosition, firstEnd];

  const gap = orderedPoints[1] < orderedPoints[2]
    ? orderedPoints[2] - orderedPoints[1]
    : 0;

  console.log(gap);
}

main(fs.readFileSync('/dev/stdin', 'utf-8'));
