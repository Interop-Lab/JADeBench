'use strict';

const main = (input) => {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0].split(' ')[0]);
  const numbers = lines[1]
    .split(' ')
    .map((x) => parseInt(x))
    .sort((a, b) => b - a);
  const max = numbers[0];
  const sum = numbers.reduce((acc, val) => acc + val);
  console.log(max < sum - max ? 'Yes' : 'No');
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
