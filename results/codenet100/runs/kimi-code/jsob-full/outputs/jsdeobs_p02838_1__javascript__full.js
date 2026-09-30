const fs = require('fs');

const UINT32_RANGE = 0x100000000;
const SIGNED_INT32_RANGE = UINT32_RANGE / 2;
const RESULT_MODULUS = 1000000007;

function solve(input) {
  const lines = input.split('\n');
  const numberCount = parseInt(lines[0], 10);
  const lowWords = lines[1].split(' ');
  const highWords = new Array(numberCount);

  for (let index = 0; index < numberCount; index++) {
    lowWords[index] = parseInt(lowWords[index], 10);
    highWords[index] = Math.floor(lowWords[index] / UINT32_RANGE);
    lowWords[index] %= UINT32_RANGE;
  }

  let lowWordXorSum = 0;
  let highWordXorSum = 0;

  for (let left = 0; left < numberCount - 1; left++) {
    for (let right = left + 1; right < numberCount; right++) {
      lowWordXorSum += lowWords[left] ^ lowWords[right];
      if (lowWordXorSum > SIGNED_INT32_RANGE) {
        lowWordXorSum %= SIGNED_INT32_RANGE;
        highWordXorSum += 0.5;
      }
      highWordXorSum += highWords[left] ^ highWords[right];
    }
  }

  const xorSum = lowWordXorSum + highWordXorSum * UINT32_RANGE;
  console.log(xorSum % RESULT_MODULUS);
}

solve(fs.readFileSync('/dev/stdin', 'utf8'));
