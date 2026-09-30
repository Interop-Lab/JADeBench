const fs = require('fs');

function Main(input) {
  input = input.trim();
  console.log(24 - input.length);
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
