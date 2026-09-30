const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'ascii').split('\n');
const [fieldHeight, fieldWidth] = input[0].split(' ').map(Number);
const field = input.slice(1, 1 + fieldHeight);

const [patternHeight, patternWidth] = input[1 + fieldHeight]
  .split(' ')
  .map(Number);
const pattern = input.slice(
  fieldHeight + 2,
  fieldHeight + 2 + patternHeight,
);

const patternMatchesByRow = Array.from(
  { length: fieldHeight },
  () => Array.from({ length: patternHeight }, () => new Set()),
);

for (let fieldRow = 0; fieldRow < fieldHeight; fieldRow++) {
  for (let patternRow = 0; patternRow < patternHeight; patternRow++) {
    let column = field[fieldRow].indexOf(pattern[patternRow]);
    while (column !== -1) {
      patternMatchesByRow[fieldRow][patternRow].add(column);
      column = field[fieldRow].indexOf(pattern[patternRow], column + 1);
    }
  }
}

for (let row = 0; row <= fieldHeight - patternHeight; row++) {
  for (let column = 0; column <= fieldWidth - patternWidth; column++) {
    let matches = true;
    for (let patternRow = 0; patternRow < patternHeight; patternRow++) {
      if (!patternMatchesByRow[row + patternRow][patternRow].has(column)) {
        matches = false;
        break;
      }
    }
    if (matches) {
      console.log('%d %d', row, column);
    }
  }
}
