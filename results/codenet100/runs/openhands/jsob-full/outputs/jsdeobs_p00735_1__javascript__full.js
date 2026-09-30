const fs = require('fs');

const SEARCH_LIMIT = 300_000;

function buildDivisorCandidates(limit) {
  const candidates = [];
  const isUnmarked = Array(limit).fill(true);

  for (let sequenceIndex = 1; ; sequenceIndex++) {
    const lowerCandidate = 7 * sequenceIndex - 1;
    const upperCandidate = 7 * sequenceIndex + 1;

    if (lowerCandidate > limit) {
      break;
    }

    if (isUnmarked[lowerCandidate]) {
      candidates.push(lowerCandidate);
    }
    if (isUnmarked[upperCandidate]) {
      candidates.push(upperCandidate);
    }

    for (
      let multiplier = 2;
      lowerCandidate * multiplier <= limit;
      multiplier++
    ) {
      isUnmarked[lowerCandidate * multiplier] = false;
      isUnmarked[upperCandidate * multiplier] = false;
    }
  }

  return candidates;
}

function findDivisors(value, candidates) {
  const divisors = [];

  for (const candidate of candidates) {
    if (value % candidate === 0) {
      divisors.push(candidate);
    }
    if (value < candidate) {
      break;
    }
  }

  return divisors;
}

const divisorCandidates = buildDivisorCandidates(SEARCH_LIMIT);
const inputLines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const value = Number(inputLines.shift());
  if (value === 1) {
    break;
  }

  const divisors = findDivisors(value, divisorCandidates);
  console.log(`${value}: ${divisors.join(' ')}`);
}
