const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const [rowCount, columnCount] = lines[0].split(' ').map(Number);
  const grid = Array(rowCount)
    .fill(false)
    .map((_, rowIndex) =>
      lines[rowIndex + 1]
        .split('')
        .slice(0, columnCount)
        .map((cell) => cell === '#'),
    );

  const allMarkedCellsHaveNeighbor = grid.every((row, rowIndex) =>
    row.every(
      (isMarked, columnIndex) =>
        !isMarked ||
        (grid[rowIndex - 1] || [])[columnIndex] ||
        (grid[rowIndex + 1] || [])[columnIndex] ||
        grid[rowIndex][columnIndex - 1] ||
        grid[rowIndex][columnIndex + 1],
    ),
  );

  console.log(allMarkedCellsHaveNeighbor ? 'Yes' : 'No');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
