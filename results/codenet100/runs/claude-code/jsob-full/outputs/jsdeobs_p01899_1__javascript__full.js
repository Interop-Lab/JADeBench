const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const [, threshold] = lines.shift().split(' ').map(Number);
const values = lines.shift().split(' ').map(Number);

let totalExcess = 0;
for (const value of values) {
  totalExcess += Math.max(0, value - threshold);
}

console.log(totalExcess === 0 ? 'kusoge' : totalExcess);
