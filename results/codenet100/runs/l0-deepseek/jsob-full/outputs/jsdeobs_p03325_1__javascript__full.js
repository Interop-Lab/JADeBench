'use strict';

function main(input) {
  const lines = input.split('\n');
  const numbers = lines[1].split(' ').map(Number);
  let count = 0;
  for (let n of numbers) {
    while (n % 2 === 0) {
      n = n / 2;
      count++;
    }
  }
  console.log(count);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
