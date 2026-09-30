'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  lines.shift(); // The dimensions are redundant; the grid supplies them.

  const height = lines.length;
  const width = lines[0].length;
  const grid = lines.map((line) => line.split(''));
  const occupiedCells = [];

  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      if (grid[row][column] === '#') {
        occupiedCells.push([row, column]);
      }
    }
  }

  const distances = [];

  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      if (grid[row][column] !== '.') continue;

      let nearestDistance = Number.MAX_SAFE_INTEGER;
      for (const [occupiedRow, occupiedColumn] of occupiedCells) {
        const distance =
          Math.abs(occupiedRow - row) + Math.abs(occupiedColumn - column);
        if (distance < nearestDistance) nearestDistance = distance;
      }
      distances.push(nearestDistance);
    }
  }

  console.log(Math.max(...distances));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
