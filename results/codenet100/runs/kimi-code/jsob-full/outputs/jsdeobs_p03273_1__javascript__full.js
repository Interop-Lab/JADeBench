const fs = require('fs');

function main(input) {
  const tokens = input.split(/\s/);
  const rowCount = parseInt(tokens[0]);
  const columnCount = parseInt(tokens[1]);
  const grid = [];
  for (let index = 2; index < 2 + rowCount; index++) grid.push(tokens[index]);

  function rowAndColumnAreClear(column, row) {
    let blockedDirections = 0;

    for (let scannedRow = 0; scannedRow < rowCount; scannedRow++) {
      if (grid[scannedRow][column] == '#') {
        blockedDirections++;
        break;
      }
    }

    for (let scannedColumn = 0; scannedColumn < columnCount; scannedColumn++) {
      if (grid[row][scannedColumn] == '#') {
        blockedDirections++;
        break;
      }
    }

    return blockedDirections == 0;
  }

  for (let row = 0; row < rowCount; row++) {
    ans = '';
    for (let column = 0; column < columnCount; column++) {
      if (rowAndColumnAreClear(column, row)) ans += grid[row][column];
    }
    if (ans != '') console.log(ans);
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
