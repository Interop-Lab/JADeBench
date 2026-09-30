function Main(input) {
  var lines = input.split('\n');
  var tokens = lines[1].split(' ');
  var n = parseInt(lines[0], 10);
  var a = new Array(n);
  var b = new Array(n);
  for (var i = 0; i < n; i++) {
    a[i] = parseInt(tokens[i], 10);
    b[i] = Math.abs(a[i]);
    a[i] = a[i] % 1000000007;
  }
  var result = 0;
  var sum = 0;
  for (var i = 0; i < n - 1; i++) {
    for (var j = i + 1; j < n; j++) {
      result += a[i] * a[j];
      if (result >= 1000000007) {
        result = result % 1000000007;
        sum += 0.5;
      }
      sum += b[i] * b[j];
    }
  }
  result = result - (sum % 1000000007);
  console.log(result % 1000000007);
}
