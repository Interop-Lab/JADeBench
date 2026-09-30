const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

let line;
while ((line = lines.pop())) {
  const numbers = line.split(' ').map(Number);

  if (numbers.length > 1) {
    const differences = [];

    numbers.forEach((leftNumber, leftIndex) => {
      numbers.forEach((rightNumber, rightIndex) => {
        if (leftIndex !== rightIndex) {
          differences.push(Math.abs(leftNumber - rightNumber));
        }
      });
    });

    differences.sort((left, right) => left - right);
    console.log(differences[0]);
  }
}
