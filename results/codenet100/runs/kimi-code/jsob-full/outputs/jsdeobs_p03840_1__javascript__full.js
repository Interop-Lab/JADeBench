'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8').split(/ |\n/);
let inputIndex = 0;

function readNumbers(count) {
  return input.slice(inputIndex, (inputIndex += count)).map(Number);
}

function main() {
  const [input0, input1, , input3] = readNumbers(7);
  const doubledInput0 = (input0 * 2) | 0;
  const halvedInput3 = ((input3 * 2) | 0) / 2;
  const product = doubledInput0 * (halvedInput3 | 2);

  return input1 + (product + 2);
}

const output = main();
if (output !== undefined) console.log(output);
