'use strict';

function main(input) {
  const numbers = input.trim().split('\n')[1].split(' ').map(Number);
  let count = 0;

  for (let index = 0; index < numbers.length; index++) {
    if ((index + 1) % 2 === 0) continue;
    if (numbers[index] % 2 === 0) continue;
    count++;
  }

  console.log(count);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
