const fs = require('fs');

const main = input => {
  const lines = input.split('\n');
  const [height, width] = lines[0].split(' ').map(Number);

  const grid = Array(height)
    .fill(false)
    .map((_, row) =>
      lines[row + 1]
        .split('')
        .slice(0, width)
        .map(cell => cell === '#')
    );

  const valid = grid.every((row, rowIndex) =>
    row.every(
      (cell, columnIndex) =>
        !cell ||
        (grid[rowIndex - 1] || [])[columnIndex] ||
        (grid[rowIndex + 1] || [])[columnIndex] ||
        grid[rowIndex][columnIndex - 1] ||
        grid[rowIndex][columnIndex + 1]
    )
  );

  console.log(valid ? 'Yes' : 'No');
};

main(fs.readFileSync('/dev/stdin', 'utf8'));
