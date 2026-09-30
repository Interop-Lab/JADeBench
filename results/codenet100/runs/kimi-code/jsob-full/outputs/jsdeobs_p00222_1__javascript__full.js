const fs = require('fs');

function listPrimes(limit) {
  const isPrime = new Uint8Array(limit + 1);
  isPrime.fill(1, 2);

  const maxFactor = Math.floor(Math.sqrt(limit));
  for (let factor = 2; factor <= maxFactor; factor++) {
    if (!isPrime[factor]) continue;
    for (let composite = factor * factor; composite <= limit; composite += factor) {
      isPrime[composite] = 0;
    }
  }

  const primes = [];
  for (let number = 2; number <= limit; number++) {
    if (isPrime[number]) primes.push(number);
  }
  return primes;
}

const primes = listPrimes(9_999_999);
const inputValues = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n').map(Number);

for (const upperBound of inputValues) {
  if (upperBound === 0) break;

  let largestPrimeQuadruplet = '';
  for (let index = 5; index < primes.length && primes[index] <= upperBound; index++) {
    const lastPrime = primes[index];
    const firstPrime = lastPrime - 8;
    if (
      primes[index - 3] === firstPrime &&
      primes[index - 2] === firstPrime + 2 &&
      primes[index - 1] === firstPrime + 6
    ) {
      largestPrimeQuadruplet = lastPrime;
    }
  }

  console.log(largestPrimeQuadruplet);
}
