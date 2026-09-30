const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'ascii').split('\n');

const [fieldHeight, fieldWidth] = input[0].split(' ').map(Number);
const field = input.slice(1, fieldHeight + 1);

const patternDimensionsIndex = fieldHeight + 1;
const [patternHeight, patternWidth] = input[patternDimensionsIndex]
  .split(' ')
  .map(Number);
const pattern = input.slice(
  patternDimensionsIndex + 1,
  patternDimensionsIndex + 1 + patternHeight,
);

const patternMatchesByFieldRow = Array.from(
  { length: fieldHeight },
  () => Array.from({ length: patternHeight }, () => new Set()),
);

for (let fieldRow = 0; fieldRow < fieldHeight; fieldRow++) {
  for (let patternRow = 0; patternRow < patternHeight; patternRow++) {
    let column = field[fieldRow].indexOf(pattern[patternRow]);

    while (column !== -1) {
      patternMatchesByFieldRow[fieldRow][patternRow].add(column);
      column = field[fieldRow].indexOf(pattern[patternRow], column + 1);
    }
  }
}

for (let row = 0; row <= fieldHeight - patternHeight; row++) {
  for (let column = 0; column <= fieldWidth - patternWidth; column++) {
    let matches = true;

    for (let patternRow = 0; patternRow < patternHeight; patternRow++) {
      if (!patternMatchesByFieldRow[row + patternRow][patternRow].has(column)) {
        matches = false;
        break;
      }
    }

    if (matches) {
      console.log('%d %d', row, column);
    }
  }
}
