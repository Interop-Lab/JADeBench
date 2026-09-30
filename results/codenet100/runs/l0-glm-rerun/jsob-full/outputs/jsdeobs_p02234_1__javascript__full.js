var config = { input: 'input.in', newline: '\n' };
var M = require('fs').readFileSync(config.input, 'utf8').trim().split(config.newline);
M = M.map(function(line) {
  return line.split(' ').map(Number);
});
var n = M[0][0];
var min = {};
for (var i = 0; i <= n; i++) min[i] = {};
for (var i = 0; i <= n; i++) min[i][i] = 0;
for (var i = 0; i < n; i++) {
  for (var j = 0, k = i + 1; k <= n; j++, k++) {
    min[j][k] = Number.MAX_VALUE;
    for (var l = j; l < k; l++) {
      min[j][k] = Math.min(min[j][k], M[j][0] * M[l][1] * M[k][1] + min[j][l] + min[l + 1][k]);
    }
  }
}
console.log(min[0][n]);
