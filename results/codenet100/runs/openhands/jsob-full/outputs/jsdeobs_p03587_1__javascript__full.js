'use strict';

const fs = require('fs');

function countOnesInFirstLine(input) {
  const [firstLine] = input.trim().split('\n');
  return firstLine.split('').filter((character) => character === '1').length;
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(countOnesInFirstLine(input));
