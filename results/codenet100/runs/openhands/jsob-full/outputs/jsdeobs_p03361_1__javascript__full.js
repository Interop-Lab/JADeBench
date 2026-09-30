const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const [rowCount, columnCount] = lines[0].split(' ').map(Number);

  const filledCells = Array(rowCount)
    .fill(false)
    .map((_, rowIndex) =>
      lines[rowIndex + 1]
        .split('')
        .slice(0, columnCount)
        .map((cell) => cell === '#'),
    );

  const hasNoIsolatedFilledCells = filledCells.every((row, rowIndex) =>
    row.every(
      (isFilled, columnIndex) =>
        !isFilled ||
        (filledCells[rowIndex - 1] || [])[columnIndex] ||
        (filledCells[rowIndex + 1] || [])[columnIndex] ||
        filledCells[rowIndex][columnIndex - 1] ||
        filledCells[rowIndex][columnIndex + 1],
    ),
  );

  console.log(hasNoIsolatedFilledCells ? 'Yes' : 'No');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
