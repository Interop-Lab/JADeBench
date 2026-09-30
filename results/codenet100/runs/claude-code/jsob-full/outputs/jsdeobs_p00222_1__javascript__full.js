const fs = require('fs');

function generatePrimes(limit) {
  const sieve = Array.from({ length: limit + 1 }, (_, number) => number);
  sieve[0] = false;
  sieve[1] = false;

  const squareRoot = Math.floor(Math.sqrt(limit));
  for (let candidate = 2; candidate <= squareRoot; candidate++) {
    if (sieve[candidate] === false) continue;

    for (let multiple = candidate * 2; multiple <= limit; multiple += candidate) {
      sieve[multiple] = false;
    }
  }

  const primes = [];
  for (let number = 0; number <= limit; number++) {
    if (sieve[number] !== false) primes.push(sieve[number]);
  }
  return primes;
}

const primes = generatePrimes(9_999_999);
const input = fs.readFileSync('/dev/stdin', 'utf8');
const upperBounds = input.trim().split('\n').map(Number);

for (const upperBound of upperBounds) {
  if (upperBound === 0) break;

  let largestQuadrupletPrime = '';
  for (let index = 5; index < primes.length; index++) {
    const largestPrime = primes[index];
    if (largestPrime > upperBound) break;

    const smallestPrime = largestPrime - 8;
    if (
      smallestPrime === primes[index - 3] &&
      smallestPrime + 2 === primes[index - 2] &&
      smallestPrime + 6 === primes[index - 1]
    ) {
      largestQuadrupletPrime = largestPrime;
    }
  }

  console.log(largestQuadrupletPrime);
}
