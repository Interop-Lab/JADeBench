const main = input => {
  const lines = input.split('\n');
  const [rows, cols] = lines[0].split(' ').map(Number);
  const grid = Array(rows).fill(false).map((_, r) =>
    lines[r + 1].split('').slice(0, cols).map(ch => ch === '#')
  );
  const result = grid.every((row, r) =>
    row.every((cell, c) =>
      !cell ||
      (grid[r - 1] || [])[c] ||
      (grid[r + 1] || [])[c] ||
      grid[r][c - 1] ||
      grid[r][c + 1]
    )
  );
  console.log(result ? 'Yes' : 'No');
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
