const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0], 10);
  const a = [];
  const b = [];
  const c = [];

  lines.slice(1, 1 + n).forEach(line => {
    const parts = line.trim().split(/\s+/).map(Number);
    a.push(parts[0]);
    b.push(parts[1]);
    c.push(parts[2]);
  });

  const LIMIT = 1000;

  for (let x = 0; x < LIMIT; x++) {
    for (let y = 0; y < LIMIT; y++) {
      let best = -1;
      for (let i = 0; i < n; i++) {
        const value = c[i] + Math.abs(b[i] - x) + Math.abs(a[i] - y);
        if (best === -1) {
          best = value;
        } else if (best > value) {
          best = -1;
          break;
        }
      }
      if (best !== -1) {
        console.log(y, x, best);
      }
    }
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
