const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
lines.shift();

const values = lines.shift().split(' ').map(Number);
const queryCount = Number(lines.shift());

for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const [start, end, destination] = lines[queryIndex].split(' ').map(Number);
  const segmentLength = end - start;

  for (let offset = 0; offset < segmentLength; offset++) {
    [values[start + offset], values[destination + offset]] = [
      values[destination + offset],
      values[start + offset],
    ];
  }
}

console.log(values.join(' '));
