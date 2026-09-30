'use strict';

function main(input) {
  const rows = input.trim().split('\n');
  rows.shift();

  const rowCount = rows.length;
  const columnCount = rows[0].length;
  const grid = rows.map((row) => row.split(''));
  const markedCells = [];

  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < columnCount; column++) {
      if (grid[row][column] === '#') {
        markedCells.push([row, column]);
      }
    }
  }

  const nearestDistances = [];

  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < columnCount; column++) {
      if (grid[row][column] !== '.') {
        continue;
      }

      let nearestDistance = Number.MAX_SAFE_INTEGER;
      for (const [markedRow, markedColumn] of markedCells) {
        const distance =
          Math.abs(markedRow - row) + Math.abs(markedColumn - column);
        if (distance < nearestDistance) {
          nearestDistance = distance;
        }
      }
      nearestDistances.push(nearestDistance);
    }
  }

  console.log(Math.max(...nearestDistances));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
