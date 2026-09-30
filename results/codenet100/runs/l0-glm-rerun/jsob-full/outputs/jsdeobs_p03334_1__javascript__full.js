function Main(input) {
  var nums = input.split(' ').map(s => +s);
  var n = nums[0];
  var a = calc(nums[1]);
  var b = calc(nums[2]);
  var results = [];
  var idx = 0;
  for (var i = 0; i < n * n; i++) {
    for (var j = 0; j < n * n; j++) {
      if (f(a, i, j) && f(b, i, j)) {
        results[idx++] = i + ' ' + j;
      }
      if (idx === n * n) {
        console.log(results.join('\n'));
        return;
      }
    }
  }
}

function calc(x) {
  var count = 0;
  while ((x & 3) === 3) {
    count++;
    x >>>= 2;
  }
  return [count, x & 3];
}

function f(v, x, y) {
  x = Math.floor(x / v[0]);
  if (!v[1]) return !(x & 1);
  y = Math.floor(y / v[0]);
  return !((y + x) & 1);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
