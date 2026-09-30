'use strict';

function main(input) {
  const lines = input.trim().split('\n');
  lines.shift();

  const rows = lines.length;
  const cols = lines[0].length;
  const grid = [];

  for (let i = 0; i < lines.length; i++) {
    grid.push(lines[i].split(''));
  }

  const starts = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '#') {
        starts.push([r, c]);
      }
    }
  }

  const distances = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '.') {
        let minDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < starts.length; i++) {
          const sr = starts[i][0];
          const sc = starts[i][1];
          const distance = Math.abs(sr - r) + Math.abs(sc - c);
          if (distance < minDistance) {
            minDistance = distance;
          }
        }
        distances.push(minDistance);
      }
    }
  }

  console.log(Math.max(...distances));
}

main(require('fs').readFileSync('in', 'utf8'));
