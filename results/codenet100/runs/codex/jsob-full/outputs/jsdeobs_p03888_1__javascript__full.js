const fs = require('fs');

function parseInput(source) {
  return source.replace(/\n/g, ' ').split(' ');
}

function main(source) {
  const input = parseInput(source);
  const firstNumber = parseInt(input[0], 10);
  const secondNumber = parseInt(input[1], 10);
  const result = (firstNumber / secondNumber) * (firstNumber + secondNumber);

  console.log(`${result.toFixed(10)}\n`);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
