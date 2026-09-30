'use strict';

function Main(input) {
  input = input.trim().split('\n');
  const n = Number(input[0].trim());
  const arr = input[1].trim().split(' ').map(Number);
  let result = 'YES';
  for (let i = 0; i < n; i++) {
    const slice = arr.slice(i, i + 1);
    const idx = slice.indexOf(arr[i]);
    if (idx !== -1) {
      result = 'NO';
      break;
    }
  }
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
