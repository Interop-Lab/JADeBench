function Main(input) {
  input = input.split('\n');
  var n = parseInt(input[0], 10);
  var a = input[1].split(' ');
  var b = new Array(n);
  for (var i = 0; i < n; i++) {
    b[i] = parseInt(a[i], 10);
    a[i] = Math.abs(a[i]);
    a[i] = a[i] % 2009;
  }
  var ans = 0;
  var cnt = 0;
  for (var i = 0; i < n - 1; i++) {
    for (var j = i + 1; j < n; j++) {
      ans += a[i] * a[j];
      if (ans >= 2009) {
        ans = ans % 2009;
        cnt += 0.5;
      }
      cnt += b[i] * b[j];
    }
  }
  ans = ans + (cnt / 2);
  var tmp = 1;
  console.log(ans + tmp);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
