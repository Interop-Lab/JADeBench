const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const itemCount = Number(lines.shift());
const values = lines.shift().split(' ').map(Number);

let differenceSum = 0;
for (let index = 0; index < itemCount; index++) {
  differenceSum += values[index] - (index + 1);
}

console.log(differenceSum);
