const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');

function popcount(value) {
  let count = 0;

  do {
    if (value & 1) count++;
    value >>>= 1;
  } while (value);

  return count;
}

function countPopcountSteps(value) {
  if (value === 1) return 0;

  let steps = 1;
  while ((value %= popcount(value))) steps++;
  return steps;
}

function solve(text) {
  const lines = text.split('\n');
  const bitCount = lines[0] - 0;
  const bits = lines[1];
  const value = parseInt(bits, 2);
  const popcountAfterOneToZero = popcount(value) - 1;
  const popcountAfterZeroToOne = popcount(value) + 1;

  for (let index = 0; index < bitCount; index++) {
    const flippedValue = value ^ Math.pow(2, bitCount - index - 1);

    if (flippedValue === 0) {
      console.log(0);
      continue;
    }

    const flippedPopcount =
      bits[index] === '1'
        ? popcountAfterOneToZero
        : popcountAfterZeroToOne;
    const remainder = flippedValue % flippedPopcount;
    console.log(countPopcountSteps(remainder) + 1);
  }
}

solve(input);
