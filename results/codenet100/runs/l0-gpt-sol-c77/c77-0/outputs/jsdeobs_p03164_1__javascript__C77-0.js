var MAX_VALUE = 1000;

var inputRaw = require('fs').readFileSync('/dev/stdin', 'utf8');
var rows = inputRaw.trim().split('\n');
var firstRow = rows[0].split(' ').map(Number);

var N = firstRow[0];
var W = firstRow[1];

var items = rows
    .slice(1)
    .map(row => row.split(' ').map(Number));

var dp = Array.from(
    { length: N + 1 },
    () => Array(N * MAX_VALUE + 1).fill(0)
);

dp[0] = Array(N * MAX_VALUE + 1).fill(Infinity);
dp[0][0] = 0;

function solve() {
    var maximumTotalValue = N * MAX_VALUE;

    for (var itemIndex = 0; itemIndex < N; itemIndex++) {
        var itemCost = items[itemIndex][0];
        var itemValue = items[itemIndex][1];

        for (var totalValue = 0; totalValue <= maximumTotalValue; totalValue++) {
            if (itemValue <= totalValue) {
                var costWithItem =
                    dp[itemIndex][totalValue - itemValue] + itemCost;
                var costWithoutItem = dp[itemIndex][totalValue];

                dp[itemIndex + 1][totalValue] = Math.min(
                    costWithItem,
                    costWithoutItem
                );
            } else {
                dp[itemIndex + 1][totalValue] = dp[itemIndex][totalValue];
            }
        }
    }

    var answer = 0;

    for (var totalValue = 0; totalValue <= maximumTotalValue; totalValue++) {
        if (dp[N][totalValue] <= W) {
            answer = totalValue;
        }
    }

    return answer;
}

console.log(solve());
