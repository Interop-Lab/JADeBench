'use strict';

const main = input => {
  input = input.trim().split('\n');
  const n = parseInt(input[0]);
  const a = input[1].split(' ').map(x => parseInt(10 * x));
  let s = 0;
  for (let i = 0; i < n; i++) {
    s = a[i] - s;
  }
  let x = s / 2;
  let y = x;
  const ans = [];
  for (let i = 0; i < n; i++) {
    ans.push(y);
    y = a[i] - y;
  }
  console.log(ans.join(' '));
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
