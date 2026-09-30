const fs = require('fs');

function generatePrimes(limit) {
  const isPrime = new Array(limit + 1).fill(true);
  isPrime[0] = false;
  isPrime[1] = false;

  for (let factor = 2; factor <= Math.floor(Math.sqrt(limit)); factor++) {
    if (!isPrime[factor]) continue;

    for (let multiple = factor * factor; multiple <= limit; multiple += factor) {
      isPrime[multiple] = false;
    }
  }

  const primes = [];
  for (let value = 2; value <= limit; value++) {
    if (isPrime[value]) primes.push(value);
  }
  return primes;
}

const primes = generatePrimes(100000);
const input = fs.readFileSync('/dev/stdin', 'utf8');

for (const line of input.trim().split('\n')) {
  if (line === '0 0 0') break;

  const [maximumProduct, ratioNumerator, ratioDenominator] = line
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
      if (product > maximumProduct) break;

      const ratioIsValid =
        secondPrime * ratioNumerator <= firstPrime * ratioDenominator;
      if (ratioIsValid && bestProduct < product) {
        bestFirstPrime = firstPrime;
        bestSecondPrime = secondPrime;
        bestProduct = product;
      }
    }
  }

  console.log(`${bestFirstPrime} ${bestSecondPrime}`);
}
