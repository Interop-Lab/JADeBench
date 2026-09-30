'use strict';

function getPair(mask) {
  const flipped = mask
    .split('')
    .map(c => (c === '1' ? '0' : '1'))
    .join('');
  return parseInt(flipped, 2);
}

function main(input) {
  const lines = input.split('\n').filter(line => line !== '');
  const firstLine = lines[0].split(' ').map(Number);
  let numbers = firstLine.slice().sort((a, b) => a - b);
  let count = 0;

  while (numbers.length > 0) {
    let current = numbers[0];
    numbers.splice(0, 1);
    let target = getPair(current);
    let found = numbers.find(n => n === target);
    if (found !== undefined) {
      numbers.splice(numbers.indexOf(found), 1);
      count++;
    }
  }

  console.log(count);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
