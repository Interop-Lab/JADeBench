const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');

while (true) {
  const [n, m] = arr.shift().split(' ').map(Number);
  if (n === 0 && m === 0) break;

  const h = new Array(n).fill(0);

  for (let i = 0; i < m; i++) {
    const p = arr.shift().split(' ').map(Number);
    h = p.map((val, idx) => h[idx] + val);
  }

  console.log(Math.max(...h));
}
