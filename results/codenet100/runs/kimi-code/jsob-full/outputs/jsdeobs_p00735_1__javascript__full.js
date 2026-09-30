const fs = require('fs');

const LIMIT = 300000;
const candidateDivisors = [];
const available = Array(LIMIT).fill(true);

for (let index = 1; ; index++) {
  const lowerCandidate = 7 * index - 1;
  const upperCandidate = 7 * index + 1;

  if (lowerCandidate > LIMIT) break;

  if (available[lowerCandidate]) candidateDivisors.push(lowerCandidate);
  if (available[upperCandidate]) candidateDivisors.push(upperCandidate);

  for (let multiplier = 2; lowerCandidate * multiplier <= LIMIT; multiplier++) {
    available[lowerCandidate * multiplier] = false;
    available[upperCandidate * multiplier] = false;
  }
}

const numbers = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const number = numbers.shift() - 0;
  if (number === 1) break;

  const divisors = [];
  candidateDivisors.some((candidate) => {
    if (number % candidate === 0) divisors.push(candidate);
    return number < candidate;
  });

  console.log(`${number}: ${divisors.join(' ')}`);
}
