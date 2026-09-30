'use strict';

function main(input) {
  const numbers = input.split('\n')[1].split(' ').map(Number);
  let count = 0;

  for (let number of numbers) {
    while (number % 2 === 0) {
      number /= 2;
      count += 1;
    }
  }

  console.log(count);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
