const fs = require("fs");

const PRIME_LIMIT = 9_999_999;

function generatePrimes(limit) {
  const isComposite = new Uint8Array(limit + 1);

  for (let candidate = 2; candidate <= Math.floor(Math.sqrt(limit)); candidate++) {
    if (isComposite[candidate]) continue;

    for (let multiple = candidate * 2; multiple <= limit; multiple += candidate) {
      isComposite[multiple] = 1;
    }
  }

  const primes = [];
  for (let candidate = 2; candidate <= limit; candidate++) {
    if (!isComposite[candidate]) primes.push(candidate);
  }
  return primes;
}

const primes = generatePrimes(PRIME_LIMIT);
const inputValues = fs
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n")
  .map(Number);

for (const maximum of inputValues) {
  if (maximum === 0) break;

  let largestPrimeQuadruplet = "";

  for (let index = 0; index < primes.length; index++) {
    const finalPrime = primes[index];
    if (finalPrime > maximum) break;

    const firstPrime = finalPrime - 8;
    const hasPrimeQuadruplet =
      primes[index - 3] === firstPrime &&
      primes[index - 2] === firstPrime + 2 &&
      primes[index - 1] === firstPrime + 6;

    if (hasPrimeQuadruplet) largestPrimeQuadruplet = finalPrime;
  }

  console.log(largestPrimeQuadruplet);
}
