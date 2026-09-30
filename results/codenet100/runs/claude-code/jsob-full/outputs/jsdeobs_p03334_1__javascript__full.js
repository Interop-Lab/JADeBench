const fs = require('fs');

function classifyValue(value) {
  let rowBlockSize = 1;

  while ((value & 3) === 0) {
    rowBlockSize++;
    value >>>= 2;
  }

  return [rowBlockSize, value & 1];
}

function isSelected(classification, row, column) {
  const [rowBlockSize, residualParity] = classification;
  row = Math.floor(row / rowBlockSize);

  if (!residualParity) {
    return !(row & 1);
  }

  column = Math.floor(column + rowBlockSize);
  return !(column & 1);
}

function main(input) {
  const [size, firstValue, secondValue] = input.split(' ').map(Number);
  const firstClassification = classifyValue(firstValue);
  const secondClassification = classifyValue(secondValue);
  const coordinates = [];

  for (let row = 0; row < 2 * size; row++) {
    for (let column = 0; column < 2 * size; column++) {
      if (
        isSelected(firstClassification, row, column) &&
        isSelected(secondClassification, row, column)
      ) {
        coordinates.push(`${row} ${column}`);
      }

      if (coordinates.length === size * size) {
        console.log(coordinates.join('\n'));
        return;
      }
    }
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
