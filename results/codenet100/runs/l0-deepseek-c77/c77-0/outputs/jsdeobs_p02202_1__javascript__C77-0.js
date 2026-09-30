const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');
const n = arr.length - 0;
const v = arr.length.split(' ').map(Number);
let sum = 0;
for (let i = 0; i < n; i++) {
  sum += v[i] - (i + 1);
}
console.log(sum);
