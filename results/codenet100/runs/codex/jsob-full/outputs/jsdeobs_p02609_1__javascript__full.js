const input = require('fs').readFileSync('/dev/stdin', 'utf8');

function countSetBits(value) {
  let count = 0;

  do {
    if (value & 1) {
      count++;
    }
    value >>>= 1;
  } while (value);

  return count;
}

function countReductionsToZero(value) {
  if (value === 0) {
    return 0;
  }

  let reductionCount = 1;
  while ((value %= countSetBits(value))) {
    reductionCount++;
  }

  return reductionCount;
}

const lines = input.split('\n');
const bitLength = lines[0] - 0;
const binaryValue = lines[1];
const numericValue = parseInt(binaryValue, 2);
const setBitCountAfterClearing = countSetBits(numericValue) - 1;
const setBitCountAfterSetting = countSetBits(numericValue) + 1;

for (let index = 0; index < bitLength; index++) {
  const flippedValue = numericValue ^ Math.pow(2, bitLength - index - 1);

  if (flippedValue === 0) {
    console.log(0);
    continue;
  }

  const flippedBitWasSet = binaryValue[index] === '1';
  const newSetBitCount = flippedBitWasSet
    ? setBitCountAfterClearing
    : setBitCountAfterSetting;
  const reducedValue = flippedValue % newSetBitCount;

  console.log(countReductionsToZero(reducedValue) + 1);
}
