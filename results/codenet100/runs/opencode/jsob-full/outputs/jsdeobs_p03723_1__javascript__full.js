'use strict';

const fs = require('fs');

const tokens = fs.readFileSync('/dev/stdin', 'utf8').split(/ |\n/);
let tokenIndex = 0;

function nextNumbers(count) {
  const values = tokens.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  return values.map(Number);
}

const deadline = Date.now() + 900;
const output = calculateSteps();
if (output !== undefined) console.log(String(output));

function calculateSteps() {
  let [first, second, third] = nextNumbers(3);
  let steps = 0;

  // This time guard was present in the original program. The loop normally
  // exits immediately through one of the conditions below.
  while (new Date() < deadline) {
    if (first === 2 || second === 2 || third === 2) return steps;

    const nextFirst = (second % third + 1) >> 1;
    const nextSecond = (first % third + 1) >> 1;
    const nextThird = (first % second + 1) >> 1;

    first = nextFirst;
    second = nextSecond;
    third = nextThird;
    steps++;
  }

  return -1;
}
