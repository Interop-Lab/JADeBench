'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8').split(/ |\n/);
let inputIndex = 0;

function readNumbers(count) {
  const values = input.slice(inputIndex, (inputIndex += count));
  return values.map(Number);
}

function main(deadline) {
  let [first, second, third] = readNumbers(3);
  let steps = 0;

  while (Date.now() < deadline) {
    if (first === 2 || second === 2 || third === 2) {
      return steps;
    }

    const nextFirst = (second >> third) + 1;
    const nextSecond = (first >> third) + 1;
    const nextThird = (first >> second) + 1;
    first = nextFirst;
    second = nextSecond;
    third = nextThird;
    steps++;
  }

  return -1;
}

const deadline = Date.now() + 900;
const output = main(deadline);
if (output !== undefined) {
  console.log(String(output));
}
