'use strict';

const fs = require('fs');

function main(input) {
  const [firstNonemptyLine] = input
    .split('\n')
    .filter((line) => line !== '');

  let moveCount = 0;
  let markersSeen = 0;

  for (let position = 0; position < firstNonemptyLine.length; position++) {
    if (firstNonemptyLine[position] !== 'W') continue;

    moveCount += position - markersSeen;
    markersSeen++;
  }

  console.log(moveCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
