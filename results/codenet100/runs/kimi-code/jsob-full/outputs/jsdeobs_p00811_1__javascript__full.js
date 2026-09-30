const fs = require('fs');

function primesUpTo(limit) {
  const isPrime = Array(limit + 1).fill(true);
  isPrime[0] = false;
  isPrime[1] = false;

  const squareRoot = Math.floor(Math.sqrt(limit));
  for (let factor = 2; factor <= squareRoot; factor++) {
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

const primes = primesUpTo(100000);
const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

for (const line of lines) {
  if (line === '0 0 0') break;

  const [maximumProduct, ratioLeft, ratioRight] = line.split(' ').map(Number);
  let bestLeft = 0;
  let bestRight = 0;
  let bestProduct = 0;

  for (let leftIndex = 0; leftIndex < primes.length; leftIndex++) {
    const left = primes[leftIndex];

    for (let rightIndex = leftIndex; rightIndex < primes.length; rightIndex++) {
      const right = primes[rightIndex];
      const product = left * right;
      if (product > maximumProduct) break;

      if (right * ratioLeft <= left * ratioRight && product >= bestProduct) {
        bestLeft = left;
        bestRight = right;
        bestProduct = product;
      }
    }
  }

  console.log(bestLeft + ' ' + bestRight);
}
