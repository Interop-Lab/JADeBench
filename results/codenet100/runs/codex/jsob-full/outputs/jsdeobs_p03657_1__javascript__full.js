'use strict';

const fs = require('fs');

function main(input) {
  const [firstNumber, secondNumber] = input.split('\n')[0].split(' ');
  const isPossible =
    firstNumber % 3 === 0 ||
    secondNumber % 3 === 0 ||
    (firstNumber + secondNumber) % 3 === 0;

  console.log(isPossible ? 'Possible' : 'Impossible');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
