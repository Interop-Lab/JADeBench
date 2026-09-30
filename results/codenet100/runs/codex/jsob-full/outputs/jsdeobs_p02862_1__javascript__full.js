'use strict';

const fs = require('fs');

const ncr = (firstValue, secondValue, modulus) => {
  modulus = modulus || 1000000007;

  const largerValue = Math.max(firstValue, secondValue);
  const smallerValue = Math.min(firstValue, secondValue);
  const termCount = Math.min(smallerValue, largerValue - smallerValue);
  const numerators = new Array(termCount + 1);
  const denominators = new Array(termCount + 1);
  let result = 1;

  if (termCount > 0) {
    for (let index = 1; index <= termCount; index++) {
      numerators[index] = largerValue - termCount + index;
      denominators[index] = index;
    }

    for (let divisor = 2; divisor <= termCount; divisor++) {
      const denominator = denominators[divisor];
      const numeratorOffset =
        denominator > 1 ? -((largerValue - termCount) % divisor) : 0;

      for (let multiple = divisor; multiple <= termCount; multiple += divisor) {
        numerators[multiple + numeratorOffset] /= denominator;
        denominators[multiple] /= denominator;
      }
    }

    for (let index = 1; index <= termCount; index++) {
      if (numerators[index] > 1) {
        result = (result * numerators[index]) % modulus;
      }
    }
  }

  return result;
};

function main(input) {
  const values = input.trim().split(' ');
  const firstTotal = Number(values[0]);
  const secondTotal = Number(values[1]);
  let result = 0;

  for (let pairCount = Math.floor(firstTotal / 2); pairCount >= 0; pairCount--) {
    const singleCount = firstTotal - pairCount * 2;

    if (singleCount * 2 + pairCount === secondTotal) {
      result = ncr(pairCount + singleCount, pairCount);
    }
  }

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
