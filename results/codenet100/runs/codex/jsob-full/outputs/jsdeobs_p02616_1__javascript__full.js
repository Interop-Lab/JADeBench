const fs = require('fs');

const MODULUS = 1_000_000_007n;

function multiplyModulo(left, right) {
  const product = BigInt(left) * BigInt(right);
  return ((product % MODULUS) + MODULUS) % MODULUS;
}

function solve(input) {
  const [[valueCount, selectionCount], values] = input
    .trim()
    .split('\n')
    .map((line) => line.split(' ').map((value) => value | 0));

  const positiveValues = [];
  const negativeValues = [];

  for (let index = 0; index < valueCount; index++) {
    const value = values[index];

    if (value > 0) positiveValues.push(value);
    if (value < 0) negativeValues.push(value);
  }

  positiveValues.sort((left, right) => right - left);
  negativeValues.sort((left, right) => left - right);

  if (positiveValues.length === 0 && (selectionCount & 1)) {
    return String(
      negativeValues
        .slice(-selectionCount)
        .reduce(multiplyModulo, 1n),
    );
  }

  const selectedPositiveValues = [];
  const selectedNegativeValues = [];
  let positiveIndex = 0;
  let negativeIndex = 0;

  for (let selectedCount = 0; selectedCount < selectionCount; selectedCount++) {
    const nextPositive = positiveValues[positiveIndex];
    const nextNegative = negativeValues[negativeIndex];

    if ((nextPositive | 0) > -(nextNegative | 0)) {
      selectedPositiveValues.push(nextPositive);
      positiveIndex++;
    } else {
      selectedNegativeValues.push(nextNegative);
      negativeIndex++;
    }
  }

  if (selectedNegativeValues.length & 1) {
    const nextPositive = positiveValues[positiveIndex];
    const nextNegative = negativeValues[negativeIndex];

    if ((nextPositive | 0) > -(nextNegative | 0)) {
      selectedPositiveValues.push(nextPositive);
      selectedNegativeValues.pop();
    } else {
      selectedNegativeValues.push(nextNegative);
      selectedPositiveValues.pop();
    }
  }

  const positiveProduct = selectedPositiveValues.reduce(multiplyModulo, 1n);
  const negativeProduct = selectedNegativeValues.reduce(multiplyModulo, 1n);
  return String(multiplyModulo(positiveProduct, negativeProduct));
}

console.log(solve(fs.readFileSync('/dev/stdin', 'utf8')));
