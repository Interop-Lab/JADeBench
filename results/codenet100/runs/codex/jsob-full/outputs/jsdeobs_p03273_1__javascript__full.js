const fs = require('fs');

function removeEmptyRowsAndColumns(input) {
  const tokens = input.split(/\s/);
  const height = parseInt(tokens[0]);
  const width = parseInt(tokens[1]);
  const grid = [];

  for (let index = 2; index < height + 2; index++) {
    grid.push(tokens[index]);
  }

  function belongsToMarkedRowAndColumn(column, row) {
    let markedDirections = 0;

    for (let otherRow = 0; otherRow < height; otherRow++) {
      if (grid[otherRow][column] == '#') {
        markedDirections++;
        break;
      }
    }

    for (let otherColumn = 0; otherColumn < width; otherColumn++) {
      if (grid[row][otherColumn] == '#') {
        markedDirections++;
        break;
      }
    }

    return markedDirections == 2;
  }

  for (let row = 0; row < height; row++) {
    let outputRow = '';

    for (let column = 0; column < width; column++) {
      if (belongsToMarkedRowAndColumn(column, row)) {
        outputRow += grid[row][column];
      }
    }

    if (outputRow != '') {
      console.log(outputRow);
    }
  }
}

removeEmptyRowsAndColumns(fs.readFileSync('/dev/stdin', 'utf8'));
