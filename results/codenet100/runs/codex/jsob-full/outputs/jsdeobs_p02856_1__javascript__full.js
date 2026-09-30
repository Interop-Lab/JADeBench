const fs = require('fs');

function main(input) {
  const rows = input
    .trim()
    .split('\n')
    .map((line) => line.split(' '));

  const entryCount = parseInt(rows[0][0], 10);
  let result = -1;
  let weightedTotal = 0;

  for (let index = 0; index < entryCount; index += 1) {
    const [multiplierText, valueText] = rows[index + 1];
    const multiplier = parseInt(multiplierText, 10);
    const value = parseInt(valueText, 10);

    result += value;
    weightedTotal += multiplier * value;
  }

  result += Math.floor((weightedTotal - 1) / 9);
  console.log(result);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
main(input);
