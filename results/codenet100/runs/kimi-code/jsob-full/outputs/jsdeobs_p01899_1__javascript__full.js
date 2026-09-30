const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const [itemCount, discount] = lines.shift().split(' ').map(Number);
const prices = lines.shift().split(' ').map(Number);

let total = 0;
for (const price of prices) {
  total += Math.max(0, price - discount);
}

console.log(total === 0 ? 'kusoge' : total);
