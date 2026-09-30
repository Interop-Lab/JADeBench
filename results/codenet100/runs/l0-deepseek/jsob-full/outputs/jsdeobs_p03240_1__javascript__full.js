const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0]);
  const a = [];
  const b = [];
  const c = [];

  lines.slice(1, 1 + n).forEach(line => {
    const parts = line.split(' ').map(Number);
    a.push(parts[0]);
    b.push(parts[1]);
    c.push(parts[2]);
  });

  const size = 100;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      let best = -1;
      for (let i = 0; i < n; i++) {
        const value = Math.abs(b[i] - x) + Math.abs(a[i] - y) + c[i];
        if (best === -1) {
          best = value;
        } else if (best > value) {
          best = value;
          break;
        }
      }
      if (best === -1) continue;
      console.log(y, x, best);
    }
  }
}

main(fs.readFileSync('in', 'utf8'));
