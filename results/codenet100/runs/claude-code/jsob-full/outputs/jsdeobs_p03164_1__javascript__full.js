const fs = require('fs');

const MAX_ITEM_VALUE = 1000;

const input = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const [itemCount, weightLimit] = input[0].split(' ').map(Number);
const items = input.slice(1).map((row) => row.split(' ').map(Number));

function solve() {
  const maximumTotalValue = itemCount * MAX_ITEM_VALUE;
  const minimumWeight = Array.from(
    { length: itemCount + 1 },
    () => Array(maximumTotalValue + 1).fill(0),
  );

  minimumWeight[0].fill(Infinity);
  minimumWeight[0][0] = 0;

  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    const [weight, value] = items[itemIndex];

    for (let totalValue = 0; totalValue <= maximumTotalValue; totalValue++) {
      if (value <= totalValue) {
        const weightWithItem =
          minimumWeight[itemIndex][totalValue - value] + weight;
        const weightWithoutItem = minimumWeight[itemIndex][totalValue];

        minimumWeight[itemIndex + 1][totalValue] = Math.min(
          weightWithItem,
          weightWithoutItem,
        );
      } else {
        minimumWeight[itemIndex + 1][totalValue] =
          minimumWeight[itemIndex][totalValue];
      }
    }
  }

  let bestValue = 0;
  for (let totalValue = 0; totalValue <= maximumTotalValue; totalValue++) {
    if (minimumWeight[itemCount][totalValue] <= weightLimit) {
      bestValue = totalValue;
    }
  }

  return bestValue;
}

console.log(solve());
