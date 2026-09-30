const fs = require('fs');

function main(lines) {
  const [itemCount, reach, batchSize] = lines[0]
    .split(' ')
    .map((value) => value - 0);
  const items = [];

  for (let lineIndex = 1; lineIndex <= itemCount; lineIndex += 1) {
    items.push(lines[lineIndex].split(' ').map((value) => value - 0));
  }

  items.sort((left, right) => left[0] - right[0]);

  let totalBatches = 0;

  for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
    const item = items[itemIndex];

    if (item[1] > 0) {
      const batches = Math.ceil(item[1] / batchSize);
      totalBatches += batches;
      const lastCoveredPosition = item[0] + reach * 2 + 1;

      for (
        let coveredIndex = itemIndex;
        coveredIndex < itemCount;
        coveredIndex += 1
      ) {
        const coveredItem = items[coveredIndex];

        if (coveredItem[0] <= lastCoveredPosition) {
          coveredItem[1] -= batchSize * batches;
        } else {
          break;
        }
      }
    }
  }

  console.log(totalBatches);
}

main(fs.readFileSync('/dev/stdin', 'utf8').split('\n'));
