'use strict';

function main(input) {
  const lines = input.trim().split('\n');
  const firstValue = parseInt(lines[0].split(' ')[0]);
  const secondValue = parseInt(lines[0].split(' ')[1]);

  console.log(secondValue === 1 ? 0 : firstValue - secondValue);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
