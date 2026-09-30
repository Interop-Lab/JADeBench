function Main(input) {
  input = input.trim();
  input = input.split('\n');
  var result = '';
  for (var i = 0; i < input[0]; i++) {
    result += input[i + 1];
  }
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
