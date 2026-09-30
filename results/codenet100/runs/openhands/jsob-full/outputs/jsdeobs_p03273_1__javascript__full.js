const fs = require('fs');

function main(input) {
  const tokens = input.split(/\s/);
  const rowCount = parseInt(tokens[0]);
  const columnCount = parseInt(tokens[1]);
  const grid = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    grid.push(tokens[rowIndex + 2]);
  }

  function belongsToOccupiedRowAndColumn(columnIndex, rowIndex) {
    let occupiedAxisCount = 0;

    for (let candidateRow = 0; candidateRow < rowCount; candidateRow++) {
      if (grid[candidateRow][columnIndex] === '#') {
        occupiedAxisCount++;
        break;
      }
    }

    for (
      let candidateColumn = 0;
      candidateColumn < columnCount;
      candidateColumn++
    ) {
      if (grid[rowIndex][candidateColumn] === '#') {
        occupiedAxisCount++;
        break;
      }
    }

    return occupiedAxisCount === 2;
  }

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    let outputRow = '';

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      if (belongsToOccupiedRowAndColumn(columnIndex, rowIndex)) {
        outputRow += grid[rowIndex][columnIndex];
      }
    }

    globalThis.ans = outputRow;
    if (outputRow !== '') {
      console.log(outputRow);
    }
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
