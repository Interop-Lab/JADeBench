function Main(input) {
  input = input.split('\n');
  let result = '';
  for (let i = input.length - 1; i >= 0; i--) {
    result += input[i];
  }
  console.log(result);
}

Main(require('fs').readFileSync('stdin', 'utf8'));
