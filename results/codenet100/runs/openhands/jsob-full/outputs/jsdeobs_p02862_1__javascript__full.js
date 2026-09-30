'use strict';

const DEFAULT_MODULUS = 1_000_000_007;

function calculateBinomialCoefficient(total, selected, modulus) {
  modulus = modulus || DEFAULT_MODULUS;

  const largerValue = Math.max(total, selected);
  const smallerValue = Math.min(total, selected);
  const termCount = Math.min(smallerValue, largerValue - smallerValue);
  const numerators = new Array(termCount + 1);
  const denominators = new Array(termCount + 1);
  let result = 1;

  if (termCount > 0) {
    for (let index = 0; index <= termCount; index++) {
      numerators[index] = largerValue - termCount + index;
      denominators[index] = index;
    }

    for (let divisor = 2; divisor <= termCount; divisor++) {
      const factor = denominators[divisor];
      const numeratorOffset = factor > 1
        ? -(largerValue - termCount) % divisor
        : 0;

      for (let multiple = divisor; multiple <= termCount; multiple += divisor) {
        numerators[multiple + numeratorOffset] /= factor;
        denominators[multiple] /= factor;
      }
    }

    for (let index = 1; index <= termCount; index++) {
      if (numerators[index] > 1) {
        result = (result * numerators[index]) % modulus;
      }
    }
  }

  return result;
}

function main(input) {
  const values = input.trim().split(' ');
  const total = Number(values[0]);
  const target = Number(values[1]);
  let result = 0;

  for (let pairCount = Math.floor(total / 2); pairCount >= 0; pairCount--) {
    const singleCount = total - pairCount * 2;

    if (singleCount * 2 + pairCount === target) {
      result = calculateBinomialCoefficient(
        pairCount + singleCount,
        pairCount,
      );
    }
  }

  console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
