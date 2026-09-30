const fs = require('fs');

function main(input) {
  const tokens = input.split(/\s/);
  const height = parseInt(tokens[0]);
  const width = parseInt(tokens[1]);
  const grid = tokens.slice(2, height + 2);

  function isMarkedIntersection(column, row) {
    const columnContainsHash = grid.some((line) => line[column] == '#');
    const rowContainsHash = grid[row].includes('#');

    return columnContainsHash && rowContainsHash;
  }

  for (let row = 0; row < height; row++) {
    let outputLine = '';

    for (let column = 0; column < width; column++) {
      if (isMarkedIntersection(column, row)) {
        outputLine += grid[row][column];
      }
    }

    if (outputLine != '') {
      console.log(outputLine);
    }
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
