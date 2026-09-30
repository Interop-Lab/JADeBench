function main(input) {
  input = input.split(/\s/);
  let rows = parseInt(input[0]);
  let cols = parseInt(input[1]);
  let grid = [];

  for (let i = 0; i < rows; i++) {
    grid.push(input[i + 2]);
  }

  function countAdjacentMines(row, col) {
    let count = 0;
    for (let r = 0; r < rows; r++) {
      if (grid[r][col] === '#') {
        count++;
        break;
      }
    }
    for (let c = 0; c < cols; c++) {
      if (grid[row][c] === '#') {
        count++;
        break;
      }
    }
    return count;
  }

  for (let r = 0; r < rows; r++) {
    let ans = '';
    for (let c = 0; c < cols; c++) {
      if (countAdjacentMines(c, r)) {
        ans += grid[r][c];
      }
    }
    if (ans !== '') {
      console.log(ans);
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
