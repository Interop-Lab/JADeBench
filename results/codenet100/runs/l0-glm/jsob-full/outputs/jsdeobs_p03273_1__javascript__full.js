function main(input) {
  const grid = input.trim().split(/\s/);
  const rows = parseInt(grid[0]);
  const cols = parseInt(grid[1]);
  const field = [];

  for (let i = 0; i < rows; i++) {
    field.push(grid[i + 2]);
  }

  function check(row, col) {
    let count = 0;
    for (let r = 0; r < rows; r++) {
      if (field[r][row] === '#') {
        count++;
        break;
      }
    }
    for (let c = 0; c < cols; c++) {
      if (field[col][c] === '#') {
        count++;
        break;
      }
    }
    return count === 2;
  }

  for (let i = 0; i < rows; i++) {
    let ans = '';
    for (let j = 0; j < cols; j++) {
      if (check(j, i)) {
        ans += field[i][j];
      }
    }
    if (ans !== '') {
      console.log(ans);
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
