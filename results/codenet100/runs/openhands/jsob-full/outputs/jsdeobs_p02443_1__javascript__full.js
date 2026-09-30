const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
const elementCount = Number(lines.shift());
let values = lines.shift().split(' ').map(Number);
const queryCount = Number(lines.shift());

for (let queryIndex = 0; queryIndex < queryCount; queryIndex += 1) {
  const [start, end] = lines[queryIndex].split(' ').map(Number);
  const prefix = values.slice(0, start);
  const reversedRange = values.slice(start, end).reverse();
  const suffix = values.slice(end);

  values = prefix.concat(reversedRange, suffix);
}

console.log(values.join(' '));
