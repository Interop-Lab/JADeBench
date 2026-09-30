'use strict';

const main = input => {
  input = input.trim().split('\n');
  const n = parseInt(input[0].split(' ')[1]);
  let arr = input[1].split(' ').map(x => parseInt(x)).sort((a, b) => b - a);
  const max = arr.shift();
  const sum = arr.reduce((a, b) => a + b);
  console.log(sum < max ? 'Yes' : 'No');
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
