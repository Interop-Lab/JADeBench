const fs = require('fs');

function calculateRegionScore(input) {
  const [dimensions, ...grid] = input.trim().split('\n');
  const [rowCount, columnCount] = dimensions.split(' ').map(Number);
  const visited = Array.from({ length: rowCount }, () =>
    Array(columnCount).fill(false)
  );
  const neighbors = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ];

  let totalScore = 0;

  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < columnCount; column++) {
      if (visited[row][column]) continue;

      const queue = [[row, column]];
      visited[row][column] = true;
      let dotCount = Number(grid[row][column] === '.');
      let hashCount = Number(grid[row][column] === '#');

      while (queue.length > 0) {
        const [currentRow, currentColumn] = queue.shift();

        for (const [rowOffset, columnOffset] of neighbors) {
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
          if (grid[nextRow][nextColumn] === '#') hashCount++;
          else dotCount++;
          queue.push([nextRow, nextColumn]);
        }
      }

      totalScore += dotCount * hashCount;
    }
  }

  return String(totalScore);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(calculateRegionScore(input));
