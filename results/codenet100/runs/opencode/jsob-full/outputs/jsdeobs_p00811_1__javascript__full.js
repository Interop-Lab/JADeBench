const fs = require("fs");

function primesUpTo(limit) {
  const isPrime = new Uint8Array(limit + 1);
  isPrime.fill(1, 2);

  for (let prime = 2; prime <= Math.floor(Math.sqrt(limit)); prime++) {
    if (!isPrime[prime]) continue;

    for (let multiple = prime * prime; multiple <= limit; multiple += prime) {
      isPrime[multiple] = 0;
    }
  }

  const primes = [];
  for (let number = 2; number <= limit; number++) {
    if (isPrime[number]) primes.push(number);
  }
  return primes;
}

const primes = primesUpTo(100_000);
const input = fs.readFileSync("/dev/stdin", "utf8");

input.trim().split("\n").some((line) => {
  if (line === "0 0 0") return true;

  const [maximumProduct, leftWeight, rightWeight] = line.split(" ").map(Number);
  let bestLeftPrime = 0;
  let bestRightPrime = 0;
  let bestProduct = 0;

  for (let leftIndex = 0; leftIndex < primes.length; leftIndex++) {
    const leftPrime = primes[leftIndex];

    for (let rightIndex = leftIndex; rightIndex < primes.length; rightIndex++) {
      const rightPrime = primes[rightIndex];
      const product = leftPrime * rightPrime;

      if (product > maximumProduct) break;

      if (
        rightPrime * leftWeight <= leftPrime * rightWeight &&
        bestProduct <= product
      ) {
        bestLeftPrime = leftPrime;
        bestRightPrime = rightPrime;
        bestProduct = product;
      }
    }
  }

  console.log(`${bestLeftPrime} ${bestRightPrime}`);
  return false;
});
