'use strict';

const fs = require('fs');

const MODULUS = 1_000_000_007;

function binomialCoefficient(left, right, modulus) {
  modulus = modulus || MODULUS;

  const total = Math.max(left, right);
  const smallerArgument = Math.min(left, right);
  const selectionSize = Math.min(smallerArgument, total - smallerArgument);
  const numerators = new Array(selectionSize + 1);
  const denominators = new Array(selectionSize + 1);

  for (let index = 0; index <= selectionSize; index++) {
    numerators[index] = total - selectionSize + index;
    denominators[index] = index;
  }

  for (let divisor = 2; divisor <= selectionSize; divisor++) {
    const remainingFactor = denominators[divisor];
    const offset = remainingFactor > 1
      ? -((total - selectionSize) % divisor)
      : 0;

    for (let multiple = divisor; multiple <= selectionSize; multiple += divisor) {
      numerators[multiple + offset] /= remainingFactor;
      denominators[multiple] /= remainingFactor;
    }
  }

  let result = 1;
  for (let index = 1; index <= selectionSize; index++) {
    if (numerators[index] > 1) {
      result = (result * numerators[index]) % modulus;
    }
  }

  return result;
}

function main(input) {
  const [firstTotal, secondTotal] = input.trim().split(' ').map(Number);
  let arrangementCount = 0;

  for (
    let firstKindCount = Math.floor(firstTotal / 2);
    firstKindCount >= 0;
    firstKindCount--
  ) {
    const secondKindCount = firstTotal - firstKindCount * 2;
    if (secondKindCount * 2 + firstKindCount === secondTotal) {
      arrangementCount = binomialCoefficient(
        firstKindCount + secondKindCount,
        firstKindCount,
      );
    }
  }

  console.log(arrangementCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
