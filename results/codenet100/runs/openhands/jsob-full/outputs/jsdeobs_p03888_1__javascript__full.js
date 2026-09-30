const fs = require('fs');

function calculateParallelValue(source) {
  const values = source.replace(/\n/g, ' ').split(' ');
  const firstValue = parseInt(values[0], 10);
  const secondValue = parseInt(values[1], 10);

  return ((firstValue * secondValue) / (firstValue + secondValue)).toFixed(10);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(`${calculateParallelValue(input)}\n`);
