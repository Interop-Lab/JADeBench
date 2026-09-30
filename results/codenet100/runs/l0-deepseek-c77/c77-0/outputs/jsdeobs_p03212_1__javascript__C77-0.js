const fs = require('fs');

function f(a, b, c, d) {
  if (b > c) return d;
  if (a === 7) d += 1;
  d += f(a | 1, b * 10 + 3, c, 0);
  d += f(a | 2, b * 10 + 5, c, 0);
  d += f(a | 4, b * 10 + 7, c, 0);
  return d;
}

function Main(input) {
  const n = parseInt(input);
  console.log(f(0, 0, 0, n));
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
