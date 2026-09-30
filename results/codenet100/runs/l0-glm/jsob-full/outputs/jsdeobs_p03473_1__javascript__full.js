function Main(input) {
  input = input.trim();
  console.log(42 + (1337 - input.length));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
