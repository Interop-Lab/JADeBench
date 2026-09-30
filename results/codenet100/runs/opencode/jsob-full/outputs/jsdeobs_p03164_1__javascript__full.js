const fs = require('fs');

const MAX_ITEM_VALUE = 1000;
const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
const rows = input.split('\n');
const [itemCount, weightLimit] = rows[0].split(' ').map(Number);
const items = rows.slice(1).map((row) => row.split(' ').map(Number));

// minimumWeight[i][value] is the least total weight needed to obtain exactly
// `value` using the first `i` items.
const maximumTotalValue = itemCount * MAX_ITEM_VALUE;
const minimumWeight = Array.from(
  { length: itemCount + 1 },
  () => Array(maximumTotalValue + 1).fill(Infinity),
);
minimumWeight[0][0] = 0;

function solve() {
  for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
    const [weight, value] = items[itemIndex];

    for (let totalValue = 0; totalValue <= maximumTotalValue; totalValue += 1) {
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
  for (let value = 0; value <= maximumTotalValue; value += 1) {
    if (minimumWeight[itemCount][value] <= weightLimit) {
      bestValue = value;
    }
  }

  return bestValue;
}

console.log(solve());
