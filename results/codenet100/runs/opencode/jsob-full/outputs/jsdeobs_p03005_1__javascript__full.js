'use strict';

const fs = require('fs');

function main(input) {
  const firstLine = input.trim().split('\n')[0];
  const tokens = firstLine.split(' ');
  const total = parseInt(tokens[0]);
  const amount = parseInt(tokens[1]);

  console.log(amount === 1 ? 0 : total - amount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
