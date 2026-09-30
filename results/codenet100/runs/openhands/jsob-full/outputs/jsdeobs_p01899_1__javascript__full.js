const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

const [, threshold] = lines.shift().split(' ').map(Number);
const scores = lines.shift().split(' ').map(Number);

let excessTotal = 0;
scores.forEach((score) => {
  excessTotal += Math.max(0, score - threshold);
});

console.log(excessTotal === 0 ? 'kusoge' : excessTotal);
