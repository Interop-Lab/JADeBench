const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');

console.log((data => {
  const [firstLine, ...grid] = data.trim().split('\n');
  const [height, width] = firstLine.split(' ').map(Number);
  const visited = Array.from(
    { length: height },
    () => Array(width).fill(false)
  );

  const directions = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1]
  ];

  let total = 0;

  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      if (visited[row][column]) continue;

      const queue = [[row, column]];
      visited[row][column] = true;

      let dots = Number(grid[row][column] === '.');
      let hashes = dots ^ 1;

      while (queue.length) {
        const [currentRow, currentColumn] = queue.shift();

        for (const [rowOffset, columnOffset] of directions) {
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

          if (grid[nextRow][nextColumn] === '#') {
            hashes++;
          } else {
            dots++;
          }

          queue.push([nextRow, nextColumn]);
        }
      }

      total += dots * hashes;
    }
  }

  return String(total);
})(input));
