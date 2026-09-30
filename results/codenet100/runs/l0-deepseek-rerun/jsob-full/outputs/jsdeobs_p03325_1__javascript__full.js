'use strict';

function main(input) {
  const lines = input.split('\n');
  const numbers = lines[1].split(' ').map(Number);
  let count = 0;
  for (let num of numbers) {
    while (num % 2 === 0) {
      num = num / 2;
      count++;
    }
  }
  console.log(count);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
