'use strict';

function main(input) {
  const lines = input.split('\n')[1].split(' ').map(s => Number(s));
  let count = 0;
  for (let n of lines) {
    while (n % 3 === 0) {
      n = n / 3;
      count += 1;
    }
  }
  console.log(count);
}

main(require('fs').readFileSync(0, 'utf8'));
