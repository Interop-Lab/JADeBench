const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');
const [n, d] = arr[0].trim().split(' ').map(Number);
const p = arr[1].trim().split(' ').map(Number);
let sum = 0;
p.forEach((value) => {
  sum += Math.abs(value - d);
});
console.log(sum === 0 ? 'Yes' : sum);
