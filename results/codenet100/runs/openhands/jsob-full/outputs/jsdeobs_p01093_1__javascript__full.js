const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

for (const line of lines) {
  if (!line) {
    break;
  }

  const numbers = line.split(' ').map(Number);

  if (numbers.length > 1) {
    const differences = [];

    numbers.forEach((firstNumber, firstIndex) => {
      numbers.forEach((secondNumber, secondIndex) => {
        if (firstIndex !== secondIndex) {
          differences.push(Math.abs(firstNumber - secondNumber));
        }
      });
    });

    differences.sort((first, second) => first - second);
    console.log(differences[0]);
  }
}
