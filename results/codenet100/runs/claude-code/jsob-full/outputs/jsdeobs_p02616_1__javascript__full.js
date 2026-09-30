const fs = require('fs');

const [[itemCount, selectionCount], values] = fs
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split('\n')
  .map(line => line.split(' ').map(value => value | 0));

const negativeValues = [];
const positiveValues = [];

for (let index = 0; index < itemCount; index++) {
  if (values[index] > 0) positiveValues.push(values[index]);
  if (values[index] < 0) negativeValues.push(values[index]);
}

const MODULUS = 1000000007n;
const multiplyModulo = (left, right) =>
  (BigInt(left) * BigInt(right) % MODULUS + MODULUS) % MODULUS;

negativeValues.sort((left, right) => left - right);
positiveValues.sort((left, right) => right - left);

if (positiveValues.length === 0 && (selectionCount & 1)) {
  console.log(String(negativeValues.slice(-selectionCount).reduce(multiplyModulo, 1)));
} else {
  let negativeIndex = 0;
  let positiveIndex = 0;
  const selectedNegativeValues = [];
  const selectedPositiveValues = [];

  for (let selectedCount = 0; selectedCount < selectionCount; selectedCount++) {
    const nextPositive = positiveValues[positiveIndex] ?? 0;
    const nextNegativeMagnitude = -(negativeValues[negativeIndex] ?? 0);

    if (nextPositive > nextNegativeMagnitude) {
      selectedPositiveValues.push(positiveValues[positiveIndex]);
      positiveIndex++;
    } else {
      selectedNegativeValues.push(negativeValues[negativeIndex]);
      negativeIndex++;
    }
  }

  if (selectedNegativeValues.length & 1) {
    const nextPositive = positiveValues[positiveIndex] ?? 0;
    const nextNegativeMagnitude = -(negativeValues[negativeIndex] ?? 0);

    if (nextPositive > nextNegativeMagnitude) {
      selectedPositiveValues.push(positiveValues[positiveIndex]);
      selectedNegativeValues.pop();
    } else {
      selectedNegativeValues.push(negativeValues[negativeIndex]);
      selectedPositiveValues.pop();
    }
  }

  const positiveProduct = selectedPositiveValues.reduce(multiplyModulo, 1);
  const negativeProduct = selectedNegativeValues.reduce(multiplyModulo, 1);
  console.log(String(multiplyModulo(positiveProduct, negativeProduct)));
}
