const fs = require('fs');

const MAX_ITEM_VALUE = 1000;

const rows = fs.readFileSync(0, 'utf8').trim().split('\n');
const [itemCount, budget] = rows[0].split(' ').map(Number);
const items = rows.slice(1).map((row) => row.split(' ').map(Number));

function findMaximumValue() {
  const maximumTotalValue = itemCount * MAX_ITEM_VALUE;
  const minimumCost = Array.from(
    { length: itemCount + 1 },
    () => Array(maximumTotalValue + 1).fill(0),
  );

  minimumCost[0].fill(Infinity);
  minimumCost[0][0] = 0;

  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    const [value, cost] = items[itemIndex];

    for (let totalValue = 0; totalValue <= maximumTotalValue; totalValue++) {
      const costWithoutItem = minimumCost[itemIndex][totalValue];

      if (value <= totalValue) {
        const costWithItem = minimumCost[itemIndex][totalValue - value] + cost;
        minimumCost[itemIndex + 1][totalValue] = Math.min(
          costWithItem,
          costWithoutItem,
        );
      } else {
        minimumCost[itemIndex + 1][totalValue] = costWithoutItem;
      }
    }
  }

  let bestValue = 0;
  for (let totalValue = 0; totalValue < maximumTotalValue; totalValue++) {
    if (minimumCost[itemCount][totalValue] <= budget) {
      bestValue = totalValue;
    }
  }

  return bestValue;
}

console.log(findMaximumValue());
