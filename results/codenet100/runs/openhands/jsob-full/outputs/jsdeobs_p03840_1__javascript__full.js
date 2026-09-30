'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8').split(/ |\n/);
let inputIndex = 0;

function readNumbers(count) {
  const values = input.slice(inputIndex, inputIndex + count).map(Number);
  inputIndex += count;
  return values;
}

function truncatedHalf(value) {
  return (value / 2) | 0;
}

function main() {
  const [firstValue, baseValue, , fourthValue, fifthValue] = readNumbers(7);

  let result =
    baseValue +
    2 *
      (truncatedHalf(firstValue) +
        truncatedHalf(fourthValue) +
        truncatedHalf(fifthValue));

  const remainderTotal =
    (firstValue % 2) + (fourthValue % 2) + (fifthValue % 2);

  switch (remainderTotal) {
    case 3:
      result += 3;
      break;
    case 2:
      if (firstValue * fourthValue * fifthValue) {
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
