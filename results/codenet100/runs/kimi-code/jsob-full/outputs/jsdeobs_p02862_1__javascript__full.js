'use strict';

const fs = require('fs');

const MODULUS = 1_000_000_007;

function binomialModulo(n, k, modulus = MODULUS) {
  const upper = Math.max(n, k);
  const lower = Math.min(n, k);
  const terms = Math.min(lower, upper - lower);
  const numeratorFactors = new Array(terms + 1);
  const denominatorFactors = new Array(terms + 1);
  let result = 1;

  if (terms > 0) {
    for (let index = 0; index <= terms; index++) {
      numeratorFactors[index] = upper - terms + index;
      denominatorFactors[index] = index;
    }

    for (let divisor = 2; divisor <= terms; divisor++) {
      const denominator = denominatorFactors[divisor];
      const numeratorOffset = denominator > 1 ? -(upper - terms) % denominator : 0;

      for (let index = divisor; index <= terms; index += divisor) {
        numeratorFactors[index + numeratorOffset] /= denominator;
        denominatorFactors[index] /= denominator;
      }
    }

    for (let index = 1; index <= terms; index++) {
      if (numeratorFactors[index] > 1) {
        result = (result * numeratorFactors[index]) % modulus;
      }
    }
  }

  return result;
}

function solve(input) {
  const [n, target] = input.trim().split(' ').map(Number);
  let count = 0;

  for (let left = Math.floor(n / 2); left >= 0; left--) {
    const right = n - 2 * left;
    if (2 * n - 3 * left === target) {
      count = binomialModulo(n - left, left);
    }
  }

  console.log(count);
}

solve(fs.readFileSync('/dev/stdin', 'utf8'));
