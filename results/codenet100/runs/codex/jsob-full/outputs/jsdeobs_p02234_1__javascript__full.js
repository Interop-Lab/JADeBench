const fs = require('fs');

const rows = fs
  .readFileSync('/dev/stdin', 'ascii')
  .trim()
  .split('\n')
  .map((line) => line.split(' ').map(Number));

const matrixCount = rows[0][0];
const minimumCost = Array.from(
  { length: matrixCount + 1 },
  () => Array(matrixCount + 1),
);

for (let matrix = 1; matrix <= matrixCount; matrix++) {
  minimumCost[matrix][matrix] = 0;
}

for (let chainOffset = 1; chainOffset < matrixCount; chainOffset++) {
  for (
    let firstMatrix = 1, lastMatrix = 1 + chainOffset;
    lastMatrix <= matrixCount;
    firstMatrix++, lastMatrix++
  ) {
    minimumCost[firstMatrix][lastMatrix] = Number.MAX_VALUE;

    for (let splitAfter = firstMatrix; splitAfter < lastMatrix; splitAfter++) {
      const multiplicationCost =
        rows[firstMatrix][0] * rows[splitAfter][1] * rows[lastMatrix][1];
      const totalCost =
        multiplicationCost +
        minimumCost[firstMatrix][splitAfter] +
        minimumCost[splitAfter + 1][lastMatrix];

      minimumCost[firstMatrix][lastMatrix] = Math.min(
        minimumCost[firstMatrix][lastMatrix],
        totalCost,
      );
    }
  }
}

console.log(minimumCost[1][matrixCount]);
