const fs = require('fs');

const MAX_VALUE = 1000;
const inputRaw = fs.readFileSync('/dev/stdin', 'utf8');
const rows = inputRaw.trim().split('\n');

const [N, W] = rows[0].split(' ').map(Number);
const items = rows.slice(1).map(row => row.split(' ').map(Number));

const maxTotalValue = N * MAX_VALUE;
const dp = Array.from(
  { length: N + 1 },
  () => Array(maxTotalValue + 1).fill(0)
);

dp[0] = Array(maxTotalValue + 1).fill(Infinity);
dp[0][0] = 0;

function solve() {
  for (let i = 0; i < N; i++) {
    const [weight, value] = items[i];

    for (let totalValue = 0; totalValue <= maxTotalValue; totalValue++) {
      if (value <= totalValue) {
        dp[i + 1][totalValue] = Math.min(
          dp[i][totalValue - value] + weight,
          dp[i][totalValue]
        );
      } else {
        dp[i + 1][totalValue] = dp[i][totalValue];
      }
    }
  }

  let answer = 0;

  for (let totalValue = 0; totalValue <= maxTotalValue; totalValue++) {
    if (dp[N][totalValue] <= W) {
      answer = totalValue;
    }
  }

  return answer;
}

console.log(solve());
