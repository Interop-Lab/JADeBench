const fs = require('fs');

function main(input) {
  const rows = input
    .trim()
    .split('\n')
    .map((line) => line.split(' '));

  const itemCount = parseInt(rows[0][0], 10);
  let result = -1;
  let weightedTotal = 0;

  for (let index = 0; index < itemCount; index++) {
    const [valueText, multiplierText] = rows[index + 1];
    const value = parseInt(valueText, 10);
    const multiplier = parseInt(multiplierText, 10);

    result += value;
    weightedTotal += value * multiplier;
  }

  result += Math.floor((weightedTotal - 1) / 9);
  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
