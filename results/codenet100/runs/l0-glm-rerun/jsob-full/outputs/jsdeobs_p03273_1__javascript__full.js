function main(input) {
  const lines = input.trim().split(/\s/);
  const rows = parseInt(lines[0]);
  const cols = parseInt(lines[1]);
  const grid = [];
  for (let i = 0; i < rows; i++) {
    grid.push(lines[i + 2]);
  }

  function countWalls(row, col) {
    let count = 0;
    for (let i = 0; i < rows; i++) {
      if (grid[i][row] === '#') {
        count++;
        break;
      }
    }
    for (let j = 0; j < cols; j++) {
      if (grid[col][j] === '#') {
        count++;
        break;
      }
    }
    return count;
  }

  for (let i = 0; i < rows; i++) {
    let ans = '';
    for (let j = 0; j < cols; j++) {
      if (countWalls(j, i)) {
        ans += grid[i][j];
      }
    }
    if (ans != '') {
      console.log(ans);
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
