const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const elementCount = Number(lines.shift());
const values = lines.shift().split(' ').map(Number);
const queryCount = Number(lines.shift());

for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const [sourceStart, sourceEnd, destinationStart] = lines[queryIndex]
    .split(' ')
    .map(Number);
  const rangeLength = sourceEnd - sourceStart;

  for (let offset = 0; offset < rangeLength; offset++) {
    const sourceIndex = sourceStart + offset;
    const destinationIndex = destinationStart + offset;

    [values[sourceIndex], values[destinationIndex]] = [
      values[destinationIndex],
      values[sourceIndex],
    ];
  }
}

console.log(values.join(' '));
