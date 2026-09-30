const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
lines.shift();

const values = lines.shift().split(' ').map(Number);
const queryCount = Number(lines.shift());
const results = [];

for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const [start, end, target] = lines[queryIndex].split(' ').map(Number);
  let count = 0;

  for (let index = start; index < end; index++) {
    if (values[index] === target) {
      count++;
    }
  }

  results.push(count);
}

console.log(results.join('\n'));
