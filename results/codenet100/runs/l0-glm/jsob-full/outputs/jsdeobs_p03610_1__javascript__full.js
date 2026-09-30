function Main(input) {
  input = input.trim();
  input = input.split('\n');
  input = input[0];
  var result = '';
  for (var i = 0; i <= input.length; i++) {
    result += input[i];
  }
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
