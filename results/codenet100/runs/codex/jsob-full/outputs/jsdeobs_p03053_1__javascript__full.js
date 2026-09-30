'use strict';

const fs = require('fs');

function findLargestDistanceFromMarker(input) {
  const rows = input.trim().split('\n');
  rows.shift();

  const rowCount = rows.length;
  const columnCount = rows[0].length;
  const grid = rows.map((row) => row.split(''));
  const markerPositions = [];

  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < columnCount; column++) {
      if (grid[row][column] === '#') {
        markerPositions.push([row, column]);
      }
    }
  }

  const distancesFromNearestMarker = [];

  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < columnCount; column++) {
      if (grid[row][column] !== '.') continue;

      let nearestDistance = Number.MAX_SAFE_INTEGER;

      for (const [markerRow, markerColumn] of markerPositions) {
        const distance = Math.abs(markerRow - row) + Math.abs(markerColumn - column);
        if (distance < nearestDistance) {
          nearestDistance = distance;
        }
      }

      distancesFromNearestMarker.push(nearestDistance);
    }
  }

  console.log(Math.max(...distancesFromNearestMarker));
}

findLargestDistanceFromMarker(fs.readFileSync('/dev/stdin', 'utf8'));
