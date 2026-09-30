const fs = require('fs');

const numbers = fs
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split('\n')
  .map(Number);

numbers.shift();
numbers.sort((left, right) => left - right);

const maximum = numbers[numbers.length - 1];
const primes = [2];

for (let candidate = 3; candidate <= maximum; candidate += 2) {
  let isPrime = true;
  const factorLimit = Math.floor(Math.sqrt(candidate)) + 1;

  for (let index = 0; index < primes.length; index++) {
    const prime = primes[index];
    if (prime > factorLimit) break;

    if (candidate % prime === 0) {
      isPrime = false;
      break;
    }
  }

  if (isPrime) primes.push(candidate);
}

let primeCount = 0;
let searchStart = 0;

for (let index = 0; index < numbers.length; index++) {
  const number = numbers[index];
  if (number !== 2 && number % 2 === 0) continue;

  const primeIndex = primes.indexOf(number, searchStart);
  if (primeIndex !== -1) {
    searchStart = primeIndex;
    primeCount++;
  }
}

console.log(primeCount);
