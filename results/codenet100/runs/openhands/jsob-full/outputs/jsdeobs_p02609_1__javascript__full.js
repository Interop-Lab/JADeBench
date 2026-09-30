const fs = require('fs');

function countSetBits(value) {
  let count = 0;

  do {
    count += value & 1;
    value >>>= 1;
  } while (value);

  return count;
}

function countReductionSteps(value) {
  if (value === 0) {
    return 0;
  }

  let steps = 1;
  while ((value %= countSetBits(value))) {
    steps++;
  }

  return steps;
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.split('\n');
const bitLength = lines[0] - 0;
const binary = lines[1];
const value = parseInt(binary, 2);
const setBitCount = countSetBits(value);
const lowerModulus = setBitCount - 1;
const upperModulus = setBitCount + 1;

for (let index = 0; index < bitLength; index++) {
  const bitMask = 2 ** (bitLength - index - 1);
  const toggledValue = value ^ bitMask;

  if (toggledValue === 0) {
    console.log(0);
    continue;
  }

  const modulus = binary[index] === '1' ? lowerModulus : upperModulus;
  const remainder = toggledValue % modulus;
  console.log(countReductionSteps(remainder) + 1);
}
