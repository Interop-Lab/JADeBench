'use strict';

const fs = require('fs');

function main(input) {
  const nonEmptyLines = input.split('\n').filter((line) => line !== '');
  const firstLine = nonEmptyLines[0];

  const wPositions = firstLine
    .split('')
    .map((character, index) => (character === 'W' ? index : -1))
    .filter((index) => index !== -1);

  const result = wPositions.reduce(
    (total, position, matchIndex) => total + position - matchIndex,
    0,
  );

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
