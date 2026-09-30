function Main(input) {
  var result = 0;
  result += Math.floor(input / 500) * 1000;
  result += Math.floor((input % 500) / 5) * 5;
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
