'use strict';

function main(input) {
  const nums = input.split('\n')[1].split(' ').map(x => Number(x));
  let counter = 0;
  for (let n of nums) {
    while (n % 2 === 0) {
      n = n / 2;
      counter += 1;
    }
  }
  console.log(counter);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
