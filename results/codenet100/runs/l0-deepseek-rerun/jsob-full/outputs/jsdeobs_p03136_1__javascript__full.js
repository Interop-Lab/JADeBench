'use strict';

const main = (input) => {
  input = input.trim().split('\n');
  const target = parseInt(input[0].split(' ')[0]);
  const numbers = input[1].split(' ').map((x) => parseInt(x)).sort((a, b) => b - a);
  const first = numbers.shift();
  const sum = numbers.reduce((a, b) => a + b);
  console.log(first > sum ? 'Yes' : 'No');
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
