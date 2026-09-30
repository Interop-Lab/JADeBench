const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const [dimensions, ...grid] = input.trim().split('\n');
const [rowCount, columnCount] = dimensions
  .split(' ')
  .map((value) => parseInt(value));

const visited = Array.from({ length: rowCount }, () =>
  Array(columnCount).fill(false),
);
const directions = [
  [-1, 0],
  [0, -1],
  [1, 0],
  [0, 1],
];

let total = 0;

for (let row = 0; row < rowCount; row++) {
  for (let column = 0; column < columnCount; column++) {
    if (visited[row][column]) continue;

    const componentCells = [[row, column]];
    visited[row][column] = true;

    let dotCount = grid[row][column] === '.' ? 1 : 0;
    let hashCount = grid[row][column] === '.' ? 0 : 1;

    while (componentCells.length) {
      const [currentRow, currentColumn] = componentCells.pop();

      for (const [rowOffset, columnOffset] of directions) {
        const nextRow = currentRow + rowOffset;
        const nextColumn = currentColumn + columnOffset;

        if (
          nextRow < 0 ||
          nextRow >= rowCount ||
          nextColumn < 0 ||
          nextColumn >= columnCount ||
          visited[nextRow][nextColumn] ||
          grid[currentRow][currentColumn] === grid[nextRow][nextColumn]
        ) {
          continue;
        }

        visited[nextRow][nextColumn] = true;
        if (grid[nextRow][nextColumn] === '#') {
          hashCount++;
        } else {
          dotCount++;
        }
        componentCells.push([nextRow, nextColumn]);
      }
    }

    total += dotCount * hashCount;
  }
}

console.log(String(total));
