'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const count = Number(lines[0].trim());
  const numbers = lines[1].trim().split(' ').map(Number);

  let result = 'YES';
  for (let index = 0; index < count; index += 1) {
    const laterNumbers = numbers.slice(index + 1);
    if (laterNumbers.indexOf(numbers[index]) !== -1) {
      result = 'NO';
      break;
    }
  }

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
