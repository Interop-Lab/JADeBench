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

for (let chainLength = 1; chainLength < matrixCount; chainLength++) {
  for (
    let start = 1, end = start + chainLength;
    end <= matrixCount;
    start++, end++
  ) {
    minimumCost[start][end] = Number.MAX_VALUE;

    for (let split = start; split < end; split++) {
      const multiplicationCost =
        rows[start][0] * rows[split][1] * rows[end][1];
      const totalCost =
        minimumCost[start][split] +
        minimumCost[split + 1][end] +
        multiplicationCost;

      minimumCost[start][end] = Math.min(
        minimumCost[start][end],
        totalCost,
      );
    }
  }
}

console.log(minimumCost[1][matrixCount]);
