const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const n = Number(lines.shift());
const values = lines.shift().split(' ').map(Number);

let sum = 0;
for (let index = 0; index < n; index++) {
  sum += values[index] - (index + 1);
}

console.log(sum);
