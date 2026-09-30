const fs = require('fs');

function main(input) {
  const numbers = input.split(' ').map((value) => parseInt(value));
  const [firstNumber, secondNumber, target] = numbers;

  console.log(firstNumber + secondNumber >= target ? 'Yes' : 'No');
}

const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
main(input);
