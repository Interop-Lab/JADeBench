function Main(input) {
  input = input.split(' ').map(x => +x);
  const n = input[0];
  const a = calc(input[1]);
  const b = calc(input[2]);
  const result = [];
  let count = 0;
  for (let i = 0; i < 2 * n; i++) {
    for (let j = 0; j < 2 * n; j++) {
      if (f(a, i, j) && f(b, i, j)) {
        result[count++] = i + ' ' + j;
      }
      if (count === n * n) {
        console.log(result.join('\n'));
        return;
      }
    }
  }
}

function calc(x) {
  let count = 0;
  while ((x & 1) === 0) {
    count++;
    x >>>= 1;
  }
  return [count, x & 1];
}

function f(arr, x, y) {
  x = Math.floor(x / arr[0]);
  if (!arr[0]) return !(x & 1);
  y = Math.floor(y / arr[0]);
  return !((y + x) & 1);
}

Main(require('fs').readFileSync('input.txt', 'utf8'));
