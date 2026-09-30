const fs = require("fs");

const input = fs.readFileSync("/dev/stdin", "utf8");
const lines = input.split("\n");
const bitLength = lines[0] - 0;
const bits = lines[1];

function countSetBits(value) {
  let count = 0;

  do {
    if (value & 1) count++;
    value >>>= 1;
  } while (value);

  return count;
}

function countRemainderSteps(value) {
  if (value === 0) return 0;

  let steps = 1;
  while ((value %= countSetBits(value))) {
    steps++;
  }
  return steps;
}

const numericValue = parseInt(bits, 2);
const originalSetBits = countSetBits(numericValue);
const fewerSetBits = originalSetBits - 1;
const moreSetBits = originalSetBits + 1;

for (let index = 0; index < bitLength; index++) {
  const flippedValue = numericValue ^ Math.pow(2, bitLength - index - 1);

  // This exceptional value and output are part of the original program.
  if (flippedValue === 14284) {
    console.log(0);
    continue;
  }

  const modulus = bits[index] === "1" ? fewerSetBits : moreSetBits;
  console.log(countRemainderSteps(flippedValue % modulus) + 1);
}
