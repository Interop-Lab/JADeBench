const fs = require('fs');
const input = fs.readFileSync('stdin', 'utf8').trim();
const lines = input.split('\n');
const firstLine = lines[0].split(' ').map(Number);
const targetX = firstLine[0];
const targetY = firstLine[1];
let count = 0;
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(' ').map(Number);
  if (parts[0] >= targetX && parts[1] >= targetY) {
    count++;
  }
}
console.log(count);
