function Main(input) {
  var result = -1;
  result += Math.floor(input / 100) * 2;
  result += Math.floor(input % 100 / 10) * 3;
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
