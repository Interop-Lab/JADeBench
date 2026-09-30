const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8');

function Main(data) {
  const lines = data.split('\n');
  const n = +lines[0];
  if (n <= 0) {
    console.log(0);
    return;
  }
  const pairs = lines.slice(1).map(line => line.split(' ').map(Number));
  const sums = {};
  pairs.forEach((a) => {
    pairs.forEach((b) => {
      if (a === b) return;
      const key = [a[0] + b[0], a[1] + b[1]].join('_');
      sums[key] = sums[key] == null ? 1 : sums[key] + 1;
    });
  });
  const best = Object.keys(sums).reduce((acc, key) => {
    const count = sums[key];
    return count > acc[0] ? [count, key] : [acc[0], acc[1]];
  }, [0, '']);
  console.log(n - best[0]);
}

Main(fs.readFileSync('input.txt', 'utf8'));
