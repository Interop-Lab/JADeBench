const fs = require('fs');
const inputRaw = fs.readFileSync('/dev/stdin', 'utf8');
const rows = inputRaw.trim().split('\n');
const row1 = rows[0].split(' ').map(Number);
const N = row1[0];
const W = row1[1];
const list = rows.slice(1).map(line => line.split(' ').map(Number));

const MAX_VALUE = 1000;
const dp = Array.from({ length: N + 1 }, () => Array(N * MAX_VALUE + 1).fill(0));
dp[0][0] = 0;
for (let i = 0; i < N; i++) {
  for (let j = 0; j <= N * MAX_VALUE; j++) {
    if (list[i][0] <= j) {
      dp[i + 1][j] = Math.max(dp[i][j - list[i][0]] + list[i][1], dp[i][j]);
    } else {
      dp[i + 1][j] = dp[i][j];
    }
  }
}

let answer = 0;
for (let j = 0; j <= N * MAX_VALUE; j++) {
  if (dp[N][j] >= W) {
    answer = j;
    break;
  }
}

console.log(answer);
