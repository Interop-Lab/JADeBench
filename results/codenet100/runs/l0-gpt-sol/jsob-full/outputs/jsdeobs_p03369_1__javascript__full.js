function main(input) {
  let score = 700;

  for (let i = 0; i < 3; i++) {
    if (input[i] === 'o') {
      score += 100;
    }
  }

  console.log(score);
}

const fs = require('fs');
main(fs.readFileSync('/dev/stdin', 'utf8'));
