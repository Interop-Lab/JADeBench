const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const [firstNumber, secondNumber, thirdNumber] = input
  .trim()
  .split(' ')
  .map(Number);

console.log(firstNumber + secondNumber + thirdNumber);
