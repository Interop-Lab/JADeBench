'use strict';

const fs = require('fs');

const DEFAULT_MODULUS = 1_000_000_007;

/**
 * Computes C(first, second), reducing intermediate products modulo `modulus`.
 * The numerator and denominator factors are cancelled before multiplication,
 * so the calculation stays in ordinary JavaScript Number arithmetic.
 */
const ncr = (first, second, modulus) => {
  modulus = modulus || DEFAULT_MODULUS;

  const largest = Math.max(first, second);
  const smallest = Math.min(first, second);
  const factorCount = Math.min(smallest, largest - smallest);
  const numerator = new Array(factorCount + 1);
  const denominator = new Array(factorCount + 1);
  let result = 1;

  if (factorCount > 0) {
    for (let index = 1; index <= factorCount; index += 1) {
      numerator[index] = largest - factorCount + index;
      denominator[index] = index;
    }

    // Cancel each remaining denominator factor against the corresponding
    // divisible numerator terms.
    for (let divisor = 2; divisor <= factorCount; divisor += 1) {
      const denominatorFactor = denominator[divisor];
      const numeratorOffset =
        denominatorFactor > 1 ? -((largest - factorCount) % divisor) : 0;

      for (
        let multiple = divisor;
        multiple <= factorCount;
        multiple += divisor
      ) {
        numerator[multiple + numeratorOffset] /= denominatorFactor;
        denominator[multiple] /= denominatorFactor;
      }
    }

    for (let index = 1; index <= factorCount; index += 1) {
      if (numerator[index] > 1) {
        result = (result * numerator[index]) % modulus;
      }
    }
  }

  return result;
};

function main(input) {
  const values = input.trim().split(' ');
  const total = Number(values[0]);
  const target = Number(values[1]);
  let result = 0;

  for (let pairs = Math.floor(total / 2); pairs >= 0; pairs -= 1) {
    const singles = total - pairs * 2;
    if (singles * 2 + pairs === target) {
      result = ncr(pairs + singles, pairs);
    }
  }

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
