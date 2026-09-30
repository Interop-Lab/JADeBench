function Main(input) {
  var parts = input.trim().split(' ');
  var a = parts[0];
  var b = parts[1];
  var result = (a + b) - 0;
  console.log(result);
}
Main(require('fs')['readFileSync']('in', 'utf8'));
