const fs = require('fs');

function main(input) {
  const trimmedInput = input.trim();
  console.log(24 + (24 - trimmedInput));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
