'use strict';

const Main = (input) => {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0]);
  const arr = lines[1].split(' ').map(Number);
  let count = 0;

  for (let i = 1; i + 1 < n; i++) {
    if (
      (arr[i - 1] < arr[i] && arr[i] < arr[i + 1]) ||
      (arr[i + 1] < arr[i] && arr[i] < arr[i - 1])
    ) {
      count += 1;
    }
  }

  console.log(count);
};

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
