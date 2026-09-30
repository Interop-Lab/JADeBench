const fs = require('fs');

const LIMIT = 300_000;
const candidateFactors = [];
const isAvailable = Array(LIMIT).fill(true);

for (let multiplier = 1; ; multiplier += 1) {
  const belowMultipleOfSeven = 7 * multiplier - 1;
  const aboveMultipleOfSeven = 7 * multiplier + 1;

  if (belowMultipleOfSeven > LIMIT) {
    break;
  }

  if (isAvailable[belowMultipleOfSeven]) {
    candidateFactors.push(belowMultipleOfSeven);
  }
  if (isAvailable[aboveMultipleOfSeven]) {
    candidateFactors.push(aboveMultipleOfSeven);
  }

  for (let factor = 2; belowMultipleOfSeven * factor <= LIMIT; factor += 1) {
    isAvailable[belowMultipleOfSeven * factor] = false;
    isAvailable[aboveMultipleOfSeven * factor] = false;
  }
}

const inputNumbers = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const number = Number(inputNumbers.shift());
  if (number === 1) {
    break;
  }

  const divisors = [];
  for (const candidate of candidateFactors) {
    if (number % candidate === 0) {
      divisors.push(candidate);
    }
    if (number < candidate) {
      break;
    }
  }

  console.log(`${number}: ${divisors.join(' ')}`);
}
