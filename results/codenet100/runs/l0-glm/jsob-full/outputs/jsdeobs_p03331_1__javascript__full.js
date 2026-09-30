function main(input) {
  var n = parseInt(input, 10);
  var digits = n.toString().length;
  var divisor = Math.pow(10, digits - 1);
  var result = [];
  for (var i = 0; i < digits; i++) {
    result.push(Math.floor(n / divisor));
    n = n % divisor;
    divisor /= 10;
  }
  var sum = result.reduce((a, b) => a + b);
  if (sum == 0) {
    sum = 1;
  }
  console.log(sum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
