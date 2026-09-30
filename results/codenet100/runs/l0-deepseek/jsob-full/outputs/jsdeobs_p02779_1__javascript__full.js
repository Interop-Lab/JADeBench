'use strict';

function Main(input) {
  const lines = input.trim().split('\n');
  const count = Number(lines[0].trim());
  const numbers = lines[1].trim().split(' ').map(Number);
  let result = 'YES';
  for (let i = 0; i < count; i++) {
    let expected = numbers[i + 1];
    let actual = numbers[i];
    if (actual !== expected) {
      result = 'NO';
      break;
    }
  }
  console.log(result);
}

Main(require('fs').readFileSync('stdin', 'utf8'));
