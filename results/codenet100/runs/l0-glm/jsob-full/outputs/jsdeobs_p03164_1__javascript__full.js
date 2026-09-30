var MAX_VALUE = 1000;
var inputRaw = require('fs').readFileSync('/dev/stdin', 'utf8');
var rows = inputRaw.trim().split('\n');
var row1 = rows[0].split(' ').map(Number);
var N = row1[0], W = row1[1];
var list = rows.slice(1).map(function (row) { return row.split(' ').map(Number); });

var dp = Array.from({ length: N + 1 }, function () { return Array(N * MAX_VALUE + 1).fill(-Infinity); });
dp[0] = Array(N * MAX_VALUE + 1).fill(Infinity);
dp[0][0] = 0;

function solve() {
  for (var i = 0; i < N; i++) {
    for (var j = 0; j <= N * MAX_VALUE; j++) {
      if (list[i][0] <= j) {
        var take = dp[i][j - list[i][0]] + list[i][1];
        var skip = dp[i][j];
        dp[i + 1][j] = Math.min(take, skip);
      } else {
        dp[i + 1][j] = dp[i][j];
      }
    }
  }

  var ans = 0;
  for (var j = 0; j <= N * MAX_VALUE; j++) {
    if (dp[N][j] <= W) ans = j;
  }
  return ans;
}

console.log(solve());
