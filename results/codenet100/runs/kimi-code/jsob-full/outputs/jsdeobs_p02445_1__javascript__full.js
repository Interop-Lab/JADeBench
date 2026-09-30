const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const itemCount = Number(lines.shift());
const values = lines.shift().split(' ').map(Number);
const operationCount = Number(lines.shift());

for (let operationIndex = 0; operationIndex < operationCount; operationIndex++) {
  const [sourceStart, sourceEnd, targetStart] = lines[operationIndex]
    .split(' ')
    .map(Number);
  const rangeLength = sourceEnd - sourceStart;

  for (let offset = 0; offset < rangeLength; offset++) {
    [values[sourceStart + offset], values[targetStart + offset]] = [
      values[targetStart + offset],
      values[sourceStart + offset],
    ];
  }
}

console.log(values.join(' '));
