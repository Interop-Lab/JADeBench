'use strict';

const fs = require('fs');

function main(input) {
  const firstLine = input.split('\n')[0];
  const isWinningNumber = firstLine == 7 || firstLine == 5 || firstLine == 3;

  console.log(isWinningNumber ? 'YES' : 'NO');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
