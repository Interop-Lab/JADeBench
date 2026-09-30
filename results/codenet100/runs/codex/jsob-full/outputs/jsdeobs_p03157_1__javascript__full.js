const fs = require('fs');

function calculateRegionPairTotal(input) {
  const [dimensions, ...grid] = input.trim().split('\n');
  const [rowCount, columnCount] = dimensions
    .split(' ')
    .map((value) => parseInt(value));

  const visited = Array.from({ length: rowCount }, () =>
    Array(columnCount).fill(false),
  );
  const adjacentOffsets = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
  ];

  let total = 0;

  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < columnCount; column++) {
      if (visited[row][column]) continue;

      const pendingCells = [[row, column]];
      visited[row][column] = true;

      let dotCount = Number(grid[row][column] === '.');
      let hashCount = dotCount ^ 1;

      while (pendingCells.length) {
        const [currentRow, currentColumn] = pendingCells.pop();

        for (const [rowOffset, columnOffset] of adjacentOffsets) {
          const nextRow = currentRow + rowOffset;
          const nextColumn = currentColumn + columnOffset;

          if (
            nextRow < 0 ||
            rowCount <= nextRow ||
            nextColumn < 0 ||
            columnCount <= nextColumn ||
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
          pendingCells.push([nextRow, nextColumn]);
        }
      }

      total += dotCount * hashCount;
    }
  }

  return String(total);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(calculateRegionPairTotal(input));
