'use strict';

const fs = require('fs');

const main = input => {
  const lines = input.trim().split('\n');
  const count = parseInt(lines[0].split(' ')[0]);

  const lengths = lines[1]
    .split(' ')
    .map(value => parseInt(value))
    .sort((a, b) => b - a);

  const longest = lengths.shift();
  const sumOfOthers = lengths.reduce((sum, length) => sum + length);

  console.log(longest < sumOfOthers ? 'Yes' : 'No');
};

main(fs.readFileSync('/dev/stdin', 'utf8'));
