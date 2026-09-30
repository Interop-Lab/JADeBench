const fs = require('fs');

const MODULUS = 1_000_000_007n;

function multiplyModulo(left, right) {
  const product = (BigInt(left) * BigInt(right)) % MODULUS;
  return (product + MODULUS) % MODULUS;
}

function findMaximumProduct(input) {
  const [[valueCount, selectionCount], values] = input
    .trim()
    .split('\n')
    .map((line) => line.split(' ').map((value) => value | 0));

  const negativeValues = [];
  const positiveValues = [];

  for (let index = 0; index < valueCount; index += 1) {
    const value = values[index];
    if (value > 0) positiveValues.push(value);
    if (value < 0) negativeValues.push(value);
  }

  negativeValues.sort((left, right) => left - right);
  positiveValues.sort((left, right) => right - left);

  if (positiveValues.length === 0 && (selectionCount & 1)) {
    return String(
      negativeValues.slice(-selectionCount).reduce(multiplyModulo, 1),
    );
  }

  let nextNegativeIndex = 0;
  let nextPositiveIndex = 0;
  const selectedPositiveValues = [];
  const selectedNegativeValues = [];

  for (let selectedCount = 0; selectedCount < selectionCount; selectedCount += 1) {
    const positiveValue = positiveValues[nextPositiveIndex] | 0;
    const negativeMagnitude = -(negativeValues[nextNegativeIndex] | 0);

    if (positiveValue > negativeMagnitude) {
      selectedPositiveValues.push(positiveValues[nextPositiveIndex]);
      nextPositiveIndex += 1;
    } else {
      selectedNegativeValues.push(negativeValues[nextNegativeIndex]);
      nextNegativeIndex += 1;
    }
  }

  if (selectedNegativeValues.length & 1) {
    const positiveValue = positiveValues[nextPositiveIndex] | 0;
    const negativeMagnitude = -(negativeValues[nextNegativeIndex] | 0);

    if (positiveValue > negativeMagnitude) {
      selectedPositiveValues.push(positiveValues[nextPositiveIndex]);
      selectedNegativeValues.pop();
    } else {
      selectedNegativeValues.push(negativeValues[nextNegativeIndex]);
      selectedPositiveValues.pop();
    }
  }

  const positiveProduct = selectedPositiveValues.reduce(multiplyModulo, 1);
  const result = selectedNegativeValues.reduce(multiplyModulo, positiveProduct);
  return String(result);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(findMaximumProduct(input));
