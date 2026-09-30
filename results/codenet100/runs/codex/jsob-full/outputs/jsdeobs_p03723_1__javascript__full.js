'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const tokens = input.split(/ |\n/);
let tokenIndex = 0;

function readNumbers(count) {
  return tokens
    .slice(tokenIndex, (tokenIndex += count))
    .map((token) => +token);
}

const deadline = +new Date() + 900;
const output = main();

if (output !== undefined) {
  console.log(String(output));
}

function main() {
  let [first, second, third] = readNumbers(3);
  let operationCount = 0;

  while (new Date() < deadline) {
    if (first % 2 || second % 2 || third % 2) {
      return operationCount;
    }

    const nextFirst = (second + third) >> 1;
    const nextSecond = (first + third) >> 1;
    const nextThird = (first + second) >> 1;

    first = nextFirst;
    second = nextSecond;
    third = nextThird;
    operationCount++;
  }

  return -1;
}
