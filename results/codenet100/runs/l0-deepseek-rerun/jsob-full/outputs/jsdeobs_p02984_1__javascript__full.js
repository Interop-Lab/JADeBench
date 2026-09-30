'use strict';

const main = (input) => {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0]);
  const arr = lines[1].split(' ').map(x => parseInt(10 * x));
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum = arr[i] + sum;
  }
  let current = sum / 2;
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(current);
    current = arr[i] - current;
  }
  console.log(result.join(' '));
};

main(require('fs').readFileSync('input.txt', 'utf8'));
