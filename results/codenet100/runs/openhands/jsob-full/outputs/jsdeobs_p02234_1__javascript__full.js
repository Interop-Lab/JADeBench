const fs = require('fs');

const rows = fs
  .readFileSync('/dev/stdin', 'ascii')
  .trim()
  .split('\n')
  .map((line) => line.split(' ').map(Number));

const matrixCount = rows[0][0];
const minimumCost = {};

for (let matrix = 1; matrix <= matrixCount; matrix += 1) {
  minimumCost[matrix] = {};
  minimumCost[matrix][matrix] = 0;
}

for (let gap = 1; gap < matrixCount; gap += 1) {
  for (let start = 1, end = gap + 1; end <= matrixCount; start += 1, end += 1) {
    minimumCost[start][end] = Number.MAX_VALUE;

    for (let split = start; split < end; split += 1) {
      const multiplicationCost = rows[start][0] * rows[split][1] * rows[end][1];
      const totalCost =
        multiplicationCost + minimumCost[start][split] + minimumCost[split + 1][end];

      minimumCost[start][end] = Math.min(minimumCost[start][end], totalCost);
    }
  }
}

console.log(minimumCost[1][matrixCount]);
