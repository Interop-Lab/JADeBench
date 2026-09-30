const fs = require('fs');

function main(input) {
  let count = 0;
  for (let i = 0; i < 3; i++) {
    if (input[i] === 'o') {
      count++;
    }
  }
  console.log(700 + count * 100);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
