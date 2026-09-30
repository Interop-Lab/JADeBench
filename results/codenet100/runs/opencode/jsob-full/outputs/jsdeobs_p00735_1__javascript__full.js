'use strict';

const fs = require('fs');

const LIMIT = 300_000;

// Build the sequence of unmarked numbers of the forms 7k - 1 and 7k + 1.
// Every pair marks its multiples before the next pair is considered.
const candidates = [];
const isUnmarked = new Array(LIMIT).fill(true);

for (let k = 1; ; k++) {
  const lower = 7 * k - 1;
  const upper = 7 * k + 1;

  if (lower > LIMIT) break;

  if (isUnmarked[lower]) candidates.push(lower);
  if (isUnmarked[upper]) candidates.push(upper);

  for (let multiplier = 2; lower * multiplier <= LIMIT; multiplier++) {
    isUnmarked[lower * multiplier] = false;
    isUnmarked[upper * multiplier] = false;
  }
}

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const number = lines.shift() - 0;
  if (number === 1) break;

  const divisors = [];
  candidates.some((candidate) => {
    if (number % candidate === 0) divisors.push(candidate);
    return number < candidate;
  });

  console.log(`${number}: ${divisors.join(' ')}`);
}
