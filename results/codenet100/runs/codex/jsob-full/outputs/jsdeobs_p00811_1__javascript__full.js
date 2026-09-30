const fs = require('fs');

function generatePrimes(limit) {
  const sieve = Array.from({ length: limit + 1 }, (_, number) => number);
  sieve[0] = false;
  sieve[1] = false;

  const largestFactor = Math.floor(Math.sqrt(limit));
  for (let candidate = 2; candidate <= largestFactor; candidate++) {
    if (sieve[candidate] === false) {
      continue;
    }

    for (let multiple = candidate * 2; multiple <= limit; multiple += candidate) {
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

  const [maximumProduct, lowerRatio, upperRatio] = line.split(' ').map(Number);
  let bestFirstPrime = 0;
  let bestSecondPrime = 0;
  let bestProduct = 0;

  for (let firstIndex = 0; firstIndex < primes.length; firstIndex++) {
    for (let secondIndex = firstIndex; secondIndex < primes.length; secondIndex++) {
      const product = primes[firstIndex] * primes[secondIndex];
      if (product > maximumProduct) {
        break;
      }

      const ratioIsValid =
        primes[secondIndex] * lowerRatio <= primes[firstIndex] * upperRatio;
      if (ratioIsValid && bestProduct < product) {
        bestFirstPrime = primes[firstIndex];
        bestSecondPrime = primes[secondIndex];
        bestProduct = product;
      }
    }
  }

  console.log(`${bestFirstPrime} ${bestSecondPrime}`);
  return false;
});
