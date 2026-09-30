const fs = require('fs');

function main(input) {
  const rows = input
    .trim()
    .split('\n')
    .map((line) => line.split(' '));

  const rowCount = parseInt(rows[0][0], 10);
  let totalSecondValues = -1;
  let ratioSum = 0;

  for (let index = 0; index < rowCount; index += 1) {
    const row = rows[index + 1];
    const firstValue = parseInt(row[0], 10);
    const secondValue = parseInt(row[1], 10);

    totalSecondValues += secondValue;
    ratioSum += firstValue / secondValue;
  }

  const result = totalSecondValues + Math.floor((ratioSum - 1) / 9);
  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
