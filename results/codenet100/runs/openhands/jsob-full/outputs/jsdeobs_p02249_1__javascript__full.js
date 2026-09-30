const { readFileSync } = require('fs');

const lines = readFileSync('/dev/stdin', 'ascii').split('\n');
const [fieldHeight, fieldWidth] = lines[0].split(' ').map(Number);
const fieldRows = lines.slice(1, fieldHeight + 1);

const [patternHeight, patternWidth] = lines[fieldHeight + 1]
  .split(' ')
  .map(Number);
const patternRows = lines.slice(
  fieldHeight + 2,
  fieldHeight + patternHeight + 2,
);

const matchingColumns = Array.from({ length: fieldHeight }, () =>
  Array.from({ length: patternHeight }, () => new Set()),
);

for (let fieldRow = 0; fieldRow < fieldHeight; fieldRow += 1) {
  for (let patternRow = 0; patternRow < patternHeight; patternRow += 1) {
    let column = fieldRows[fieldRow].indexOf(patternRows[patternRow]);

    while (column !== -1) {
      matchingColumns[fieldRow][patternRow].add(column);
      column = fieldRows[fieldRow].indexOf(patternRows[patternRow], column + 1);
    }
  }
}

for (let row = 0; row <= fieldHeight - patternHeight; row += 1) {
  for (let column = 0; column <= fieldWidth - patternWidth; column += 1) {
    let matches = true;

    for (let patternRow = 0; patternRow < patternHeight; patternRow += 1) {
      if (!matchingColumns[row + patternRow][patternRow].has(column)) {
        matches = false;
        break;
      }
    }

    if (matches) {
      console.log('%d %d', row, column);
    }
  }
}
