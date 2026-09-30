const fs = require('fs');

const MAX_ITEM_VALUE = 1000;

const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
const rows = input.split('\n');
const [itemCount, weightLimit] = rows[0].split(' ').map(Number);
const items = rows.slice(1).map((row) => row.split(' ').map(Number));
const maxTotalValue = itemCount * MAX_ITEM_VALUE;

const minWeightByValue = Array.from(
  { length: itemCount + 1 },
  () => Array(maxTotalValue + 1).fill(0),
);
minWeightByValue[0] = Array(maxTotalValue + 1).fill(Infinity);
minWeightByValue[0][0] = 0;

function findMaximumValue() {
  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    const [itemWeight, itemValue] = items[itemIndex];

    for (let totalValue = 0; totalValue <= maxTotalValue; totalValue++) {
      if (itemValue <= totalValue) {
        const weightWithItem =
          minWeightByValue[itemIndex][totalValue - itemValue] + itemWeight;
        const weightWithoutItem = minWeightByValue[itemIndex][totalValue];
        minWeightByValue[itemIndex + 1][totalValue] = Math.min(
          weightWithItem,
          weightWithoutItem,
        );
      } else {
        minWeightByValue[itemIndex + 1][totalValue] =
          minWeightByValue[itemIndex][totalValue];
      }
    }
  }

  let maximumValue = 0;
  for (let totalValue = 0; totalValue < maxTotalValue; totalValue++) {
    if (minWeightByValue[itemCount][totalValue] <= weightLimit) {
      maximumValue = totalValue;
    }
  }
  return maximumValue;
}

console.log(findMaximumValue());
