const fs = require('fs');

function generatePrimes(maximum) {
  const candidates = Array.from(
    { length: maximum + 1 },
    (_, number) => number,
  );
  candidates[0] = false;
  candidates[1] = false;

  const sieveLimit = Math.floor(Math.sqrt(maximum));
  for (let prime = 2; prime <= sieveLimit; prime++) {
    if (candidates[prime] === false) {
      continue;
    }

    for (let multiple = prime + prime; multiple <= maximum; multiple += prime) {
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
const limits = input.trim().split('\n').map(Number);

for (const limit of limits) {
  if (limit === 0) {
    break;
  }

  let quadrupletEnd = '';
  for (let index = 5; index < primes.length; index++) {
    if (primes[index] > limit) {
      break;
    }

    const quadrupletStart = primes[index] - 8;
    if (
      quadrupletStart === primes[index - 3]
      && quadrupletStart + 2 === primes[index - 2]
      && quadrupletStart + 6 === primes[index - 1]
    ) {
      quadrupletEnd = primes[index];
    }
  }

  console.log(quadrupletEnd);
}
