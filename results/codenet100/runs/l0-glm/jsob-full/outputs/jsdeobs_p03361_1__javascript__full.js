const main = (input) => {
  const lines = input.split('\n');
  const [N, M] = lines[0].split(' ').map(Number);
  const grid = Array(N).fill().map((_, i) =>
    lines[i + 1].split('').slice(0, M).map(c => c === '#')
  );
  const result = grid.every((row, i) =>
    row.every((cell, j) =>
      !cell ||
      (grid[i - 1] || [])[j] ||
      (grid[i + 1] || [])[j] ||
      grid[i][j - 1] ||
      grid[i][j + 1]
    )
  );
  console.log(result ? 'Yes' : 'No');
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
