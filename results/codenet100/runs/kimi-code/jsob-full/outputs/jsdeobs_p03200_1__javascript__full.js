'use strict';

const fs = require('fs');

function main(input) {
  const nonEmptyLines = input.split('\n').filter(line => line !== '');
  const sequence = nonEmptyLines[0];

  const whitePositions = sequence
    .split('')
    .map((character, index) => character === 'W' ? index : -1)
    .filter(index => index !== -1);

  const movesToPackWhitesLeft = whitePositions.reduce(
    (totalMoves, currentPosition, targetPosition) => (
      totalMoves + currentPosition - targetPosition
    ),
    0,
  );

  console.log(movesToPackWhitesLeft);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
