'use strict';

function Main(input) {
  const lines = input.trim().split('\n');
  const n = Number(lines[0].trim());
  const arr = lines[1].trim().split(' ').map(Number);
  let result = 'YES';
  for (let i = 0; i < n; i++) {
    let diff = arr[i + 1] - arr[i];
    if (diff < 0) {
      result = 'NO';
      break;
    }
  }
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
