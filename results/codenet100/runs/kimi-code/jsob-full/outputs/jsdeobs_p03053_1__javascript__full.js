'use strict';

const fs = require('fs');

function findLargestDistanceFromMarkedCell(input) {
  const rows = input.trim().split('\n').sort();
  const height = rows.length;
  const width = rows[0].length;
  const grid = rows.map((row) => row.split(''));

  const markedCells = [];
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      if (grid[row][column] === '#') {
        markedCells.push([row, column]);
      }
    }
  }

  const distances = [];
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
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
      distances.push(nearestDistance);
    }
  }

  console.log(Math.max(...distances));
}

findLargestDistanceFromMarkedCell(fs.readFileSync('/dev/stdin', 'utf8'));
