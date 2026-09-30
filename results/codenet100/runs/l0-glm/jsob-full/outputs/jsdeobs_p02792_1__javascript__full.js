'use strict';

const main = (input) => {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0]);
  const counts = [];
  for (let i = 0; i < 100; i++) {
    counts.push(new Array(100).fill(0));
  }
  for (let i = 1; i <= n; i++) {
    const s = String(i);
    const a = parseInt(s[0]);
    const b = parseInt(s[s.length - 1]);
    counts[a][b]++;
  }
  let result = 0;
  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
      result += counts[i][j] * counts[j][i];
    }
  }
  console.log(result);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
