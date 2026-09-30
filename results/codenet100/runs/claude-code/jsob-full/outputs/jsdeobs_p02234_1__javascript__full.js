const fs = require('fs');

const rows = fs
  .readFileSync('/dev/stdin', 'ascii')
  .trim()
  .split('\n')
  .map((line) => line.split(' ').map(Number));

const matrixCount = rows[0][0];
const minimumCost = {};

for (let start = 0; start <= matrixCount; start++) {
  minimumCost[start] = {};
}

for (let index = 0; index <= matrixCount; index++) {
  minimumCost[index][index] = 0;
}

for (let chainOffset = 1; chainOffset < matrixCount; chainOffset++) {
  for (
    let start = 1, end = start + chainOffset;
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
