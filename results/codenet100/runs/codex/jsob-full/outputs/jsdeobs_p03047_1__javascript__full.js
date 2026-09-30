const fs = require('fs');

function main(input) {
  const parts = input.trim().split(' ');
  const firstPart = parts[0];
  const secondPart = parts[1];
  const result = firstPart + secondPart - 1;

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
