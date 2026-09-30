'use strict';

function main(input) {
  const values = input.trim().split('\n')[1].split(' ').map(Number);
  let oddValueAtOddPositionCount = 0;

  for (let index = 0; index < values.length; index += 2) {
    if (values[index] % 2 !== 0) {
      oddValueAtOddPositionCount++;
    }
  }

  console.log(oddValueAtOddPositionCount);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
