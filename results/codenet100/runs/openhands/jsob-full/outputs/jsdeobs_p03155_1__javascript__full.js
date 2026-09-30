const fs = require('fs');

function main(input) {
  const [base, firstValue, secondValue] = input.split('\n').map(Number);
  const nextBase = base + 1;

  console.log((nextBase - firstValue) * (nextBase - secondValue));
}

const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
main(input);
