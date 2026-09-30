const fs = require('fs');

const MODULUS = 1_000_000_007;

function main(input) {
  const [upperBound, lowerBound] = input.trim().split(' ').map(Number);
  let total = 0;

  for (let value = lowerBound; value <= upperBound + 1; value++) {
    const precedingPairs = ((value - 1) * value) / 2;
    const remainingValues = upperBound - value + 1;
    const crossingPairs = ((remainingValues + upperBound) * value) / 2;
    total += crossingPairs - precedingPairs + 1;
  }

  console.log(((total % MODULUS) + MODULUS) % MODULUS);
}

if (process.env.MYTEST === 'test') {
  test();
} else {
  const inputPath = process.env.MYTEST ? 'dev/stdin' : '/dev/stdin';
  main(fs.readFileSync(inputPath, 'utf8'));
}
