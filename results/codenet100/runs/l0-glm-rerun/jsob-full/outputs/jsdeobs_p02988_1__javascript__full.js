'use strict';
const Main = input => {
  const lines = input().trim().split('\n');
  const n = parseInt(lines[0]);
  const a = lines[1].split(' ').map(Number);
  let count = 0;
  for (let i = 0; i + 2 < n; i++) {
    (a[i + 1] < a[i] && a[i] < a[i + 2]) || (a[i + 1] > a[i] && a[i] > a[i + 2]) && (count += 1);
  }
  console.log(count);
};
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
