const fs = require('fs');

const matrices = fs
  .readFileSync('/dev/stdin', 'utf8')
  .toString()
  .trim()
  .split('\n')
  .map(line => line.split(' ').map(Number));

const n = matrices[0][0];
const min = {};

for (let i = 1; i <= n; i++) {
  min[i] = {};
  min[i][i] = 0;
}

for (let length = 1; length < n; length++) {
  for (let start = 1, end = start + length; end <= n; start++, end++) {
    min[start][end] = Number.POSITIVE_INFINITY;

    for (let split = start; split < end; split++) {
      min[start][end] = Math.min(
        min[start][end],
        matrices[start][0] * matrices[split][1] * matrices[end][1] +
          min[start][split] +
          min[split + 1][end]
      );
    }
  }
}

console.log(min[1][n]);
