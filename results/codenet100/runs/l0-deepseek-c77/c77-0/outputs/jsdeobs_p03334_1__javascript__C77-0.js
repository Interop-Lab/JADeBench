function Main(input) {
  input = input.split(' ').map(x => +x);
  var n = input[0];
  var a = calc(input[1]);
  var b = calc(input[2]);
  var results = [];
  var count = 0;
  for (var i = 0; i < 2 * n; i++) {
    for (var j = 0; j < 2 * n; j++) {
      if (f(a, i, j) && f(b, i, j)) {
        results[count++] = i + ' ' + j;
      }
      if (count === n * n) {
        console.log(results.join('\n'));
        return;
      }
    }
  }
}

function calc(x) {
  var count = 1;
  while ((x & 3) === 0) {
    count++;
    x >>>= 2;
  }
  return [count, x & 1];
}

function f(p, x, y) {
  x = Math.floor(x / p[0]);
  if (!p[1]) return !(x & 1);
  y = Math.floor(y / p[0]);
  return !((y + x) & 1);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
