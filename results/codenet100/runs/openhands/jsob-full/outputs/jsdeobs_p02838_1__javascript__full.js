const fs = require('fs');

const LOWER_CHUNK_SIZE = 2 ** 32;
const LOWER_ACCUMULATOR_LIMIT = 2 ** 31;
const OUTPUT_MODULUS = 1_000_000_007;

function main(input) {
  const lines = input.split('\n');
  const count = parseInt(lines[0], 10);
  const lowerChunks = lines[1].split(' ');
  const upperChunks = new Array(count);

  let lowerXorSum = 0;
  let upperXorSum = 0;

  for (let index = 0; index < count; index++) {
    const value = parseInt(lowerChunks[index], 10);
    upperChunks[index] = Math.floor(value / LOWER_CHUNK_SIZE);
    lowerChunks[index] = value % LOWER_CHUNK_SIZE;
  }

  for (let left = 0; left < count - 1; left++) {
    for (let right = left + 1; right < count; right++) {
      lowerXorSum += lowerChunks[left] ^ lowerChunks[right];

      if (lowerXorSum > LOWER_ACCUMULATOR_LIMIT) {
        lowerXorSum %= LOWER_ACCUMULATOR_LIMIT;
        upperXorSum += 0.5;
      }

      upperXorSum += upperChunks[left] ^ upperChunks[right];
    }
  }

  const totalXorSum = lowerXorSum + upperXorSum * LOWER_CHUNK_SIZE;
  console.log(totalXorSum % OUTPUT_MODULUS);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
