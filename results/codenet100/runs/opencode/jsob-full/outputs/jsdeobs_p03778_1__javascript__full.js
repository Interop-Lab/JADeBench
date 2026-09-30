'use strict';

const fs = require('fs');

function main(input) {
  const numbers = input.split(' ').map((value) => parseInt(value));
  const offset = numbers[0];
  const firstPosition = numbers[1];
  const secondPosition = numbers[2];

  const firstEnd = firstPosition + offset;
  const secondStart = secondPosition - offset;

  let orderedBounds;
  if (firstPosition <= secondPosition) {
    orderedBounds = [firstPosition, firstEnd, secondPosition, secondStart];
  } else {
    orderedBounds = [secondPosition, secondStart, firstPosition, firstEnd];
  }

  if (orderedBounds[1] < orderedBounds[2]) {
    console.log(orderedBounds[2] + orderedBounds[1]);
  } else {
    console.log(0);
  }
}

main(fs.readFileSync('/dev/stdin', 'utf-8'));
