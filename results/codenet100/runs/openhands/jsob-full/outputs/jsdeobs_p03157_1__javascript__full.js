const fs = require('fs');

function calculateAlternatingRegionScore(input) {
  const [dimensions, ...grid] = input.trim().split('\n');
  const [height, width] = dimensions.split(' ').map(value => parseInt(value));
  const visited = Array.from({ length: height }, () => Array(width).fill(false));
  const directions = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
  ];

  let totalScore = 0;

  for (let startRow = 0; startRow < height; startRow++) {
    for (let startColumn = 0; startColumn < width; startColumn++) {
      if (visited[startRow][startColumn]) continue;

      const cellsToVisit = [[startRow, startColumn]];
      visited[startRow][startColumn] = true;

      let whiteCellCount = Number(grid[startRow][startColumn] === '.');
      let blackCellCount = whiteCellCount ^ 1;

      while (cellsToVisit.length) {
        const [row, column] = cellsToVisit.pop();

        for (const [rowOffset, columnOffset] of directions) {
          const neighborRow = row + rowOffset;
          const neighborColumn = column + columnOffset;

          if (
            neighborRow < 0 ||
            height <= neighborRow ||
            neighborColumn < 0 ||
            width <= neighborColumn ||
            visited[neighborRow][neighborColumn] ||
            grid[row][column] === grid[neighborRow][neighborColumn]
          ) {
            continue;
          }

          visited[neighborRow][neighborColumn] = true;
          if (grid[neighborRow][neighborColumn] === '#') {
            blackCellCount++;
          } else {
            whiteCellCount++;
          }
          cellsToVisit.push([neighborRow, neighborColumn]);
        }
      }

      totalScore += whiteCellCount * blackCellCount;
    }
  }

  return String(totalScore);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(calculateAlternatingRegionScore(input));
