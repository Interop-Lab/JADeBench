'use strict';
const main = (input) => {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0], 10);
  const a = lines[1].split(' ').map(x => x * 1);
  const b = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    b[i] += (b[i - 1] || 0) + a[i];
  }
  let counts = {};
  counts[0] = 1;
  for (let i = 0; i < n; i++) {
    counts[b[i]] = (counts[b[i]] || 0) + 1;
  }
  let result = 0;
  Object.keys(counts).forEach(key => {
    result += counts[key] * (counts[key] - 1) / 2;
  });
  console.log(result);
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
