function Main(input) {
  var parts = input.trim().split(' ');
  var sum = 0;
  var first = parts[0];
  var second = parts[1];
  sum = first + second - 1;
  console.log(sum);
}

Main(require('fs').readFileSync('stdin', 'utf8'));
