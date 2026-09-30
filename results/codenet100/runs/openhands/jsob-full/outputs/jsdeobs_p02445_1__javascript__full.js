const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const elementCount = Number(lines.shift());
const values = lines.shift().split(' ').map(Number);
const operationCount = Number(lines.shift());

for (let operationIndex = 0; operationIndex < operationCount; operationIndex += 1) {
  const [sourceStart, sourceEnd, targetStart] = lines[operationIndex]
    .split(' ')
    .map(Number);
  const rangeLength = sourceEnd - sourceStart;

  for (let offset = 0; offset < rangeLength; offset += 1) {
    const sourceIndex = sourceStart + offset;
    const targetIndex = targetStart + offset;
    [values[sourceIndex], values[targetIndex]] = [
      values[targetIndex],
      values[sourceIndex],
    ];
  }
}

console.log(values.join(' '));
