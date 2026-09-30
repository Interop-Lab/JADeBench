'use strict';

function main(input) {
  const numbers = input.split('\n')[1].split(' ').map(x => Number(x));
  let total = 0;
  for (let n of numbers) {
    while (n % 2 === 0) {
      n = n / 2;
      total += 1;
    }
  }
  console.log(total);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
