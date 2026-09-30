const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

let line;
while ((line = lines.shift())) {
  const numbers = line.split(' ').map(Number);

  if (numbers.length > 1) {
    const pairsByDifference = [];

    numbers.forEach((firstNumber, firstIndex) => {
      numbers.forEach((secondNumber, secondIndex) => {
        if (firstIndex !== secondIndex) {
          pairsByDifference.push([
            `${firstNumber} ${secondNumber}`,
            Math.abs(firstNumber - secondNumber),
          ]);
        }
      });
    });

    const closestPair = pairsByDifference.sort(
      (firstPair, secondPair) => firstPair[1] - secondPair[1],
    )[0];

    console.log(closestPair[0]);
  }
}
