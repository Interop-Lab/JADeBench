const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

const n = lines.shift() - 0;
const numbers = lines.shift().split(' ').map(Number);
const queryCount = lines.shift() - 0;

let output = '';

for (let i = 0; i < queryCount; i++) {
  const [begin, end, value] = lines[i].split(' ').map(Number);
  let count = 0;

  for (let j = begin; j < end; j++) {
    if (numbers[j] == value) {
      count++;
    }
  }

  output += count + '\n';
}

console.log(output.trim());
