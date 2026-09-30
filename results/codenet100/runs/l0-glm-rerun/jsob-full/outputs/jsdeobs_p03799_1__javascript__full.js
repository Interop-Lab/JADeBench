function Main(input) {
  var parts = input.split(' ');
  var n = Number(parts[0]);
  var m = Number(parts[1]);
  var result = 0;
  while (n > 0) {
    if (m > n / 2) {
      result += Math.ceil(n / 2);
    } else {
      result += m;
      n -= result * 2;
      result += Math.ceil(n / 2);
    }
  }
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
