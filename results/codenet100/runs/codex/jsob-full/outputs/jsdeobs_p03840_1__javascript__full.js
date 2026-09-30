'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const tokens = input.split(/ |\n/);

function readNumbers(count) {
  return tokens.slice(0, count).map((token) => +token);
}

function main() {
  const values = readNumbers(7);
  const halfTotal =
    ((values[0] / 2) | 0) +
    ((values[3] / 2) | 0) +
    ((values[4] / 2) | 0);
  let result = values[1] + halfTotal * 2;

  const oddRemainderTotal = values[0] % 2 + values[3] % 2 + values[4] % 2;
  if (oddRemainderTotal === 3) {
    result += 3;
  } else if (oddRemainderTotal === 2 && values[0] * values[3] * values[4]) {
    result += 1;
  }

  return result;
}

const output = main();
if (output !== undefined) {
  console.log(output);
}
