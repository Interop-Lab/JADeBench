const fs = require('fs');

const MAX_ITEM_VALUE = 1000;

const input = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const [itemCount, weightLimit] = input[0].split(' ').map(Number);
const items = input
  .slice(1)
  .map((line) => line.split(' ').map(Number));

function findMaximumValue() {
  const maximumTotalValue = itemCount * MAX_ITEM_VALUE;
  const minimumWeightForValue = Array.from(
    { length: itemCount + 1 },
    () => Array(maximumTotalValue + 1).fill(0),
  );

  minimumWeightForValue[0].fill(Infinity);
  minimumWeightForValue[0][0] = 0;

  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    const [itemWeight, itemValue] = items[itemIndex];

    for (let totalValue = 0; totalValue <= maximumTotalValue; totalValue++) {
      const weightWithoutItem = minimumWeightForValue[itemIndex][totalValue];

      if (itemValue <= totalValue) {
        const weightWithItem =
          minimumWeightForValue[itemIndex][totalValue - itemValue] + itemWeight;

        minimumWeightForValue[itemIndex + 1][totalValue] = Math.min(
          weightWithItem,
          weightWithoutItem,
        );
      } else {
        minimumWeightForValue[itemIndex + 1][totalValue] = weightWithoutItem;
      }
    }
  }

  let bestValue = 0;
  for (let totalValue = 0; totalValue <= maximumTotalValue; totalValue++) {
    if (minimumWeightForValue[itemCount][totalValue] <= weightLimit) {
      bestValue = totalValue;
    }
  }

  return bestValue;
}

console.log(findMaximumValue());
