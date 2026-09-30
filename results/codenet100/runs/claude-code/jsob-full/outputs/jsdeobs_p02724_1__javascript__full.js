const fs = require('fs');

function calculateTotal(input) {
  const largeUnits = Math.floor(input / 500);
  const remainder = input % 500;
  const smallUnits = Math.floor(remainder / 5);

  return largeUnits * 1000 + smallUnits * 5;
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(calculateTotal(input));
