'use strict';

const main = (input) => {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0]);
  const values = lines[1].split(' ').map((x) => parseInt(2 * x));

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum = values[i] - sum;
  }

  let current = sum / 2;
  const result = [];

  for (let i = 0; i < n; i++) {
    result.push(current);
    current = values[i] - current;
  }

  console.log(result.join(' '));
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
