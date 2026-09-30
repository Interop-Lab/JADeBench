const fs = require('fs');

function main(input) {
  const rows = input
    .trim()
    .split('\n')
    .map((line) => line.split(' '));

  const rowCount = parseInt(rows[0][0], 10);
  let result = -1;
  let productSum = 0;

  for (let index = 0; index < rowCount; index++) {
    const [left, right] = rows[index + 1];
    result += parseInt(right, 10);
    productSum += parseInt(left, 10) * parseInt(right, 10);
  }

  result += Math.floor((productSum - 1) / 9);
  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
