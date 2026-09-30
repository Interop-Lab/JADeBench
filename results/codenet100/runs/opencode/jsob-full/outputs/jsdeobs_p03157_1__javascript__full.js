const fs = require("fs");

function calculateAlternatingRegionScore(input) {
  const [dimensions, ...grid] = input.trim().split("\n");
  const [height, width] = dimensions.split(" ").map((value) => parseInt(value));

  const visited = Array.from({ length: height }, () => Array(width).fill(false));
  const neighborOffsets = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
  ];

  let score = 0;

  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      if (visited[row][column]) continue;

      const pendingCells = [[row, column]];
      visited[row][column] = true;

      let dots = grid[row][column] === "." ? 1 : 0;
      let hashes = dots ^ 1;

      while (pendingCells.length) {
        const [currentRow, currentColumn] = pendingCells.pop();

        for (const [rowOffset, columnOffset] of neighborOffsets) {
          const nextRow = currentRow + rowOffset;
          const nextColumn = currentColumn + columnOffset;

          if (
            nextRow < 0 ||
            nextRow >= height ||
            nextColumn < 0 ||
            nextColumn >= width ||
            visited[nextRow][nextColumn] ||
            grid[currentRow][currentColumn] === grid[nextRow][nextColumn]
          ) {
            continue;
          }

          visited[nextRow][nextColumn] = true;
          if (grid[nextRow][nextColumn] === "#") hashes++;
          else dots++;
          pendingCells.push([nextRow, nextColumn]);
        }
      }

      score += dots * hashes;
    }
  }

  return "" + score;
}

const input = fs.readFileSync("/dev/stdin", "utf8");
console.log(calculateAlternatingRegionScore(input));
