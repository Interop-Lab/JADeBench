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
  const limit = Math.trunc(Math.sqrt(candidate)) + 1;

  for (const prime of primes) {
    if (prime > limit) break;
    if (candidate % prime === 0) {
      isPrime = false;
      break;
    }
  }

  if (isPrime) primes.push(candidate);
}

let matchedCount = 0;
let searchFrom = 0;

for (const number of numbers) {
  if (number !== 2 && number % 2 === 0) continue;

  const primeIndex = primes.indexOf(number, searchFrom);
  if (primeIndex !== -1) {
    searchFrom = primeIndex;
    matchedCount++;
  }
}

console.log(matchedCount);
