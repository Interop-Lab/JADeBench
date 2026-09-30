const fs = require('fs');
const input = fs.readFileSync('stdin', 'utf8');
const lines = input.split('\n');
const firstLine = lines[0].split(' ').map(Number);
const target = firstLine[0];
let count = 0;
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(' ').map(Number);
  if (parts[0] >= target && parts[1] >= target) {
    count++;
  }
}
console.log(count);
