const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

lines.shift();
let values = lines.shift().split(' ').map(Number);
const queryCount = Number(lines.shift());

for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const [start, end] = lines[queryIndex].split(' ').map(Number);
  const prefix = values.slice(0, start);
  const reversedRange = values.slice(start, end).reverse();
  const suffix = values.slice(end);

  values = prefix.concat(reversedRange, suffix);
}

console.log(values.join(' '));
