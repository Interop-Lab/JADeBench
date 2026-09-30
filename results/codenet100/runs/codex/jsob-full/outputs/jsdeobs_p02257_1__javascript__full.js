const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const numbers = input.trim().split('\n').map(Number);

numbers.shift();
numbers.sort((left, right) => left - right);

const maximum = numbers[numbers.length - 1];
const primes = [2];

for (let candidate = 3; candidate <= maximum; candidate += 2) {
  let isPrime = true;
  const divisorLimit = Math.floor(Math.sqrt(candidate)) + 1;

  for (let primeIndex = 0; primeIndex < primes.length; primeIndex++) {
    const prime = primes[primeIndex];

    if (prime > divisorLimit) {
      break;
    }

    if (candidate % prime === 0) {
      isPrime = false;
      break;
    }
  }

  if (isPrime) {
    primes.push(candidate);
  }
}

let primeCount = 0;
let searchStart = 0;

for (let numberIndex = 0; numberIndex < numbers.length; numberIndex++) {
  const number = numbers[numberIndex];

  if (number !== 2 && number % 2 === 0) {
    continue;
  }

  const primeIndex = primes.indexOf(number, searchStart);
  if (primeIndex !== -1) {
    searchStart = primeIndex;
    primeCount++;
  }
}

console.log(primeCount);
