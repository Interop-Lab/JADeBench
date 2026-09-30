const fs = require('fs');

function describePattern(value) {
  let blockSize = 1;

  while ((value & 3) === 0) {
    blockSize++;
    value >>>= 2;
  }

  return [blockSize, value & 1];
}

function matchesPattern(pattern, row, column) {
  const rowBlock = Math.floor(row / pattern[0]);

  if (!pattern[1]) {
    return !(rowBlock & 1);
  }

  const columnBlock = Math.floor(column / pattern[0]);
  return !((columnBlock + rowBlock) & 1);
}

function Main(input) {
  const values = input.split(' ').map(value => +value);
  const size = values[0];
  const firstPattern = describePattern(values[1]);
  const secondPattern = describePattern(values[2]);
  const coordinates = [];
  let coordinateCount = 0;

  for (let row = 0; row < 2 * size; row++) {
    for (let column = 0; column < 2 * size; column++) {
      if (
        matchesPattern(firstPattern, row, column) &&
        matchesPattern(secondPattern, row, column)
      ) {
        coordinates[coordinateCount++] = `${row} ${column}`;
      }

      if (coordinateCount === size * size) {
        console.log(coordinates.join('\n'));
        return;
      }
    }
  }
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
