'use strict';

const main = (input) => {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0], 10);
  const counts = [];

  for (let i = 0; i < 10; i++) {
    counts.push(new Array(10).fill(0));
  }

  for (let i = 0; i < n; i++) {
    const s = String(i);
    const first = parseInt(s[0], 10);
    const last = parseInt(s[s.length - 1], 10);
    counts[first][last]++;
  }

  let result = 0;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      result += counts[i][j] * counts[j][i];
    }
  }

  console.log(result);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
