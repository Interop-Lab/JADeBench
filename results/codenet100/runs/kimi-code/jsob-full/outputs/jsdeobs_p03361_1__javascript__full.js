const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const [height, width] = lines[0].split(' ').map(Number);
  const grid = Array(height)
    .fill(false)
    .map((_, row) =>
      lines[row + 1]
        .split('')
        .slice(0, width)
        .map(cell => cell === '#'),
    );

  const isValid = grid.every((row, rowIndex) =>
    row.every(
      (isFilled, columnIndex) =>
        !isFilled ||
        (grid[rowIndex - 1] || [])[columnIndex] ||
        (grid[rowIndex + 1] || [])[columnIndex] ||
        grid[rowIndex][columnIndex - 1] ||
        grid[rowIndex][columnIndex + 1],
    ),
  );

  console.log(isValid ? 'Yes' : 'No');
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
