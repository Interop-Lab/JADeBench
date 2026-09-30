function Main(input) {
  input = input.trim();
  console.log(1 + (2 - input));
}

Main(require('fs').readFileSync('stdin', 'utf8'));
