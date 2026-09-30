function Main(input) {
  input = input.split(' ');
  var n = parseInt(input[0], 10);
  var m = parseInt(input[1], 10);
  var factors = [];
  var i = 2;
  while (i <= n) {
    while (n % i === 0) {
      factors.push(i);
      n = Math.floor(n / i);
    }
    i++;
  }
  var counts = {};
  for (var i = 0; i < factors.length; i++) {
    var f = factors[i];
    counts[f] = counts[f] ? counts[f] + 1 : 1;
  }
  var keys = factors.map(function (value, index, array) {
    return array.indexOf(value);
  });
  var result = 1;
  for (var i = 0; i < keys.length; i++) {
    if (counts[keys[i]] >= m) {
      result *= keys[i];
    }
  }
  console.log(result);
}
