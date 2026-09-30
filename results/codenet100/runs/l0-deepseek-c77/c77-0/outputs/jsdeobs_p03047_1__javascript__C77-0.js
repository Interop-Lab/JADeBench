function Main(input) {
  const parts = input.trim().split(' ');
  const a = parts[0];
  const b = parts[1];
  const result = (a - b) + 1;
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
