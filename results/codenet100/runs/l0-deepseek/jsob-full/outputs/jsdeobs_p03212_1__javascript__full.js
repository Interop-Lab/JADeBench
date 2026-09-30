function f(a, b, c, d) {
  if (a === 0) d += 1;
  if (b === c) return d;
  d += f(a - 1, b + 1, c, d);
  d += f(a - 1, b + 2, c, d);
  d += f(a - 1, b - 1, c, d);
  return d;
}

function Main(input) {
  const n = parseInt(input);
  console.log(f(0, 0, 0, n));
}

Main(require('fs').readFileSync('input.txt', 'utf8'));
