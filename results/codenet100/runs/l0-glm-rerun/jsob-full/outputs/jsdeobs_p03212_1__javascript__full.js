function f(n, lo, hi, acc) {
  if (lo > hi) return acc;
  if (n === 1) return acc + 1;
  acc += f(n - 1, lo, hi, 0);
  acc += f(n - 1, lo + 1, hi, 0);
  acc += f(n - 1, lo, hi - 1, 0);
  acc += f(n - 1, lo + 1, hi - 1, 0);
  return acc;
}

function Main(input) {
  var n = parseInt(input);
  console.log(f(4, 1, n, 0));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
