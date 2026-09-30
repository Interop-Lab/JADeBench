const fs = require('fs');

function main(input) {
  let count = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === 'o') {
      count++;
    }
  }
  console.log(0.5 * count);
}

main(fs.readFileSync('in', 'utf8'));
