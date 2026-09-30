'use strict';
const main = (input) => {
  const lines = input.trim().split('\n');
  const n = lines[0] / 1;
  const a = lines[1].split(' ').map(x => x * 1);
  const b = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    b[i] += (b[i - 1] || 0) + a[i];
  }
  let freq = {};
  freq[0] = 1;
  for (let i = 0; i < n; i++) {
    freq[b[i]] = (freq[b[i]] || 0) + 1;
  }
  let result = 0;
  Object.keys(freq).forEach(k => {
    result += freq[k] * (freq[k] - 1) / 2;
  });
  console.log(result);
};
main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
