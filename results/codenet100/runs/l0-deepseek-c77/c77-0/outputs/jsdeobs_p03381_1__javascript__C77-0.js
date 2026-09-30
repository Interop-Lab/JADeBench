const fs = require('fs');

function Main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0]);
  const nums = lines[1].split(' ').map(function (x) { return parseInt(x); });
  const diffs = nums.slice().sort(function (a, b) { return a - b; });
  const median = diffs[Math.floor(n / 2)];
  const other = diffs[Math.floor(n / 2) - 1];
  nums.forEach(function (x) {
    console.log(x >= median ? other : median);
  });
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
