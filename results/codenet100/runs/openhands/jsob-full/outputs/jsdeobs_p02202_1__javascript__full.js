const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
const numberCount = Number(lines.shift());
const values = lines.shift().split(' ').map(Number);

let differenceSum = 0;
for (let index = 0; index < numberCount; index += 1) {
  differenceSum += values[index] - (index + 1);
}

console.log(differenceSum);
