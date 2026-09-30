'use strict';

function main(input) {
  input = input.trim().split('\n');
  input.shift();

  const rows = input.length;
  const cols = input[0].length;
  const grid = [];

  for (let i = 0; i < input.length; i++) {
    grid.push(input[i].split(''));
  }

  const hashes = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '#') {
        hashes.push([r, c]);
      }
    }
  }

  const distances = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '.') {
        let best = Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < hashes.length; i++) {
          const hr = hashes[i][0];
          const hc = hashes[i][1];
          const dist = Math.abs(hr - r) + Math.abs(hc - c);

          if (dist < best) {
            best = dist;
          }
        }

        distances.push(best);
      }
    }
  }

  console.log(Math.max(...distances));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
