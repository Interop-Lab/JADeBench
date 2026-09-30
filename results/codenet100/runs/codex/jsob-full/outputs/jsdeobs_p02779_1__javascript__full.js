'use strict';

const fs = require('fs');

function printUniquenessResult(input) {
  const lines = input.trim().split('\n');
  const numberCount = Number(lines[0].trim());
  const numbers = lines[1].trim().split(' ').map(Number);

  let result = 'YES';

  for (let index = 0; index < numberCount; index++) {
    const followingNumbers = numbers.slice(index + 1);
    const duplicateIndex = followingNumbers.indexOf(numbers[index]);

    if (duplicateIndex !== -1) {
      result = 'NO';
      break;
    }
  }

  console.log(result);
}

printUniquenessResult(fs.readFileSync('/dev/stdin', 'utf8'));
