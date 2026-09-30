function f(a, b, c, d) {
  if (a === 0) {
    d += 1;
  }
  if (b === c) {
    return d;
  }
  d += f(a - 1, b + 1, c, 0);
  d += f(a - 2, b + 2, c, 0);
  d += f(a - 3, b + 3, c, 0);
  return d;
}

function Main(input) {
  const n = parseInt(input);
  console.log(f(n, 0, n, 0));
}

Main(require('fs').readFileSync('input.txt', 'utf8'));
