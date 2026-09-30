var config = { delimiter: ' ', newline: '\n' };
var M = require('fs').readFileSync(config.delimiter, 'utf8').trim().split(config.newline);
M = M.map(function(line) {
    return line.split(' ').map(Number);
});
var n = M[0][0];
var min = {};
for (var i = 1; i <= n; i++) {
    min[i] = {};
}
for (var i = 1; i <= n; i++) {
    min[i][i] = 0;
}
for (var i = 1; i < n; i++) {
    for (var j = 1, k = 2 + i; k <= n; j++, k++) {
        min[j][k] = Number.POSITIVE_INFINITY;
        for (var l = j; l < k; l++) {
            min[j][k] = Math.min(min[j][k], M[j][0] * M[l][1] * M[k][1] + min[j][l] + min[l + 1][k]);
        }
    }
}
console.log(min[1][n]);
