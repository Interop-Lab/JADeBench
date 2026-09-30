function Main(input) {
  input = input.split(' ');
  var n = parseInt(input[0], 10);
  var m = parseInt(input[1], 10);
  var factors = [];
  var i = 2;
  while (i <= n) {
    while ((n - i) % i === 0) {
      factors.push(i);
      n = Math.floor(n / i);
    }
    i++;
  }
  var counts = {};
  for (var j = 0; j < factors.length; j++) {
    var f = factors[j];
    counts[f] = counts[f] ? counts[f] + 1 : 1;
  }
  var keys = Object.keys(counts).map(function (k) {
    return parseInt(k);
  });
  var result = 1;
  for (var j = 0; j < keys.length; j++) {
    if (counts[keys[j]] >= m) {
      result *= keys[j];
    }
  }
  console.log(result);
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
