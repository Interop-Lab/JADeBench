const fs = require('fs');

const lines = fs.readFileSync('stdin', 'utf8').trim().split('\n');
const n = lines.shift() - 0;
const values = lines.shift().split(' ').map(Number);

let sum = 0;

for (let i = 0; i < n; i++) {
  sum += values[i] - (i + 1);
}

console.log(sum);
