function main(input) {
  input = input.split(/\s/);
  let rows = parseInt(input[0]);
  let cols = parseInt(input[1]);
  let grid = [];

  for (let i = 0; i < rows; i++) {
    grid.push(input[i + 2]);
  }

  function hasWall(row, col) {
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
    return count === 2;
  }

  for (let i = 0; i < rows; i++) {
    let ans = '';
    for (let j = 0; j < cols; j++) {
      if (hasWall(j, i)) {
        ans += grid[i][j];
      }
    }
    if (ans !== '') {
      console.log(ans);
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
