const fs = require('fs');

function generatePrimes(maximum) {
  const candidates = [];
  for (let number = 0; number <= maximum; number++) {
    candidates[number] = number;
  }

  candidates[0] = false;
  candidates[1] = false;

  const largestFactor = Math.floor(Math.sqrt(maximum));
  for (let factor = 2; factor <= largestFactor; factor++) {
    if (candidates[factor] === false) {
      continue;
    }

    for (let multiple = factor + factor; multiple <= maximum; multiple += factor) {
      candidates[multiple] = false;
    }
  }

  const primes = [];
  for (let number = 0; number <= maximum; number++) {
    if (candidates[number] !== false) {
      primes.push(candidates[number]);
    }
  }
  return primes;
}

const primes = generatePrimes(9_999_999);
const input = fs.readFileSync('/dev/stdin', 'utf8');
const upperBounds = input.trim().split('\n').map(Number);

for (const upperBound of upperBounds) {
  if (upperBound === 0) {
    break;
  }

  let largestPrimeInQuadruplet = '';
  for (let primeIndex = 5; primeIndex < primes.length; primeIndex++) {
    const largestPrime = primes[primeIndex];
    if (largestPrime > upperBound) {
      break;
    }

    const firstPrime = largestPrime - 8;
    const isPrimeQuadruplet =
      firstPrime === primes[primeIndex - 3] &&
      firstPrime + 2 === primes[primeIndex - 2] &&
      firstPrime + 6 === primes[primeIndex - 1];

    if (isPrimeQuadruplet) {
      largestPrimeInQuadruplet = largestPrime;
    }
  }

  console.log(largestPrimeInQuadruplet);
}
