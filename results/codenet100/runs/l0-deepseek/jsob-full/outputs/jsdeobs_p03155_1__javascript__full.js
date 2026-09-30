function Main(input) {
  const numbers = input.split('\n').map(Number);
  console.log((numbers[0] - numbers[1]) + (numbers[2] * numbers[3]));
}

Main(require('fs').readFileSync('stdin', 'utf8'));
