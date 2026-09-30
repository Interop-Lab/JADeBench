const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.toString().split('\n');
const [n, d] = arr.shift().split(' ').map(Number);
const p = arr.shift().split(' ').map(Number);
let sum = 0;
p.forEach((x) => {
  sum += Math.max(0, x - d);
});
console.log(sum == 0 ? 'kusoge' : sum);
