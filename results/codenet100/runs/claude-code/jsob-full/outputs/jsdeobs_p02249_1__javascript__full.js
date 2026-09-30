const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'ascii').split('\n');
const [fieldHeight, fieldWidth] = lines[0].split(' ').map(Number);
const field = lines.slice(1, fieldHeight + 1);

const [patternHeight, patternWidth] = lines[fieldHeight + 1]
  .split(' ')
  .map(Number);
const pattern = lines.slice(
  fieldHeight + 2,
  fieldHeight + 2 + patternHeight,
);

for (let row = 0; row <= fieldHeight - patternHeight; row += 1) {
  for (let column = 0; column <= fieldWidth - patternWidth; column += 1) {
    let matches = true;

    for (let patternRow = 0; patternRow < patternHeight; patternRow += 1) {
      if (!field[row + patternRow].startsWith(pattern[patternRow], column)) {
        matches = false;
        break;
      }
    }

    if (matches) {
      console.log('%d %d', row, column);
    }
  }
}
