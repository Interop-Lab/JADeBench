function Main(input) {
  input = input.split('\n');
  input = input[0];
  let result = '';
  for (let i = 1; i <= input.length; i = i + 2) {
    result += input[i - 1];
  }
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
