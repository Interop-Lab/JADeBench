'use strict';
const main = input => {
  input = input.trim().split('\n');
  const N = parseInt(input[0]);
  const grid = [];
  for (let i = 0; i < N; i++) {
    grid.push(new Array(N).fill(0));
  }
  for (let i = 0; i < N; i++) {
    const row = String(i);
    const a = parseInt(row[0]);
    const b = parseInt(row[row.length - 1]);
    grid[a][b]++;
  }
  let ans = 0;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      ans += grid[i][j] * grid[j][i];
    }
  }
  console.log(ans);
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
