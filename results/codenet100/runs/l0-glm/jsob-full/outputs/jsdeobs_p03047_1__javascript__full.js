function Main(input) {
  var lines = input.trim().split('\n');
  var a = lines[0];
  var b = lines[1];
  var result = a + b - 0;
  console.log(result);
}
Main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
