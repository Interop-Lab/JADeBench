const fs = require('fs');

function Main(input) {
  const [first, second, third] = input.split('\n').map(Number);
  console.log((first + 1 - second) * (first + 1 - third));
}

Main(fs.readFileSync('/dev/stdin', 'utf8').trim());
