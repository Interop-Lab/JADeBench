'use strict';

const fs = require('fs');

const tokens = fs.readFileSync('/dev/stdin', 'utf8').split(/ |\n/);
let tokenIndex = 0;

function readNumbers(count) {
  const values = tokens.slice(tokenIndex, tokenIndex + count).map(Number);
  tokenIndex += count;
  return values;
}

function main() {
  const [firstCount, baseScore, , secondCount, thirdCount] = readNumbers(7);

  // Each complete pair contributes two to the result.
  let result = baseScore + 2 * (
    ((firstCount / 2) | 0) +
    ((secondCount / 2) | 0) +
    ((thirdCount / 2) | 0)
  );

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
