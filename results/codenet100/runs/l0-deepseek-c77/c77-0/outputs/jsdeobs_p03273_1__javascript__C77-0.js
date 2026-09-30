const fs = require('fs');

function main(input) {
  const tokens = input.split(/\s/);
  const rows = parseInt(tokens[0]);
  const cols = parseInt(tokens[1]);
  const grid = [];

  for (let i = 2; i < 2 + rows; i++) {
    grid.push(tokens[i]);
  }

  function countHits(rowIdx, colIdx) {
    let hits = 0;

    for (let r = 0; r < rows; r++) {
      if (grid[r][rowIdx] === '#') {
        hits++;
        break;
      }
    }

    for (let c = 0; c < cols; c++) {
      if (grid[colIdx][c] === '#') {
        hits++;
        break;
      }
    }

    return hits === 2;
  }

  for (let r = 0; r < rows; r++) {
    let ans = '';
    for (let c = 0; c < cols; c++) {
      if (countHits(c, r)) {
        ans += grid[r][c];
      }
    }
    if (ans !== '') {
      console.log(ans);
    }
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
