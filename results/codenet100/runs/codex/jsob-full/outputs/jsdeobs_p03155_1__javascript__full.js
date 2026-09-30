const fs = require('fs');

function main(input) {
  const [baseValue, firstValue, secondValue] = input.trim().split('\n').map(Number);
  const firstDifference = baseValue - firstValue;
  const secondDifference = baseValue - secondValue;

  console.log(firstDifference * secondDifference);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
