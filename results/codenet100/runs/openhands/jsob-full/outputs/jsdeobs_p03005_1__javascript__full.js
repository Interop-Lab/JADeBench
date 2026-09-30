'use strict';

const fs = require('fs');

function main(input) {
  const firstLine = input.trim().split('\n')[0];
  const [firstToken, secondToken] = firstLine.split(' ');
  const firstNumber = parseInt(firstToken);
  const secondNumber = parseInt(secondToken);

  console.log(secondNumber === 1 ? 0 : firstNumber - secondNumber);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
