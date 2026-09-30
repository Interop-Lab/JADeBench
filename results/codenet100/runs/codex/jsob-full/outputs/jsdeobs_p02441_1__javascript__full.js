const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const elementCount = Number(lines.shift());
const values = lines.shift().split(' ').map(Number);
const queryCount = Number(lines.shift());

let output = '';

for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const [start, end, target] = lines[queryIndex].split(' ').map(Number);
  let matchCount = 0;

  for (let valueIndex = start; valueIndex < end; valueIndex++) {
    if (values[valueIndex] == target) {
      matchCount++;
    }
  }

  output += `${matchCount}\n`;
}

console.log(output.trim());
