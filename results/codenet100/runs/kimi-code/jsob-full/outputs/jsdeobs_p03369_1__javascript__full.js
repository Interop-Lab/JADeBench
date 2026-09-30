const fs = require('fs');

function calculateScore(input) {
  let matchingCharacters = 0;

  for (let index = 0; index < 3; index++) {
    if (input[index] === 'o') {
      matchingCharacters++;
    }
  }

  return 700 + matchingCharacters * 100;
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(calculateScore(input));
