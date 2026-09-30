const fs = require("fs");

const MODULUS = 1_000_000_007n;

function multiplyModulo(left, right) {
  return ((BigInt(left) * BigInt(right)) % MODULUS + MODULUS) % MODULUS;
}

function maximumProduct(input) {
  const [[valueCount, selectionCount], values] = input
    .trim()
    .split("\n")
    .map((line) => line.split(" ").map((value) => value | 0));

  const negativeValues = [];
  const positiveValues = [];

  for (let index = 0; index < valueCount; index++) {
    if (values[index] > 0) positiveValues.push(values[index]);
    if (values[index] < 0) negativeValues.push(values[index]);
  }

  negativeValues.sort((left, right) => left - right);
  positiveValues.sort((left, right) => right - left);

  // An odd number of exclusively negative factors has its greatest product
  // when the factors closest to zero are used.
  if (positiveValues.length === 0 && (selectionCount & 1)) {
    return String(
      negativeValues.slice(-selectionCount).reduce(multiplyModulo, 1),
    );
  }

  let negativeIndex = 0;
  let positiveIndex = 0;
  const selectedPositiveValues = [];
  const selectedNegativeValues = [];

  for (let count = 0; count < selectionCount; count++) {
    const positive = positiveValues[positiveIndex] | 0;
    const negativeMagnitude = -(negativeValues[negativeIndex] | 0);

    if (positive > negativeMagnitude) {
      selectedPositiveValues.push(positiveValues[positiveIndex++]);
    } else {
      selectedNegativeValues.push(negativeValues[negativeIndex++]);
    }
  }

  // A positive result needs an even number of negative factors. Replace the
  // least useful selected factor with the best remaining factor as needed.
  if (selectedNegativeValues.length & 1) {
    const nextPositive = positiveValues[positiveIndex] | 0;
    const nextNegativeMagnitude = -(negativeValues[negativeIndex] | 0);

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
  return String(multiplyModulo(positiveProduct, negativeProduct));
}

const input = fs.readFileSync("/dev/stdin", "utf8");
console.log(maximumProduct(input));
