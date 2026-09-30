const fs = require('fs');

const [[count, selectionSize], values] = fs
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split('\n')
  .map((line) => line.split(' ').map((value) => value | 0));

const negativeValues = [];
const positiveValues = [];

for (let index = 0; index < count; index += 1) {
  if (values[index] > 0) positiveValues.push(values[index]);
  if (values[index] < 0) negativeValues.push(values[index]);
}

const MODULUS = 1_000_000_007n;
const multiplyModulo = (left, right) =>
  ((BigInt(left) * BigInt(right)) % MODULUS + MODULUS) % MODULUS;

negativeValues.sort((left, right) => left - right);
positiveValues.sort((left, right) => right - left);

if (positiveValues.length === 0 && (selectionSize & 1)) {
  const result = negativeValues
    .slice(-selectionSize)
    .reduce(multiplyModulo, 1);
  console.log(String(result));
  return;
}

let negativeIndex = 0;
let positiveIndex = 0;
const selectedNegatives = [];
const selectedPositives = [];

for (let selected = 0; selected < selectionSize; selected += 1) {
  const nextNegative = negativeValues[negativeIndex];
  const nextPositive = positiveValues[positiveIndex];

  if ((nextNegative | 0) > -(nextPositive | 0)) {
    selectedPositives.push(nextPositive);
    positiveIndex += 1;
  } else {
    selectedNegatives.push(nextNegative);
    negativeIndex += 1;
  }
}

if (selectedNegatives.length & 1) {
  const nextPositive = positiveValues[positiveIndex];
  const nextNegative = negativeValues[negativeIndex];

  if ((nextPositive | 0) > -(nextNegative | 0)) {
    selectedPositives.push(nextPositive);
    selectedNegatives.pop();
  } else {
    selectedNegatives.push(nextNegative);
    selectedPositives.pop();
  }
}

const positiveProduct = selectedPositives.reduce(multiplyModulo, 1);
const negativeProduct = selectedNegatives.reduce(multiplyModulo, 1);
console.log(String(multiplyModulo(positiveProduct, negativeProduct)));
