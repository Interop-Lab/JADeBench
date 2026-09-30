const fs = require('fs');

function main(input) {
  let lowercaseOCount = 0;

  for (let index = 0; index < 3; index++) {
    if (input[index] === 'o') {
      lowercaseOCount++;
    }
  }

  console.log(700 + lowercaseOCount * 100);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
main(input);
