const fs = require('fs');

function generatePrimes(limit) {
  const sieve = [];
  for (let number = 0; number <= limit; number++) {
    sieve[number] = number;
  }

  sieve[0] = false;
  sieve[1] = false;

  const largestFactor = Math.floor(Math.sqrt(limit));
  for (let factor = 2; factor <= largestFactor; factor++) {
    if (sieve[factor] == false) {
      continue;
    }

    for (let multiple = factor + factor; multiple <= limit; multiple += factor) {
      sieve[multiple] = false;
    }
  }

  const primes = [];
  for (let number = 0; number <= limit; number++) {
    if (sieve[number] !== false) {
      primes.push(sieve[number]);
    }
  }
  return primes;
}

const primes = generatePrimes(100000);
const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

lines.some((line) => {
  if (line == '0 0 0') {
    return true;
  }

  const [productLimit, secondPrimeScale, firstPrimeScale] = line
    .split(' ')
    .map(Number);
  let bestFirstPrime = 0;
  let bestSecondPrime = 0;
  let bestProduct = 0;

  for (let firstIndex = 0; firstIndex < primes.length; firstIndex++) {
    const firstPrime = primes[firstIndex];

    for (let secondIndex = firstIndex; secondIndex < primes.length; secondIndex++) {
      const secondPrime = primes[secondIndex];
      const product = firstPrime * secondPrime;

      if (product > productLimit) {
        break;
      }

      const satisfiesRatio =
        secondPrime * secondPrimeScale <= firstPrime * firstPrimeScale;
      if (satisfiesRatio && bestProduct < product) {
        bestFirstPrime = firstPrime;
        bestSecondPrime = secondPrime;
        bestProduct = product;
      }
    }
  }

  console.log(`${bestFirstPrime} ${bestSecondPrime}`);
  return false;
});
