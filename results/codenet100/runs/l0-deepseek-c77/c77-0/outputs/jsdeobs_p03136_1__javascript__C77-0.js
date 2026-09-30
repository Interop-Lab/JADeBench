'use strict';

const main = (input) => {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0].split(' ')[0]);
  const numbers = lines[1].split(' ').map((x) => parseInt(x)).sort((a, b) => a - b);
  const min = numbers[0];
  const sum = numbers.reduce((acc, x) => acc + x);
  console.log(min < sum ? 'Yes' : 'No');
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
