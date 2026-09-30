const fs = require("fs");

const TWO_TO_THE_32 = 4294967296;
const RESULT_MODULUS = 1000000007;

function main(input) {
  const inputLines = input.split("\n");
  const valueCount = parseInt(inputLines[0], 10);
  const lowWords = inputLines[1].split(" ");
  const highWords = new Array(valueCount);

  for (let index = 0; index < valueCount; index++) {
    const value = parseInt(lowWords[index], 10);
    highWords[index] = Math.floor(value / TWO_TO_THE_32);
    lowWords[index] = value % TWO_TO_THE_32;
  }

  let lowWordXorSum = 0;
  let highWordXorSum = 0;

  for (let left = 0; left < valueCount - 1; left++) {
    for (let right = left + 1; right < valueCount; right++) {
      lowWordXorSum += lowWords[left] ^ lowWords[right];

      // Move each accumulated 2^31 into half of a 2^32 high-word unit.
      if (lowWordXorSum > TWO_TO_THE_32 / 2) {
        lowWordXorSum %= TWO_TO_THE_32 / 2;
        highWordXorSum += 0.5;
      }

      highWordXorSum += highWords[left] ^ highWords[right];
    }
  }

  const xorSum = lowWordXorSum + highWordXorSum * TWO_TO_THE_32;
  console.log(xorSum % RESULT_MODULUS);
}

main(fs.readFileSync("/dev/stdin", "utf8"));
