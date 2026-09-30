const input = require("fs").readFileSync("/dev/stdin", "utf8");
const values = input.trim().split("\n").map(Number);

// The first line is the number of values; the original program relies on the
// remaining lines rather than using the declared count.
values.shift();
values.sort((left, right) => left - right);

const largestValue = values[values.length - 1];
const primes = [2];

for (let candidate = 3; candidate <= largestValue; candidate += 2) {
  let isPrime = true;
  const divisorLimit = Math.floor(Math.sqrt(candidate)) + 1;

  for (let index = 0; index < primes.length; index++) {
    const prime = primes[index];
    if (prime > divisorLimit) break;
    if (candidate % prime === 0) {
      isPrime = false;
      break;
    }
  }

  if (isPrime) primes.push(candidate);
}

let primeCount = 0;
let previousPrimeIndex = 0;

for (const value of values) {
  if (value !== 2 && value % 2 === 0) continue;

  const primeIndex = primes.indexOf(value, previousPrimeIndex);
  if (primeIndex !== -1) {
    previousPrimeIndex = primeIndex;
    primeCount++;
  }
}

console.log(primeCount);
