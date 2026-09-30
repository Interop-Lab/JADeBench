'use strict';

const fs = require('fs');

function main(input) {
  const numbers = input.split('\n')[1].split(' ').map(Number);
  let divisionsByTwo = 0;

  for (let number of numbers) {
    while (number % 2 === 0) {
      number /= 2;
      divisionsByTwo += 1;
    }
  }

  console.log(divisionsByTwo);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
