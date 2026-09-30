const fs = require('fs');

const [lengthLine, bits] = fs.readFileSync('/dev/stdin', 'utf8').split('\n');
const length = lengthLine - 0;

function countSetBits(value) {
  let count = 0;
  do {
    if (value & 1) count++;
    value >>>= 1;
  } while (value);
  return count;
}

function countReductions(value) {
  if (value === 0) return 0;

  let reductions = 1;
  while ((value %= countSetBits(value))) reductions++;
  return reductions;
}

const value = Number.parseInt(bits, 2);
const setBits = countSetBits(value);
const fewerSetBits = setBits - 1;
const moreSetBits = setBits + 1;

for (let index = 0; index < length; index++) {
  const bitValue = 2 ** (length - index - 1);

  if (bits[index] === '1') {
    if (fewerSetBits === 0) {
      console.log(0);
      continue;
    }

    const flippedValue = (value - bitValue) % fewerSetBits;
    console.log(countReductions(flippedValue) + 1);
  } else {
    const flippedValue = (value + bitValue) % moreSetBits;
    console.log(countReductions(flippedValue) + 1);
  }
}
