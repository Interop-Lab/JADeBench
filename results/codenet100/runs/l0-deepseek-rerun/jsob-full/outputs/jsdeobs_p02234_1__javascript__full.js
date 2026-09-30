const fs = require('fs');

const config = {
  input: 'input.txt',
  delimiter: '\n'
};

let M = fs.readFileSync(config.input, 'utf8').trim().split(config.delimiter);
M = M.map(function(line) {
  return line.split(' ').map(Number);
});

const n = M[0][0];
const min = {};

for (let i = 0; i <= n; i++) {
  min[i] = {};
}

for (let i = 0; i <= n; i++) {
  min[i][i] = 0;
}

for (let i = 0; i < n; i++) {
  for (let j = 0, k = i; k <= n; j++, k++) {
    min[j][k] = Number.MAX_VALUE;
    for (let l = j; l < k; l++) {
      min[j][k] = Math.min(
        min[j][k],
        M[j][0] * M[l][1] * M[k][1] + min[j][l] + min[l + 1][k]
      );
    }
  }
}

console.log(min[0][n]);
