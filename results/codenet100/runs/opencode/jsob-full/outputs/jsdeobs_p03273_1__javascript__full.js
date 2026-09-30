const fs = require("fs");

function main(input) {
  const tokens = input.split(/\s/);
  const rowCount = parseInt(tokens[0]);
  const columnCount = parseInt(tokens[1]);
  const grid = [];

  for (let index = 2; index < rowCount + 2; index++) {
    grid.push(tokens[index]);
  }

  function isInMarkedRowAndColumn(column, row) {
    let markedDirections = 0;

    for (let otherRow = 0; otherRow < rowCount; otherRow++) {
      if (grid[otherRow][column] == "#") {
        markedDirections++;
        break;
      }
    }

    for (let otherColumn = 0; otherColumn < columnCount; otherColumn++) {
      if (grid[row][otherColumn] == "#") {
        markedDirections++;
        break;
      }
    }

    return markedDirections == 2;
  }

  for (let row = 0; row < rowCount; row++) {
    let outputRow = "";

    for (let column = 0; column < columnCount; column++) {
      if (isInMarkedRowAndColumn(column, row)) {
        outputRow += grid[row][column];
      }
    }

    if (outputRow != "") {
      console.log(outputRow);
    }
  }
}

main(fs.readFileSync("/dev/stdin", "utf8"));
