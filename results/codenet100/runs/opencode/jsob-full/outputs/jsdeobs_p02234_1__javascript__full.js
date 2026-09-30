const fs = require("fs");

const rows = fs
  .readFileSync("/dev/stdin", "ascii")
  .trim()
  .split("\n")
  .map((line) => line.split(" ").map(Number));

const matrixCount = rows[0][0];
const minimumCost = {};

for (let start = 1; start <= matrixCount; start += 1) {
  minimumCost[start] = {};
  minimumCost[start][start] = 0;
}

for (let chainLength = 1; chainLength < matrixCount; chainLength += 1) {
  for (
    let start = 1, end = 1 + chainLength;
    end <= matrixCount;
    start += 1, end += 1
  ) {
    minimumCost[start][end] = Number.MAX_VALUE;

    for (let split = start; split < end; split += 1) {
      const multiplicationCost =
        rows[start][0] * rows[split][1] * rows[end][1];
      const candidateCost =
        multiplicationCost +
        minimumCost[start][split] +
        minimumCost[split + 1][end];

      minimumCost[start][end] = Math.min(
        minimumCost[start][end],
        candidateCost,
      );
    }
  }
}

console.log(minimumCost[1][matrixCount]);
