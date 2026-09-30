'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  lines.shift();

  const grid = lines.map((line) => line.split(''));
  const rowCount = grid.length;
  const columnCount = grid[0].length;
  const markedCells = [];

  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < columnCount; column++) {
      if (grid[row][column] === '#') {
        markedCells.push([row, column]);
      }
    }
  }

  const distances = [];

  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < columnCount; column++) {
      if (grid[row][column] !== '.') {
        continue;
      }

      let nearestMarkedDistance = Number.MAX_SAFE_INTEGER;

      for (const [markedRow, markedColumn] of markedCells) {
        const distance =
          Math.abs(markedRow - row) + Math.abs(markedColumn - column);

        if (distance < nearestMarkedDistance) {
          nearestMarkedDistance = distance;
        }
      }

      distances.push(nearestMarkedDistance);
    }
  }

  console.log(Math.max(...distances));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
