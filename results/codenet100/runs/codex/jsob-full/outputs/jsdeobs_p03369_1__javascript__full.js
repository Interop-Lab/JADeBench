const fs = require('fs');

function main(input) {
  let matchingCharacterCount = 0;

  for (let index = 0; index < 3; index++) {
    if (input[index] === 'o') {
      matchingCharacterCount++;
    }
  }

  console.log(700 + matchingCharacterCount * 100);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
