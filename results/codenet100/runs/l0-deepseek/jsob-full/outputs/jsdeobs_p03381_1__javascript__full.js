const fs = require('fs');

function Main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0]);
  const arr = lines[1].split(' ').map(function (x) {
    return parseInt(x);
  });
  const sorted = arr.slice().sort(function (a, b) {
    return a - b;
  });
  const min = sorted[Math.floor((n - 1) / 2)];
  const max = sorted[Math.floor(n / 2)];
  arr.forEach(function (x) {
    console.log(x < max ? max : min);
  });
}

Main(fs.readFileSync('input.txt', 'utf8'));
