'use strict';

function main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0]);
  const a = [];
  const b = [];
  const c = [];

  lines.slice(1, n + 1).forEach(line => {
    const parts = line.split(' ').map(Number);
    a.push(parts[0]);
    b.push(parts[1]);
    c.push(parts[2]);
  });

  const LIMIT = 100;

  for (let y = 0; y <= LIMIT; y++) {
    for (let x = 0; x <= LIMIT; x++) {
      let h = -1;
      for (let i = 0; i < n; i++) {
        const candidate = c[i] + Math.abs(b[i] - y) + Math.abs(a[i] - x);
        if (h === -1) {
          h = candidate;
        } else if (h !== candidate) {
          h = -2;
          break;
        }
      }
      if (h === -2) continue;
      console.log('%d %d %d', x, y, h);
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'));
