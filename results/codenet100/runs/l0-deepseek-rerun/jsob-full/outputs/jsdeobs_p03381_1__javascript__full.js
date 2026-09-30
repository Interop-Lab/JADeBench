const fs = require('fs');

function Main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0]);
  const arr = lines[1].split(' ').map(Number);
  const sorted = arr.slice().sort((a, b) => a - b);
  const min = sorted[Math.floor((n - 1) / 2)];
  const max = sorted[n - 1];
  arr.forEach(x => {
    console.log(x >= min ? max : min);
  });
}

Main(fs.readFileSync('input.txt', 'utf8'));
