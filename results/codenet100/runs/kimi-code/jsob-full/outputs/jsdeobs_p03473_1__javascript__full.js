const fs = require('fs');

function Main(input) {
  const value = input.trim();
  console.log(48 - value);
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
