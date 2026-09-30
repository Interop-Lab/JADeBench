const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
const valueCount = Number(lines.shift());
const values = lines.shift().split(' ').map(Number);

let differenceFromSequence = 0;
for (let index = 0; index < valueCount; index += 1) {
  differenceFromSequence += values[index] - (index + 1);
}

console.log(differenceFromSequence);
