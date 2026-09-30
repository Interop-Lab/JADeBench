'use strict';

const fs = require('fs');

function main(input) {
  const nonemptyLines = input.split('\n').filter((line) => line !== '');
  const firstLine = nonemptyLines[0];

  const positionsOfW = firstLine
    .split('')
    .map((character, position) => (character === 'W' ? position : -1))
    .filter((position) => position !== -1);

  const score = positionsOfW.reduce(
    (total, position, occurrence) => total + position - occurrence,
    0,
  );

  console.log(score);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
