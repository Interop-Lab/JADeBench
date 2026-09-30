const fs = require('fs');

const [[n, k], values] = fs
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split('\n')
  .map(line => line.split(' ').map(value => value | 0));

const negatives = [];
const positives = [];

for (let i = 0; i < n; i++) {
  if (values[i] > 0) positives.push(values[i]);
  if (values[i] < 0) negatives.push(values[i]);
}

const MOD = 1000000007n;

const multiplyModulo = (a, b) =>
  ((BigInt(a) * BigInt(b)) % MOD + MOD) % MOD;

negatives.sort((a, b) => a - b);
positives.sort((a, b) => b - a);

if (positives.length === 0 && (k & 1)) {
  console.log(
    String(negatives.slice(-k).reduce(multiplyModulo, 1))
  );
} else {
  let negativeIndex = 0;
  let positiveIndex = 0;
  const selectedPositives = [];
  const selectedNegatives = [];

  for (let i = 0; i < k; i++) {
    if (
      (positives[positiveIndex] | 0) >
      -(negatives[negativeIndex] | 0)
    ) {
      selectedPositives.push(positives[positiveIndex]);
      positiveIndex++;
    } else {
      selectedNegatives.push(negatives[negativeIndex]);
      negativeIndex++;
    }
  }

  if (selectedNegatives.length & 1) {
    if (
      (positives[positiveIndex] | 0) >
      -(negatives[negativeIndex] | 0)
    ) {
      selectedPositives.push(positives[positiveIndex]);
      selectedNegatives.pop();
    } else {
      selectedNegatives.push(negatives[negativeIndex]);
      selectedPositives.pop();
    }
  }

  const positiveProduct = selectedPositives.reduce(multiplyModulo, 1);
  const negativeProduct = selectedNegatives.reduce(multiplyModulo, 1);

  console.log(String(multiplyModulo(positiveProduct, negativeProduct)));
}
