var config = {
    input: '/dev/stdin',
    newline: '\n'
};

var matrices = require('fs')
    .readFileSync(config.input, 'ascii')
    .trim()
    .split(config.newline)
    .map(function (line) {
        return line.split(' ').map(Number);
    });

var n = matrices[0][0];
var minCost = {};

for (var i = 1; i <= n; i++) {
    minCost[i] = {};
}

for (var i = 1; i <= n; i++) {
    minCost[i][i] = 0;
}

for (var chainOffset = 1; chainOffset < n; chainOffset++) {
    for (
        var start = 1, end = 1 + chainOffset;
        end <= n;
        start++, end++
    ) {
        minCost[start][end] = Number.MAX_VALUE;

        for (var split = start; split < end; split++) {
            minCost[start][end] = Math.min(
                minCost[start][end],
                matrices[start][0] *
                    matrices[split][1] *
                    matrices[end][1] +
                    minCost[start][split] +
                    minCost[split + 1][end]
            );
        }
    }
}

console.log(minCost[1][n]);
