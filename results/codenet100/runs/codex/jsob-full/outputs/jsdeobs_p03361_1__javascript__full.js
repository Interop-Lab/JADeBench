const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const [height, width] = lines[0].split(' ').map(Number);
  const occupiedCells = Array(height)
    .fill(false)
    .map((_, row) =>
      lines[row + 1]
        .split('')
        .slice(0, width)
        .map((cell) => cell === '#'),
    );

  const everyOccupiedCellHasNeighbor = occupiedCells.every((row, rowIndex) =>
    row.every(
      (isOccupied, columnIndex) =>
        !isOccupied ||
        (occupiedCells[rowIndex - 1] || [])[columnIndex] ||
        (occupiedCells[rowIndex + 1] || [])[columnIndex] ||
        occupiedCells[rowIndex][columnIndex - 1] ||
        occupiedCells[rowIndex][columnIndex + 1],
    ),
  );

  console.log(everyOccupiedCellHasNeighbor ? 'Yes' : 'No');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
