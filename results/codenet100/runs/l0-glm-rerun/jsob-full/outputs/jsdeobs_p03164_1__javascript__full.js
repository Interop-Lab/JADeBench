var MAX_VALUE = 1000;
var inputRaw = require('fs').readFileSync('/dev/stdin', 'utf8');
var rows = inputRaw.trim().split('\n');
var row1 = rows[0].split(' ').map(Number);
var N = row1[0], W = row1[1];
var list = rows.slice(1).map(_0x182eda => _0x182eda.split(' ').map(Number));
var _0x1358af = {};
_0x1358af.length = N + 1;
var dp = Array.from(_0x1358af, _0x229c7d => Array(N * MAX_VALUE + 1).fill(0));
dp[0] = Array(N * MAX_VALUE + 1).fill(Infinity);
dp[0][0] = 0;

function solve() {
    for (var i = 0; i < N; i++) {
        for (var j = 0; j <= N * MAX_VALUE; j++) {
            if (list[i][0] <= j) {
                var newVal = dp[i][j - list[i][0]] + list[i][1];
                var oldVal = dp[i + 1][j];
                dp[i + 1][j] = Math.min(newVal, oldVal);
            } else {
                dp[i + 1][j] = dp[i][j];
            }
        }
    }
    var ans = 0;
    for (var i = 0; i <= N * MAX_VALUE; i++) {
        if (dp[N][i] <= W) {
            ans = i;
        }
    }
    return ans;
}

console.log(solve());
