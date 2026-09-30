'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const values = input.split(/ |\n/).slice(0, 7).map(Number);

function main() {
  const firstCount = values[0];
  const baseValue = values[1];
  const secondCount = values[3];
  const thirdCount = values[4];

  const completePairs =
    (firstCount / 2 | 0) +
    (secondCount / 2 | 0) +
    (thirdCount / 2 | 0);
  let result = baseValue + 2 * completePairs;
  const oddCount = firstCount % 2 + secondCount % 2 + thirdCount % 2;

  switch (oddCount) {
    case 3:
      result += 3;
      break;
    case 2:
      if (firstCount * secondCount * thirdCount) {
        result += 1;
      }
      break;
  }

  return result;
}

const output = main();
if (output !== undefined) {
  console.log(output);
}
