const fs = require('fs');

const SIEVE_LIMIT = 300000;
const retainedDivisors = [];
const isUnmarked = Array(SIEVE_LIMIT).fill(true);

for (let index = 1; ; index++) {
  const lowerCandidate = 7 * index - 1;
  const upperCandidate = 7 * index + 1;

  if (lowerCandidate > SIEVE_LIMIT) {
    break;
  }

  if (isUnmarked[lowerCandidate]) {
    retainedDivisors.push(lowerCandidate);
  }
  if (isUnmarked[upperCandidate]) {
    retainedDivisors.push(upperCandidate);
  }

  for (
    let multiplier = 2;
    lowerCandidate * multiplier <= SIEVE_LIMIT;
    multiplier++
  ) {
    isUnmarked[lowerCandidate * multiplier] = false;
    isUnmarked[upperCandidate * multiplier] = false;
  }
}

const inputLines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const number = inputLines.shift() - 0;
  if (number === 1) {
    break;
  }

  const divisors = [];
  retainedDivisors.some((divisor) => {
    if (number % divisor === 0) {
      divisors.push(divisor);
    }
    return number < divisor;
  });

  console.log(number + ': ' + divisors.join(' '));
}
