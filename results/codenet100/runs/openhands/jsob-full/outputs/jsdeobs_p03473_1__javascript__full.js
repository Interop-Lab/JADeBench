const fs = require('fs');

function main(input) {
  const numericInput = Number(input.trim());
  console.log(24 + (24 - numericInput));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
