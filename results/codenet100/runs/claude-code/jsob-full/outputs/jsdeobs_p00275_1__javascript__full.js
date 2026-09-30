const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const columnCount = Number(lines.shift());
  if (columnCount === 0) {
    break;
  }

  const columnHeights = Array(columnCount).fill(0);
  let pendingHeight = 0;
  const operations = lines.shift();

  for (let index = 0; index < operations.length; index++) {
    const column = index % columnCount;
    const operation = operations[index];

    if (operation === 'S') {
      pendingHeight += columnHeights[column] + 1;
      columnHeights[column] = 0;
    }
    if (operation === 'M') {
      columnHeights[column]++;
    }
    if (operation === 'L') {
      columnHeights[column] += pendingHeight + 1;
      pendingHeight = 0;
    }
  }

  columnHeights.sort((left, right) => left - right);
  console.log(`${columnHeights.join(' ')} ${pendingHeight}`);
}
