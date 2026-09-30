'use strict';

function main(input) {
  const lines = input.trim().split('\n');
  const values = lines[1].split(' ').map(Number);
  const n = values.length;
  let count = 0;

  for (let i = 0; i < n; i++) {
    if ((i + 1) % 2 === 0) {
      continue;
    }
    if (values[i] % 2 === 0) {
      continue;
    }
    count++;
  }

  console.log(count);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
