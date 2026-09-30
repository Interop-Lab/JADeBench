function main(input) {
  const tokens = input.split(/\s/);
  const rowCount = parseInt(tokens[0]);
  const columnCount = parseInt(tokens[1]);
  const grid = [];

  for (let i = 2; i < rowCount + 2; i++) {
    grid.push(tokens[i]);
  }

  function isInOccupiedRowAndColumn(column, row) {
    let occupiedCount = 0;

    for (let i = 0; i < rowCount; i++) {
      if (grid[i][column] == '#') {
        occupiedCount++;
        break;
      }
    }

    for (let i = 0; i < columnCount; i++) {
      if (grid[row][i] == '#') {
        occupiedCount++;
        break;
      }
    }

    return occupiedCount == 2;
  }

  for (let row = 0; row < rowCount; row++) {
    let result = '';

    for (let column = 0; column < columnCount; column++) {
      if (isInOccupiedRowAndColumn(column, row)) {
        result += grid[row][column];
      }
    }

    if (result != '') {
      console.log(result);
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
