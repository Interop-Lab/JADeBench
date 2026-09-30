const fs = require('fs');

function Main(input) {
  const value = input.trim();
  console.log(24 + (24 - value));
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
